# core/routes/calendar.py

"""
Purpose : Endpoints for fetching Cal.com slots and booking a call.
"""

import os
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from agent.tools.integrations.postgres import insert_message

router = APIRouter()

CAL_API_KEY = os.environ["CAL_API_KEY"]
CAL_USERNAME = "aurangzaib-shehzad"
CAL_EVENT_SLUG = "15min"
CAL_BASE = "https://api.cal.com/v2"
CAL_EVENT_TYPE_ID = 7235379
CAL_HEADERS = {
    "cal-api-version": "2024-08-13",
    "Authorization": f"Bearer {CAL_API_KEY}",
}


@router.get("/calendar/slots")
async def get_slots(date: str | None = None) -> dict:
    """Fetch available slots for a given date (YYYY-MM-DD). Defaults to today."""

    if date:
        start = datetime.fromisoformat(date)
    else:
        start = datetime.now(tz=timezone.utc)

    end = start 

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            f"{CAL_BASE}/slots",
            headers={
                "cal-api-version": "2024-09-04",
                "Authorization": f"Bearer {CAL_API_KEY}",
            },
            params={
                "eventTypeId": CAL_EVENT_TYPE_ID,
                "start": start.strftime("%Y-%m-%dT00:00:00Z"),
                "end": (start + timedelta(days=1)).strftime("%Y-%m-%dT00:00:00Z"),
            },
        )
        print(resp.status_code, resp.text)
    
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="Failed to fetch slots from Cal.com")

    raw = resp.json().get("data", {})

    slots = []
    for day, times in raw.items():
        for t in times:
            dt = datetime.fromisoformat(t["start"].replace("Z", "+00:00"))
            slots.append({
                "time": t["start"],
                "display": dt.strftime("%a %b %d, %I:%M %p"),
                "available": True,
            })

    return {"slots": slots}


class BookingRequest(BaseModel):
    slot: str       # ISO timestamp from the slots response
    name: str
    email: str
    thread_id: str | None = None


@router.post("/calendar/book")
async def book_slot(payload: BookingRequest) -> dict:
    """Book a 15-min call. Cal.com booking endpoint is public, no auth needed."""

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{CAL_BASE}/bookings",
            headers={
                "Content-Type": "application/json",
                "cal-api-version": "2024-08-13",
            },
            json={
                "eventTypeSlug": CAL_EVENT_SLUG,
                "username": CAL_USERNAME,
                "start": payload.slot,
                "attendee": {
                    "name": payload.name,
                    "email": payload.email,
                    "timeZone": "UTC",
                },
            },
        )

    if resp.status_code not in (200, 201):
        raise HTTPException(status_code=resp.status_code, detail="Booking failed")

    if payload.thread_id:
        try:
            await insert_message(
                payload.thread_id,
                "assistant",
                f"[Call booked: 15-minute call at {payload.slot} UTC for {payload.name}, {payload.email}. Confirmation email sent.]",
            )
        except Exception as e:
            print(f"could not save booking to history: {e}")

    return {
        "confirmed": True,
        "message": f"You're booked! Check {payload.email} for the confirmation.",
    }