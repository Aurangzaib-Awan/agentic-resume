# backend/main.py

"""
Purpose : So this is where our application would run

Contents :
- app : the fastapi instance, cors, and the mounted routes
- /health : cheap endpoint for the keepalive cron
"""

from dotenv import load_dotenv

load_dotenv("core/.env")   # must run before agent imports build the groq clients
# load_dotenv()


from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from agent.tools.integrations.postgres import init_db
from core.routes.chat import router as chat_router
from core.routes.relevancy import router as relevancy_router
from core.routes.calendar import router as calendar_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()   # create the table if it isn't there
    yield             # app serves requests here


app = FastAPI(title="Agentic Resume", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        # add the vercel url once the frontend is deployed
    ],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(relevancy_router)
app.include_router(calendar_router)

@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}