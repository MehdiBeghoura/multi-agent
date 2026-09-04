from typing import Literal
from pydantic import BaseModel, Field
from langchain_ollama import ChatOllama



class ReviewerOutput(BaseModel):
    feedback: str = Field(description="The feedback provided by the reviewer.")
    decision: Literal["APPROVE", "REVISE"] = Field(description="The decision made by the reviewer.")
    
    
    
llm = ChatOllama(
    model="qwen2.5:3b",
    temperature=0,
)


structured_llm = llm.with_structured_output(ReviewerOutput)