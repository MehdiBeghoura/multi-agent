import { useState } from "react";
import { runAgent } from "./api";
import AgentEventCard from "./components/AgentEventCard";
import type { AgentEvent, RunResponse } from "./types";

function App() {
  const [topic, setTopic] = useState("");
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [result, setResult] = useState<RunResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
  event: React.SyntheticEvent<HTMLFormElement>,
) {
  event.preventDefault();

  const trimmedTopic = topic.trim();

  if (!trimmedTopic) {
    setError("Please enter a topic.");
    return;
  }

  setLoading(true);
  setError("");
  setEvents([]);
  setResult(null);

  try {
    const response = await runAgent(
      trimmedTopic,
      (newEvent) => {
        setEvents((currentEvents) => [
          ...currentEvents,
          newEvent,
        ]);
      },
    );

    setResult(response);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Something went wrong.",
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            LangGraph + Groq
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Self-Correcting Multi-Agent
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            A Writer, Reviewer, and Reviser collaborate to improve
            an answer through iterative feedback.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl"
        >
          <label
            htmlFor="topic"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Research topic
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="e.g. What is RAG?"
              maxLength={300}
              disabled={loading}
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Running..." : "Generate"}
            </button>
          </div>

          <div className="mt-3 flex justify-between text-xs text-slate-600">
            <span>Maximum 300 characters</span>
            <span>{topic.length}/300</span>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </form>

        {events.length > 0 && (
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Agent Workflow
              </h2>

              {loading && (
                <span className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                  Running
                </span>
              )}
            </div>

            <div className="space-y-4">
              {events.map((event, index) => (
                <div
                  key={`${event.agent}-${index}`}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div className="mt-5 h-3 w-3 rounded-full bg-slate-500" />

                    {index < events.length - 1 && (
                      <div className="mt-2 h-full w-px bg-slate-800" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <AgentEventCard event={event} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {result && (
          <section className="mt-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold">
                  Final Answer
                </h2>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span
                    className={`rounded-full px-3 py-1 font-semibold ${
                      result.final_decision === "APPROVE"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {result.final_decision}
                  </span>

                  <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-400">
                    {result.revision_count}{" "}
                    {result.revision_count === 1
                      ? "revision"
                      : "revisions"}
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-slate-950 p-5">
                <p className="whitespace-pre-wrap leading-7 text-slate-300">
                  {result.final_answer}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default App;