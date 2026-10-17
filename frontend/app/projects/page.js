import MobileTopbar from "@/components/MobileTopbar";
import ProjectCard from "@/components/ProjectCard";
import AskAgentButton from "@/components/AskAgentButton";
import { PROJECTS } from "@/lib/projects";

export const metadata = {
  title: "Projects — Aurangzaib Shehzad",
};

const ICON_PROPS = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" };

const ICONS = {
  "AI Stylist": (
    <svg {...ICON_PROPS}>
      <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"></path>
      <path d="M3 8h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    </svg>
  ),
  "AI Assistant": (
    <svg {...ICON_PROPS}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  MentorAI: (
    <svg {...ICON_PROPS}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ),
  "Multimodal RAG": (
    <svg {...ICON_PROPS}>
      <rect x="3" y="3" width="18" height="18" rx="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  ),
  "LLaMA 3.1 8B Fine-Tuning": (
    <svg {...ICON_PROPS}>
      <polyline points="4 17 10 11 4 5"></polyline>
      <line x1="12" y1="19" x2="20" y2="19"></line>
    </svg>
  ),
  GitChat: (
    <svg {...ICON_PROPS}>
      <circle cx="11" cy="11" r="7"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
};

export default function ProjectsPage() {
  return (
    <div className="main-col">
      <MobileTopbar title="Projects" />
      <div className="topbar">
        <span className="topbar-title">Projects</span>
        <span className="topbar-sub">{PROJECTS.length} things I&apos;ve built</span>
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
                icon={ICONS[project.name]}
                name={project.name}
                description={project.description}
                tags={project.tags}
                actions={
                  <>
                    {project.githubUrl ? (
                      <a className="pc-btn primary" href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        View project
                      </a>
                    ) : (
                      <span className="pc-note">{project.note}</span>
                    )}
                    <AskAgentButton projectName={project.name} />
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
