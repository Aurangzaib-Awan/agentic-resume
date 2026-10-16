# agent/nodes/qa.py

"""
Purpose :   The purpose of this file is to set my persona so the llm talks like me.
            It gets the data from the previous nodes and answers the user according
            to the intent. This is the only node that speaks.

Contents :
- function(qa_node) : builds the prompt from state, streams the llm reply to the visitor, returns the full reply
"""

import json
from pathlib import Path

from langchain_core.messages import AIMessage
from langgraph.config import get_stream_writer

from agent.prompts.qa import QA_PROMPT, TASK_BY_INTENT, CARDS_TASK, ACTION_TASKS, STATUS_NOTE
from agent.state import AgentState
from agent.tools.chat_models import qa_llm

# loaded once at import — static config, not state
_PROFILE_TEXT = (Path(__file__).parent.parent / "profile.json").read_text()
_TOP_PROJECTS = json.loads(_PROFILE_TEXT)["top_projects"]

FALLBACK = "Sorry, something went wrong on my end. Could you ask that again?"


async def node_qa(state: AgentState) -> dict:

    intent = state["intent"]
    repo_data = state["repo_data"]

    # only the github path has repo data; other intents get an empty block
    if repo_data:
        repo_context = f"REPOSITORY DATA:\n{json.dumps(repo_data, indent=2)}\n\n"

    else:
        repo_context = ""


    # to check if cards task is to include in the context or not
    action = state.get("action", "none")
    if action != "none":
        task = ACTION_TASKS[action]
    elif state.get("project_scope") == "broad":
        task = CARDS_TASK.format(names=", ".join(_TOP_PROJECTS))
    else:
        task = TASK_BY_INTENT[intent]

    status = state.get("status", "")
    status_note = STATUS_NOTE.format(status=status) if status else ""

    prompt = QA_PROMPT.format_messages(
        profile=_PROFILE_TEXT,
        repo_context=repo_context,
        task = task,
        status_note=status_note,
        messages=state["messages"][-10:],
    )

    write = get_stream_writer()
    chunks = []

    try:

        async for text in qa_llm.astream(prompt):
            chunks.append(text)
            write({"type": "token", "text": text})

    except Exception as e:
        print(f"qa failed: {e}")

        # mid-reply failure: let the caller end the stream, a fallback line would read as part of the answer
        if chunks:
            raise

        write({"type": "token", "text": FALLBACK})
        return {"messages": [AIMessage(content=FALLBACK)]}

    return {"messages": [AIMessage(content="".join(chunks))]}