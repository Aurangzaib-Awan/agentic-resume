# backend/index.py

"""
Purpose : Vercel entrypoint, re-exports the fastapi app so zero-config detection finds it
"""

from core.main import app  # noqa: F401
