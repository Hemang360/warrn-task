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
  status: "pending" | "triaged" | "needs_review" | "resolved" | "failed";
  created_at: string;
  triage_result: TriageResult | null;
};

const API_URL = process.env.DJANGO_API_URL ?? "http://localhost:8000";