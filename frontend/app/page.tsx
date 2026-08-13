import { createTicketAction } from "@/app/actions";
import TicketListClient from "@/components/TicketListClient";

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Create ticket section */}
      <section className="mb-10">
        <div className="mb-4">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Submit a Ticket
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Describe your issue and our AI will classify it automatically. Ambiguous tickets are routed to a human reviewer.
          </p>
        </div>

        <form
          action={createTicketAction}
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-sm space-y-5"
        >
          <div>
            <label
              htmlFor="subject"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              placeholder="e.g. Charged twice for my subscription"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition"
            />
          </div>

          <div>
            <label
              htmlFor="body"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Message Body
            </label>
            <textarea
              id="body"
              name="body"
              required
              rows={4}
              placeholder="Describe the issue in detail…"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="customer_email"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Customer Email
            </label>
            <input
              id="customer_email"
              name="customer_email"
              type="email"
              required
              placeholder="customer@example.com"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition"
            />
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 active:scale-95 transition-all"
            >
              <span>🚀</span> Submit Ticket
            </button>
          </div>
        </form>
      </section>

      {/* Ticket list section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
            All Tickets
          </h2>
          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
            </span>
            Auto-refreshing
          </span>
        </div>
        <TicketListClient />
      </section>
    </div>
  );
}