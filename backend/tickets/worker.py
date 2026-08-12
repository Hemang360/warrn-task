import asyncio
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django

django.setup()

from temporalio.client import Client
from temporalio.worker import Worker
from tickets.activities import classify_ticket, mark_needs_review, save_triage_result
from tickets.workflows import TriageWorkflow

TASK_QUEUE = "triage-queue"


async def main() -> None:
    client = await Client.connect("localhost:7233")
    worker = Worker(
        client,
        task_queue=TASK_QUEUE,
        workflows=[TriageWorkflow],
        activities=[classify_ticket, mark_needs_review, save_triage_result],
    )
    print(f"Worker started, polling task queue '{TASK_QUEUE}'...")
    await worker.run()


if __name__ == "__main__":
    asyncio.run(main())