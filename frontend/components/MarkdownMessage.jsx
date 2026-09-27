import ReactMarkdown from "react-markdown";

export default function MarkdownMessage({ content }) {
  return (
    <div className="md">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
