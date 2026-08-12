from datetime import datetime
from typing import Literal, Optional
from uuid import UUID
from ninja import Schema
from .models import TriageResult

CategoryValue = Literal["billing", "technical", "account", "general", "feature_request"]
PriorityValue = Literal["low", "medium", "high"]


class TicketIn(Schema):
    subject: str
    body: str
    customer_email: str


class TriageResultOut(Schema):
    category: str
    priority: str
    confidence: float
    reasoning: str
    reviewed_by_human: bool


class TicketOut(Schema):
    id: UUID
    subject: str
    status: str
    created_at: datetime
    triage_result: Optional[TriageResultOut] = None

    @staticmethod
    def resolve_triage_result(obj):
        if hasattr(obj, "_prefetched_triage_result"):
            return obj._prefetched_triage_result
        try:
            return obj.triage_result
        except TriageResult.DoesNotExist:
            return None


class ResolveIn(Schema):
    category: CategoryValue
    priority: PriorityValue