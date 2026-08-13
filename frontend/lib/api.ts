export type TriageResult = {
  category: string;
  priority: string;
  confidence: number;
  reasoning: string;
  reviewed_by_human: boolean;
};

export type Ticket = {
  id: string;
  subject: string;
  body?: string;
  customer_email?: string;
  status: "pending" | "triaged" | "needs_review" | "resolved" | "failed";
  created_at: string;
  triage_result: TriageResult | null;
};

const API_URL = process.env.DJANGO_API_URL ?? "http://localhost:8000";

export async function getTickets(): Promise<Ticket[]> {
  const response = await fetch(`${API_URL}/api/tickets`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tickets");
  }

  return response.json();
}

export async function getTicket(id: string): Promise<Ticket | null> {
  const response = await fetch(`${API_URL}/api/tickets/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function createTicket(data: {
  subject: string;
  body: string;
  customer_email: string;
}): Promise<Ticket> {
  const response = await fetch(`${API_URL}/api/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create ticket");
  }

  return response.json();
}

export async function resolveTicket(
  ticketId: string,
  data: { category: string; priority: string }
): Promise<Ticket> {
  const response = await fetch(`${API_URL}/api/tickets/${ticketId}/resolve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to resolve ticket");
  }

  return response.json();
}