# agent/nodes/classify.py

"""
Purpose : this file is created so we can direct the user queries to either qa or github or off_topic

Contents :
- function(classify) : takes state (user message) and returns a dict built from ClassifyOutput (intent + repo if any)
"""

import json
from pathlib import Path

from agent.prompts.classify import CLASSIFY_PROMPT
from agent.state import AgentState
from agent.structured_outputs.classify_output import ClassifyOutput
from agent.tools.chat_models import classify_llm

# loaded once at import, not per request — static config, not state
_PROFILE = json.loads((Path(__file__).parent.parent / "profile.json").read_text())
_REPOS = [p["github_repo"] for p in _PROFILE["projects"] if p["github_repo"]]
_PROJECTS = [p["name"] for p in _PROFILE["projects"]]


async def node_classify(state: AgentState) -> dict:

    user_message = state["messages"][-1].content

    prompt = CLASSIFY_PROMPT.format_messages(
        repo_list="\n".join(f"- {name}" for name in _REPOS),
        project_list="\n".join(f"- {name}" for name in _PROJECTS),
        messages=state["messages"][-10:],
    )

    try:
        result: ClassifyOutput = await classify_llm.ainvoke(
            prompt, output_schema=ClassifyOutput
        )
    except Exception as e:
        print(f"classify failed, defaulting to off_topic: {e}")
        return {"intent": "off_topic", "repo": None, "project_scope": "none", "project": None, "action": "none"}

    # guard against a hallucinated repo/project name
    repo = result.repo if result.repo in _REPOS else None
    project = result.project if result.project in _PROJECTS else None

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