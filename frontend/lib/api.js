const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://agentic-resume-seven.vercel.app";

const ACTIONS = ["cv", "relevancy", "book", "email", "hire"];

// /chat streams server-sent events: status (optional) -> token (many) -> done, or error.
// Read with fetch instead of EventSource, because EventSource can't POST.
export async function streamAgentResponse(message, threadId, { onStatus, onToken }) {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, thread_id: threadId }),
  });

  if (!res.ok) {
    throw new Error(`Chat request failed with status ${res.status}`);
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += value;
    const events = buffer.split("\n\n");
    buffer = events.pop(); // last piece may be a half-received event

    for (const raw of events) {
      const type = raw.match(/^event: (.*)$/m)?.[1];
      const data = JSON.parse(raw.match(/^data: (.*)$/m)?.[1] || "{}");

      if (type === "status") onStatus(data.text);
      else if (type === "token") onToken(data.text);
      else if (type === "error") throw new Error("Chat stream failed");
      else if (type === "done") {
        return {
          projects: data.projects || [],
          action: ACTIONS.includes(data.action) ? data.action : null,
        };
      }
    }
  }

  throw new Error("Chat stream ended early");
}

export async function getCalendarSlots(date) {
  const res = await fetch(`${API_BASE_URL}/calendar/slots?date=${encodeURIComponent(date)}`);

  if (!res.ok) {
    throw new Error(`Slots request failed with status ${res.status}`);
  }

  const data = await res.json();
  return data.slots || [];
}

export async function bookCalendarSlot({ slot, name, email, threadId, timeZone }) {
  const res = await fetch(`${API_BASE_URL}/calendar/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slot, name, email, thread_id: threadId, time_zone: timeZone }),
  });

  if (!res.ok) {
    throw new Error(`Booking request failed with status ${res.status}`);
  }

  const data = await res.json();
  return { confirmed: Boolean(data.confirmed), message: data.message || "" };
}

// The backend rejected the input (400) with a message meant for the visitor.
export class RelevancyRejectedError extends Error {}

export async function checkRelevancy(jobDescription) {
  const res = await fetch(`${API_BASE_URL}/relevancy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_description: jobDescription }),
  });

  if (res.status === 400) {
    const data = await res.json().catch(() => ({}));
    if (data.error) throw new RelevancyRejectedError(data.error);
  }

  if (!res.ok) {
    throw new Error(`Relevancy request failed with status ${res.status}`);
  }

  const data = await res.json();
  return {
    score: data.score,
    summary: data.summary || "",
    strengths: data.strengths || [],
    gaps: data.gaps || [],
  };
}
