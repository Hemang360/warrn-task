"use client";

import React, { useEffect, useState } from "react";
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
  status: string;
  created_at: string;
  triage_result: TriageResult | null;
};

export default function TicketListClient() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // Use host-mapped backend URL for browser requests in dev
        const API = "http://localhost:8000";
        const res = await fetch(`${API}/api/tickets`);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        if (!cancelled) setTickets(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? String(err));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  if (!tickets) return <div>Loading tickets…</div>;

  return (
    <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          <a
            href={`/tickets/${ticket.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
          >
            <span className="text-sm">{ticket.subject}</span>
            <StatusBadge status={ticket.status as any} />
          </a>
        </li>
      ))}
    </ul>
  );
}
