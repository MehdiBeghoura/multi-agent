from typing import Literal
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()


class ReviewerOutput(BaseModel):
    feedback: str = Field(description="The feedback provided by the reviewer.")
    decision: Literal["APPROVE", "REVISE"] = Field(description="The decision made by the reviewer.")
    
    
    
llm = ChatGroq(
    model="openai/gpt-oss-20b",
    temperature=0,
)


structured_llm = llm.with_structured_output(ReviewerOutput)