"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

type TriageResult = {
  category: string;
  priority: string;
  confidence: number;
  reasoning: string;
  reviewed_by_human: boolean;
};

type Ticket = {
  id: string;
  subject: string;
  customer_email?: string;
  status: string;
  created_at: string;
  triage_result: TriageResult | null;
};

const TERMINAL_STATUSES = ["triaged", "resolved", "failed"];
const POLL_INTERVAL_MS = 3000;

export default function TicketListClient() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8000/api/tickets");
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      setTickets(data);
    } catch (err: any) {
      setError(err.message ?? String(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Poll while any ticket is in a non-terminal state
  useEffect(() => {
    if (!tickets) return;
    const hasLive = tickets.some((t) => !TERMINAL_STATUSES.includes(t.status));
    if (!hasLive) return;

    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [tickets, load]);

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-600 dark:text-rose-400">
        <p className="font-semibold">Failed to load tickets</p>
        <p className="text-xs mt-0.5 opacity-80">{error}</p>
      </div>
    );
  }

  if (!tickets) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 px-4 py-4"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1 mr-4">
                <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
              </div>
              <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900/30 p-10 text-center">
        <p className="text-2xl mb-2">🎫</p>
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">No tickets yet</p>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
          Submit your first ticket using the form above.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {tickets.map((ticket) => {
        const isLive = !TERMINAL_STATUSES.includes(ticket.status);
        const formattedDate = ticket.created_at
          ? new Date(ticket.created_at).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "";

        return (
          <li key={ticket.id}>
            <Link
              href={`/tickets/${ticket.id}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 px-4 py-4 hover:border-blue-500/40 hover:bg-blue-500/5 dark:hover:bg-blue-500/10 transition-all group"
            >
              <div className="min-w-0 flex-1 mr-4">
                <div className="flex items-center gap-2">
                  {isLive && (
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                  )}
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {ticket.subject}
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                  {ticket.customer_email && (
                    <span className="truncate">✉️ {ticket.customer_email}</span>
                  )}
                  {ticket.created_at && (
                    <span className="shrink-0">📅 {formattedDate}</span>
                  )}
                  {ticket.triage_result && (
                    <span className="shrink-0 capitalize text-gray-500 dark:text-gray-400 font-medium">
                      🏷️ {ticket.triage_result.category} · {ticket.triage_result.priority} priority
                    </span>
                  )}
                </div>
              </div>
              <StatusBadge status={ticket.status as any} size="sm" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
