"use client";

import { useEffect, useRef, useState } from "react";
import { QUICK_ACTIONS } from "@/lib/quickActions";

export default function QuickActionMenu({ onAction }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="qa-menu-wrap" ref={wrapRef}>
      <button
        type="button"
        className="qa-trigger"
        aria-label="Shortcuts"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
          <polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2"></polygon>
        </svg>
      </button>
      {!open && <span className="qa-tooltip" role="tooltip">Shortcuts</span>}
      {open && (
        <div className="qa-menu" role="menu">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              role="menuitem"
              className="qa-item"
              onClick={() => {
                setOpen(false);
                onAction(action.id);
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
