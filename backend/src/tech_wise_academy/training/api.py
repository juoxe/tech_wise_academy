"""HTTP API of the training. The player is identified by the header X-Profile-Id for now."""

import uuid
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Header, Query, Request, Response
from pydantic import BaseModel, Field

from tech_wise_academy.training.model import Progress
from tech_wise_academy.training.service import TrainingService

router = APIRouter(prefix="/training", tags=["training"])

GameName = Literal["level0", "clearing"]


class AnswerIn(BaseModel):
    game: GameName
    tool_key: str = Field(pattern=r"^[a-z0-9-]+$", max_length=100)
    correct: bool


class ProgressOut(BaseModel):
    tool_key: str
    correct_in_a_row: int
    learned: bool
    correct_total: int
    wrong_total: int


ProfileHeader = Annotated[uuid.UUID, Header(alias="X-Profile-Id")]


def get_service(request: Request) -> TrainingService:
    service: TrainingService = request.app.state.training_service
    return service


ServiceDep = Annotated[TrainingService, Depends(get_service)]


def _out(progress: Progress) -> ProgressOut:
    return ProgressOut(
        tool_key=progress.tool_key,
        correct_in_a_row=progress.correct_in_a_row,
        learned=progress.learned,
        correct_total=progress.correct_total,
        wrong_total=progress.wrong_total,
    )


@router.post("/answers", response_model=ProgressOut)
async def record_answer(
    body: AnswerIn,
    profile_id: ProfileHeader,
    service: ServiceDep,
) -> ProgressOut:
    progress = await service.record_answer(profile_id, body.game, body.tool_key, body.correct)
    return _out(progress)


@router.get("/progress", response_model=list[ProgressOut])
async def list_progress(
    profile_id: ProfileHeader,
    service: ServiceDep,
    game: Annotated[GameName, Query()],
) -> list[ProgressOut]:
    return [_out(progress) for progress in await service.list_progress(profile_id, game)]


@router.delete("/progress", status_code=204)
async def reset_progress(
    profile_id: ProfileHeader,
    service: ServiceDep,
    game: Annotated[GameName, Query()],
) -> Response:
    await service.reset_progress(profile_id, game)
    return Response(status_code=204)
