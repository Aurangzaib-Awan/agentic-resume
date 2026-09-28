## Task 1: render markdown in agent replies

Bug: agent messages in the chat render as raw text, so markdown syntax from the backend (**bold**, - bullet lists, etc.) shows up literally instead of being formatted.

Fix: install react-markdown (`npm install react-markdown`) and use it to render agent message content in the chat page, instead of dropping the raw string into a `<p>` or `<div>`. Keep visitor messages as plain text (no markdown needed there). Style the rendered markdown output (bold, lists, paragraphs, links) to match the existing design tokens in globals.css — same font, text color, and spacing as the rest of the agent message, don't let it introduce its own default browser styling.

## Task 2: render project cards in chat replies

The `/chat` response has changed. It now returns:

```json
{
  "reply": "string",
  "projects": [
    {
      "name": "string",
      "description": "string",
      "tags": ["string"],
      "githubUrl": "string | null",
      "liveUrl": "string | null"
    }
  ]
}
```

- `projects` is always present. It's an empty list when there are no cards to show.
- It holds 3 projects when the user asks broadly ("what have you built"), 1 when they ask about a specific project.

### What to do
1. In the chat's fetch handler, read both `reply` and `projects` from the response (currently only `reply` is used).
2. Render `reply` as the agent's text (markdown-rendered per Task 1), same as now.
3. If `projects` is not empty, render each one as a card **below** the reply text, reusing the existing silver card component from the Projects page. If that shared component doesn't exist yet, extract/build it first rather than duplicating card markup in the chat page.
4. On the card:
   - `githubUrl` → "View project" link, hidden if `null`
   - `liveUrl` → live link, hidden if `null`
   - `tags` → the tag row
5. Keep the "Ask agent about this" button on inline cards if it's easy to reuse; skip it otherwise.

### Constraints
- Don't change any other page, styling, or component.
- Don't hardcode project data in the frontend. Cards come only from the `projects` field.
- Ask me before any decision not covered here.

## Task 3: Quick-action menu — capsules + chat dropdown

### Overview
Replace the current suggested-question capsules on the landing page with 5 new action capsules. Also add a dropdown button inside the chat input area (right side, before the send button) that shows the same 5 actions. Both trigger the same behavior per action.

### The 5 actions

#### 1. Show Projects
- **Behavior:** Sends the message `"Show me his projects"` into the chat as if the user typed it. The backend already handles this and returns project cards in the response.
- **No new backend work.** Same `POST /chat` endpoint, same response shape:
```json
{
  "reply": "string",
  "projects": [
    {
      "name": "string",
      "description": "string",
      "tags": ["string"],
      "githubUrl": "string | null",
      "liveUrl": "string | null"
    }
  ]
}
```

#### 2. Show CV
- **Behavior:** Opens a modal/overlay displaying a PDF of the CV, with a "Download" button. No backend call.
- **Implementation:** Store the CV as a static file at `public/cv.pdf`. Use an `<iframe>` or `<embed>` to preview it in a modal, and an `<a href="/cv.pdf" download>` for the download button.
- **Note:** The PDF file doesn't exist yet — use a placeholder path (`/cv.pdf`) and show a "CV not available yet" message if the file 404s. Don't block on this.

#### 3. Send Email
- **Behavior:** Opens the user's default email app with a pre-filled draft. No backend call. Pure `mailto:` link.
- **Implementation:**
    mailto:aurangzaibshehzadawan@gmail.com?subject=Reaching out from your portfolio&body=Hi Aurangzaib,%0D%0A%0D%0AI came across your portfolio and wanted to connect.%0D%0A%0D%0A

- Open in a new tab (`target="_blank"`) or `window.location.href`.

#### 4. Book a Call
- **Behavior:** Calls a new backend endpoint to fetch available time slots from Cal.com, then renders them as selectable cards inside the chat. When the user picks a slot, calls another backend endpoint to confirm the booking.
- **This needs backend work (being built separately).** For now, build the frontend assuming these two endpoints exist:

