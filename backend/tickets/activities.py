from temporalio import activity

from tickets.models import Ticket, TriageResult


@activity.defn
async def classify_ticket(input: dict) -> dict:
    # TODO: replace this stub with a real Pydantic AI call that classifies
    # input["subject"] / input["body"] into category/priority/confidence.
    return {
        "category": "bug",
        "priority": "medium",
        "confidence": 0.9,
        "reasoning": "stub",
    }


@activity.defn
async def mark_needs_review(ticket_id: str) -> None:
    ticket = await Ticket.objects.aget(id=ticket_id)
    ticket.status = Ticket.Status.NEEDS_REVIEW
    await ticket.asave()


@activity.defn
async def save_triage_result(data: dict) -> None:
    ticket = await Ticket.objects.aget(id=data["ticket_id"])
    await TriageResult.objects.aupdate_or_create(
        ticket=ticket,
        defaults={
            "category": data["category"],
            "priority": data["priority"],
            "confidence": data["confidence"],
            "reasoning": data["reasoning"],
            "reviewed_by_human": data["reviewed_by_human"],
        },
    )
    ticket.status = (
        Ticket.Status.RESOLVED if data["reviewed_by_human"] else Ticket.Status.TRIAGED
    )
    await ticket.asave()