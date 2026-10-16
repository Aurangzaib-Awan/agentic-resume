"use client";

import { useEffect, useState } from "react";

const PHRASES = ["Reading your question", "Checking his profile", "Connecting the dots", "Almost there"];

// Shown until the agent's first status line or word arrives. Pass `text` to show a fixed line instead.
export default function TypingIndicator({ text }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (text) return;
    // stops on the last phrase rather than looping back to "Reading your question"
    const timer = setInterval(() => setIndex((i) => Math.min(i + 1, PHRASES.length - 1)), 1500);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <div className="activity">
      <span>{text || PHRASES[index]}</span>
      <span className="typing-dots" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </div>
  );
}
