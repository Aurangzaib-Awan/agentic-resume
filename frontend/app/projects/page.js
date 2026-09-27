import Link from "next/link";
import MobileTopbar from "@/components/MobileTopbar";
import ProjectCard from "@/components/ProjectCard";

export const metadata = {
  title: "Projects — Aurangzaib Shehzad",
};

const PROJECTS = [
  {
    name: "GitChat",
    description: "RAG system for exploring GitHub repositories through natural-language queries.",
    tags: ["Python", "FastAPI", "RAG", "Qdrant"],
    viewable: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    ),
  },
  {
    name: "text-to-sql-llama",
    description: "Converts natural language into SQL against arbitrary schemas.",
    tags: ["LangChain", "Llama", "SQL"],
    viewable: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5"></polyline>
        <line x1="12" y1="19" x2="20" y2="19"></line>
      </svg>
    ),
  },
  {
    name: "AI Stylist",
    description: "Client project — private repo. Ask the agent for details instead.",
    tags: ["Private"],
    viewable: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"></path>
        <path d="M3 8h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      </svg>
    ),
  },
  {
    name: "Multimodal RAG",
    description: "Local-only build combining text and image retrieval in one pipeline.",
    tags: ["Local", "CLIP", "RAG"],
    viewable: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    ),
  },
];

export default function ProjectsPage() {
  return (
    <div className="main-col">
      <MobileTopbar title="Projects" />
      <div className="topbar">
        <span className="topbar-title">Projects</span>
        <span className="topbar-sub">4 things I&apos;ve built</span>
      </div>

      <div className="content-scroll">
        <div className="content-inner wide">
          <div className="page-heading">
            <h1>Projects</h1>
            <p>Part of the agent&apos;s own knowledge — ask about any of these directly in chat, or open one below.</p>
          </div>

          <div className="grid">
            {PROJECTS.map((project) => (
              <ProjectCard
                key={project.name}
                icon={project.icon}
                name={project.name}
                description={project.description}
                tags={project.tags}
                actions={
                  <>
                    <button className="pc-btn primary" disabled={!project.viewable}>
                      View project
                    </button>
                    <Link href="/chat" className="pc-btn">
                      Ask agent about this
                    </Link>
                  </>
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
