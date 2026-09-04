from backend.graph import graph


initial_state = {
    "topic": "What is an AI agent?",
    "draft": "",
    "decision": "",
    "feedback": "",
    "revision_count": 0,
}


for update in graph.stream(initial_state, stream_mode="updates"):
    print(update)