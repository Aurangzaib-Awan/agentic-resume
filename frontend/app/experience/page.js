import Image from "next/image";
import MobileTopbar from "@/components/MobileTopbar";

export const metadata = {
  title: "Experience — Aurangzaib Shehzad",
};

const ROLES = [
  {
    company: "Systems Limited",
    logo: "/logos/systems-limited.png",
    logoAlt: "Systems Limited logo",
    logoWidth: 264,
    logoHeight: 111,
    title: "GenAI Engineer Intern",
    period: "Jun 2026 — Sep 2026",
    bullets: [
      "Built a retail conversational agent for a high-end fashion brand, owning the backend end to end — database design and ORM integration.",
      "Designed an orchestrator that routes incoming queries between two sub-agents: one tuned for heavy, complex reasoning and one for fast, simple lookups.",
      "Added a guardrail node to keep the agent on-scope, and a dedicated QA node that enforces the brand's tone — the client invests heavily in copywriting, so voice consistency mattered.",
      "Retrieval runs in two stages: hard SQL filtering first to shrink the product space, then embedding search over that narrowed set for accurate, relevant matches.",
    ],
    tags: ["Multi-agent orchestration", "RAG", "SQL", "ORM", "Guardrails"],
  },
  {
    company: "Netsol",
    logo: "/logos/netsol.png",
    logoAlt: "Netsol logo",
    logoWidth: 214,
    logoHeight: 241,
    title: "AI/ML Engineer Intern",
    period: "Jun 2025 — Aug 2025",
    bullets: [
      "Built an end-to-end web application — FastAPI backend, React frontend — from scratch.",
      "Dockerized the app for consistent, reproducible environments.",
      "Deployed it to AWS Lambda.",
    ],
    tags: ["FastAPI", "React", "Docker", "AWS Lambda"],
  },
];

export default function ExperiencePage() {
  return (
    <div className="main-col">
      <MobileTopbar title="Experience" />
      <div className="topbar">
        <span className="topbar-title">Experience</span>
        <span className="topbar-sub">2 roles</span>
      </div>

      <div className="content-scroll">
        <div className="content-inner experience">
          <div className="page-heading">
            <h1>Experience</h1>
            <p>Where I&apos;ve worked and what I actually built there — ask the agent for more detail on any of it.</p>
          </div>

          <div className="timeline">
            {ROLES.map((role) => (
              <div className="role" key={role.company}>
                <div className="role-logo">
                  <Image src={role.logo} alt={role.logoAlt} width={role.logoWidth} height={role.logoHeight} />
                </div>
                <div className="role-card">
                  <div className="role-head">
                    <span className="role-title">
                      {role.title} <span className="role-company">· {role.company}</span>
                    </span>
                    <span className="role-period">{role.period}</span>
                  </div>
                  <ul className="role-list">
                    {role.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <div className="role-tags">
                    {role.tags.map((tag) => (
                      <span className="role-tag" key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="edu-line">
            <div className="edu-left">
              <div className="edu-logo">
                <Image src="/logos/fast-nuces.png" alt="FAST NUCES logo" width={323} height={317} />
              </div>
              <span className="edu-text">
                <strong>B.S. Computer Science</strong> — FAST National University of Computer and Emerging Sciences
              </span>
            </div>
            <span className="edu-period">2022 — 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
