from backend.llm import llm, structured_llm


def writer(state):
    topic = state["topic"]

    response = llm.invoke(
        f"""
You are the Writer agent in a self-correcting multi-agent system.

Write a beginner-friendly explanation about this topic:
{topic}

Requirements:
- Use simple language.
- Include one everyday analogy.
- Include one small concrete example.
- Keep the answer concise.
"""
    )

    return {"draft": response.content}


def reviewer(state):
    draft = state["draft"]
    topic = state["topic"]

    
    response = structured_llm.invoke(
    f"""
You are the Reviewer agent in a self-correcting multi-agent system.

Review this answer about "{topic}".

Check whether:
1. It is easy for a beginner to understand.
2. It contains an everyday analogy.
3. It contains a small concrete example.
4. It stays focused on the topic.

Rules:
- If ALL four requirements are satisfied:
  decision = "APPROVE"
  feedback = ""

- If ANY requirement is not satisfied:
  decision = "REVISE"
  feedback = a specific explanation of what should be changed.
  DO NOT put the word "REVISE" in the feedback.

Answer:
{draft}
"""
)

    return {
        "feedback": response.feedback,
        "decision": response.decision,
    }


def reviser(state):
    draft = state["draft"]
    feedback = state["feedback"]

    response = llm.invoke(
        f"""
You are the Reviser agent in a self-correcting multi-agent system.

Improve the answer using the reviewer's feedback.

Current answer:
{draft}

Reviewer feedback:
{feedback}

Return only the improved answer.
"""
    )

    return {
        "draft": response.content,
        "revision_count": state["revision_count"] + 1,
    }