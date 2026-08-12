from django.db import models
import uuid

class Ticket(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        TRIAGED = "triaged", "Triaged"
        NEEDS_REVIEW = "needs_review", "Needs Review"
        RESOLVED = "resolved", "Resolved"
        FAILED = "failed", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.CharField(max_length=255)
    body = models.TextField()
    customer_email = models.EmailField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    workflow_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Temporal workflow ID once triage is dispatched.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.subject} ({self.status})"

class TriageResult(models.Model):
    
    ticket = models.OneToOneField(
        Ticket,
        on_delete=models.CASCADE,
        related_name="triage_result",
    )
    category = models.CharField(max_length=100)
    priority = models.CharField(max_length=50)
    confidence = models.FloatField()
    reasoning = models.TextField(blank=True)
    reviewed_by_human = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"TriageResult for {self.ticket_id} ({self.category}/{self.priority})"
