import type { AgentEvent, RunResponse } from "./types";

interface NodeUpdate {
  draft?: string;
  decision?: AgentEvent["decision"];
  feedback?: string;
  revision_count?: number;
}

type GraphUpdate = Record<string, NodeUpdate>;

export async function runAgent(
  topic: string,
  onEvent: (event: AgentEvent) => void,
): Promise<RunResponse> {
  const response = await fetch("http://localhost:8000/api/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ topic }),
  });

  if (!response.ok) {
    throw new Error("Failed to run the agent workflow.");
  }

  if (!response.body) {
    throw new Error("The server did not return a response body.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  const events: AgentEvent[] = [];

  let finalAnswer = "";
  let finalDecision: AgentEvent["decision"] = "";
  let revisionCount = 0;

  function processLine(line: string) {
    if (!line.trim()) {
      return;
    }

    const update = JSON.parse(line) as GraphUpdate;

    for (const [agent, values] of Object.entries(update)) {
      const event: AgentEvent = {
        agent: agent as AgentEvent["agent"],
        draft: values.draft ?? "",
        decision: values.decision ?? "",
        feedback: values.feedback ?? "",
        revision_count: values.revision_count ?? 0,
      };

      events.push(event);

      if (event.draft) {
        finalAnswer = event.draft;
      }

      if (event.decision) {
        finalDecision = event.decision;
      }

      revisionCount = event.revision_count;

     

      onEvent(event);
    }
  }

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");

    
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      processLine(line);
    }
  }

  
  if (buffer.trim()) {
    processLine(buffer);
  }

  return {
    topic,
    events,
    final_answer: finalAnswer,
    final_decision: finalDecision,
    revision_count: revisionCount,
  };
}