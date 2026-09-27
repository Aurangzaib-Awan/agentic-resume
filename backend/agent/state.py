# agent/state.py

"""
Purpose : to carry state and its fields

Contents : the state fields
"""

from typing import Literal
from langgraph.graph import MessagesState

class AgentState(MessagesState):
    intent : Literal["qa","github","off_topic"]
    repo : str | None
    repo_data : dict | None
    project_scope : Literal["specific","broad","none"]
    project : str | None