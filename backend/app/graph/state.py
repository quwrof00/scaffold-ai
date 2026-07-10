from typing import Annotated, TypedDict, List, Optional, Dict, Any
from langchain_core.messages import BaseMessage
from app.models.profile import StudentProfileContext
from app.models.session import CurrentSessionContext
from langgraph.graph.message import add_messages

class Diagnosis(TypedDict):
    requiredConcept: str
    possibleMisconceptions: List[str]
    question: str

class ConceptNode(TypedDict):
    prerequisites: List[str]

class GraphState(TypedDict):
    # The history of messages in the session
    messages: Annotated[List[BaseMessage], add_messages]
    
    # Input modality and extracted content (if any)
    input_type: str  # "text", "image", "pdf"
    extracted_text: Optional[str]  # Text extracted from image/pdf if applicable
    
    # Contexts
    profile: StudentProfileContext
    session: CurrentSessionContext
    
    # Dynamic Concept Tracking
    concept_graph: Optional[Dict[str, ConceptNode]]
    concept_states: Optional[Dict[str, str]] # Maps concept name to ConceptStatus (e.g. "KNOWN", "UNKNOWN")
    
    # Workflow control variables
    current_stage: str # e.g., "initial", "diagnosis", "socratic_question", "hint", "reflection", "complete"
    diagnosis: Optional[Diagnosis] # Structured diagnosis
    current_misconception: Optional[str] # Determined by rule engine
    next_action: Optional[str] # e.g., "diagnose", "guide", "reflect"
    understanding: int # Tracks progress
    
    # End of Session variables
    is_completion_check: Optional[bool]
    completion_question: Optional[str]
