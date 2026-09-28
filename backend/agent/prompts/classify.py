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
        "- 'broad' if they want to see or list his projects or work in ANY "
        "phrasing, singular or plural, short or long. Examples: 'show project', "
        "'show projects', 'projects', 'his work', 'what have you built', "
        "'show me your work', 'what has he made'. Naming no specific project "
        "is what makes it broad.\n"
        "- 'none' for everything else — follow-ups, skill questions, greetings, "
        "hiring questions, or anything not asking to see a project for the first time.\n"
        "For any other intent, leave project_scope as 'none' and project null.\n\n"
        "Also set action, for ANY intent:\n"
        "- 'cv' if the LATEST message directly asks to see, open, or download "
        "his CV or resume (e.g. 'show cv', 'can I see your resume').\n"
        "- 'relevancy' if it directly asks to check how well he fits a job or "
        "role (e.g. 'check relevancy', 'how relevant is he for my job').\n"
        "- 'book' if it directly asks to book, schedule, or set up a call or "
        "meeting (e.g. 'book a call', 'can we schedule a meeting').\n"
        "- 'hire' if it generally asks how to hire him, reach out to hire "
        "him, or work with him, WITHOUT naming a specific channel (e.g. 'how "
        "can I hire him', 'how do I get in touch to hire him', 'how do we "
        "start working together'). If they specifically say 'call' or 'book', "
        "use 'book' instead. If they specifically say 'email' or 'mail', use "
        "'email' instead.\n"
        "- 'email' if it directly asks to email him or send him a message "
        "(e.g. 'send him an email', 'I want to email him').\n"
        "- 'none' for everything else, including questions ABOUT these topics "
        "('what does his CV say about Docker', 'what is his email'). Only the "
        "LATEST message counts — earlier messages never trigger an action.\n"
        "If action is not 'none', set intent to 'qa', project_scope to 'none', "
        "and leave project and repo null.",


    ),
    MessagesPlaceholder("messages"),
])