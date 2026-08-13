import React from "react";

type TicketProgressStepperProps = {
  status: string;
};

export default function TicketProgressStepper({
  status,
}: TicketProgressStepperProps) {
  const isPending = status === "pending";
  const isNeedsReview = status === "needs_review";
  const isTriaged = status === "triaged";
  const isResolved = status === "resolved";
  const isFailed = status === "failed";
  const isLive = isPending || isNeedsReview;

  const step3Title = isNeedsReview
    ? "Human Review"
    : isTriaged
    ? "Auto-Triaged"
    : isResolved
    ? "Resolved"
    : isFailed
    ? "Failed"
    : "Resolution";

  const step3Desc = isNeedsReview
    ? "Awaiting human resolution"
    : isPending
    ? "Pending AI classification"
    : isTriaged
    ? "AI classified with confidence"
    : isResolved
    ? "Reviewed & resolved by human"
    : isFailed
    ? "Workflow encountered an error"
    : "Complete";

  const steps = [
    {
      id: "created",
      title: "Submitted",
      desc: "Ticket received",
      state: "completed",
    },
    {
      id: "ai_triage",
      title: "AI Triage",
      desc: isPending ? "Analyzing content…" : "Classification complete",
      state: isPending ? "active" : "completed",
    },
    {
      id: "review_resolution",
      title: step3Title,
      desc: step3Desc,
      state: isPending
        ? "upcoming"
        : isNeedsReview
        ? "active"
        : isFailed
        ? "failed"
        : "completed",
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Ticket Workflow Progress
        </h3>
        {isLive && (
          <span className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Live Polling Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {steps.map((step, idx) => {
          const isCompleted = step.state === "completed";
          const isActive = step.state === "active";
          const isFailed = step.state === "failed";

          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                isActive
                  ? "border-blue-500/50 bg-blue-500/5 dark:bg-blue-500/10 shadow-sm"
                  : isCompleted
                  ? "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10"
                  : isFailed
                  ? "border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10"
                  : "border-gray-200 dark:border-gray-800/60 opacity-60"
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-blue-600 text-white animate-pulse"
                    : isFailed
                    ? "bg-rose-500 text-white"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-500"
                }`}
              >
                {isCompleted ? "✓" : isFailed ? "✕" : idx + 1}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
