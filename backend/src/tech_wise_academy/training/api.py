"""HTTP API of the training. The player is identified by the header X-Profile-Id for now."""

import uuid
from datetime import datetime
from typing import Annotated, Literal, Self

from fastapi import APIRouter, Depends, Header, Query, Request, Response
from pydantic import BaseModel, Field, model_validator

from tech_wise_academy.training.model import (
    MAX_SCORE,
    MIN_SCORE,
    Progress,
    ResultSummary,
    RoundResult,
)
from tech_wise_academy.training.service import TrainingService

router = APIRouter(prefix="/training", tags=["training"])

GameName = Literal["level0", "clearing"]
RoundGameName = Literal["sql", "code", "memory"]


class ResultIn(BaseModel):
    """The result of a finished round: `solved` of `total` (Memory: pairs found of moves)."""

    game: RoundGameName
    difficulty: int = Field(ge=1, le=3)
    solved: int = Field(ge=0, le=1000)
    total: int = Field(ge=1, le=1000)

    @model_validator(mode="after")
    def solved_is_at_most_total(self) -> Self:
        if self.solved > self.total:
            raise ValueError("solved must not be greater than total")
        return self


class RoundResultOut(BaseModel):
    solved: int
    total: int
    played_at: datetime


class ResultSummaryOut(BaseModel):
    game: str
    difficulty: int
    rounds: int
    best: RoundResultOut
    last: RoundResultOut


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


class PriorityOut(BaseModel):
    """A tool the player has given a score."""

    tool_key: str
    score: int


class PrioritiesIn(BaseModel):
    """One score for several tools: a single tool, an area or a whole tech stack."""

    tool_keys: list[Annotated[str, Field(pattern=r"^[a-z0-9][a-z0-9._+#-]*$", max_length=100)]] = (
        Field(min_length=1, max_length=1000)
    )
    # `null` removes the scores of the tools: they are "not set" again.
    score: Annotated[int, Field(ge=MIN_SCORE, le=MAX_SCORE)] | None


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


def _result_out(result: RoundResult) -> RoundResultOut:
    return RoundResultOut(solved=result.solved, total=result.total, played_at=result.played_at)


def _summary_out(summary: ResultSummary) -> ResultSummaryOut:
    return ResultSummaryOut(
        game=summary.game,
        difficulty=summary.difficulty,
        rounds=summary.rounds,
        best=_result_out(summary.best),
        last=_result_out(summary.last),
    )


@router.post("/results", status_code=204)
async def record_result(
    body: ResultIn,
    profile_id: ProfileHeader,
    service: ServiceDep,
) -> Response:
    await service.record_result(profile_id, body.game, body.difficulty, body.solved, body.total)
    return Response(status_code=204)


@router.get("/results", response_model=list[ResultSummaryOut])
async def list_results(profile_id: ProfileHeader, service: ServiceDep) -> list[ResultSummaryOut]:
    return [_summary_out(summary) for summary in await service.list_result_summaries(profile_id)]


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


@router.get("/priorities", response_model=list[PriorityOut])
async def list_priorities(profile_id: ProfileHeader, service: ServiceDep) -> list[PriorityOut]:
    """The importance scores the player has set; a tool that is not listed has no score."""
    scores = await service.list_scores(profile_id)
    return [PriorityOut(tool_key=key, score=scores[key]) for key in sorted(scores)]


@router.put("/priorities", status_code=204)
async def set_priorities(
    body: PrioritiesIn,
    profile_id: ProfileHeader,
    service: ServiceDep,
) -> Response:
    await service.set_scores(profile_id, body.tool_keys, body.score)
    return Response(status_code=204)


@router.delete("/priorities", status_code=204)
async def reset_priorities(profile_id: ProfileHeader, service: ServiceDep) -> Response:
    await service.reset_scores(profile_id)
    return Response(status_code=204)
