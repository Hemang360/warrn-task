from ninja import NinjaAPI
from typing import List, Optional
from uuid import UUID
from django.shortcuts import get_object_or_404
from ninja import NinjaAPI, Query
from ninja.errors import HttpError
from .models import Ticket, TriageResult
from .schemas import ResolveIn, TicketIn, TicketOut

api = NinjaAPI()

@api.post("/tickets", response={201: TicketOut})
def create_ticket(request, payload: TicketIn):
    ticket = Ticket.objects.create(
        subject=payload.subject,
        body=payload.body,
        customer_email=payload.customer_email,
        status=Ticket.Status.PENDING,
    )
    # TODO: once Temporal is wired up, start the triage workflow here and
    # persist ticket.workflow_id. This endpoint becomes `async def` at that
    # point so it can await the Temporal client — leave it sync until then.
    return 201, ticket


@api.get("/tickets/{ticket_id}", response=TicketOut)
def get_ticket(request, ticket_id: UUID):
    ticket = get_object_or_404(Ticket, id=ticket_id)
    return ticket


@api.get("/tickets", response=List[TicketOut])
def list_tickets(
    request,
    status: Optional[str] = Query(None),
    limit: int = Query(20),
    offset: int = Query(0),
):
    qs = Ticket.objects.all().order_by("-created_at")
    if status:
        qs = qs.filter(status=status)
    return list(qs[offset : offset + limit])


@api.post("/tickets/{ticket_id}/resolve", response=TicketOut)
def resolve_ticket(request, ticket_id: UUID, payload: ResolveIn):
    ticket = get_object_or_404(Ticket, id=ticket_id)

    if ticket.status != Ticket.Status.NEEDS_REVIEW:
        raise HttpError(
            409,
            f"Ticket must be in 'needs_review' status to resolve "
            f"(current status: '{ticket.status}').",
        )

    # TODO: once Temporal is wired up, this direct write is replaced by
    # signaling the running workflow instead of mutating the DB here.
    TriageResult.objects.update_or_create(
        ticket=ticket,
        defaults={
            "category": payload.category,
            "priority": payload.priority,
            "confidence": 1.0,
            "reasoning": "Manually resolved by a human reviewer.",
            "reviewed_by_human": True,
        },
    )
    ticket.status = Ticket.Status.RESOLVED
    ticket.save(update_fields=["status", "updated_at"])
    return ticket