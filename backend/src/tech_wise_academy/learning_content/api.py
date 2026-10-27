"""HTTP API of the learning content: routes, response models and error mapping."""

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel

from tech_wise_academy.learning_content.model import DEFAULT_LANGUAGE, Category
from tech_wise_academy.learning_content.service import ToolDetail, ToolService, ToolSummary

router = APIRouter(prefix="/tools", tags=["tools"])

LanguageParam = Literal["de"]


class AlternativeOut(BaseModel):
    key: str
    name: str


class ToolSummaryOut(BaseModel):
    key: str
    name: str
    category: Category
    summary: str
    language: str
    icon: str | None


class ToolDetailOut(ToolSummaryOut):
    documentation_url: str
    hints: list[str]
    examples: list[str]
    alternatives: list[AlternativeOut]


def get_service(request: Request) -> ToolService:
    service: ToolService = request.app.state.tool_service
    return service


ServiceDep = Annotated[ToolService, Depends(get_service)]
LanguageQuery = Annotated[LanguageParam, Query()]


def _summary_out(summary: ToolSummary) -> ToolSummaryOut:
    return ToolSummaryOut(
        key=summary.key,
        name=summary.name,
        category=summary.category,
        summary=summary.summary,
        language=summary.language,
        icon=summary.icon,
    )


def _detail_out(detail: ToolDetail) -> ToolDetailOut:
    return ToolDetailOut(
        key=detail.key,
        name=detail.name,
        category=detail.category,
        summary=detail.summary,
        language=detail.language,
        icon=detail.icon,
        documentation_url=detail.documentation_url,
        hints=list(detail.hints),
        examples=list(detail.examples),
        alternatives=[
            AlternativeOut(key=alternative.key, name=alternative.name)
            for alternative in detail.alternatives
        ],
    )


@router.get("", response_model=list[ToolSummaryOut])
async def list_tools(
    service: ServiceDep,
    lang: LanguageQuery = DEFAULT_LANGUAGE,
) -> list[ToolSummaryOut]:
    return [_summary_out(summary) for summary in await service.list_tools(lang)]


@router.get("/{key}", response_model=ToolDetailOut)
async def get_tool(
    key: str,
    service: ServiceDep,
    lang: LanguageQuery = DEFAULT_LANGUAGE,
) -> ToolDetailOut:
    detail = await service.get_tool(key, lang)
    if detail is None:
        raise HTTPException(status_code=404, detail=f"Tool '{key}' not found")
    return _detail_out(detail)
