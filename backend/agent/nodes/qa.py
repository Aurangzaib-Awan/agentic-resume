# agent/nodes/qa.py

"""
Purpose :   The purpose of this file is to set my persona so the llm talks like me.
            It gets the data from the previous nodes and answers the user according
            to the intent. This is the only node that speaks.

Contents :
- function(qa_node) : builds the prompt from state, calls the llm, returns the reply
"""

import json
from pathlib import Path

from langchain_core.messages import AIMessage

from agent.prompts.qa import QA_PROMPT, TASK_BY_INTENT, CARDS_TASK
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
    if state.get("project_scope") == "broad":
        task = CARDS_TASK.format(names=", ".join(_TOP_PROJECTS))
    else:
        task = TASK_BY_INTENT[intent]
    print(state.get("project_scope"), task)

    prompt = QA_PROMPT.format_messages(
        profile=_PROFILE_TEXT,
        repo_context=repo_context,
        task = task,
        messages=state["messages"][-10:],
    )

    try:
        response = await qa_llm.ainvoke(prompt)
        
    except Exception as e:
        print(f"qa failed: {e}")
        return {"messages": [AIMessage(content=FALLBACK)]}

    return {"messages": [response]}