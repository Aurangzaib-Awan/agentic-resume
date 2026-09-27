# Gap Ledger

Logged concept gaps from build sessions. Run learn sessions against this list,
prioritizing frequent/old open gaps. A gap can only be marked resolved with a
verification source (docs URL, source file, test, or "ran it and confirmed") --
an LLM's explanation alone never counts as verification, only as a step toward it.
Managed by scripts/ledger.py -- don't hand-edit the table structure, it'll break
parsing (free-form notes below the table are fine).

| id | concept | project | context | status | first_logged | times_seen | last_seen | verified_via |
|----|---------|---------|---------|--------|--------------|------------|-----------|--------------|
| 1 | with_structured_output return type | agentic_resume | guessed it returns a dict; it returns a validated Pydantic model instance, so access is result.intent not result['intent'] | open | 2026-09-08 | 1 | 2026-09-08 |  |
| 2 | LangChain message objects (BaseMessage/HumanMessage/.content) | agentic_resume | thought state['messages'][-1] held the LLM response; it holds the user's HumanMessage. Unclear on why .content is needed and what else the object carries | open | 2026-09-08 | 1 | 2026-09-08 |  |
| 3 | why chat models take a message list not a string | agentic_resume | did not know. Roles (system vs human) are what separate instructions from user data; flattening removes the prompt-injection boundary | open | 2026-09-08 | 1 | 2026-09-08 |  |
| 4 | blocking vs non-blocking calls in async code | agentic_resume | which operations are CPU/disk-bound and why a blocking call (e.g. Path.read_text) inside an async function stalls the whole event loop for all concurrent users | open | 2026-09-08 | 1 | 2026-09-08 |  |
| 5 | how LangGraph state updates work | agentic_resume | did not know nodes must RETURN a partial dict that the runtime merges; mutating the passed-in state silently does nothing. Default reducer overwrites, MessagesState.messages appends | open | 2026-09-10 | 1 | 2026-09-10 |  |
| 6 | GitHub REST API | agentic_resume | did not know the endpoints for repo metadata, README, and contents; auth via GITHUB_TOKEN and the 60/hr unauthenticated rate limit | open | 2026-09-10 | 1 | 2026-09-10 |  |
| 7 | httpx and async HTTP clients | agentic_resume | unfamiliar with httpx, AsyncClient, async with, and response objects (.status_code / .json() / .text). Why httpx not requests in async code | open | 2026-09-10 | 1 | 2026-09-10 |  |
| 8 | LangChain tool vs a plain function | agentic_resume | called the github integration a 'tool' when nothing binds it to an LLM. A @tool is something a model CHOOSES to call; this is called directly by Python after classify already decided. Affects naming and whether @tool/bind_tools is needed | open | 2026-09-10 | 1 | 2026-09-10 |  |
| 9 | HTTP headers and content negotiation | agentic_resume | did not know what a header is. Accept sets the RESPONSE FORMAT (vnd.github+json gives JSON with base64 content, vnd.github.raw gives plain text), Authorization carries the token. Guessed headers control access - they do not | open | 2026-09-10 | 1 | 2026-09-10 |  |
| 10 | API authentication vs authorization - when a token is actually required | agentic_resume | surprised the GitHub fetch worked with no PAT. Public data needs no auth; a token only RAISES the rate limit (60/hr -> 5000/hr) or unlocks private repos. Auth is about identity and quota, not permission to read public things | open | 2026-09-10 | 1 | 2026-09-10 |  |
| 11 | LangGraph checkpointers, MemorySaver, and thread_id | agentic_resume | chose server-side memory without knowing the mechanics: what compile(checkpointer=...) actually does, how MemorySaver stores state (in-process RAM, lost on restart), how thread_id keys separate conversations with no auth, and why only the new message is passed to ainvoke instead of full history | open | 2026-09-12 | 1 | 2026-09-12 |  |
| 12 | LangGraph StateGraph API | agentic_resume | add_node / add_edge / add_conditional_edges / compile. Graphs are BUILT by calling StateGraph(AgentState), not subclassed. Conditional edges take a callable that returns the next node name, not a state field | open | 2026-09-12 | 1 | 2026-09-12 |  |