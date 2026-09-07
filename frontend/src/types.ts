export type Decision = "APPROVE" | "REVISE" | "";

export type AgentName = "writer" | "reviewer" | "reviser";

export interface AgentEvent {
  agent: AgentName;
  draft: string;
  decision: Decision;
  feedback: string;
  revision_count: number;
}

export interface RunResponse {
  topic: string;
  events: AgentEvent[];
  final_answer: string;
  final_decision: Decision;
  revision_count: number;
}