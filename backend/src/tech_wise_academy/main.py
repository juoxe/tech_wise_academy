"""Application factory and wiring: the composition root of the backend."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy.ext.asyncio import create_async_engine

from tech_wise_academy.config import load_settings
from tech_wise_academy.learning_content.api import router as learning_content_router
from tech_wise_academy.learning_content.repository import ToolRepository
from tech_wise_academy.learning_content.service import ToolService
from tech_wise_academy.training.api import router as training_router
from tech_wise_academy.training.repository import TrainingRepository
from tech_wise_academy.training.service import TrainingService


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = load_settings()
    engine = create_async_engine(settings.database_url)
    app.state.tool_service = ToolService(ToolRepository(engine))
    app.state.training_service = TrainingService(TrainingRepository(engine))
    try:
        yield
    finally:
        await engine.dispose()


def create_app() -> FastAPI:
    app = FastAPI(title="Tech Wise Academy", version="0.1.0", lifespan=lifespan)
    app.include_router(learning_content_router, prefix="/api")
    app.include_router(training_router, prefix="/api")
    return app


app = create_app()
