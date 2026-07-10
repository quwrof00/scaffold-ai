import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import joinedload
import bcrypt
from app.db.database import AsyncSessionLocal
from app.db.models import User, UserRole, StudentProfile, ParentProfile, TeacherProfile, StudentConceptMastery, StudentMisconception, Session as DBSession, MisconceptionMaster, SessionIntent, InputType, ConceptStatus
from langchain_core.messages import HumanMessage
from app.services.rule_engine import analyze_student_prompt
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from psycopg_pool import AsyncConnectionPool
import psycopg

from app.graph.workflow import app_workflow_builder
from app.models.profile import StudentProfileContext
from app.models.session import CurrentSessionContext

# Global variables for the compiled graph and postgres pool
app_workflow = None
postgres_pool = None

async def check_postgres_connection(conn):
    try:
        await conn.execute("SELECT 1")
    except psycopg.OperationalError as e:
        raise psycopg.OperationalError("Connection check failed") from e

@asynccontextmanager
async def lifespan(app: FastAPI):
    global app_workflow, postgres_pool
    
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        print("Using AsyncPostgresSaver...")
        postgres_pool = AsyncConnectionPool(
            conninfo=db_url,
            max_size=20,
            max_idle=120,
            max_lifetime=300,
            open=False,
            check=check_postgres_connection,
            kwargs={
                "autocommit": True,
                "keepalives": 1,
                "keepalives_idle": 30,
                "keepalives_interval": 10,
                "keepalives_count": 5
            }
        )
        await postgres_pool.open()
        checkpointer = AsyncPostgresSaver(postgres_pool)
        await checkpointer.setup()
        app_workflow = app_workflow_builder.compile(checkpointer=checkpointer)
        yield
        await postgres_pool.close()
    else:
        print("Using AsyncSqliteSaver (local fallback)...")
        async with AsyncSqliteSaver.from_conn_string("checkpoints.db") as checkpointer:
            await checkpointer.setup()
            app_workflow = app_workflow_builder.compile(checkpointer=checkpointer)
            yield

app = FastAPI(title="Guided Session Tutoring API", version="0.1.0", lifespan=lifespan)

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", os.getenv("FRONTEND_URL", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── DB dependency ────────────────────────────────────────────────────────────

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# ─── Auth models ─────────────────────────────────────────────────────────────

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "STUDENT"  # STUDENT | TEACHER | PARENT

class LoginRequest(BaseModel):
    email: str
    password: str

# ─── Chat models ─────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    session_id: str
    student_id: str
    
class ChatResponse(BaseModel):
    response: str
    diagnosis: Optional[Any] = None
    next_stage: Optional[str] = None
    concept_states: Optional[Any] = None
    concept_graph: Optional[Any] = None
    is_completion_check: Optional[bool] = False

# ─── Root ─────────────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Tutoring Backend API"}

# ─── Auth ─────────────────────────────────────────────────────────────────────

@app.post("/auth/register")
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Map role string to enum
    role_map = {"STUDENT": UserRole.STUDENT, "TEACHER": UserRole.TEACHER, "PARENT": UserRole.PARENT}
    role = role_map.get(req.role.upper(), UserRole.STUDENT)
    
    hashed_pw = get_password_hash(req.password)
    new_user = User(
        name=req.name,
        email=req.email,
        password_hash=hashed_pw,
        role=role,
    )
    db.add(new_user)
    await db.flush()  # get new_user.id without committing

    # Auto-create a stub StudentProfile for students
    if role == UserRole.STUDENT:
        stub_profile = StudentProfile(
            userId=new_user.id,
            grade=None,
            board=None,
            preferredLanguage="English",
            streak=0,
            xp=0,
        )
        db.add(stub_profile)
    elif role == UserRole.PARENT:
        parent_profile = ParentProfile(userId=new_user.id)
        db.add(parent_profile)
    elif role == UserRole.TEACHER:
        teacher_profile = TeacherProfile(userId=new_user.id)
        db.add(teacher_profile)

    await db.commit()
    await db.refresh(new_user)
    return {"message": "User created", "id": new_user.id, "role": new_user.role}

@app.post("/auth/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalars().first()
    
    if not user or not user.password_hash:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Fetch the linked profile id too if student
    student_profile_id = None
    if user.role == UserRole.STUDENT:
        sp_result = await db.execute(select(StudentProfile).where(StudentProfile.userId == user.id))
        sp = sp_result.scalars().first()
        if sp:
            student_profile_id = sp.id

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "studentProfileId": student_profile_id,
    }

