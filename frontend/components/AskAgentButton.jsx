"use client";

import { useRouter } from "next/navigation";

export function askAboutPrompt(projectName) {
  return `Tell me about ${projectName}`;
}

// Inside chat, pass onAsk to send directly. Elsewhere, hand off to /chat via ?q=,
// which the chat page sends once and then strips from the URL.
export default function AskAgentButton({ projectName, onAsk }) {
  const router = useRouter();

  function handleClick() {
    const message = askAboutPrompt(projectName);
    if (onAsk) onAsk(message);
    else router.push(`/chat?q=${encodeURIComponent(message)}`);
  }

  return (
    <button type="button" className="pc-btn" onClick={handleClick}>
      Ask agent about this
    </button>
  );
}