**Fetch slots:**
- `GET /calendar/slots?date=YYYY-MM-DD`
- Response:
```json
{
  "slots": [
    {
      "time": "2026-09-28T10:00:00Z",
      "display": "Mon Sep 28, 10:00 AM",
      "available": true
    }
  ]
}
```
- Render each slot as a clickable card/chip inside the chat. Show a simple date picker or "this week / next week" toggle above the slots so the user can browse days.

**Book a slot:**
- `POST /calendar/book`
- Request body:
```json
{
  "slot": "2026-09-28T10:00:00Z",
  "name": "string",
  "email": "string"
}
```
- Response:
```json
{
  "confirmed": true,
  "message": "You're booked for Mon Sep 28 at 10:00 AM."
}
```
- Before booking, show a small inline form asking for the visitor's name and email. After confirmation, show the success message in chat.
- **If the endpoints aren't reachable yet**, show "Booking isn't set up yet — reach out via email instead" and fall back to the Send Email action.

#### 5. Check Relevancy
- **Behavior:** Prompts the user to paste or upload a job description. Sends it to a backend endpoint that scores it against the CV/profile. Renders the result in chat.
- **This needs backend work (being built separately).** Build the frontend assuming this endpoint:

**Score relevancy:**
- `POST /relevancy`
- Request body:
```json
{
  "job_description": "string"
}
```
- Response:
```json
{
  "score": 82,
  "summary": "Strong match on multi-agent systems and RAG. No Kubernetes experience listed.",
  "strengths": ["Multi-agent systems", "RAG pipelines", "FastAPI"],
  "gaps": ["Kubernetes", "Go"]
}
```
- When the user clicks "Check Relevancy", show a text area in chat with a prompt like "Paste the job description below" and a submit button. After submission, show a styled result card with the score (as a percentage or badge), summary, strengths and gaps.
- **If the endpoint isn't reachable yet**, show "Relevancy check isn't available yet — ask the agent directly about specific skills instead."

### UI details

**Landing page capsules:**
- Replace the current 5 suggested-question capsules with these 5 actions.
- Same visual style as the current capsules (match existing CSS).
- Each capsule has a short label: `Show Projects`, `Show CV`, `Send Email`, `Book a Call`, `Check Relevancy`.

**Chat dropdown:**
- Add a small icon button (e.g. a `+` or a grid/menu icon) to the left of the send button inside the chat input bar.
- On click, show a dropdown/popover listing the same 5 actions.
- Clicking an action closes the dropdown and triggers that action.
- Style the dropdown to match the existing dark theme — same surface color, border, and text as the rest of the chat UI.

### Constraints
- Don't touch the backend — it's being built separately.
- Don't change existing pages other than landing and chat.
- Gracefully handle missing endpoints (Book a Call, Check Relevancy) with fallback messages as described above.
- Ask before making any decision not covered here.

## Task 5: Fix Send Email button — nothing happens on click

The "Send Email" action in both the landing page capsules and the chat dropdown does nothing when clicked. It should open the user's default email app with a pre-filled draft.

### Expected behavior
When clicked, open a `mailto:` link:
```
mailto:aurangzaibshehzadawan@gmail.com?subject=Reaching out from your portfolio&body=Hi Aurangzaib,%0D%0A%0D%0AI came across your portfolio and wanted to connect.%0D%0A%0D%0A
```

