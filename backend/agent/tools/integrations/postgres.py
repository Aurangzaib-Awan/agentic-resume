# agent/tools/integrations/postgres.py

"""
Purpose :   So we can make the messages persistent so when the user came back in the current session,
            the agent remembers the user.

Contents :
- init_db : creates the messages table if it isn't there
- insert_message : saves one message for a thread
- get_last_messages : reads back the recent messages for a thread, last hour only
"""

import os

import psycopg
from psycopg.rows import dict_row

DB_URL = os.environ["DB_URL"]

HISTORY_WINDOW = "1 hour"   # anything older is ignored
MESSAGE_LIMIT = 10          # how many messages to feed back into the prompt


async def init_db() -> None:
    async with await psycopg.AsyncConnection.connect(DB_URL) as conn:
        await conn.execute(
            """
            CREATE TABLE IF NOT EXISTS messages (
                id          BIGSERIAL PRIMARY KEY,
                thread_id   TEXT        NOT NULL,
                role        TEXT        NOT NULL,
                content     TEXT        NOT NULL,
                created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
            );
            CREATE INDEX IF NOT EXISTS idx_thread_time
                ON messages (thread_id, created_at DESC);
            """
        )


async def insert_message(thread_id: str, role: str, content: str) -> bool:
    try:
        async with await psycopg.AsyncConnection.connect(DB_URL) as conn:
            await conn.execute(
                "INSERT INTO messages (thread_id, role, content) VALUES (%s, %s, %s)",
                (thread_id, role, content),
            )
        return True
    except Exception as e:
        print(f"postgres: insert failed for thread {thread_id}: {e}")
        return False

async def get_last_messages(thread_id: str) -> list[dict]:
    try:
        async with await psycopg.AsyncConnection.connect(
            DB_URL, row_factory=dict_row
        ) as conn:
            cur = await conn.execute(
                f"""
                SELECT role, content FROM messages
                WHERE thread_id = %s
                  AND created_at > now() - interval '{HISTORY_WINDOW}'
                ORDER BY created_at DESC
                LIMIT {MESSAGE_LIMIT}
                """,
                (thread_id,),
            )
            rows = await cur.fetchall()
        # newest-first from the query, flipped back to chronological for the prompt
        return list(reversed(rows))
    except Exception as e:
        print(f"postgres: read failed for thread {thread_id}: {e}")
        return []