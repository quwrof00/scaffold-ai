from langgraph.graph import StateGraph, START, END
from app.graph.state import GraphState
from app.graph.nodes.rule_engine import rule_engine_node
from app.graph.nodes.llm_layer import diagnosis_node, socratic_node, hint_node, concept_graph_generator_node, concept_evaluator_node
from app.graph.nodes.objective_evaluator import objective_evaluator_node

def route_after_rules(state: GraphState):
    """Router based on the next_action determined by the rule engine."""
    next_action = state.get("next_action")
    session = state.get("session")
    
    if next_action == "evaluate_objective":
        return "objective_evaluator_node"
    
    # Concept Flow Routing
    if session and getattr(session, 'intent', None) == "CONCEPT_UNDERSTANDING":
        if not state.get("concept_graph"):
            return "concept_graph_generator_node"
        return "concept_evaluator_node"
        
    # Problem Solving Routing
    if next_action == "hint":
        return "hint_node"
    elif next_action == "socratic":
        return "socratic_node"
    return "diagnosis_node"

def build_workflow():
    workflow = StateGraph(GraphState)
    
    # Add nodes
    workflow.add_node("rule_engine", rule_engine_node)
    workflow.add_node("diagnosis_node", diagnosis_node)
    workflow.add_node("socratic_node", socratic_node)
    workflow.add_node("hint_node", hint_node)
    workflow.add_node("concept_graph_generator_node", concept_graph_generator_node)
    workflow.add_node("concept_evaluator_node", concept_evaluator_node)
    workflow.add_node("objective_evaluator_node", objective_evaluator_node)
    
    # Add edges
    workflow.add_edge(START, "rule_engine")
    
    # Conditional edge after rule engine
    workflow.add_conditional_edges(
        "rule_engine",
        route_after_rules,
        {
            "hint_node": "hint_node",
            "diagnosis_node": "diagnosis_node",
            "socratic_node": "socratic_node",
            "concept_graph_generator_node": "concept_graph_generator_node",
            "concept_evaluator_node": "concept_evaluator_node",
            "objective_evaluator_node": "objective_evaluator_node"
        }
    )
    
    # Concept Flow
    workflow.add_edge("concept_graph_generator_node", "concept_evaluator_node")
    workflow.add_edge("concept_evaluator_node", "socratic_node")
    
    # Standard flow: Diagnosis -> End (since diagnosis generates its own question)
    workflow.add_edge("diagnosis_node", END)
    workflow.add_edge("socratic_node", END)
    
    # Hint flow: Hint -> End
    workflow.add_edge("hint_node", END)
    
    # Objective evaluation -> End
    workflow.add_edge("objective_evaluator_node", END)
    
    return workflow

# Return the uncompiled workflow graph so the main app can compile it with a checkpointer
app_workflow_builder = build_workflow()
