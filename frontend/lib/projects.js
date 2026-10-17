// Same projects, names, subtitles and repos as backend/agent/profile.json, so /projects
// and the chat's project cards always agree.
// shortcut: copied by hand because the frontend deploys separately from the backend; serve it from the API if it starts drifting.
const GITHUB = "https://github.com/Aurangzaib-Awan";

export const PROJECTS = [
  {
    name: "AI Stylist",
    description: "Multi-agent assistant for a high-end fashion brand",
    tags: ["LangGraph", "LangChain", "Playwright", "PostgreSQL", "ORM", "Python"],
    githubUrl: null,
    note: "Private client code",
  },
  {
    name: "AI Assistant",
    description: "This agent — a LangGraph-powered talking resume",
    tags: ["LangGraph", "LangChain", "FastAPI", "Next.js", "PostgreSQL", "Groq"],
    githubUrl: `${GITHUB}/agentic-resume`,
  },
  {
    name: "MentorAI",
    description: "AI skill-mentor and proctoring system (final-year project)",
    tags: ["FastAPI", "React", "YOLOv8", "MediaPipe", "PyTorch", "LangGraph"],
    githubUrl: `${GITHUB}/MentorAI`,
  },
  {
    name: "Multimodal RAG",
    description: "Document QA over both text and images",
    tags: ["VLM", "PyMuPDF4LLM", "fitz", "Qdrant", "hybrid retrieval"],
    githubUrl: `${GITHUB}/multimodal_rag`,
  },
  {
    name: "LLaMA 3.1 8B Fine-Tuning",
    description: "Text-to-SQL with QLoRA on the Spider dataset",
    tags: ["QLoRA", "bitsandbytes", "PEFT", "HuggingFace SFTTrainer", "MLflow"],
    githubUrl: `${GITHUB}/text-to-sql-llama`,
  },
  {
    name: "GitChat",
    description: "RAG system for exploring GitHub repositories through natural-language queries",
    tags: ["Python", "FastAPI", "RAG", "Qdrant"],
    githubUrl: `${GITHUB}/gitchat`,
  },
];
