"use client";

import { useShell } from "./ShellContext";

export default function MobileTopbar({ title }) {
  const { openDrawer } = useShell();

  return (
    <div className="mobile-topbar">
      <button className="menu-btn" onClick={openDrawer} aria-label="Open menu">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <span className="mt-title">{title}</span>
      <span className="mt-status">
        <span className="status-dot"></span>Online
      </span>
    </div>
  );
}
