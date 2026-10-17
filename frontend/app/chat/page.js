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
import { useChat } from "@/components/ChatContext";
import { PROJECTS_PROMPT, QUICK_ACTIONS, openEmailDraft } from "@/lib/quickActions";

// shown under the greeting until the first message, so a visitor arriving straight at /chat sees what the agent can do
const STARTERS = QUICK_ACTIONS.filter((action) => action.id !== "email");

function ChatPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { messages, pending, cvOpen, setCvOpen, sendMessage, appendAgentMessage } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const initialSendRef = useRef(false);

  const prefillInput = useCallback((text) => {
    setInput(text);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, pending]);

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
    [pending, sendMessage, appendAgentMessage, setCvOpen]
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
      if (q) sendMessage(q);
      else if (action) runAction(action);
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
