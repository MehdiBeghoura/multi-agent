from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from backend.graph import graph


app = FastAPI(title="Self-Correcting Multi-Agent App")


class RunRequest(BaseModel):
    topic: str = Field(min_length=2, max_length=300)


@app.post("/api/run")
def run_agents(payload: RunRequest):
    topic = payload.topic.strip()

    if not topic:
        raise HTTPException(status_code=400, detail="Please enter a topic.")

    initial_state = {
        "topic": topic,
        "draft": "",
        "decision": "",
        "feedback": "",
        "revision_count": 0,
    }

    try:
        result = graph.invoke(initial_state)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc