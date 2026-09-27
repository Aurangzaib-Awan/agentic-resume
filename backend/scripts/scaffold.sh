"""
    run this from the root dir
"""

#!/usr/bin/env bash
set -e

ROOT="."

# ---------- AGENT ----------
mkdir -p "$ROOT/agent/nodes"
mkdir -p "$ROOT/agent/tools/integrations"

touch "$ROOT/agent/__init__.py"
touch "$ROOT/agent/state.py"
touch "$ROOT/agent/factory.py"
touch "$ROOT/agent/interface.py"

touch "$ROOT/agent/nodes/__init__.py"
touch "$ROOT/agent/nodes/guard.py"
touch "$ROOT/agent/nodes/router.py"
touch "$ROOT/agent/nodes/qa.py"
touch "$ROOT/agent/nodes/github.py"
touch "$ROOT/agent/nodes/redirect.py"

touch "$ROOT/agent/tools/__init__.py"
touch "$ROOT/agent/tools/chat_models.py"
touch "$ROOT/agent/tools/integrations/__init__.py"
touch "$ROOT/agent/tools/integrations/github.py"

# ---------- BACKEND ----------
mkdir -p "$ROOT/backend/routes"

touch "$ROOT/backend/__init__.py"
touch "$ROOT/backend/main.py"
touch "$ROOT/backend/routes/__init__.py"
touch "$ROOT/backend/routes/chat.py"

# ---------- ROOT ----------
mkdir -p "$ROOT/tests"
touch "$ROOT/tests/__init__.py"
touch "$ROOT/requirements.txt"
touch "$ROOT/run.sh"
chmod +x "$ROOT/run.sh"

echo "Scaffolding created at ./$ROOT"