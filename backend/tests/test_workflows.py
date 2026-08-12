import uuid
from temporalio import activity
from temporalio.testing import WorkflowEnvironment
from temporalio.worker import Worker
from temporalio.worker.workflow_sandbox import SandboxedWorkflowRunner, SandboxRestrictions
from tickets.workflows import TriageWorkflow

TASK_QUEUE = "test-triage-queue"

RESTRICTIONS = SandboxRestrictions.default.with_passthrough_modules(
    "beartype",
    "pydantic_ai",
    "pydantic",
)


def _make_classify_stub(response: dict):
    @activity.defn(name="classify_ticket")
    async def _classify(input: dict) -> dict:
        return response

    return _classify


def _make_review_recorder(calls: list):
    @activity.defn(name="mark_needs_review")
    async def _mark_needs_review(ticket_id: str) -> None:
        calls.append(ticket_id)

    return _mark_needs_review


def _make_save_recorder(calls: list):
    @activity.defn(name="save_triage_result")
    async def _save_triage_result(data: dict) -> None:
        calls.append(data)

    return _save_triage_result


async def test_auto_triage_path_when_confidence_is_high():
    high_confidence_result = {
        "category": "billing",
        "priority": "high",
        "confidence": 0.95,
        "reasoning": "Clearly a duplicate billing charge.",
    }
    review_calls: list = []
    save_calls: list = []

    async with await WorkflowEnvironment.start_time_skipping() as env:
        worker = Worker(
            env.client,
            task_queue=TASK_QUEUE,
            workflows=[TriageWorkflow],
            activities=[
                _make_classify_stub(high_confidence_result),
                _make_review_recorder(review_calls),
                _make_save_recorder(save_calls),
            ],
            workflow_runner=SandboxedWorkflowRunner(restrictions=RESTRICTIONS),
        )
        async with worker:
            ticket_id = str(uuid.uuid4())
            result = await env.client.execute_workflow(
                TriageWorkflow.run,
                {
                    "ticket_id": ticket_id,
                    "subject": "Charged twice",
                    "body": "Please refund the duplicate charge.",
                },
                id=f"triage-{ticket_id}",
                task_queue=TASK_QUEUE,
            )

    assert result["reviewed_by_human"] is False
    assert result["category"] == "billing"
    assert result["confidence"] == 0.95
    assert review_calls == []
    assert len(save_calls) == 1
    assert save_calls[0]["ticket_id"] == ticket_id
    assert save_calls[0]["reviewed_by_human"] is False


async def test_needs_review_path_with_human_signal():
    low_confidence_result = {
        "category": "other",
        "priority": "medium",
        "confidence": 0.4,
        "reasoning": "Ambiguous, needs a human look.",
    }
    review_calls: list = []
    save_calls: list = []

    async with await WorkflowEnvironment.start_time_skipping() as env:
        worker = Worker(
            env.client,
            task_queue=TASK_QUEUE,
            workflows=[TriageWorkflow],
            activities=[
                _make_classify_stub(low_confidence_result),
                _make_review_recorder(review_calls),
                _make_save_recorder(save_calls),
            ],
            workflow_runner=SandboxedWorkflowRunner(restrictions=RESTRICTIONS),
        )
        async with worker:
            ticket_id = str(uuid.uuid4())
            handle = await env.client.start_workflow(
                TriageWorkflow.run,
                {
                    "ticket_id": ticket_id,
                    "subject": "idk something's off",
                    "body": "not sure what's wrong, maybe account issue?",
                },
                id=f"triage-{ticket_id}",
                task_queue=TASK_QUEUE,
            )

            await handle.signal(
                TriageWorkflow.submit_human_review,
                {"category": "account", "priority": "low"},
            )

            result = await handle.result()

    assert result["reviewed_by_human"] is True
    assert result["confidence"] == 1.0
    assert result["category"] == "account"
    assert result["priority"] == "low"
    assert review_calls == [ticket_id]
    assert len(save_calls) == 1
    assert save_calls[0]["reviewed_by_human"] is True