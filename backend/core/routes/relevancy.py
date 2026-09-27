# backend/core/routes/relevancy.py

"""
Purpose : Endpoint for checking relevancy between a job description and the profile.
"""

import json
import re
from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from agent.prompts.relevancy import RELEVANCY_PROMPT
from agent.structured_outputs.relevancy_output import RelevancyOutput
from agent.tools.chat_models import qa_llm

router = APIRouter()

_PROFILE_TEXT = (Path(__file__).parent.parent.parent / "agent" / "profile.json").read_text()

_MIN_JD_LENGTH = 50
_NOT_A_JD_ERROR = "That doesn't look like a job description. Paste the full listing."

# Prefix match on word starts, so "requirement" also catches "requirements", "develop" catches "developer", etc.
_JD_KEYWORDS = re.compile(
    r"\b(role|responsibilit|requirement|required|qualification|skill|experience|"
    r"years|position|job|hiring|candidate|develop|engineer|intern|manager|"
    r"analyst|designer|degree|bachelor|salary|remote|onsite|full[- ]time|part[- ]time|"
    r"team|work with|knowledge of|proficien|familiar)",
    re.IGNORECASE,
)


class RelevancyRequest(BaseModel):
    job_description: str


def _looks_like_jd(text: str) -> bool:
    text = text.strip()
    return len(text) >= _MIN_JD_LENGTH and bool(_JD_KEYWORDS.search(text))


@router.post("/relevancy")
async def check_relevancy(payload: RelevancyRequest) -> dict:

    if not _looks_like_jd(payload.job_description):
        return JSONResponse(status_code=400, content={"error": _NOT_A_JD_ERROR})

    prompt = RELEVANCY_PROMPT.format_messages(
        profile=_PROFILE_TEXT,
        job_description=payload.job_description,
    )

    result: RelevancyOutput = await qa_llm.ainvoke(
        prompt, output_schema=RelevancyOutput
    )
    print(result)  # TODO: remove after testing

    return {
        "score": result.score,
        "summary": result.summary,
        "strengths": result.strengths,
        "gaps": result.gaps,
    }