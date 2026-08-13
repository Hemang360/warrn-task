from datetime import timedelta
from typing import Optional

from temporalio import workflow
from temporalio.common import RetryPolicy

CONFIDENCE_THRESHOLD = 0.7

# LLM calls can be slow on free-tier models — give them 2 minutes.
CLASSIFY_TIMEOUT = timedelta(seconds=120)
DEFAULT_TIMEOUT = timedelta(seconds=30)
DEFAULT_RETRY_POLICY = RetryPolicy(maximum_attempts=3)


@workflow.defn
class TriageWorkflow:
    def __init__(self) -> None:
        self._human_override: Optional[dict] = None

    @workflow.signal
    def submit_human_review(self, payload: dict) -> None:
        self._human_override = payload

    @workflow.run
    async def run(self, workflow_input: dict) -> dict:
        ticket_id = workflow_input["ticket_id"]
        subject = workflow_input["subject"]
        body = workflow_input["body"]

        try:
            classification = await workflow.execute_activity(
                "classify_ticket",
                {"subject": subject, "body": body},
                start_to_close_timeout=CLASSIFY_TIMEOUT,
                retry_policy=DEFAULT_RETRY_POLICY,
            )

            if classification["confidence"] < CONFIDENCE_THRESHOLD:
                await workflow.execute_activity(
                    "mark_needs_review",
                    ticket_id,
                    start_to_close_timeout=DEFAULT_TIMEOUT,
                    retry_policy=DEFAULT_RETRY_POLICY,
                )
                await workflow.wait_condition(lambda: self._human_override is not None)

                final = {
                    **self._human_override,
                    "confidence": 1.0,
                    "reasoning": "Manually resolved by a human reviewer.",
                    "reviewed_by_human": True,
                }
            else:
                final = {**classification, "reviewed_by_human": False}

            await workflow.execute_activity(
                "save_triage_result",
                {"ticket_id": ticket_id, **final},
                start_to_close_timeout=DEFAULT_TIMEOUT,
                retry_policy=DEFAULT_RETRY_POLICY,
            )

            return final

        except Exception:
            # Any unhandled failure (e.g. LLM timeout, bad API key after max retries)
            # must mark the ticket as failed so it doesn't stay stuck on 'pending'.
            await workflow.execute_activity(
                "mark_failed",
                ticket_id,
                start_to_close_timeout=DEFAULT_TIMEOUT,
                retry_policy=RetryPolicy(maximum_attempts=5),
            )
            raise