# ─── Student data endpoints ────────────────────────────────────────────────────

@app.get("/students")
async def get_all_students(parent_email: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    query = select(User, StudentProfile).join(StudentProfile, User.id == StudentProfile.userId).where(User.role == UserRole.STUDENT)
    
    if parent_email:
        query = query.where(StudentProfile.parentEmails.ilike(f"%{parent_email}%"))
        
    result = await db.execute(query)
    students = result.all()
    return [
        {
            "id": p.id,
            "name": u.name,
            "email": u.email,
        }
        for u, p in students
    ]

@app.get("/students/{student_id}/profile")
async def get_student_profile(student_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(StudentProfile)
        .options(joinedload(StudentProfile.user))
        .where(StudentProfile.id == student_id)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    return {
        "id": profile.id,
        "userId": profile.userId,
        "name": profile.user.name if profile.user else "",
        "email": profile.user.email if profile.user else "",
        "grade": profile.grade,
        "board": profile.board,
        "preferredLanguage": profile.preferredLanguage,
        "learningPace": profile.learningPace,
        "xp": profile.xp,
        "streak": profile.streak,
        "parentEmails": profile.parentEmails,
        # Level derived from XP (every 500 XP = 1 level)
        "level": max(1, (profile.xp or 0) // 500 + 1),
    }

class UpdateProfileRequest(BaseModel):
    grade: Optional[str] = None
    board: Optional[str] = None
    preferredLanguage: Optional[str] = None
    learningPace: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    parentEmails: Optional[str] = None

@app.patch("/students/{student_id}/profile")
async def update_student_profile(student_id: str, req: UpdateProfileRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(StudentProfile).options(joinedload(StudentProfile.user)).where(StudentProfile.id == student_id)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    if req.grade is not None:
        profile.grade = req.grade
    if req.board is not None:
        profile.board = req.board
    if req.preferredLanguage is not None:
        profile.preferredLanguage = req.preferredLanguage
    if req.learningPace is not None:
        profile.learningPace = req.learningPace
    if req.parentEmails is not None:
        profile.parentEmails = req.parentEmails
        
    if profile.user:
        if req.name is not None:
            profile.user.name = req.name
        if req.email is not None:
            profile.user.email = req.email
            
    await db.commit()
    return {"status": "success"}

@app.get("/students/{student_id}/activity-heatmap")
async def get_activity_heatmap(student_id: str, db: AsyncSession = Depends(get_db)):
    from datetime import datetime, timezone, timedelta
    now = datetime.now(timezone.utc)
    # We want 154 cells ending TODAY. So today is day 153.
    cutoff = now - timedelta(days=153)
    
    result = await db.execute(
        select(DBSession.createdAt)
        .where(DBSession.studentId == student_id)
        .where(DBSession.createdAt >= cutoff)
    )
    sessions = result.scalars().all()
    
    counts = {}
    for dt in sessions:
        if not dt: continue
        date_str = dt.strftime("%Y-%m-%d")
        counts[date_str] = counts.get(date_str, 0) + 1
        
    heatmap = []
    for i in range(154):
        day = cutoff + timedelta(days=i)
        date_str = day.strftime("%Y-%m-%d")
        count = counts.get(date_str, 0)
        # Convert count to a heat level (0-4)
        # e.g., 0=0, 1=1, 2=2, 3=3, 4=4+ 
        level = min(4, count)
        heatmap.append({
            "id": f"cell-{i}",
            "date": date_str,
            "level": level
        })
    return heatmap

@app.get("/students/{student_id}/trajectory")
async def get_trajectory(student_id: str, db: AsyncSession = Depends(get_db)):
    from datetime import datetime, timezone, timedelta
    now = datetime.now(timezone.utc)
    # 30 cells ending today, so today is day 29.
    cutoff = now - timedelta(days=29)
    
    # We want cumulative 'KNOWN' masteries over time, and sessions per day
    # Get masteries updated in last 30 days
    m_result = await db.execute(
        select(StudentConceptMastery.updatedAt, StudentConceptMastery.status)
        .where(StudentConceptMastery.studentId == student_id)
        .where(StudentConceptMastery.updatedAt >= cutoff)
    )
    masteries = m_result.all()
    
    # Get sessions in last 30 days
    s_result = await db.execute(
        select(DBSession.createdAt)
        .where(DBSession.studentId == student_id)
        .where(DBSession.createdAt >= cutoff)
    )
    sessions = s_result.scalars().all()
    
    # Group by YYYY-MM-DD
    days_data = {}
    for i in range(30):
        d_str = (cutoff + timedelta(days=i)).strftime("%b %d")
        days_data[d_str] = {"name": d_str, "mastery": 0, "sessions": 0}
        
    for m in masteries:
        if m.updatedAt and m.status == ConceptStatus.KNOWN:
            d_str = m.updatedAt.strftime("%b %d")
            if d_str in days_data:
                days_data[d_str]["mastery"] += 1
                
    for s in sessions:
        if s:
            d_str = s.strftime("%b %d")
            if d_str in days_data:
                days_data[d_str]["sessions"] += 1
                
    # Make masteries cumulative
    trajectory = []
    cumulative = 0
    for i in range(30):
        d_str = (cutoff + timedelta(days=i)).strftime("%b %d")
        cumulative += days_data[d_str]["mastery"]
        trajectory.append({
            "name": d_str,
            "mastery": cumulative,
            "sessions": days_data[d_str]["sessions"]
        })
        
    return trajectory

@app.get("/students/{student_id}/sessions")
async def get_student_sessions(student_id: str, limit: int = 10, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DBSession)
        .where(DBSession.studentId == student_id)
        .order_by(DBSession.createdAt.desc())
        .limit(limit)
    )
    sessions = result.scalars().all()
    return [
        {
            "id": s.id,
            "subject": s.subject,
            "topic": s.topic,
            "status": s.status,
            "intent": s.intent,
            "createdAt": s.createdAt.isoformat() if s.createdAt else None,
            "completedAt": s.completedAt.isoformat() if s.completedAt else None,
        }
        for s in sessions
    ]

@app.get("/students/{student_id}/concepts")
async def get_student_concepts(student_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(StudentConceptMastery)
        .where(StudentConceptMastery.studentId == student_id)
        .order_by(StudentConceptMastery.updatedAt.desc())
    )
    concepts = result.scalars().all()
    return [
        {
            "id": c.id,
            "subject": c.subject,
            "topic": c.topic,
            "concept": c.concept,
            "status": c.status,
            "attempts": c.attempts,
            "updatedAt": c.updatedAt.isoformat() if c.updatedAt else None,
        }
        for c in concepts
    ]

@app.get("/students/{student_id}/misconceptions")
async def get_student_misconceptions(student_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(StudentMisconception)
        .options(joinedload(StudentMisconception.misconception))
        .where(StudentMisconception.studentId == student_id)
        .order_by(StudentMisconception.lastSeenAt.desc())
    )
    items = result.scalars().all()
    return [
        {
            "id": m.id,
            "concept": m.concept,
            "frequency": m.frequency,
            "lastSeenAt": m.lastSeenAt.isoformat() if m.lastSeenAt else None,
            "misconceptionName": m.misconception.name if m.misconception else None,
            "misconceptionDescription": m.misconception.description if m.misconception else None,
        }
        for m in items
    ]

# ─── Chat ─────────────────────────────────────────────────────────────────────

class CreateSessionRequest(BaseModel):
    student_id: str
    message: str

@app.post("/sessions")
async def create_session(req: CreateSessionRequest, db: AsyncSession = Depends(get_db)):
    try:
        analysis = analyze_student_prompt(req.message)
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}\n{tb}")
        
    intent_map = {
        "PROBLEM_SOLVING": SessionIntent.PROBLEM_SOLVING,
        "CONCEPT_UNDERSTANDING": SessionIntent.CONCEPT_UNDERSTANDING,
        "GENERAL": SessionIntent.GENERAL
    }
    
    try:
        # STREAK LOGIC
        now = datetime.now(timezone.utc)
        sp_result = await db.execute(select(StudentProfile).where(StudentProfile.id == req.student_id))
        student_profile = sp_result.scalars().first()
        
        if student_profile:
            last_active = student_profile.lastActiveAt
            if last_active:
                # If last active was yesterday, increment. If today, do nothing. If older, reset to 1.
                diff = now.date() - last_active.date()
                if diff.days == 1:
                    student_profile.streak = (student_profile.streak or 0) + 1
                elif diff.days > 1:
                    student_profile.streak = 1
            else:
                student_profile.streak = 1
            
            student_profile.lastActiveAt = now
            student_profile.xp = (student_profile.xp or 0) + 10

        new_session = DBSession(
            studentId=req.student_id,
            title=analysis.title,
            subject=analysis.subject,
            topic=analysis.topic,
            intent=intent_map.get(analysis.intent, SessionIntent.GENERAL),
            inputType=InputType.TEXT
        )
        db.add(new_session)
        await db.commit()
        await db.refresh(new_session)
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        raise HTTPException(status_code=500, detail=f"Database save failed: {str(e)}\n{tb}")
    
    return {"session_id": new_session.id}

# ─── Chat ─────────────────────────────────────────────────────────────────────
@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest, db: AsyncSession = Depends(get_db)):
    session_result = await db.execute(select(DBSession).where(DBSession.id == req.session_id))
    db_session = session_result.scalars().first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    profile_result = await db.execute(select(StudentProfile).where(StudentProfile.id == req.student_id))
    db_profile = profile_result.scalars().first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Student Profile not found")

    profile_ctx = StudentProfileContext(
        grade=db_profile.grade or "Unknown",
        weakTopics=[],
        misconceptionHistory=[],
        pace=db_profile.learningPace.value if db_profile.learningPace else "MEDIUM",
        strictnessPreference="HINT_ONLY",
        recentSessions=[]
    )

    session_ctx = CurrentSessionContext(
        problem=req.message,
        subject=db_session.subject or "General",
        topic=db_session.topic or "General",
        teacherMode="HINT_ONLY",
        intent=db_session.intent.value if db_session.intent else "GENERAL",
        failed_attempts=0
    )

    user_msg = HumanMessage(content=req.message)
    config = {"configurable": {"thread_id": req.session_id}}

    existing_state_snapshot = await app_workflow.aget_state(config)
    input_state: dict = {
        "messages": [user_msg],
        "input_type": "text",
    }
    if not existing_state_snapshot or not existing_state_snapshot.values.get("session"):
        input_state["profile"] = profile_ctx
        input_state["session"] = session_ctx

    # Run the workflow and get the final state
    final_state = await app_workflow.ainvoke(input_state, config=config)

    # Extract the last AIMessage
    from langchain_core.messages import AIMessage as LCAIMessage
    messages = final_state.get("messages", [])
    ai_messages = [m for m in messages if isinstance(m, LCAIMessage)]
    if ai_messages:
        ai_response = ai_messages[-1].content
    elif messages:
        ai_response = messages[-1].content
    else:
        ai_response = "I'm not sure how to respond. Could you rephrase?"

    print(f"[CHAT] ai_response = {repr(ai_response[:120])}")

    # --- Persistence ---
    try:
        concept_states = final_state.get("concept_states")
        if concept_states and isinstance(concept_states, dict):
            for concept_name, status_str in concept_states.items():
                status_val = ConceptStatus.UNKNOWN
                try:
                    status_val = ConceptStatus(status_str)
                except ValueError:
                    pass
                mastery_result = await db.execute(
                    select(StudentConceptMastery).where(
                        StudentConceptMastery.studentId == req.student_id,
                        StudentConceptMastery.concept == concept_name
                    )
                )
                mastery_record = mastery_result.scalars().first()
                if mastery_record:
                    if mastery_record.status != ConceptStatus.KNOWN and status_val == ConceptStatus.KNOWN:
                        db_profile.xp = (db_profile.xp or 0) + 50
                    mastery_record.status = status_val
                    mastery_record.attempts += 1
                else:
                    if status_val == ConceptStatus.KNOWN:
                        db_profile.xp = (db_profile.xp or 0) + 50
                    db.add(StudentConceptMastery(
                        studentId=req.student_id,
                        subject=db_session.subject,
                        topic=db_session.topic,
                        concept=concept_name,
                        status=status_val,
                        attempts=1
                    ))

        diagnosis = final_state.get("diagnosis")
        if diagnosis and isinstance(diagnosis, dict):
            possible_misconceptions = diagnosis.get("possibleMisconceptions", [])
            if possible_misconceptions:
                misc_text = possible_misconceptions[0]
                misc_result = await db.execute(
                    select(StudentMisconception).where(
                        StudentMisconception.studentId == req.student_id,
                        StudentMisconception.concept == misc_text
                    )
                )
                misc_record = misc_result.scalars().first()
                if misc_record:
                    misc_record.frequency += 1
                else:
                    db.add(StudentMisconception(
                        studentId=req.student_id,
                        concept=misc_text,
                        frequency=1
                    ))

        await db.commit()
    except Exception as persist_error:
        print(f"[CHAT] Persistence failed (non-fatal): {persist_error}")
        await db.rollback()

    return {
        "response": ai_response,
        "diagnosis": final_state.get("diagnostic_state") or final_state.get("diagnosis"),
        "next_stage": final_state.get("current_stage"),
        "concept_states": final_state.get("concept_states"),
        "concept_graph": final_state.get("concept_graph"),
        "is_completion_check": final_state.get("is_completion_check", False),
    }

