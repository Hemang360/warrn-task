import Link from "next/link";
import { getTickets } from "@/lib/api";
import { createTicketAction } from "@/app/actions";
import StatusBadge from "@/components/StatusBadge";

export default async function Home() {
  const tickets = await getTickets();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Tickets</h1>

      <form action={createTicketAction} className="mb-10 space-y-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-1">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium mb-1">
            Body
          </label>
          <textarea
            id="body"
            name="body"
            required
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="customer_email"
            className="block text-sm font-medium mb-1"
          >
            Customer email
          </label>
          <input
            id="customer_email"
            name="customer_email"
            type="email"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Create Ticket
        </button>
      </form>

      <h2 className="text-lg font-medium mb-3">All Tickets</h2>
      <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
        {tickets.map((ticket: typeof tickets[number]) => (
          <li key={ticket.id}>
            <Link
              href={`/tickets/${ticket.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
            >
              <span className="text-sm">{ticket.subject}</span>
              <StatusBadge status={ticket.status} />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}