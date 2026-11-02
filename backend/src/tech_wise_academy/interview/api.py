"""HTTP API of the interview sets. The player is identified by the header X-Profile-Id for now."""

import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response
from pydantic import BaseModel, Field

from tech_wise_academy.interview.embedding import EmbeddingUnavailableError
from tech_wise_academy.interview.model import InterviewSet, InterviewSetSummary
from tech_wise_academy.interview.service import EmptyJobAdError, InterviewService

router = APIRouter(prefix="/interview-sets", tags=["interview"])


class InterviewSetIn(BaseModel):
    job_ad: str = Field(min_length=50, max_length=20_000)


class InterviewSetSummaryOut(BaseModel):
    id: uuid.UUID
    title: str
    created_at: datetime
    card_count: int


class InterviewCardOut(BaseModel):
    tool_key: str
    similarity: float
    mentioned: bool
    evidence: str


class InterviewSetOut(BaseModel):
    id: uuid.UUID
    title: str
    created_at: datetime
    embedding_model: str
    cards: list[InterviewCardOut]


ProfileHeader = Annotated[uuid.UUID, Header(alias="X-Profile-Id")]


def get_service(request: Request) -> InterviewService:
    service: InterviewService = request.app.state.interview_service
    return service


ServiceDep = Annotated[InterviewService, Depends(get_service)]


def _summary_out(summary: InterviewSetSummary) -> InterviewSetSummaryOut:
    return InterviewSetSummaryOut(
        id=summary.id,
        title=summary.title,
        created_at=summary.created_at,
        card_count=summary.card_count,
    )


def _set_out(interview_set: InterviewSet) -> InterviewSetOut:
    return InterviewSetOut(
        id=interview_set.id,
        title=interview_set.title,
        created_at=interview_set.created_at,
        embedding_model=interview_set.model,
        cards=[
            InterviewCardOut(
                tool_key=card.tool_key,
                similarity=card.similarity,
                mentioned=card.mentioned,
                evidence=card.evidence,
            )
            for card in interview_set.cards
        ],
    )


@router.post("", response_model=InterviewSetOut, status_code=201)
async def create_set(
    body: InterviewSetIn,
    profile_id: ProfileHeader,
    service: ServiceDep,
) -> InterviewSetOut:
    try:
        return _set_out(await service.create_set(profile_id, body.job_ad))
    except EmptyJobAdError as error:
        raise HTTPException(status_code=422, detail="The job ad holds no text") from error
    except EmbeddingUnavailableError as error:
        raise HTTPException(status_code=503, detail="Embedding service unavailable") from error


@router.get("", response_model=list[InterviewSetSummaryOut])
async def list_sets(profile_id: ProfileHeader, service: ServiceDep) -> list[InterviewSetSummaryOut]:
    return [_summary_out(summary) for summary in await service.list_sets(profile_id)]


@router.get("/{set_id}", response_model=InterviewSetOut)
async def get_set(
    set_id: uuid.UUID,
    profile_id: ProfileHeader,
    service: ServiceDep,
) -> InterviewSetOut:
    interview_set = await service.get_set(profile_id, set_id)
    if interview_set is None:
        raise HTTPException(status_code=404, detail=f"Interview set '{set_id}' not found")
    return _set_out(interview_set)


@router.delete("/{set_id}", status_code=204)
async def delete_set(
    set_id: uuid.UUID,
    profile_id: ProfileHeader,
    service: ServiceDep,
) -> Response:
    if not await service.delete_set(profile_id, set_id):
        raise HTTPException(status_code=404, detail=f"Interview set '{set_id}' not found")
    return Response(status_code=204)
