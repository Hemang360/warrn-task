"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createTicket, resolveTicket } from "@/lib/api";

export async function createTicketAction(formData: FormData) {
  const subject = formData.get("subject") as string;
  const body = formData.get("body") as string;
  const customer_email = formData.get("customer_email") as string;
  const ticket = await createTicket({ subject, body, customer_email });

  redirect(`/tickets/${ticket.id}`);
}

export async function resolveTicketAction(
  ticketId: string,
  formData: FormData
) {
  const category = formData.get("category") as string;
  const priority = formData.get("priority") as string;

  await resolveTicket(ticketId, { category, priority });

  revalidatePath(`/tickets/${ticketId}`);
}