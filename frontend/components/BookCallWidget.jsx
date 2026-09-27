"use client";

import { useEffect, useMemo, useState } from "react";
import { bookCalendarSlot, getCalendarSlots } from "@/lib/api";
import { openEmailDraft } from "@/lib/quickActions";

function toDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildWeek(weekOffset) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

// status: loading | ready | booking | booked | unavailable
export default function BookCallWidget({ onBooked }) {
  const [week, setWeek] = useState(0);
  const days = useMemo(() => buildWeek(week), [week]);
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const [slots, setSlots] = useState([]);
  const [status, setStatus] = useState("loading");
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getCalendarSlots(date)
      .then((result) => {
        if (cancelled) return;
        setSlots(result);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, [date]);

  function selectDate(key) {
    if (key === date) return;
    setDate(key);
    setSelected(null);
    setStatus("loading");
  }

  function selectWeek(w) {
    setWeek(w);
    selectDate(toDateKey(buildWeek(w)[0]));
  }

  async function handleBook(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setFormError("Enter your name and a valid email.");
      return;
    }
    setFormError("");
    setStatus("booking");
    try {
      const result = await bookCalendarSlot({
        slot: selected.time,
        name: trimmedName,
        email: trimmedEmail,
      });
      if (result.confirmed) {
        setStatus("booked");
        onBooked(result.message || `You're booked for ${selected.display}.`);
      } else {
        setStatus("ready");
        setFormError(result.message || "That slot couldn't be booked — pick another time.");
      }
    } catch {
      setStatus("unavailable");
    }
  }

  if (status === "unavailable") {
    return (
      <div className="qa-widget">
        <p className="qa-note">Booking isn&apos;t set up yet — reach out via email instead.</p>
        <div className="pc-actions">
          <button type="button" className="pc-btn primary" onClick={openEmailDraft}>
            Send Email
          </button>
        </div>
      </div>
    );
  }

  if (status === "booked") {
    return (
      <div className="qa-widget">
        <p className="qa-note">Booked: {selected.display}</p>
      </div>
    );
  }

  return (
    <div className="qa-widget">
      <div className="qa-toggle">
        <button
          type="button"
          className={`qa-chip${week === 0 ? " active" : ""}`}
          onClick={() => selectWeek(0)}
        >
          This week
        </button>
        <button
          type="button"
          className={`qa-chip${week === 1 ? " active" : ""}`}
          onClick={() => selectWeek(1)}
        >
          Next week
        </button>
      </div>

      <div className="qa-chips">
        {days.map((d) => {
          const key = toDateKey(d);
          return (
            <button
              key={key}
              type="button"
              className={`qa-chip${key === date ? " active" : ""}`}
              onClick={() => selectDate(key)}
            >
              {d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}
            </button>
          );
        })}
      </div>

      {status === "loading" ? (
        <div className="activity">
          <span className="pulse"></span>Loading slots...
        </div>
      ) : slots.length === 0 ? (
        <p className="qa-note">No open slots on this day.</p>
      ) : (
        <div className="qa-chips">
          {slots.map((slot) => (
            <button
              key={slot.time}
              type="button"
              className={`qa-chip slot${selected && selected.time === slot.time ? " active" : ""}`}
              disabled={!slot.available || status === "booking"}
              onClick={() => setSelected(slot)}
            >
              {slot.display}
            </button>
          ))}
        </div>
      )}

      {selected && status !== "loading" && (
        <form className="qa-form" onSubmit={handleBook}>
          <input
            className="qa-input"
            type="text"
            placeholder="Your name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="qa-input"
            type="email"
            placeholder="Your email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {formError && <p className="qa-note">{formError}</p>}
          <div className="pc-actions">
            <button type="submit" className="pc-btn primary" disabled={status === "booking"}>
              {status === "booking" ? "Booking..." : `Book ${selected.display}`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
