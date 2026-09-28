import Link from "next/link";
import MobileTopbar from "@/components/MobileTopbar";

export const metadata = {
  title: "Contact — Aurangzaib Shehzad",
};

const CHANNELS = [
  {
    href: "mailto:aurangzaibshehzadawan@gmail.com",
    external: false,
    label: "Email",
    value: "aurangzaibshehzadawan@gmail.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 6l-10 7L2 6"></path>
        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
      </svg>
    ),
  },
  {
    href: "https://linkedin.com/in/aurangzaib-shehzad",
    external: true,
    label: "LinkedIn",
    value: "linkedin.com/in/aurangzaib-shehzad",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect x="2" y="9" width="4" height="12"></rect>
        <circle cx="4" cy="4" r="2"></circle>
      </svg>
    ),
  },
  {
    href: "https://github.com/Aurangzaib-Awan",
    external: true,
    label: "GitHub",
    value: "github.com/Aurangzaib-Awan",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
      </svg>
    ),
  },
];

export default function ContactPage() {
  return (
    <div className="main-col">
      <MobileTopbar title="Contact" />
      <div className="topbar">
        <span className="topbar-title">Contact</span>
        <span className="topbar-sub">direct or through the agent</span>
      </div>

      <div className="content-scroll">
        <div className="content-inner">
          <div className="page-heading">
            <h1>Get in touch</h1>
            <p>Reach me directly, or just ask the agent — it can take a message and pass it on.</p>
          </div>

          <div className="channels">
            {CHANNELS.map((channel) => (
              <a
                key={channel.label}
                className="channel"
                href={channel.href}
                target={channel.external ? "_blank" : undefined}
                rel={channel.external ? "noopener" : undefined}
              >
                <div className="channel-icon">{channel.icon}</div>
                <div className="channel-body">
                  <div className="channel-label">{channel.label}</div>
                  <div className="channel-value">{channel.value}</div>
                </div>
                <span className="channel-go">↗</span>
              </a>
            ))}
          </div>

          <div className="divider-row"><span>or</span></div>

          <div className="pc-actions">
            <Link href="/chat?action=book" className="pc-btn primary">
              Book a call
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
