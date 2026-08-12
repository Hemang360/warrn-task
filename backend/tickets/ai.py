from typing import Literal
from pydantic import BaseModel, Field
from pydantic_ai import Agent

class Classification(BaseModel):
    category: Literal["billing", "bug", "feature", "account", "other"]
    priority: Literal["low", "medium", "high"]
    confidence: float = Field(ge=0, le=1)
    reasoning: str

triage_agent = Agent(
    "openrouter:liquid/lfm-2.5-2.6b:free",
    output_type=Classification,
    system_prompt=(
        "You are a support ticket triage assistant. Given a customer's "
        "ticket subject and body, classify it into one of these "
        "categories: billing, bug, feature, account, other. Assign a "
        "priority of low, medium, or high based on urgency and impact. "
        "Give a confidence score between 0 and 1 reflecting how certain "
        "you are about this classification — use a lower score for "
        "vague, ambiguous, or multi-topic tickets. Briefly explain your "
        "reasoning."
    ),
)