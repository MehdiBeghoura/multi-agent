from langgraph.graph import END, START, StateGraph
from backend.nodes import reviewer, reviser, writer
from backend.state import State


MAX_REVISIONS = 3

def route_after_review(state: State):
    if state["decision"] == "APPROVE":
        return "done"

    if state["revision_count"] >= MAX_REVISIONS:
        return "done"

    return "revise"

builder = StateGraph(State)


builder.add_node("writer", writer)
builder.add_node("reviewer", reviewer)
builder.add_node("reviser", reviser)

builder.add_edge(START, "writer")
builder.add_edge("writer", "reviewer")
builder.add_conditional_edges("reviewer", route_after_review, {"revise": "reviser", "done": END})
builder.add_edge("reviser", "reviewer")

graph = builder.compile()

