from app.graph.state import GraphState

def rule_engine_node(state: GraphState) -> GraphState:
    """
    Deterministic rule engine to handle logic before LLM processing.
    """
    session = state.get("session")
    profile = state.get("profile")
    
    messages = state.get("messages", [])
    
    if not session or not profile:
        return state
        
    is_session_dict = isinstance(session, dict)
    failed_attempts = session.get("failed_attempts", 0) if is_session_dict else session.failed_attempts
    max_attempts = session.get("max_attempts_before_hint", 3) if is_session_dict else session.max_attempts_before_hint
    

    # 1. Determine next action based on failed attempts
    if failed_attempts >= max_attempts:
        state["next_action"] = "hint"
    else:
        # Check if all concepts are KNOWN
        concept_states = state.get("concept_states")
        if concept_states and len(concept_states) > 0 and all(status == "KNOWN" for status in concept_states.values()):
            state["next_action"] = "evaluate_objective"
        elif state.get("diagnosis"):
            state["next_action"] = "socratic"
        else:
            state["next_action"] = "diagnose"
        
    state["session"] = session
    state["profile"] = profile
    
    return state
