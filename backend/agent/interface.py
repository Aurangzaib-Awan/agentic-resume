# agent/interface.py

"""
Purpose :   Its the doorway to our agent(graph), we are making this so routers never touch graph internals,
            a silent entry that wraps the graph and exposes it to the fastapi backend.

Contents :
- (function) ask_agent : loads history, runs the graph, saves the exchange, returns the reply
"""

import json
from pathlib import Path

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


async def ask_agent(message: str, thread_id: str) -> dict:    
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
    }

    final_state = await Graph.ainvoke(initial_state)

    reply = final_state["messages"][-1].content

    # saved after the graph runs, so a failed turn doesn't leave a dangling question
    await insert_message(thread_id, "user", message)
    await insert_message(thread_id, "assistant", reply)

    action = final_state.get("action", "none")
    return {
        "reply": reply,
        "projects": _get_projects(final_state),
        "action": None if action == "none" else action,
    }