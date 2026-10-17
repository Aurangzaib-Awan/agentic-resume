"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { streamAgentResponse } from "@/lib/api";
import { createRevealer } from "@/lib/smoothText";
import { getThreadId } from "@/lib/threadId";

// Chat state lives here, in the shared layout, instead of in the /chat page: the layout stays
// mounted across page changes, so the conversation (and a reply still streaming) survives
// visiting another page and coming back.
// Finished turns are also saved to sessionStorage, so a reload in the same tab keeps the chat.
// Widgets (booking, job fit) come back in their starting state; their half-filled input is not saved.

let nextId = 1;

const CONNECTION_ERROR = "I couldn't reach the backend just now — try again in a moment.";

const INITIAL_MESSAGE = {
  id: 0,
  role: "agent",
  content: "I'm Aurangzaib's agent. Ask me about his projects, stack, or experience.",
  projects: [],
  action: null,
};

const STORAGE_KEY = "chat";

// The saved chat belongs to one thread_id. Once that expires (1 hour), the backend has forgotten
// the conversation, so showing it again would mislead: start fresh instead.
function loadSavedMessages() {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY));
    if (saved && saved.threadId === getThreadId() && saved.messages.length > 1) return saved.messages;
  } catch {
    // unreadable or blocked storage: start fresh
  }
  return null;
}

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [pending, setPending] = useState(false);
  const [cvOpen, setCvOpen] = useState(false);

  // restored after mount, not in useState, so the server render and first client render match
  useEffect(() => {
    const saved = loadSavedMessages();
    if (!saved) return;
    // the chat page's effects run first, so a deep link like /chat?q= may already have started a
    // new turn; keep that turn rather than overwrite it with the saved one
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot read from browser storage
    setMessages((current) => {
      if (current.length > 1) return current;
      nextId = Math.max(...saved.map((m) => m.id)) + 1;
      return saved;
    });
  }, []);

  // saved only between turns: a reply cut off by a reload isn't stored by the backend either
  useEffect(() => {
    if (pending || messages.length < 2) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ threadId: getThreadId(), messages }));
    } catch {
      // storage full or blocked: the chat still works, it just won't survive a reload
    }
  }, [messages, pending]);

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
