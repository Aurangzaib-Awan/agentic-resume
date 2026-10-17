"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { bookCalendarSlot, getCalendarSlots } from "@/lib/api";
import { openEmailDraft } from "@/lib/quickActions";
import { getThreadId } from "@/lib/threadId";

const DAY_COUNT = 7;
const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
  const [attempt, setAttempt] = useState(0); // bumped by "Try again" to refetch the week
  const formRef = useRef(null);

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
  }, [days, attempt]);

  // the form renders below the slot grid, often below the fold on a phone
  useEffect(() => {
    if (selected) formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selected]);

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
        threadId: getThreadId(),
        timeZone: TIME_ZONE,
      });
      if (result.confirmed) {
        setStatus("booked");
        onBooked(result.message || `You're booked for ${selected.display}.`);
      } else {
        setStatus("ready");
        setFormError(result.message || "That slot couldn't be booked — pick another time.");
      }
    } catch {
      // keep the slot and details so one failed request doesn't cost the visitor their input
      setStatus("ready");
      setFormError("Couldn't reach the booking service. Your details are still here, so try again, or email him instead.");
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
              aria-pressed={selected ? selected.time === slot.time : false}
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
        <p className="qa-note">Couldn&apos;t load his calendar just now. Try again, or email him instead.</p>
        <div className="pc-actions">
          <button type="button" className="pc-btn primary" onClick={() => {
              setStatus("loading");
              setAttempt((n) => n + 1);
            }}>
            Try again
          </button>
          <button type="button" className="pc-btn" onClick={openEmailDraft}>
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
          <strong className="book-confirmed">
            Booked for {formatDay(new Date(selected.time))}, {formatTime(selected.time)}
          </strong>
          <br />
          A confirmation is on its way to {email.trim()}.
        </p>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="qa-widget">
        <div className="activity">
          <span className="pulse"></span>Loading his calendar...
        </div>
      </div>
    );
  }

  return (
    <div className="qa-widget">
      <p className="qa-note book-meta">15-minute call · times in {TIME_ZONE.replace(/_/g, " ")}</p>
      <div className="book-days">
        {days.map((d) => {
          const key = toDateKey(d);
          const open = slotsByDate[key]?.length > 0;
          return (
            <button
              key={key}
              type="button"
              className={`qa-chip${key === date ? " active" : ""}`}
              aria-pressed={key === date}
              aria-label={open ? undefined : `${formatDay(d)}, no open slots`}
              disabled={!open}
              onClick={() => selectDate(key)}
            >
              {formatDay(d)}
            </button>
          );
        })}
      </div>

      {slots.length === 0 ? (
        <p className="qa-note">No open slots this week. Email him to find a time.</p>
      ) : (
        <div className="book-slots">
          {renderGroup("Morning", morning)}
          {renderGroup("Afternoon", afternoon)}
        </div>
      )}

      {selected && (
        <form className="qa-form" onSubmit={handleBook} ref={formRef}>
          <input
            className="qa-input"
            type="text"
            aria-label="Your name"
            placeholder="Your name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="qa-input"
            type="email"
            aria-label="Your email"
            placeholder="Your email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {formError && <p className="qa-note" role="alert">{formError}</p>}
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
