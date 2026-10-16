# agent/interface.py

"""
Purpose :   Its the doorway to our agent(graph), we are making this so routers never touch graph internals,
            a silent entry that wraps the graph and exposes it to the fastapi backend.

Contents :
- (function) _get_projects : project cards to show for this turn
- (function) _to_langchain : stored rows back into message objects
- (function) stream_agent : loads history, streams the graph's events, saves the exchange, ends with cards + action
"""

import json
from pathlib import Path
from typing import AsyncIterator

from langchain_core.messages import AIMessage, HumanMessage

from agent.factory import Graph
from agent.tools.integrations.postgres import get_last_messages, insert_message


_PROFILE = json.loads((Path(__file__).parent / "profile.json").read_text())
_TOP_PROJECTS = _PROFILE["top_projects"]

def _get_projects(state: dict) -> list[dict]:
    if state.get("project_scope") == "broad":
        names = _TOP_PROJECTS
    elif state.get("project"):
        names = [state["project"]]
    else:
        return []

    return [
        {
            "name": p["name"],
            "description": p["subtitle"],
            "tags": p["tech_stack"],
            "githubUrl": f"https://github.com/Aurangzaib-Awan/{p['github_repo']}" if p["github_repo"] else None,
            "liveUrl": p.get("live_url"),
        }
        for p in _PROFILE["projects"] if p["name"] in names
    ]

def _to_langchain(rows: list[dict]) -> list:
    """Turn stored {role, content} rows back into message objects."""
    messages = []
    for row in rows:
        if row["role"] == "user":
            messages.append(HumanMessage(content=row["content"]))
        else:
            messages.append(AIMessage(content=row["content"]))
    return messages


async def stream_agent(message: str, thread_id: str) -> AsyncIterator[dict]:
    """Run the graph for one visitor message and yield its events as they happen.

    Args:
        message (str): The visitor's latest message.
        thread_id (str): Conversation id the client keeps for an hour.

    Returns:
        AsyncIterator[dict]: status and token events, then one done event with projects and action.
    """

    # past messages for this thread, last hour only — empty list if new or expired
    history = _to_langchain(await get_last_messages(thread_id))

    initial_state = {
        "messages": history + [HumanMessage(content=message)],
        "intent": "off_topic",
        "repo": None,
        "repo_data": None,
        "project_scope": "none",
        "project": None,
        "action": "none",
        "status": "",
    }

    final_state = initial_state

    # custom = what the nodes write themselves, values = the state after each step
    async for mode, chunk in Graph.astream(initial_state, stream_mode=["custom", "values"]):

        if mode == "custom":
            yield chunk
        else:
            final_state = chunk

    reply = final_state["messages"][-1].content

    # saved after the graph runs, so a failed turn doesn't leave a dangling question
    await insert_message(thread_id, "user", message)
    await insert_message(thread_id, "assistant", reply)

    action = final_state.get("action", "none")

    yield {
        "type": "done",
        "projects": _get_projects(final_state),
        "action": None if action == "none" else action,
    }
