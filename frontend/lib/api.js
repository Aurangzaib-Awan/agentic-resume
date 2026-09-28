const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://agentic-resume-seven.vercel.app";

export async function getAgentResponse(message, threadId) {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, thread_id: threadId }),
  });

  if (!res.ok) {
    throw new Error(`Chat request failed with status ${res.status}`);
  }

  const data = await res.json();
  const action = ["cv", "relevancy", "book", "email"].includes(data.action) ? data.action : null;
  return { reply: data.reply, projects: data.projects || [], action };
}

export async function getCalendarSlots(date) {
  const res = await fetch(`${API_BASE_URL}/calendar/slots?date=${encodeURIComponent(date)}`);

  if (!res.ok) {
    throw new Error(`Slots request failed with status ${res.status}`);
  }

  const data = await res.json();
  return data.slots || [];
}

export async function bookCalendarSlot({ slot, name, email, threadId }) {
  const res = await fetch(`${API_BASE_URL}/calendar/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slot, name, email, thread_id: threadId }),
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
