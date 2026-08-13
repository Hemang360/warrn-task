import Link from "next/link";
import { notFound } from "next/navigation";
import { getTicket } from "@/lib/api";
import { resolveTicketAction } from "@/app/actions";
import StatusBadge from "@/components/StatusBadge";
import PollingRefresher from "@/components/PollingRefresher";
import TicketProgressStepper from "@/components/TicketProgressStepper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type TicketPageProps = {
  params: Promise<{ id: string }>;
};

const TERMINAL_STATUSES = ["triaged", "resolved", "failed"];

export default async function TicketDetailPage({ params }: TicketPageProps) {
  const { id } = await params;
  const ticket = await getTicket(id);

  if (!ticket) {
    notFound();
  }

  const formattedDate = ticket.created_at
    ? new Date(ticket.created_at).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Recently";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 text-gray-900 dark:text-gray-100">
      {!TERMINAL_STATUSES.includes(ticket.status) && (
        <PollingRefresher intervalMs={3000} />
      )}

      {/* Navigation Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        >
          <span className="text-base">←</span> Back to All Tickets
        </Link>
        <span className="text-xs font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800/80 px-2.5 py-1 rounded-md">
          ID: {ticket.id}
        </span>
      </div>

      {/* Title & Status Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{ticket.subject}</h1>
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            {ticket.customer_email && (
              <span className="flex items-center gap-1.5 font-medium">
                <span className="text-sm">✉️</span> {ticket.customer_email}
              </span>
            )}
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="text-sm">📅</span> {formattedDate}
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <StatusBadge status={ticket.status} size="md" />
        </div>
      </div>

      {/* Progress Workflow Stepper */}
      <TicketProgressStepper status={ticket.status} />

      {/* Status Alert Banners */}
      {ticket.status === "pending" && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-400">
          <span className="text-lg">⏳</span>
          <div>
            <p className="font-semibold">AI Triage In Progress</p>
            <p className="text-xs opacity-90">
              Our automated LLM workflow is currently classifying your request. This page auto-refreshes every 3 seconds.
            </p>
          </div>
        </div>
      )}

      {ticket.status === "needs_review" && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-orange-500/20 bg-orange-500/10 p-4 text-sm text-orange-600 dark:text-orange-400">
          <span className="text-lg">🚨</span>
          <div>
            <p className="font-semibold">Human Review Required</p>
            <p className="text-xs opacity-90">
              The AI classifier flagged this request as ambiguous. A support team member can review and resolve it below.
            </p>
          </div>
        </div>
      )}

      {/* Main Ticket Body Details Card */}
      <section className="mb-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-xs">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800/80 pb-2">
          Ticket Message Body
        </h2>
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          {ticket.body || "No body content provided."}
        </div>
      </section>

      {/* AI Triage Breakdown Card */}
      {ticket.triage_result && (
        <section className="mb-8 rounded-xl border border-blue-500/20 bg-blue-500/5 dark:bg-blue-500/10 p-6">
          <div className="flex items-center justify-between mb-4 border-b border-blue-500/20 pb-3">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>🤖</span> AI Triage Classification
            </h2>
            {ticket.triage_result.reviewed_by_human && (
              <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Reviewed by Human
              </span>
            )}
          </div>

          <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="rounded-lg border border-gray-200/60 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 p-3">
              <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Category
              </dt>
              <dd className="mt-1 text-sm font-bold capitalize text-gray-900 dark:text-gray-100">
                {ticket.triage_result.category}
              </dd>
            </div>

            <div className="rounded-lg border border-gray-200/60 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 p-3">
              <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Priority
              </dt>
              <dd className="mt-1 text-sm font-bold capitalize text-gray-900 dark:text-gray-100">
                {ticket.triage_result.priority}
              </dd>
            </div>

            <div className="rounded-lg border border-gray-200/60 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 p-3">
              <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Confidence Score
              </dt>
              <dd className="mt-1 flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {(ticket.triage_result.confidence * 100).toFixed(0)}%
                </span>
                <div className="h-1.5 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${ticket.triage_result.confidence * 100}%`,
                    }}
                  />
                </div>
              </dd>
            </div>
          </dl>

          {ticket.triage_result.reasoning && (
            <div className="rounded-lg border border-gray-200/60 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 p-4">
              <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                LLM Reasoning & Explanation
              </dt>
              <dd className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {ticket.triage_result.reasoning}
              </dd>
            </div>
          )}
        </section>
      )}

      {/* Human Resolution Form */}
      {ticket.status === "needs_review" && (
        <form
          action={resolveTicketAction.bind(null, ticket.id)}
          className="space-y-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 p-6 shadow-md"
        >
          <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>👤</span> Manual Human Resolution
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Select the final category and priority to complete ticket triage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="category"
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="billing">💳 Billing</option>
                <option value="account">👤 Account</option>
                <option value="technical">🐛 Technical / Bug</option>
                <option value="feature_request">✨ Feature Request</option>
                <option value="general">💬 General / Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="priority"
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300"
              >
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              Submit Resolution
            </button>
          </div>
        </form>
      )}
    </div>
  );
}