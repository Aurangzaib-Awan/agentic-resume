# agent/tools/integrations/github.py

"""
Purpose : To fetch the data from the github.

Content :
- fetch_git_data(repo_name) : repo metadata + README + top-level files, cached 15 min
"""

import os
import time
from typing import Optional

import httpx

OWNER = "Aurangzaib-Awan"
API = "https://api.github.com"
CACHE_TTL = 900  # 15 minutes, in seconds

# {repo_name: (fetched_at, data)} — lives for the life of the process
_CACHE: dict[str, tuple[float, dict]] = {}

# unauthenticated = 60 requests/hour, with a token = 5000
_HEADERS = {"Accept": "application/vnd.github+json"}
if os.environ.get("GITHUB_TOKEN"):
    _HEADERS["Authorization"] = f"Bearer {os.environ['GITHUB_TOKEN']}"


async def fetch_git_data(repo_name: str) -> Optional[dict]:
    cached = _CACHE.get(repo_name)
    if cached and time.time() - cached[0] < CACHE_TTL:
        return cached[1]

    base = f"{API}/repos/{OWNER}/{repo_name}"

    async with httpx.AsyncClient(headers=_HEADERS, timeout=10) as client:
        try:
            meta_resp = await client.get(base)
            if meta_resp.status_code != 200:
                print(f"github: repo '{repo_name}' returned {meta_resp.status_code}")
                return None
            meta = meta_resp.json()

            # raw README text; 404 is normal — plenty of repos have none
            readme_resp = await client.get(
                f"{base}/readme", headers={**_HEADERS, "Accept": "application/vnd.github.raw"}
            )
            readme = readme_resp.text if readme_resp.status_code == 200 else None

            # top-level files and folders only, not the full recursive tree
            files_resp = await client.get(f"{base}/contents")
            files = (
                [item["name"] for item in files_resp.json()]
                if files_resp.status_code == 200
                else []
            )

        except Exception as e:
            print(f"github: fetch failed for '{repo_name}': {e}")
            return None

    data = {
        "name": meta["name"],
        "description": meta.get("description"),
        "language": meta.get("language"),
        "topics": meta.get("topics", []),
        "stars": meta.get("stargazers_count", 0),
        "url": meta["html_url"],
        "pushed_at": meta.get("pushed_at"),
        "readme": readme,
        "files": files,
    }

    _CACHE[repo_name] = (time.time(), data)
    return data