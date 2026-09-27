# agent/tools/integrations/groq.py

"""
Purpose : instantiate the Groq chat models used by the app, so provider-specific
config lives here and chat_models.py stays provider-agnostic.

Contents :
- GROQ_FAST : small model for classification
- GROQ_MAIN : larger model for the qa response
"""

import os

from langchain_groq import ChatGroq

GROQ_FAST = ChatGroq(
    model=os.environ.get("GROQ_FAST_MODEL", "openai/gpt-oss-20b"),
    temperature=0,
    max_tokens=256,
    timeout=15,
    max_retries=0,
    reasoning_effort="low",

)

GROQ_MAIN = ChatGroq(
    model=os.environ.get("GROQ_MAIN_MODEL", "openai/gpt-oss-120b"),
    temperature=0.5,
    max_tokens=1024,
    timeout=30,
    max_retries=0,
)