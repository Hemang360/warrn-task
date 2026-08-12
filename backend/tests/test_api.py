import json
import uuid
import pytest
from tickets.models import Ticket, TriageResult

pytestmark = pytest.mark.django_db


def _create_ticket(**overrides):
    defaults = {
        "subject": "Cannot log in",
        "body": "I get an error when trying to log in.",
        "customer_email": "customer@example.com",
        "status": Ticket.Status.PENDING,
    }
    defaults.update(overrides)
    return Ticket.objects.create(**defaults)


class TestCreateTicket:
    def test_happy_path(self, client):
        payload = {
            "subject": "Billing question",
            "body": "Why was I charged twice?",
            "customer_email": "user@example.com",
        }
        response = client.post(
            "/api/tickets", data=json.dumps(payload), content_type="application/json"
        )

        assert response.status_code == 201
        data = response.json()
        assert data["subject"] == payload["subject"]
        assert data["status"] == "pending"
        assert data["triage_result"] is None

        ticket = Ticket.objects.get(id=data["id"])
        assert ticket.customer_email == payload["customer_email"]


class TestGetTicket:
    def test_happy_path_without_triage_result(self, client):
        ticket = _create_ticket()

        response = client.get(f"/api/tickets/{ticket.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(ticket.id)
        assert data["triage_result"] is None

    def test_happy_path_with_triage_result(self, client):
        ticket = _create_ticket(status=Ticket.Status.TRIAGED)
        TriageResult.objects.create(
            ticket=ticket,
            category="billing",
            priority="high",
            confidence=0.92,
            reasoning="Duplicate charge detected.",
            reviewed_by_human=False,
        )

        response = client.get(f"/api/tickets/{ticket.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["triage_result"]["category"] == "billing"
        assert data["triage_result"]["confidence"] == 0.92

    def test_404_for_unknown_ticket(self, client):
        response = client.get(f"/api/tickets/{uuid.uuid4()}")
        assert response.status_code == 404


class TestListTickets:
    def test_default_pagination(self, client):
        for i in range(3):
            _create_ticket(subject=f"Ticket {i}")

        response = client.get("/api/tickets")

        assert response.status_code == 200
        assert len(response.json()) == 3

    def test_status_filter(self, client):
        _create_ticket(subject="Pending one", status=Ticket.Status.PENDING)
        _create_ticket(subject="Resolved one", status=Ticket.Status.RESOLVED)

        response = client.get("/api/tickets", {"status": "resolved"})

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["subject"] == "Resolved one"

    def test_limit_offset(self, client):
        for i in range(5):
            _create_ticket(subject=f"Ticket {i}")

        response = client.get("/api/tickets", {"limit": 2, "offset": 1})

        assert response.status_code == 200
        assert len(response.json()) == 2


class TestResolveTicket:
    def test_happy_path(self, client):
        ticket = _create_ticket(status=Ticket.Status.NEEDS_REVIEW)
        payload = {"category": "technical", "priority": "medium"}

        response = client.post(
            f"/api/tickets/{ticket.id}/resolve",
            data=json.dumps(payload),
            content_type="application/json",
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "resolved"
        assert data["triage_result"]["category"] == "technical"
        assert data["triage_result"]["priority"] == "medium"
        assert data["triage_result"]["confidence"] == 1.0
        assert data["triage_result"]["reviewed_by_human"] is True

        ticket.refresh_from_db()
        assert ticket.status == Ticket.Status.RESOLVED

    def test_409_when_not_needs_review(self, client):
        ticket = _create_ticket(status=Ticket.Status.PENDING)
        payload = {"category": "technical", "priority": "medium"}

        response = client.post(
            f"/api/tickets/{ticket.id}/resolve",
            data=json.dumps(payload),
            content_type="application/json",
        )

        assert response.status_code == 409
        ticket.refresh_from_db()
        assert ticket.status == Ticket.Status.PENDING

    def test_404_for_unknown_ticket(self, client):
        payload = {"category": "technical", "priority": "medium"}

        response = client.post(
            f"/api/tickets/{uuid.uuid4()}/resolve",
            data=json.dumps(payload),
            content_type="application/json",
        )

        assert response.status_code == 404