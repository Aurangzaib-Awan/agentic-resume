## Task 1: Inline actions — typing "show my CV" / "book a call" etc. triggers the same actions as the shortcut menu

Files are under `backend/`. Do not touch the frontend, `/relevancy`, or `/calendar/*`.

### What this does
Classify already reads every message. Add one field, `action`, that says whether the LATEST message is a direct request for one of four actions. `/chat` then returns that action to the frontend, which opens the right widget.

### Response contract (exact)
`POST /chat` returns:
```json
{
  "reply": "string",
  "projects": [],
  "action": "cv" | "relevancy" | "book" | "email" | null
}
```
`action` is `null` when there is nothing to trigger. Never any other value.

### Changes, file by file

**1. `agent/structured_outputs/classify_output.py`** — add to `ClassifyOutput`:
```python
    action: Literal["cv", "relevancy", "book", "email", "none"] = Field(
        default="none",
        description=(
            "Set only when the LATEST message is a direct request to do one of "
            "these. cv: wants to see or download his CV/resume. relevancy: "
            "wants to check how well he matches a job or role. book: wants to "
            "book or schedule a call/meeting. email: wants to email him. "
            "none: everything else, including questions ABOUT these things "
            "(e.g. 'what does his CV say about Docker')."
        ),
    )
```

**2. `agent/prompts/classify.py`** — the system string currently ends with:
```python
        "For any other intent, leave project_scope as 'none' and project null.",
```
Replace that last line with:
```python
        "For any other intent, leave project_scope as 'none' and project null.\n\n"
        "Also set action, for ANY intent:\n"
        "- 'cv' if the LATEST message directly asks to see, open, or download "
        "his CV or resume (e.g. 'show cv', 'can I see your resume').\n"
        "- 'relevancy' if it directly asks to check how well he fits a job or "
        "role (e.g. 'check relevancy', 'how relevant is he for my job').\n"
        "- 'book' if it directly asks to book, schedule, or set up a call or "
        "meeting (e.g. 'book a call', 'can we schedule a meeting').\n"
        "- 'email' if it directly asks to email him or send him a message "
        "(e.g. 'send him an email', 'I want to email him').\n"
        "- 'none' for everything else, including questions ABOUT these topics "
        "('what does his CV say about Docker', 'what is his email'). Only the "
        "LATEST message counts — earlier messages never trigger an action.\n"
        "If action is not 'none', set intent to 'qa', project_scope to 'none', "
        "and leave project and repo null.",
```

**3. `agent/state.py`** — add to `AgentState`:
```python
    action : Literal["cv","relevancy","book","email","none"]
```

**4. `agent/nodes/classify.py`**
- The fallback return (classify failed) must also include `"action": "none"`.
- After the existing `repo` and `project` guard lines, replace the final return with:
```python
    intent = result.intent
    project_scope = result.project_scope
    action = result.action

    # an action always wins: no cards, no github lookup
    if action != "none":
        intent, repo, project_scope, project = "qa", None, "none", None

    return {
        "intent": intent,
        "repo": repo,
        "project_scope": project_scope,
        "project": project,
        "action": action,
    }
```

**5. `agent/prompts/qa.py`** — add:
```python
ACTION_TASKS = {
    "cv": (
        "The visitor asked to see his CV. A CV viewer opens right below your "
        "reply. Write one short, friendly sentence saying so. Don't describe "
        "what the CV contains."
    ),
    "relevancy": (
        "The visitor wants to check how well he fits a role. A box to paste "
        "the job description opens right below your reply. Write one short "
        "sentence asking them to paste the job description there."
    ),
    "book": (
        "The visitor wants to book a call. A date and time picker opens right "
        "below your reply. Write one short sentence saying they can pick a "
        "15-minute slot below."
    ),
    "email": (
        "The visitor wants to email him. A Send Email button appears right "
        "below your reply. Write one short sentence pointing to it."
    ),
}
```
Every ACTION_TASKS reply: one sentence, no emojis, no exclamation-mark hype.

**6. `agent/nodes/qa.py`** — import `ACTION_TASKS`. Where `task` is chosen, keep the existing branches and add this one FIRST:
```python
    action = state.get("action", "none")
    if action != "none":
        task = ACTION_TASKS[action]
    elif ...   # existing broad-projects branch, unchanged
    else:      # existing default, unchanged
```

**7. `agent/interface.py`**
- Add `"action": "none"` to `initial_state`.
- Change the final return to:
```python
    action = final_state.get("action", "none")
    return {
        "reply": reply,
        "projects": _get_projects(final_state),
        "action": None if action == "none" else action,
    }
```

**8. `core/routes/chat.py`** — add to `ResponsePayloadSchema`:
```python
    action: Literal["cv", "relevancy", "book", "email"] | None = None
```
and `from typing import Literal`.

### Testing (required, run against the real server, fresh thread_id each time)
```
curl -s -X POST http://localhost:8000/chat -H "Content-Type: application/json" -d '{"message":"show me his cv","thread_id":"t1"}'
```
Expected `action` per message:
- "show me his cv" → `cv`
- "can I see your resume" → `cv`
- "check relevancy" → `relevancy`
- "how relevant is he for my job" → `relevancy`
- "book a call" → `book`
- "can we schedule a meeting" → `book`
- "send him an email" → `email`
- "hey" → `null`
- "what skills does he have" → `null`
- "what does his CV say about Docker" → `null`
- "show projects" → `null`, with 3 items in `projects`
- Same thread: "book a call", then "thanks" → second reply has `action: null`
- When `action` is set, `projects` must be `[]`.
- Each action reply is one short sentence.

If any case fails, fix the classify prompt wording and re-test. Do not add keyword matching in code.