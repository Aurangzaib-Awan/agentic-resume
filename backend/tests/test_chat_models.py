# tests/test_chat_models.py

"""
Purpose : guard the one rule streaming depends on — fall back to the next model only
          before the first chunk, never after, so the visitor never gets a reply twice.

Contents :

* class(FakeModel) : chat model stand-in that streams fixed chunks, optionally failing
* method(astream) : yields the chunks, raises where told to
* class(TestAstream) : the fallback cases
* method(test_falls_back_before_first_chunk) : first model dies at once, second answers
* method(test_no_fallback_after_first_chunk) : first model dies mid-reply, error reaches the caller

Run : venv/bin/python -m unittest tests.test_chat_models
"""

import asyncio
import os
import unittest
from typing import AsyncIterator, Optional
from unittest import mock

from langchain_core.messages import AIMessageChunk

os.environ.setdefault("GROQ_API_KEY", "test")   # chat_models builds the groq clients at import

from agent.tools import chat_models
from agent.tools.chat_models import LLMClient


# chat model stand-in
class FakeModel:

    def __init__(self, chunks: list[str], fail_after: Optional[int] = None) -> None:
        self.chunks = chunks
        self.fail_after = fail_after   # number of chunks sent before raising, None = never fails

    async def astream(self, prompt: list) -> AsyncIterator[AIMessageChunk]:
        """Yield the fixed chunks, raising after fail_after of them.

        Args:
            prompt (list): Ignored.

        Returns:
            AsyncIterator[AIMessageChunk]: The chunks as message chunks.
        """

        for sent, text in enumerate(self.chunks):

            if sent == self.fail_after:
                raise RuntimeError("model died")

            yield AIMessageChunk(content=text)


async def _collect(client: LLMClient) -> list[str]:
    """Drain the client's stream into a list.

    Args:
        client (LLMClient): Client under test.

    Returns:
        list[str]: Every chunk it yielded.
    """

    return [text async for text in client.astream([])]


# the fallback cases
class TestAstream(unittest.TestCase):

    def setUp(self) -> None:
        # skip the real backoff sleeps
        patcher = mock.patch.object(chat_models.asyncio, "sleep", mock.AsyncMock())
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_falls_back_before_first_chunk(self) -> None:
        client = LLMClient([FakeModel(["never"], fail_after=0), FakeModel(["Hel", "lo"])])

        self.assertEqual(asyncio.run(_collect(client)), ["Hel", "lo"])

    def test_no_fallback_after_first_chunk(self) -> None:
        client = LLMClient([FakeModel(["Hel", "lo"], fail_after=1), FakeModel(["should not run"])])
        received = []

        async def run() -> None:

            async for text in client.astream([]):
                received.append(text)

        with self.assertRaises(RuntimeError):
            asyncio.run(run())

        self.assertEqual(received, ["Hel"])


if __name__ == "__main__":
    unittest.main()
