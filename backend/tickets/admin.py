from django.contrib import admin
from .models import Ticket, TriageResult

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("id", "subject", "customer_email", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("subject", "body", "customer_email")
    readonly_fields = ("id", "created_at", "updated_at")

@admin.register(TriageResult)
class TriageResultAdmin(admin.ModelAdmin):
    list_display = (
        "ticket",
        "category",
        "priority",
        "confidence",
        "reviewed_by_human",
        "created_at",
    )
    list_filter = ("category", "priority", "reviewed_by_human")
    search_fields = ("ticket__subject", "category", "priority")
    readonly_fields = ("created_at",)
