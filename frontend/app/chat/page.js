"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MobileTopbar from "@/components/MobileTopbar";
import MarkdownMessage from "@/components/MarkdownMessage";
import ProjectCard from "@/components/ProjectCard";
import AskAgentButton from "@/components/AskAgentButton";
import QuickActionMenu from "@/components/QuickActionMenu";
import CvModal from "@/components/CvModal";
import BookCallWidget from "@/components/BookCallWidget";
import RelevancyWidget from "@/components/RelevancyWidget";
import TypingIndicator from "@/components/TypingIndicator";
import { streamAgentResponse } from "@/lib/api";
import { createRevealer } from "@/lib/smoothText";
import { getThreadId } from "@/lib/threadId";
import { PROJECTS_PROMPT, QUICK_ACTIONS, openEmailDraft } from "@/lib/quickActions";

let nextId = 1;

// shown under the greeting until the first message, so a visitor arriving straight at /chat sees what the agent can do
const STARTERS = QUICK_ACTIONS.filter((action) => action.id !== "email");

const CONNECTION_ERROR = "I couldn't reach the backend just now — try again in a moment.";

const INITIAL_MESSAGE = {
  id: 0,
  role: "agent",
  content:
    "I'm Aurangzaib's agent. Ask me about his projects, stack, or experience.",
  projects: [],
  action: null,
};

function ChatPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [cvOpen, setCvOpen] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const threadIdRef = useRef(null);
  const initialSendRef = useRef(false);

  const prefillInput = useCallback((text) => {
    setInput(text);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    threadIdRef.current = getThreadId();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
      const { projects, action } = await streamAgentResponse(trimmed, threadIdRef.current, {
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
    setMessages((prev) => [
      ...prev,
      { id: nextId++, role: "agent", content, projects: [], widget },
    ]);
  }, []);

  const runAction = useCallback(
    (id) => {
      if (id === "projects") {
        if (!pending) sendMessage(PROJECTS_PROMPT);
      }
      else if (id === "cv") setCvOpen(true);
      else if (id === "email") openEmailDraft();
      else if (id === "book") appendAgentMessage("Pick a day and time that works for you.", "book");
      else if (id === "relevancy") appendAgentMessage("Paste the job description below.", "relevancy");
    },
    [pending, sendMessage, appendAgentMessage]
  );

  useEffect(() => {
    if (initialSendRef.current) return;
    const q = searchParams.get("q");
    const action = searchParams.get("action");
    const prefill = searchParams.get("prefill");
    if (q || action || prefill) {
      initialSendRef.current = true;
      router.replace("/chat");
      // One-shot handoff from another page (?q=, ?action=, or ?prefill=), not a sync loop.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (q) sendMessage(q);
      else if (action) runAction(action);
      else prefillInput(prefill);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || pending) return;
    setInput("");
    sendMessage(trimmed);
  }

  return (
    <div className="chat-col">
      <MobileTopbar title="Aurangzaib's Agent" />
      <div className="chat-topbar">
        <span className="topbar-title">Aurangzaib&apos;s Agent</span>
        <span className="topbar-status">
          <span className="status-dot"></span>Online
        </span>
      </div>

      <div className="chat-scroll" ref={scrollRef}>
        <div className="chat-inner" role="log" aria-live="polite" aria-busy={pending}>
          {messages.map((msg) => (
            <div key={msg.id} className={`msg ${msg.role}`}>
              <span className="msg-label">{msg.role === "agent" ? "Agent" : "You"}</span>
              {msg.streaming && !msg.content ? (
                <TypingIndicator text={msg.status} />
              ) : (
                <>
                  {msg.status && <div className="msg-status">{msg.status}</div>}
                  <div className="bubble">
                    {msg.role === "agent" ? (
                      <MarkdownMessage content={msg.content} />
                    ) : (
                      msg.content
                    )}
                  </div>
                </>
              )}
              {msg.widget === "book" && (
                <BookCallWidget onBooked={(message) => appendAgentMessage(message)} />
              )}
              {msg.widget === "relevancy" && <RelevancyWidget />}
              {msg.role === "agent" && msg.projects && msg.projects.length > 0 && (
                <div className="project-cards">
                  {msg.projects.map((project) => (
                    <ProjectCard
                      key={project.name}
                      name={project.name}
                      description={project.description}
                      tags={project.tags}
                      actions={
                        <>
                          {project.githubUrl && (
                            <a
                              className="pc-btn primary"
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View project
                            </a>
                          )}
                          {project.liveUrl && (
                            <a
                              className="pc-btn"
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Live demo
                            </a>
                          )}
                          <AskAgentButton projectName={project.name} onPrefill={prefillInput} />
                        </>
                      }
                    />
                  ))}
                </div>
              )}
              {msg.role === "agent" && msg.action === "book" && (
                <BookCallWidget onBooked={(message) => appendAgentMessage(message)} />
              )}
              {msg.role === "agent" && msg.action === "relevancy" && <RelevancyWidget />}
              {msg.role === "agent" && msg.action === "email" && (
                <button type="button" className="suggestion" onClick={openEmailDraft}>
                  Send Email
                </button>
              )}
              {msg.role === "agent" && msg.action === "hire" && (
                <div className="hire-actions">
                  <button type="button" className="suggestion" onClick={() => runAction("book")}>
                    Book a Call
                  </button>
                  <button type="button" className="suggestion" onClick={openEmailDraft}>
                    Send Email
                  </button>
                </div>
              )}
            </div>
          ))}
          {messages.length === 1 && (
            <div className="chat-starters">
              {STARTERS.map((action) => (
                <button key={action.id} type="button" className="suggestion" onClick={() => runAction(action.id)}>
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="chat-input-wrap">
        <form className="chat-input-shell" onSubmit={handleSubmit}>
          <QuickActionMenu onAction={runAction} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask me anything..."
            aria-label="Message the agent"
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="send-btn" type="submit" aria-label="Send" disabled={pending}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#060606" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </form>
      </div>
      {cvOpen && <CvModal onClose={() => setCvOpen(false)} />}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageInner />
    </Suspense>
  );
}
