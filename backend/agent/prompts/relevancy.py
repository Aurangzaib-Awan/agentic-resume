# agent/prompts/relevancy.py

"""
Purpose : Prompt for the relevancy scorer — takes a job description and the profile,
          returns a match score with strengths and gaps.
"""

from langchain_core.prompts import ChatPromptTemplate

RELEVANCY_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        "You compare a job description against a candidate's profile and score "
        "how well they match.\n\n"
        "First, verify this is an actual job description. If the text is "
        "gibberish, too vague, or clearly not a job posting (e.g. just a few "
        "random words, a greeting, or unrelated text), return a score of 0 and "
        "say so in the summary.\n\n"
        "Only score against concrete, stated requirements in the JD. Do not "
        "infer requirements that aren't written. If the JD is vague ('looking "
        "for a good developer'), score only what's explicitly asked for.\n\n"
        "For real job descriptions: be optimistic — job descriptions in Pakistan "
        "tend to bloat requirements beyond what the role actually needs, so don't "
        "penalize heavily for nice-to-haves.\n\n"
        "Return:\n"
        "- score: 0–100, one decimal place (e.g. 78.3)\n"
        "- summary: one or two sentences — is this a good fit, or a different "
        "domain? If it's a partial match, suggest the user book a free call or "
        "reach out via email/LinkedIn for confirmation.\n"
        "- strengths: which skills/experience from the profile match\n"
        "- gaps: which requirements from the JD aren't covered\n\n"
        "PROFILE:\n{profile}\n\n"
        "JOB DESCRIPTION:\n{job_description}"
    ),
])