import { notFound } from "next/navigation";
import { getTicket } from "@/lib/api";
import { resolveTicketAction } from "@/app/actions";
import StatusBadge from "@/components/StatusBadge";

type TicketPageProps = {
  params: { id: string };
};

export default async function TicketDetailPage({ params }: TicketPageProps) {
  const ticket = await getTicket(params.id);

  if (!ticket) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{ticket.subject}</h1>
        <StatusBadge status={ticket.status} />
      </div>

      {ticket.triage_result && (
        <section className="mb-8 rounded-md border border-gray-200 p-4">
          <h2 className="mb-3 text-sm font-medium text-gray-500">
            Triage Result
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Category</dt>
              <dd>{ticket.triage_result.category}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Priority</dt>
              <dd>{ticket.triage_result.priority}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Confidence</dt>
              <dd>{ticket.triage_result.confidence.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="mb-1 text-gray-500">Reasoning</dt>
              <dd className="text-gray-700">
                {ticket.triage_result.reasoning}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {ticket.status === "needs_review" && (
        <form
          action={resolveTicketAction.bind(null, ticket.id)}
          className="space-y-4 rounded-md border border-gray-200 p-4"
        >
          <h2 className="text-sm font-medium text-gray-500">
            Resolve Ticket
          </h2>

          <div>
            <label
              htmlFor="category"
              className="mb-1 block text-sm font-medium"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="billing">Billing</option>
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
              <option value="account">Account</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="priority"
              className="mb-1 block text-sm font-medium"
            >
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <button
            type="submit"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Resolve
          </button>
        </form>
      )}
    </main>
  );
}