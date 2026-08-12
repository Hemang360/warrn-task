from pydantic_ai.messages import ModelMessage, ModelResponse, ToolCallPart
from pydantic_ai.models.function import AgentInfo, FunctionModel
from pydantic_ai.models.test import TestModel
from tickets.activities import classify_ticket
from tickets.ai import triage_agent

async def test_classify_ticket_returns_structurally_valid_classification():
    with triage_agent.override(model=TestModel()):
        result = await classify_ticket({"subject": "Test subject", "body": "Test body"})

    assert set(result.keys()) == {"category", "priority", "confidence", "reasoning"}
    assert result["category"] in {"billing", "bug", "feature", "account", "other"}
    assert result["priority"] in {"low", "medium", "high"}
    assert isinstance(result["confidence"], float)
    assert 0.0 <= result["confidence"] <= 1.0
    assert isinstance(result["reasoning"], str)


def _low_confidence_response(
    messages: list[ModelMessage], info: AgentInfo
) -> ModelResponse:
    args = {
        "category": "bug",
        "priority": "high",
        "confidence": 0.35,
        "reasoning": "Ambiguous ticket, insufficient detail to be confident.",
    }
    return ModelResponse(parts=[ToolCallPart("final_result", args)])


async def test_classify_ticket_low_confidence_passthrough():
    with triage_agent.override(model=FunctionModel(_low_confidence_response)):
        result = await classify_ticket(
            {"subject": "idk", "body": "something is broken maybe?"}
        )

    assert result == {
        "category": "bug",
        "priority": "high",
        "confidence": 0.35,
        "reasoning": "Ambiguous ticket, insufficient detail to be confident.",
    }