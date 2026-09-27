"use client";

import { useEffect, useMemo, useState } from "react";
import { bookCalendarSlot, getCalendarSlots } from "@/lib/api";
import { openEmailDraft } from "@/lib/quickActions";

const DAY_COUNT = 7;

function toDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildDays() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: DAY_COUNT }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function formatDay(d) {
  const weekday = d.toLocaleDateString(undefined, { weekday: "short" });
  return `${weekday} ${d.getDate()}`;
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

// The backend's window can spill into the next day, so keep only the slots that land
// on the chosen date in the visitor's timezone.
function slotsForDay(slots, key) {
  return slots.filter((slot) => slot.available && toDateKey(new Date(slot.time)) === key);
}

// status: loading | ready | booking | booked | unavailable
export default function BookCallWidget({ onBooked }) {
  const days = useMemo(() => buildDays(), []);
  const [slotsByDate, setSlotsByDate] = useState({});
  const [date, setDate] = useState(null);
  const [status, setStatus] = useState("loading");
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");

  // Fetch the whole week up front so we can open on the first day with open slots
  // and switching days is instant.
  useEffect(() => {
    let cancelled = false;
    Promise.allSettled(days.map((d) => getCalendarSlots(toDateKey(d)))).then((results) => {
      if (cancelled) return;
      if (results.every((r) => r.status === "rejected")) {
        setStatus("unavailable");
        return;
      }
      const byDate = {};
      days.forEach((d, i) => {
        const key = toDateKey(d);
        byDate[key] = results[i].status === "fulfilled" ? slotsForDay(results[i].value, key) : [];
      });
      const firstOpen = days.map(toDateKey).find((key) => byDate[key].length > 0);
      setSlotsByDate(byDate);
      setDate(firstOpen || toDateKey(days[0]));
      setStatus("ready");
    });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const slots = (date && slotsByDate[date]) || [];
  const morning = slots.filter((slot) => new Date(slot.time).getHours() < 12);
  const afternoon = slots.filter((slot) => new Date(slot.time).getHours() >= 12);

  function selectDate(key) {
    if (key === date || status === "booking") return;
    setDate(key);
    setSelected(null);
    setFormError("");
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

  function renderGroup(label, group) {
    if (group.length === 0) return null;
    return (
      <div className="book-group">
        <span className="book-label">{label}</span>
        <div className="book-times">
          {group.map((slot) => (
            <button
              key={slot.time}
              type="button"
              className={`qa-chip slot${selected && selected.time === slot.time ? " active" : ""}`}
              disabled={status === "booking"}
              onClick={() => setSelected(slot)}
            >
              {formatTime(slot.time)}
            </button>
          ))}
        </div>
      </div>
    );
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
        <p className="qa-note">
          Booked: {formatDay(new Date(selected.time))}, {formatTime(selected.time)}
        </p>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="qa-widget">
        <div className="activity">
          <span className="pulse"></span>Loading slots...
        </div>
      </div>
    );
  }

  return (
    <div className="qa-widget">
      <div className="book-days">
        {days.map((d) => {
          const key = toDateKey(d);
          return (
            <button
              key={key}
              type="button"
              className={`qa-chip${key === date ? " active" : ""}`}
              onClick={() => selectDate(key)}
            >
              {formatDay(d)}
            </button>
          );
        })}
      </div>

      {slots.length === 0 ? (
        <p className="qa-note">No open slots on this day.</p>
      ) : (
        <div className="book-slots">
          {renderGroup("Morning", morning)}
          {renderGroup("Afternoon", afternoon)}
        </div>
      )}

      {selected && (
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
              {status === "booking"
                ? "Booking..."
                : `Book ${formatDay(new Date(selected.time))}, ${formatTime(selected.time)}`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
