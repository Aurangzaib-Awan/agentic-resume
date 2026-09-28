export const QUICK_ACTIONS = [
  { id: "projects", label: "Show Projects" },
  { id: "cv", label: "Show CV" },
  { id: "email", label: "Send Email" },
  { id: "book", label: "Book a Call" },
  { id: "relevancy", label: "ATS" },
];

export const PROJECTS_PROMPT = "Show me his projects";

export const CV_PATH = "/assets/Aurangzaib_AgenticSystems.pdf";

export const EMAIL_GMAIL_COMPOSE =
  "https://mail.google.com/mail/?view=cm&to=aurangzaibshehzadawan@gmail.com&su=Reaching+out+from+your+portfolio&body=Hi+Aurangzaib,%0D%0A%0D%0AI+came+across+your+portfolio+and+wanted+to+connect.";

// Must be called directly from a click handler, or the browser blocks the popup.
export function openEmailDraft() {
  window.open(EMAIL_GMAIL_COMPOSE, "_blank", "noopener,noreferrer");
}
