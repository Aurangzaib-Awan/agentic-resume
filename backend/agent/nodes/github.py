# agent/nodes/github.py

"""
Purpose :   This is a conditional node, if the classify node returns github in intent and also the repo name
            then here we are gonna use the github integration to fetch the data of that repo from my profile

Contents :

- function(fetch_github_repo):  get the data from the github integration and return the state update

"""

from agent.state import AgentState
from agent.tools.integrations.github import fetch_git_data


async def node_github(state: AgentState) -> dict:
    
    repo = state["repo"]

    # classify nulls out hallucinated repo names, so repo can be None here
    if repo is None:
        return {"repo_data": None}

    fetched_data = await fetch_git_data(repo)

    return {"repo_data": fetched_data}