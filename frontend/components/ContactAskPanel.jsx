"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactAskPanel() {
  const router = useRouter();
  const [input, setInput] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    router.push("/chat");
  }

  return (
    <div className="ask-panel">
      <h2>Leave a message with the agent</h2>
      <p>Tell it what you need — a project inquiry, a role, a quick question — and it&apos;ll pass it along.</p>
      <form className="chat-input-shell" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="I'm hiring for a GenAI role and wanted to ask about..."
          autoComplete="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="send-btn" type="submit" aria-label="Send">
          <svg viewBox="0 0 24 24" fill="none" stroke="#060606" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </form>
    </div>
  );
}
