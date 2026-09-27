"use client";

import { useEffect, useState } from "react";
import { CV_PATH } from "@/lib/quickActions";

// Mount only while open, so each opening re-checks whether the PDF exists.
export default function CvModal({ onClose }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;
    fetch(CV_PATH, { method: "HEAD" })
      .then((res) => {
        const isPdf = (res.headers.get("content-type") || "").includes("pdf");
        if (!cancelled) setStatus(res.ok && isPdf ? "ready" : "missing");
      })
      .catch(() => {
        if (!cancelled) setStatus("missing");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="cv-backdrop" onClick={onClose}>
      <div
        className="cv-modal"
        role="dialog"
        aria-modal="true"
        aria-label="CV"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cv-head">
          <span className="cv-title">CV</span>
          <div className="pc-actions">
            {status === "ready" && (
              <a className="pc-btn primary" href={CV_PATH} download>
                Download
              </a>
            )}
            <button type="button" className="pc-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
        <div className="cv-body">
          {status === "ready" && <iframe src={CV_PATH} title="CV" />}
          {status === "checking" && <p className="qa-note">Loading...</p>}
          {status === "missing" && <p className="qa-note">CV not available yet.</p>}
        </div>
      </div>
    </div>
  );
}
