"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShell } from "./ShellContext";

const NAV_ITEMS = [
  {
    href: "/chat",
    label: "Chat",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
  },
  {
    href: "/projects",
    label: "Projects",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
  },
  {
    href: "/experience",
    label: "Experience",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7h-9M14 17H5"></path>
        <circle cx="17" cy="17" r="3"></circle>
        <circle cx="7" cy="7" r="3"></circle>
      </svg>
    ),
  },
  {
    href: "/about",
    label: "About",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    ),
  },
  {
    href: "/contact",
    label: "Contact",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 6l-10 7L2 6"></path>
        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
      </svg>
    ),
  },
];

const FOOTER_ITEMS = [
  {
    href: "https://github.com/Aurangzaib-Awan",
    label: "GitHub",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
      </svg>
    ),
  },
  {
    href: "https://linkedin.com/in/aurangzaib-shehzad",
    label: "LinkedIn",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect x="2" y="9" width="4" height="12"></rect>
        <circle cx="4" cy="4" r="2"></circle>
      </svg>
    ),
  },
  {
    href: "mailto:aurangzaibshehzadawan@gmail.com",
    label: "Email",
    external: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 6l-10 7L2 6"></path>
        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
      </svg>
    ),
  },
];

export default function Sidebar({ collapsed, onToggleCollapse, drawerOpen }) {
  const pathname = usePathname();
  const { closeDrawer } = useShell();

  return (
    <aside
      id="sidebar"
      className={[collapsed ? "collapsed" : "", drawerOpen ? "drawer-open" : ""].join(" ").trim()}
    >
      <div className="side-top">
        <div className="side-brand">
          <span className="side-brand-name">Aurangzaib Shehzad</span>
          <span className="side-brand-role">AI Engineer</span>
        </div>
        <button className="collapse-btn" onClick={onToggleCollapse} aria-label="Collapse sidebar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>

      <div className="side-status">
        <span className="status-dot"></span>
        <span>Agent online</span>
      </div>

      <nav className="side-nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? "active" : ""}
            onClick={closeDrawer}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="side-bottom">
        {FOOTER_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener" : undefined}
          >
            {item.icon}
            <span>{item.label}</span>
          </a>
        ))}
      </div>
    </aside>
  );
}