### Implementation
- Use `window.location.href = "mailto:..."` or an `<a href="mailto:...">` tag.
- If using a button/div with an onClick handler, make sure the handler is actually attached and the mailto string is correct.
- Test that clicking it opens the email client (Gmail app, Outlook, Apple Mail — whatever the browser's default is).

### Debug checklist
- Is the onClick handler attached to the correct element?
- Is the mailto URL correctly formatted (no broken encoding, no missing `?` or `&`)?
- Is `preventDefault()` being called somewhere that blocks navigation?
- Is the action mapped correctly in the dropdown and the landing capsules (both places should trigger the same behavior)?

### Constraints
- Don't change any backend code.
- Don't change the styling or layout of the capsules or dropdown.
- Ask before making any decision not covered here.


## Task 5 (revised): Fix Send Email — remove mailto, use Gmail compose as primary

The `mailto:` approach doesn't work reliably on Linux and fails silently when no default mail app is set. Since most visitors will be on phones or Windows with Gmail, skip `mailto:` entirely and go straight to opening Gmail's web compose in a new tab.

### Implementation
When the "Send Email" action is triggered (from either the landing capsules or the chat dropdown), open this URL in a new tab:

```
https://mail.google.com/mail/?view=cm&to=aurangzaibshehzadawan@gmail.com&su=Reaching+out+from+your+portfolio&body=Hi+Aurangzaib,%0D%0A%0D%0AI+came+across+your+portfolio+and+wanted+to+connect.
```

Use `window.open(url, '_blank')` — not `window.location.href`, since that navigates the current tab away from the site.

### Testing — required before marking done
1. Click "Send Email" from the landing page capsule → Gmail compose should open in a new tab with To, Subject, and Body pre-filled.
2. Click "Send Email" from the chat dropdown → same behavior.
3. After clicking, the original tab should still be on the site, not navigated away.
4. If the browser blocks the popup, verify that the click handler is synchronous (not inside a setTimeout or async callback) — browsers block `window.open` if it's not triggered directly by a user gesture.
5. Test in the browser you have available. If you have access to a browser tool, open the page and verify the button works end-to-end.

### Constraints
- Remove any `mailto:` code for this action entirely.
- Don't change the styling or layout.
- Don't change any backend code.

---

## Task 6: Show actual error messages from /relevancy, not the generic fallback

When `/relevancy` returns a 400 (invalid input), the frontend shows "Relevancy check isn't available yet" — the same message as when the endpoint is unreachable. This makes valid rejections look like the feature is broken.

### Fix
In the relevancy handler, distinguish between:
- **Network error / 500 / endpoint unreachable** → show "Relevancy check isn't available yet — ask the agent directly about specific skills instead."
- **400 Bad Request** → read the `error` field from the response body and show that message to the user in chat. The backend returns:
```json
{"error": "That doesn't look like a job description. Paste the full listing."}
```

### Expected behavior
1. User pastes garbage → agent shows "That doesn't look like a job description. Paste the full listing."
2. User pastes a real JD → agent shows the score card as normal.
3. Backend is down → agent shows the generic fallback.

### Testing — required before marking done
1. Paste "good work" into the relevancy input → should see the rejection message, not the fallback.
2. Paste a real JD (e.g. "We need a senior Python developer with 3+ years experience in FastAPI, Docker, and AWS") → should see the score card.
3. Stop the backend server, then try relevancy → should see the generic fallback.

### Constraints
- Don't change any backend code.
- Don't change the styling of the score card or other components.


## Task 7: Fix mobile scroll — chat not scrollable on phone

When opening the frontend on a phone, the chat content doesn't scroll. This likely means the chat container or the page body has `overflow: hidden` or a fixed height that doesn't account for mobile viewport. 

### Debug checklist
1. Check if the chat message container has `overflow-y: auto` or `overflow-y: scroll`.
2. Check if any parent element (Shell, layout, body) has `overflow: hidden` or `height: 100vh` that traps the scroll on mobile.
3. On mobile, the browser chrome (address bar) shrinks/grows on scroll — using `100vh` causes content to hide behind it. Use `100dvh` (dynamic viewport height) instead, or `min-height: 100vh` with `overflow: auto`.
4. Check if the sidebar drawer or backdrop is somehow intercepting touch events even when closed.

### Testing — required before marking done
1. Open the site on a phone (or use Chrome DevTools mobile emulation — toggle device toolbar, pick a phone like iPhone 14 or Pixel 7).
2. Send several messages so the chat overflows the visible area.
3. Verify you can scroll up through message history and scroll down to the input.
4. Verify the landing page also scrolls if content overflows.
5. Test with the sidebar both open and closed on mobile.

### Constraints
- Don't change the desktop layout or styling.
- Fix should work across iOS Safari and Android Chrome at minimum.

---

## Task 8: Redesign Book a Call — cleaner slot picker

The current booking UI dumps all available time slots at once, making it feel cluttered. Redesign it as a two-step picker:

### Step 1: Pick a date
- Show a compact row of selectable date chips (next 7 days), e.g. `Mon 28`, `Tue 29`, `Wed 30`...
- Default to the first day that has available slots.
- Only one date selected at a time.

### Step 2: Pick a time
- After a date is selected, fetch slots for that date from `GET /calendar/slots?date=YYYY-MM-DD`.
- Show the available times as a vertical list of selectable chips, e.g. `9:00 AM`, `9:15 AM`, `9:30 AM`.
- Group them visually if there are many — e.g. morning (before 12pm) and afternoon (12pm+) with a subtle label.
- All slots are 15 minutes — don't show duration, it's implicit.

### Step 3: Confirm
- After picking a time, show the name + email form (same as now).
- On submit, call `POST /calendar/book` with the selected slot, name, and email.
- Show confirmation or error message in chat (same as now).

### Response shapes (unchanged)

**Fetch slots:**
```
GET /calendar/slots?date=2026-09-28
```
```json
{
  "slots": [
    {
      "time": "2026-09-28T04:00:00.000Z",
      "display": "Mon Sep 28, 09:00 AM",
      "available": true
    }
  ]
}
```

**Book:**
```
POST /calendar/book
```
```json
// Request
{"slot": "2026-09-28T04:00:00.000Z", "name": "John", "email": "john@example.com"}

// Response
{"confirmed": true, "message": "You're booked! Check john@example.com for the confirmation."}
```

### Styling
- Match the existing dark theme — same surface colors, borders, text colors as the rest of the chat.
- Date chips and time chips should look like the action capsules (outlined, monochrome, clickable feel).
- Selected state: subtle highlight (e.g. lighter border or faint background), not a bright accent color.

### Constraints
- Don't change the backend endpoints or response shapes.
- Don't change other components or pages.
- Ask before any decision not covered here.

## Task 9: Fix three mobile UX bugs

### Bug 1: Sidebar close button doesn't fully close the sidebar
On mobile, tapping the close (X) icon on the sidebar drawer only hides the text labels — the sidebar itself (background, icons, layout space) stays visible and stuck on screen. It should fully close and slide away, same as tapping the backdrop.

**Fix:** Find wherever the close button's onClick is wired (likely in `Sidebar.jsx` or `Shell.jsx`) and make sure it toggles the same state that controls the drawer's open/closed CSS class or transform — not just a state that hides text. The close button and the backdrop-click should trigger identical behavior.

**Test:** Open the drawer on mobile, tap the close icon → the whole sidebar (icons included) should slide/fade away completely, same as tapping outside it.

### Bug 2: Chat send button overflows the input bar on some mobile screens
On certain mobile viewport sizes (especially zoomed-in or narrower screens), the send/arrow button pokes outside the input bar instead of staying docked inside it.

**Fix:** Likely a flexbox/width issue — the input field and button probably don't have `flex-shrink` set correctly, or the input bar's container has a fixed width that doesn't scale. Check:
- The input bar container should use `display: flex` with the text input set to `flex: 1` (so it shrinks/grows) and the button at a fixed size that doesn't shrink (`flex-shrink: 0`).
- Test at multiple mobile widths (320px, 375px, 390px, 414px) and with browser zoom at 110–125%, since the bug seems to depend on effective viewport width.

**Test:** Check the chat input bar at several mobile widths and zoom levels — the send button should always stay fully inside the input bar, never overflowing or getting cut off.

### Bug 3: Email/text overflows its container on the Contact page
On the Contact page, the email address (and possibly other contact info) overflows outside its card/box instead of wrapping or truncating.

**Fix:** Add `word-break: break-all` or `overflow-wrap: break-word` to the text element holding the email (long unbroken strings like emails don't wrap by default). Alternatively, reduce font size on mobile if the container has a fixed width. Check the same for LinkedIn URL/handle if it's displayed as raw text.

**Test:** Open the Contact page on mobile — the email and LinkedIn text should stay fully inside their card, wrapping to a new line if needed, never spilling outside the box.

### Constraints
- Test all three fixes on mobile viewport sizes (use Chrome DevTools device toolbar at minimum: iPhone SE, iPhone 14, Pixel 7).
- Don't change desktop layout or styling.
- Don't touch unrelated components.


## Task 10: Make every "Ask agent about this" button work

The "Ask agent about this" button on project cards is a placeholder. It links to `/chat` and sends nothing. It needs to work everywhere it appears.

### Behavior
- **Inside the chat page:** clicking it sends a message as if the visitor typed it: `Tell me about <project name>`. It appears as a normal visitor message and the agent replies as usual.
- **On any other page** (Projects, Contact, or anywhere else it appears): clicking it navigates to `/chat` and sends that same message automatically once the chat loads.

### Implementation notes
1. First, search the whole frontend for every "Ask agent about this" button (chat cards, Projects page, Contact page, any others) and list them before changing anything.
2. Use one shared handler so every button behaves identically. Don't copy the logic into each page.
3. For the cross-page case, pass the message through a query param (e.g. `/chat?ask=Tell%20me%20about%20MentorAI`) or sessionStorage. On chat load, read it, send it once, then clear it so a refresh or React strict-mode double render doesn't send it twice.
4. If a button isn't attached to a project (e.g. on the Contact page), check what it's attached to and ask me what message it should send before deciding.

### Testing, required before marking done
1. In chat, ask "show me his projects", then click Ask agent on a card. The message should appear once, and the agent should reply.
2. From the Projects page, click Ask agent on a card. It should land on `/chat` and send the message once.
3. Refresh the chat page after that. The message must not send again.
4. Repeat on mobile viewport size.

### Constraints
- Don't change backend code.
- Don't change styling or layout.
- Ask before any decision not covered here.

## Task 10 - Revised (replaces the earlier Task 10): "Ask agent about this" prefills the chat box, and Contact page gets a Book a Call button

The earlier Task 10 said the button should auto-send a message. Ignore that. The new behavior is below.

### Part A: every "Ask agent about this" button
**Behavior:** the button puts text in the chat input box. It does NOT send it. The visitor reviews it and presses send themselves.
- The text is `Tell me about <project name>`, using the name shown on that card (e.g. `Tell me about MentorAI`).
- Inside the chat page (cards in chat replies): fill the chat input with the text and focus the input. No navigation.
- On any other page (Projects page, anywhere else the button exists): navigate to `/chat?prefill=<url-encoded text>`. When the chat page loads, read `prefill`, put it in the input, focus it, then remove the param from the URL (`router.replace('/chat')`) so a refresh doesn't refill it.

### Part B: Contact page
- Remove the "Leave a message with the agent" box (heading, description, input, arrow button).
- Replace it with one "Book a call" button, styled like the existing primary button (same style as "View project"). Keep the "or" divider only if it still reads correctly. Leave every other piece of copy on the page unchanged, and ask me if any wording now sounds wrong.
- Clicking it navigates to `/chat?action=book`. On chat load, read `action`, and if it is `book`, open the same booking picker (BookCallWidget) that the "Book a Call" shortcut opens. Then remove the param from the URL.
- Reuse the existing shortcut handler for Book a Call. Do not duplicate the logic.

### Implementation rules
1. First, search the whole frontend for every "Ask agent about this" button and list them all before changing anything. Also search for any other button that links to `/chat`.
2. Use ONE shared handler for all Ask agent buttons.
3. Reading `prefill` and `action` must run exactly once. React strict mode runs effects twice in development, so guard with a ref so the picker never opens twice and the input is never filled twice.
4. If a button isn't attached to a project card, ask me what text it should prefill. Don't guess.

### Testing, required before marking done (use a real browser tool if you have one)
1. In chat, ask "show projects", then click Ask agent on the MentorAI card. The input shows `Tell me about MentorAI`, nothing is sent, and the visitor can edit it and press send.
2. On the Projects page, click Ask agent on a card. You land on `/chat` with that text in the input and nothing sent. Refresh: the input is empty.
3. On the Contact page, click Book a call. You land on `/chat` with the booking picker open exactly once. Refresh: the picker is not reopened.
4. Repeat all three at phone width (390px).
5. Confirm the Contact page no longer has the message box, with no leftover empty space or broken layout.

### Constraints
- Don't change backend code.
- Don't change styling except what Part B needs.
- Ask before any decision not covered here.

## Task 11: Inline actions — open the same widgets when the backend says so

`POST /chat` now returns a third field:
```json
{
  "reply": "string",
  "projects": [ ...cards, unchanged... ],
  "action": "cv" | "relevancy" | "book" | "email" | null
}
```
If `action` is missing, `null`, or any other value, do nothing extra.

### Behavior
After a chat reply arrives, render in this order: reply text, then project cards (if any), then the action widget (if `action` is set). The four actions map to what the shortcut menu already does:
- `cv` → open the CV viewer/modal, same as the "Show CV" shortcut.
- `relevancy` → show the paste-a-job-description box, same as the "Check Relevancy" shortcut.
- `book` → show the booking picker (BookCallWidget), same as the "Book a Call" shortcut.
- `email` → do NOT auto-open Gmail. Render a "Send Email" button inline under the reply, styled like the existing action capsules. Clicking it runs the same handler as the "Send Email" shortcut. Reason: browsers block `window.open` when it runs inside a network callback instead of a real click, so the visitor must click.

### Rules
1. Reuse the existing shortcut handlers and components. Do not duplicate logic.
2. First find where the shortcut menu handlers live and list them before changing anything.
3. Store the `action` on that agent message and render the widget as part of the message, so it appears exactly once per reply. Do not trigger it from an effect that can re-run. If you must use an effect, guard it with a ref (React strict mode runs effects twice in development).
4. Never fire on page load, navigation, or re-render. Only for the reply to the message just sent.
5. The shortcut menu and capsules must keep working exactly as before.

### Testing (required, use a real browser tool if you have one; otherwise a mock backend that returns each action)
1. Reply with `action: "cv"` → CV viewer opens once.
2. `action: "relevancy"` → paste box appears once, and submitting a job description still works.
3. `action: "book"` → picker appears once, and booking still works.
4. `action: "email"` → a Send Email button appears and nothing opens automatically. Clicking it opens Gmail compose in a new tab, and the original tab stays on the site.
5. `action: null` and a response with no `action` field → nothing extra renders.
6. Send two messages in a row with different actions → each widget appears once, under the right reply.
7. Repeat 1–4 at 390px phone width.

### Constraints
- Don't change backend code.
- Don't change styling except for the inline Send Email button.
- Ask before any decision not covered here.


## Task 12: Booking memory + relevancy heading colour

### Part A: send thread_id when booking
`POST /calendar/book` now accepts an optional `thread_id`:
```json
{"slot": "...", "name": "...", "email": "...", "thread_id": "string"}
```
In the booking widget, include the same `thread_id` that the chat already sends to `/chat` (the one in localStorage). Don't generate a new one. The response is unchanged.

### Part B: relevancy card headings
In the relevancy result card, the labels "Relevancy", "Strengths" and "Gaps" are too dim. Make them white, using the existing primary text colour token from globals.css (not a hardcoded hex). Change only those three labels.

### Testing (required, use a real browser tool if you have one)
1. Book a call from the chat. In the browser network tab, confirm the request body to `/calendar/book` contains `thread_id`, and that it equals the one sent to `/chat`.
2. Open the relevancy card and confirm the three headings are white and readable. Confirm the score badge and other text are unchanged.
3. Repeat at 390px width.

### Constraints
- Don't change any other styling.
- Don't change backend code.

## Task 13: Render both options when action is "hire"

`POST /chat` can now return `action: "hire"` in addition to the existing four values.

### Behavior
When `action` is `"hire"`, render two buttons together under the reply, side by side (or stacked on mobile): **Book a Call** and **Send Email**. Clicking either runs the exact same handler as the existing "Book a Call" and "Send Email" shortcuts/actions — do not duplicate logic, reuse what Task 11 already built.

### Testing (required)
1. Ask "how can I hire him?" → both buttons appear under the reply, exactly once.
2. Click "Book a Call" → the same booking picker from the shortcut menu opens.
3. Click "Send Email" → the same Gmail compose behavior from the shortcut menu happens.
4. Ask "can I book a call about hiring him?" → only the booking picker opens (no double buttons), since the backend returns `action: "book"` here, not `"hire"`.
5. Repeat at 390px width.

### Constraints
- Don't change backend code.
- Don't duplicate the book/email logic — call the same handlers Task 11 wired up.
- Ask before any decision not covered here.