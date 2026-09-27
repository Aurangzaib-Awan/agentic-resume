# backend/routes/chat.py

"""
Purpose : to route the chatting requests to this endpoint

Contents :
- RequestPayloadSchema
- ResponsePayloadSchema
- function(chat)
"""

from fastapi import APIRouter
from pydantic import BaseModel

from agent.interface import ask_agent

router = APIRouter()


class RequestPayloadSchema(BaseModel):
    message: str
    thread_id: str   # client generates a uuid on first load and reuses it


class ResponsePayloadSchema(BaseModel):
    reply: str
    projects: list[dict] = []


@router.post("/chat", response_model=ResponsePayloadSchema)
async def chat(payload: RequestPayloadSchema) -> ResponsePayloadSchema:

    result = await ask_agent(payload.message, payload.thread_id) 
    return ResponsePayloadSchema(**result)