import Link from "next/link";
import MobileTopbar from "@/components/MobileTopbar";

export const metadata = {
  title: "About — Aurangzaib Shehzad",
};

export default function AboutPage() {
  return (
    <div className="main-col">
      <MobileTopbar title="About" />
      <div className="topbar">
        <span className="topbar-title">About</span>
        <span className="topbar-sub">the short version</span>
      </div>

      <div className="content-scroll">
        <div className="content-inner">
          <p className="about-lede">
            I&apos;m Awan — I build multi-agent systems, RAG pipelines, and production LLM applications. This site is one of them.
          </p>

          <div className="about-body">
            <p>
              Most of what I do sits at the point where an LLM stops being a chatbot and starts being a system — <strong>routing</strong> between specialized agents, <strong>grounding</strong> answers in real data instead of letting a model guess, and <strong>constraining</strong> output so it stays reliable enough to put in front of actual users.
            </p>
            <p>
              I like owning things end to end: database and API design, the retrieval and orchestration logic, and the deployment pipeline that gets it in front of people. I&apos;d rather ship something narrow and correct than something broad and shaky.
            </p>
          </div>

          <div className="focus-grid">
            <div className="focus-item">
              <div className="f-title">Multi-agent orchestration</div>
              <div className="f-desc">Routing between specialized sub-agents instead of one model doing everything.</div>
            </div>
            <div className="focus-item">
              <div className="f-title">RAG &amp; retrieval</div>
              <div className="f-desc">Grounding answers in real data — filtering before embedding, not instead of it.</div>
            </div>
            <div className="focus-item">
              <div className="f-title">Production LLM apps</div>
              <div className="f-desc">Backend, DB, deployment — shipping systems people actually use, not demos.</div>
            </div>
            <div className="focus-item">
              <div className="f-title">Guardrails &amp; QA</div>
              <div className="f-desc">Keeping agents on-scope and on-brand, not just technically functional.</div>
            </div>
          </div>

          <Link href="/chat" className="about-cta">
            <svg viewBox="0 0 24 24" fill="none" stroke="#060606" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Ask my agent anything else
          </Link>
        </div>
      </div>
    </div>
  );
}
