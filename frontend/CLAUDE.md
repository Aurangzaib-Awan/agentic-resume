@AGENTS.md

# Agentic Resume — Frontend

## What this is

A personal site for Aurangzaib Shehzad (GenAI/agentic systems engineer) that is framed as "talk to my agent," not a traditional portfolio. The chat is the primary experience; other pages (Projects, Experience, About, Contact) support it.

## Reference design — source of truth

The `reference-html/` folder (one level above this frontend, at the project root — i.e. `../reference-html/`) contains six fully-designed static HTML files:

- `landing-preview.html`
- `chat-preview.html`
- `projects-preview.html`
- `experience-preview.html`
- `about-preview.html`
- `contact-preview.html`

These are **finished, approved designs** — visual direction, copy, layout, and interaction behavior (collapsible sidebar, mobile drawer, project cards, chat bubbles, etc.) are all locked. Do not redesign, restyle, or rewrite copy. The job is to convert these into a working Next.js app with the same look and behavior, not to reinterpret them.

Read each reference file before building the matching page/component.

## Tech stack

- **Next.js, App Router** (already scaffolded with `create-next-app --javascript --tailwind --eslint --app`)
- **Plain JSX, no TypeScript** — do not introduce `.tsx` files or type annotations
- Tailwind was installed by the scaffold but is **not used** for this design system — the reference HTML uses hand-written CSS with custom properties (design tokens). Port that CSS into `app/globals.css` as-is rather than converting it to Tailwind utility classes. Tailwind can stay installed unused; don't fight the scaffold, just don't reach for its utilities here.

## Design system (from the reference HTML — do not change)

- Palette: near-black background (`#060606`), dark surface tones (`#0F0F10`, `#161617`, `#1C1C1E`), off-white text (`#F2F1ED`), muted greys for secondary text. No color accent — monochrome throughout except a small green "online" status dot.
- Typography: Inter (sans, body/UI) + IBM Plex Mono (labels, tags, code-ish bits), loaded from Google Fonts.
- Signature element: "silver" project/info cards — subtle diagonal gradient (`#26272B` → `#19191C`), a lighter steel border (`#4A4C52`), drop shadow, and a hairline top highlight (`inset 0 1px 0 rgba(210,213,222,0.08)`). Used for project cards, experience cards, focus-grid items, and contact channels.
- Sidebar: collapsible (icon-only when collapsed), fixed nav items (Chat, Projects, Experience, About, Contact), footer links (GitHub, LinkedIn, Email — real URLs, see Sidebar.jsx already built). On mobile (<760px) the sidebar becomes an off-canvas drawer triggered by a hamburger button, with a backdrop.

## Structure

```
app/
├── layout.js          — root layout, wraps everything in the shared Shell
├── page.js             — landing ("/")
├── chat/page.js
├── projects/page.js
├── experience/page.js
├── about/page.js
├── contact/page.js
├── globals.css         — all design-system CSS ported from reference-html
components/
├── Shell.jsx            — sidebar + mobile topbar + drawer state, wraps page content
├── Sidebar.jsx           — nav + footer links, already built, has real GitHub/LinkedIn/email URLs
```

`Sidebar.jsx` already exists and should not be rebuilt from scratch — use it as-is, wiring it into `Shell.jsx`.

Active nav state should use `usePathname()` from `next/navigation`, not manual `active` class toggling.

## Chat page — two things to wire

### 1. `getAgentResponse()` — real backend call

Replace any placeholder/demo chat logic with a real call:

- **Endpoint:** `POST /chat`
- **Base URL:** `http://localhost:8000` for now (will be swapped for the deployed backend URL later — read it from an env var, e.g. `NEXT_PUBLIC_API_BASE_URL`, defaulting to `http://localhost:8000`, don't hardcode it inline)
- **Request body:** `{ "message": string, "thread_id": string }`
- **Response body:** `{ "reply": string }`
- On fetch failure, show a graceful in-chat message (e.g. an agent-style line saying the connection failed) — never let the chat UI crash or hang silently.

### 2. `thread_id` session logic

- On page load, check `localStorage` for a stored `thread_id` and a timestamp.
- If none exists, or the stored timestamp is older than 1 hour, generate a new UUID (`crypto.randomUUID()`) as `thread_id` and store it with a fresh timestamp.
- If a valid one exists and is under 1 hour old, reuse it.
- Every call to `/chat` sends this `thread_id`.

## Content notes

- Project cards, experience entries, and about/contact copy should come directly from the corresponding reference HTML file — don't invent new project descriptions or bios.
- Logos (Netsol, Systems Limited, FAST NUCES) are currently inlined as base64 `data:` URIs in the reference HTML — pull these out into `public/logos/` as real image files and reference them with `<Image>` or `<img src="/logos/...">` instead of keeping them inline in JSX.

## What NOT to do

- Don't redesign any page "while you're in there."
- Don't add Tailwind utility classes to replace the existing custom CSS.
- Don't add TypeScript.
- Don't invent new copy, project descriptions, or nav items not present in the reference HTML.
- Don't delete or modify `../reference-html/` — it's the spec, treat it as read-only.