"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MobileTopbar from "@/components/MobileTopbar";
import CvModal from "@/components/CvModal";
import { PROJECTS_PROMPT, QUICK_ACTIONS, openEmailDraft } from "@/lib/quickActions";

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [cvOpen, setCvOpen] = useState(false);

  function runAction(id) {
    if (id === "projects") router.push(`/chat?q=${encodeURIComponent(PROJECTS_PROMPT)}`);
    else if (id === "cv") setCvOpen(true);
    else if (id === "email") openEmailDraft();
    else router.push(`/chat?action=${id}`);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      router.push("/chat");
      return;
    }
    router.push(`/chat?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="hero-col">
      <MobileTopbar title="Awan" />
      <main className="hero-main">
        <div className="hero">
          <h1>Talk to my agent.</h1>
          <p className="sub">It knows how I work, what I&apos;ve built, and what I can help you build.</p>

          <form className="chat-input-shell" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Ask me anything..."
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

          <div className="suggestions">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                className="suggestion"
                onClick={() => runAction(action.id)}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </main>
      {cvOpen && <CvModal onClose={() => setCvOpen(false)} />}
    </div>
  );
}
