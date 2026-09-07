from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import json

from backend.graph import stream_workflow


app = FastAPI(title="Self-Correcting Multi-Agent App")


origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RunRequest(BaseModel):
    topic: str = Field(min_length=2, max_length=300)


@app.post("/api/run")
def run_agents(payload: RunRequest):
    topic = payload.topic.strip()

    if not topic:
        raise HTTPException(
            status_code=400,
            detail="Please enter a topic.",
        )

    def event_stream():
        for event in stream_workflow(topic):
            yield json.dumps(event) + "\n"

    return StreamingResponse(
        event_stream(),
        media_type="application/x-ndjson",
    )