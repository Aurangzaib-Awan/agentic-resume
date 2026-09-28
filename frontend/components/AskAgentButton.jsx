"use client";

import { useRouter } from "next/navigation";

export function askAboutPrompt(projectName) {
  return `Tell me about ${projectName}`;
}

// Puts the "Tell me about <project>" text into the chat input for the visitor to review
// and send themselves — it never sends automatically.
// Inside chat, pass onPrefill to fill the input directly. Elsewhere, hand off to /chat via
// ?prefill=, which the chat page reads once, fills the input with, and then strips from the URL.
export default function AskAgentButton({ projectName, onPrefill }) {
  const router = useRouter();

  function handleClick() {
    const message = askAboutPrompt(projectName);
    if (onPrefill) onPrefill(message);
    else router.push(`/chat?prefill=${encodeURIComponent(message)}`);
  }

  return (
    <button type="button" className="pc-btn" onClick={handleClick}>
      Ask agent about this
    </button>
  );
}
