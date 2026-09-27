# agent/structured_outputs/relevancy_output.py

"""
Purpose : Structured output for the relevancy check — forces the LLM to return
          a score, summary, strengths, and gaps.
"""

from pydantic import BaseModel, Field


class RelevancyOutput(BaseModel):
    score: float = Field(
        description="Relevancy percentage from 0 to 100, up to 1 decimal place."
    )
    summary: str = Field(
        description="One or two sentences on whether the profile is a good match for the job description."
    )
    strengths: list[str] = Field(
        description="Skills or experience from the profile that match the job description."
    )
    gaps: list[str] = Field(
        description="Requirements from the job description not covered by the profile."
    )