import type { AgentEvent } from "../types";

interface AgentEventCardProps {
  event: AgentEvent;
}

function AgentEventCard({ event }: AgentEventCardProps) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium capitalize">
          {event.agent}
        </h3>

        {event.agent === "reviser" && event.revision_count > 0 && (
          <span className="text-sm text-slate-500">
            Revision {event.revision_count}
          </span>
        )}
      </div>

      {event.decision && (
        <p className="mt-2 text-sm">
          Decision:{" "}
          <span className="font-semibold">
            {event.decision}
          </span>
        </p>
      )}

      {event.feedback && (
        <p className="mt-3 text-sm leading-6 text-slate-400">
          <span className="font-medium text-slate-300">
            Feedback:
          </span>{" "}
          {event.feedback}
        </p>
      )}

      {event.draft && (
        <p className="mt-3 text-sm text-slate-500">
          Draft generated
        </p>
      )}
    </article>
  );
}

export default AgentEventCard;