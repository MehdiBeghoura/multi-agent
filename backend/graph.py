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

def run_workflow(topic: str):
    initial_state: State = {
        "topic": topic,
        "draft": "",
        "decision": "",
        "feedback": "",
        "revision_count": 0,
    }

    final_state = initial_state.copy()

    events = []

    for update in graph.stream(
        initial_state,
        stream_mode="updates",
    ):
        for node_name, values in update.items():
            final_state.update(values)

            events.append(
                {
                    "agent": node_name,
                    "draft": values.get("draft", ""),
                    "decision": values.get("decision", ""),
                    "feedback": values.get("feedback", ""),
                    "revision_count": final_state["revision_count"],
                }
            )

    return {
        "topic": topic,
        "events": events,
        "final_answer": final_state["draft"],
        "final_decision": final_state["decision"],
        "revision_count": final_state["revision_count"],
    }
    
def stream_workflow(topic: str):
    initial_state: State = {
        "topic": topic,
        "draft": "",
        "decision": "",
        "feedback": "",
        "revision_count": 0,
    }

    for chunk in graph.stream(
        initial_state,
        stream_mode="updates",
        version="v2",
    ):
        if chunk["type"] == "updates":
            yield chunk["data"]