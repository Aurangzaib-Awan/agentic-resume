"use client";

import { useState } from "react";
import { checkRelevancy, RelevancyRejectedError } from "@/lib/api";

// status: idle | loading | done | unavailable (rejected input shows `error` and keeps the form)
export default function RelevancyWidget() {
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = jobDescription.trim();
    if (!trimmed || status === "loading") return;
    setStatus("loading");
    setError("");
    try {
      setResult(await checkRelevancy(trimmed));
      setStatus("done");
    } catch (err) {
      if (err instanceof RelevancyRejectedError) {
        setError(err.message);
        setStatus("idle");
      } else {
        setStatus("unavailable");
      }
    }
  }

  if (status === "unavailable") {
    return (
      <div className="qa-widget">
        <p className="qa-note">
          Relevancy check isn&apos;t available yet — ask the agent directly about specific skills instead.
        </p>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="relevancy-card">
        <div className="rel-head">
          <span className="rel-label">Relevancy</span>
          <span className="rel-score">{result.score}%</span>
        </div>
        {result.summary && <p className="rel-summary">{result.summary}</p>}
        {result.strengths.length > 0 && (
          <div className="rel-section">
            <span className="rel-label">Strengths</span>
            <div className="pc-tags">
              {result.strengths.map((s) => (
                <span className="pc-tag" key={s}>{s}</span>
              ))}
            </div>
          </div>
        )}
        {result.gaps.length > 0 && (
          <div className="rel-section">
            <span className="rel-label">Gaps</span>
            <div className="pc-tags">
              {result.gaps.map((g) => (
                <span className="pc-tag" key={g}>{g}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <form className="qa-widget qa-form" onSubmit={handleSubmit}>
      <textarea
        className="qa-input"
        placeholder="Paste the job description here..."
        rows={7}
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        disabled={status === "loading"}
      />
      {error && <p className="qa-note">{error}</p>}
      <div className="pc-actions">
        <button
          type="submit"
          className="pc-btn primary"
          disabled={!jobDescription.trim() || status === "loading"}
        >
          {status === "loading" ? "Checking..." : "Check relevancy"}
        </button>
      </div>
    </form>
  );
}
