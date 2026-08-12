from ninja import NinjaAPI
from typing import List, Optional
from uuid import UUID
from django.shortcuts import get_object_or_404
from ninja import NinjaAPI, Query
from ninja.errors import HttpError
from .models import Ticket, TriageResult
from .schemas import ResolveIn, TicketIn, TicketOut
from .temporal_client import get_temporal_client
from .workflows import TriageWorkflow

api = NinjaAPI()

@api.post("/tickets", response={201: TicketOut})
async def create_ticket(request, payload: TicketIn):
    ticket = await Ticket.objects.acreate(
        subject=payload.subject,
        body=payload.body,
        customer_email=payload.customer_email,
        status=Ticket.Status.PENDING,
    )

    client = await get_temporal_client()
    handle = await client.start_workflow(
        TriageWorkflow.run,
        {
            "ticket_id": str(ticket.id),
            "subject": ticket.subject,
            "body": ticket.body,
        },
        id=f"triage-{ticket.id}",
        task_queue="triage-queue",
    )
    ticket.workflow_id = handle.id
    await ticket.asave()

    ticket._prefetched_triage_result = None
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
async def resolve_ticket(request, ticket_id: UUID, payload: ResolveIn):
    try:
        ticket = await Ticket.objects.aget(id=ticket_id)
    except Ticket.DoesNotExist:
        raise HttpError(404, "Ticket not found.")

    if ticket.status != Ticket.Status.NEEDS_REVIEW:
        raise HttpError(
            409,
            f"Ticket must be in 'needs_review' status to resolve "
            f"(current status: '{ticket.status}').",
        )

    client = await get_temporal_client()
    handle = client.get_workflow_handle(ticket.workflow_id)
    await handle.signal(TriageWorkflow.submit_human_review, payload.dict())

    ticket._prefetched_triage_result = None
    return ticket