import json
import uuid
from unittest.mock import AsyncMock, MagicMock
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

@pytest.fixture
def mock_temporal_client(monkeypatch):
    fake_handle = MagicMock()
    fake_handle.id = "triage-fake-workflow-id"
    fake_client = AsyncMock()
    fake_client.start_workflow = AsyncMock(return_value=fake_handle)

    async def _get_client():
        return fake_client

    monkeypatch.setattr("tickets.api.get_temporal_client", _get_client)
    return fake_client

class TestCreateTicket:
    def test_happy_path(self, client, mock_temporal_client):
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
        assert ticket.workflow_id == "triage-fake-workflow-id"
        mock_temporal_client.start_workflow.assert_awaited_once()


class TestGetTicket:
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

    def test_404_for_unknown_ticket(self, client):
        response = client.get(f"/api/tickets/{uuid.uuid4()}")
        assert response.status_code == 404


class TestListTickets:
    def test_status_filter(self, client):
        _create_ticket(subject="Pending one", status=Ticket.Status.PENDING)
        _create_ticket(subject="Resolved one", status=Ticket.Status.RESOLVED)

        response = client.get("/api/tickets", {"status": "resolved"})

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["subject"] == "Resolved one"


class TestResolveTicket:
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