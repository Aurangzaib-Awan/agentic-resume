# agent/tools/chat_models.py

"""
Purpose : One file for handling all the llm integrations, fallback and max retries so
llm logic is separate from other files.

Contents :
- LLMClient : wraps a list of chat models, retries each then falls back to the next
    - ainvoke(prompt, output_schema=None) -> response
- classify_llm, qa_llm : preloaded singletons
"""

from __future__ import annotations

import asyncio
from typing import Any, List, Optional, Type

from langchain_core.language_models import BaseChatModel
from pydantic import BaseModel

from agent.tools.integrations.groq import GROQ_FAST, GROQ_MAIN

MAX_RETRIES = 2  # attempts per model before falling back to the next one


class LLMClient:

    def __init__(self, models: List[BaseChatModel]) -> None:
        if not models:
            raise ValueError("LLMClient requires at least one model.")
        self.models = models

    async def ainvoke(
        self,
        prompt: Any,
        output_schema: Optional[Type[BaseModel]] = None,
    ) -> Any:
        
        last_error: Optional[Exception] = None

        for model in self.models:
            runnable = model.with_structured_output(output_schema) if output_schema else model

            for attempt in range(MAX_RETRIES):
                try:
                    return await runnable.ainvoke(prompt)

                except Exception as e:
                    last_error = e
                    print(f"LLM call failed [attempt {attempt + 1}/{MAX_RETRIES}]: {e}")

                    # exponential backoff, skipped on the final attempt
                    is_last_attempt = attempt == MAX_RETRIES - 1
                    if not is_last_attempt:
                        await asyncio.sleep(2 ** attempt)

        raise RuntimeError("All LLM models failed.") from last_error


classify_llm = LLMClient([GROQ_FAST, GROQ_MAIN])
qa_llm = LLMClient([GROQ_MAIN, GROQ_FAST])