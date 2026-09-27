# agent/factory.py

"""
Purpose : Assemble all the nodes into a graph 

Contents :

- (function) route_by_intent : plain-Python conditional edge, reads state["intent"]
- (function) build_graph : wires nodes and edges, returns the compiled graph
- Singleton

"""

from langgraph.graph import END, START, StateGraph

from agent.nodes.classify import node_classify
from agent.nodes.github import node_github
from agent.nodes.qa import node_qa
from agent.state import AgentState


def route_by_intent(state: AgentState) -> str:
    """Only the github intent needs a fetch; everything else goes straight to qa."""
    if state["intent"] == "github":
        return "node_github"
    return "node_qa"


def build_graph():
    builder = StateGraph(AgentState)

    builder.add_node("node_classify", node_classify)
    builder.add_node("node_github", node_github)
    builder.add_node("node_qa", node_qa)

    builder.add_edge(START, "node_classify")
    builder.add_conditional_edges(
        "node_classify",
        route_by_intent,
        ["node_github", "node_qa"],   # possible destinations, for graph rendering
    )
    builder.add_edge("node_github", "node_qa")
    builder.add_edge("node_qa", END)

    return builder.compile()


# compiled once at import — compiling per request would waste time on every call
Graph = build_graph()