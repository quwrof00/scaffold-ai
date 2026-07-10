from langchain_core.messages import SystemMessage
from app.graph.state import GraphState
from app.graph.nodes.llm_layer import grok_model

def objective_evaluator_node(state: GraphState) -> GraphState:
    """
    Evaluates if the session objective is fully achieved and generates a wrap-up message.
    """
    profile = state.get("profile")
    session = state.get("session")
    messages = state.get("messages", [])
    concept_graph = state.get("concept_graph", {})
    concept_states = state.get("concept_states", {})
    
    is_session_dict = isinstance(session, dict)
    target_objective = session.get('target_objective') if is_session_dict else session.target_objective
    
    # Format concepts string
    concepts_summary = "\n".join([f"- {concept}" for concept, status in concept_states.items() if status == "KNOWN"])
    
    system_prompt = f"""You are an encouraging Socratic tutor. 
The student has just successfully mastered all the core concepts for this session.

Session Objective: {target_objective}
Concepts Mastered:
{concepts_summary}

Your task is to:
1. Briefly congratulate the student on mastering these concepts.
2. Summarize how these concepts tie back to their original objective.
3. Ask them if they feel confident enough to end the session now, or if they still have lingering questions.

Keep your tone positive, concise, and encouraging.
"""

    response = grok_model.invoke([
        SystemMessage(content=system_prompt),
        *messages
    ])
    
    # Store the response in the state
    state["is_completion_check"] = True
    state["completion_question"] = response.content
    state["messages"] = messages + [response]
    
    # Clear diagnosis as it's not a standard question
    state["diagnosis"] = None
    
    return state
