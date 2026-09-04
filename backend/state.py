from typing import TypedDict

class State(TypedDict):
    topic: str 
    draft: str
    decision: str
    feedback: str
    revision_count: int
    