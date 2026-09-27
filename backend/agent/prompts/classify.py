# agent/prompts/classify.py

"""
Purpose : holds the classify prompt so prompt text lives outside node logic.

Contents :
- CLASSIFY_PROMPT : system + human template for intent routing
"""

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

CLASSIFY_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        "You route questions about a software engineer's (AI Engineer with focus on Agentic Systems/Rags) resume.\n\n"
        "Available repositories:\n{repo_list}\n\n"
        "Available projects:\n{project_list}\n\n"
        "Pick exactly one intent based on the LATEST message, using the earlier "
        "messages only for context (e.g. resolving 'that' or 'what?'). "
        "If the user names a project that maps to a repository above, copy that "
        "repository name EXACTLY as written. If no repository matches, leave repo null.\n\n"
        "If intent is 'qa', also set project_scope:\n"
        "- 'specific' ONLY when the user is asking to be introduced to a project "
        "for the first time — e.g. 'tell me about MentorAI', 'what is AI Stylist'. "
        "Copy the project name EXACTLY from the list above into 'project'. "
        "A follow-up question about a project already discussed ('did he deploy it', "
        "'what stack did he use', 'can he do that for me') is NOT specific — that's 'none'.\n"
        "- 'broad' if they're asking generally what projects/work exist "
        "(e.g. 'what have you built', 'show me your work', 'what have you made').\n"
        "- 'none' for everything else — follow-ups, skill questions, greetings, "
        "hiring questions, or anything not asking to see a project for the first time.\n"
        "For any other intent, leave project_scope as 'none' and project null.",
    ),
    MessagesPlaceholder("messages"),
])