# backend/routes/chat.py

"""
Purpose : to route the chatting requests to this endpoint, streamed back as server-sent events

Contents :
- RequestPayloadSchema
- function(_event_stream) : turns agent events into SSE text, ends with an error event on failure
- function(chat)
"""

import json
from typing import AsyncIterator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from agent.interface import stream_agent

router = APIRouter()


class RequestPayloadSchema(BaseModel):
    message: str
    thread_id: str   # client generates a uuid on first load and reuses it


async def _event_stream(message: str, thread_id: str) -> AsyncIterator[str]:
    """Format each agent event as one SSE message.

    Args:
        message (str): The visitor's latest message.
        thread_id (str): Conversation id the client keeps for an hour.

    Returns:
        AsyncIterator[str]: "event: <type>\\ndata: <json>\\n\\n" strings.
    """

    try:

        async for event in stream_agent(message, thread_id):
            event_type = event.pop("type")
            yield f"event: {event_type}\ndata: {json.dumps(event)}\n\n"

    except Exception as e:
        print(f"chat stream failed: {e}")
        yield "event: error\ndata: {}\n\n"


# events: status (once, optional) -> token (many) -> done {projects, action}, or error
@router.post("/chat")
async def chat(payload: RequestPayloadSchema) -> StreamingResponse:

    return StreamingResponse(
        _event_stream(payload.message, payload.thread_id),
        media_type="text/event-stream",
        # stop proxies from buffering the stream into one late response
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
