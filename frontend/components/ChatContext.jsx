"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { streamAgentResponse } from "@/lib/api";
import { createRevealer } from "@/lib/smoothText";
import { getThreadId } from "@/lib/threadId";

// Chat state lives here, in the shared layout, instead of in the /chat page: the layout stays
// mounted across page changes, so the conversation (and a reply still streaming) survives
// visiting another page and coming back.
// shortcut: memory only, so a full reload still starts fresh; mirror `messages` to sessionStorage if that matters.

let nextId = 1;

const CONNECTION_ERROR = "I couldn't reach the backend just now — try again in a moment.";

const INITIAL_MESSAGE = {
  id: 0,
  role: "agent",
  content: "I'm Aurangzaib's agent. Ask me about his projects, stack, or experience.",
  projects: [],
  action: null,
};

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [pending, setPending] = useState(false);
  const [cvOpen, setCvOpen] = useState(false);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // the agent's message exists from the start and fills in as events arrive
    const agentId = nextId++;
    const updateAgent = (change) =>
      setMessages((prev) => prev.map((m) => (m.id === agentId ? { ...m, ...change(m) } : m)));

    setMessages((prev) => [
      ...prev,
      { id: nextId++, role: "visitor", content: trimmed },
      { id: agentId, role: "agent", content: "", status: null, streaming: true, projects: [], action: null },
    ]);
    setPending(true);

    const revealer = createRevealer((content) => updateAgent(() => ({ content })));

    try {
      const { projects, action } = await streamAgentResponse(trimmed, getThreadId(), {
        onStatus: (status) => updateAgent(() => ({ status })),
        onToken: revealer.push,
      });
      // cards and widgets wait until the text has finished typing out
      await revealer.finish();
      updateAgent(() => ({ projects, action }));
      if (action === "cv") setCvOpen(true);
    } catch {
      // keep whatever part of the reply already arrived
      const partial = revealer.flush();
      updateAgent(() => ({ content: partial ? `${partial}\n\n_${CONNECTION_ERROR}_` : CONNECTION_ERROR }));
    } finally {
      updateAgent(() => ({ streaming: false }));
      setPending(false);
    }
  }, []);

  const appendAgentMessage = useCallback((content, widget) => {
    setMessages((prev) => [...prev, { id: nextId++, role: "agent", content, projects: [], widget }]);
  }, []);

  return (
    <ChatContext.Provider value={{ messages, pending, cvOpen, setCvOpen, sendMessage, appendAgentMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
