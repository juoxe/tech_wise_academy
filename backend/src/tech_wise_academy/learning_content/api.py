"""HTTP API of the learning content: routes, response models and error mapping."""

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field

from tech_wise_academy.learning_content.model import (
    DEFAULT_LANGUAGE,
    Category,
    KeyConcept,
    Paradigm,
    ToolContent,
    ToolDraft,
)
from tech_wise_academy.learning_content.service import (
    ToolDetail,
    ToolKeyTakenError,
    ToolNotFoundError,
    ToolRuleError,
    ToolService,
    ToolSummary,
)

router = APIRouter(prefix="/tools", tags=["tools"])

LanguageParam = Literal["de"]


class AlternativeOut(BaseModel):
    key: str
    name: str


class ToolSummaryOut(BaseModel):
    key: str
    name: str
    category: Category
    default_priority: int
    summary: str
    language: str
    icon: str | None
    paradigm: Paradigm | None


class KeyConceptOut(BaseModel):
    term: str
    explanation: str


class ToolContentOut(BaseModel):
    overview: str
    use_cases: list[str]
    key_concepts: list[KeyConceptOut]
    when_to_use: str
    when_not_to_use: str
    good_to_know: list[str]


class ToolDetailOut(ToolSummaryOut):
    documentation_url: str
    hints: list[str]
    examples: list[str]
    alternatives: list[AlternativeOut]
    content: ToolContentOut | None


class ToolBody(BaseModel):
    """All editable data of a tool; the texts are German. Used to replace a tool as a whole."""

    name: str
    category: Category
    paradigm: Paradigm | None = None
    default_priority: int
    documentation_url: str
    icon: str | None = None
    summary: str
    hints: list[str] = Field(default_factory=list)
    examples: list[str] = Field(default_factory=list)
    alternatives: list[str] = Field(default_factory=list)
    content: ToolContentOut | None = None


class ToolCreate(ToolBody):
    key: str


def _draft(key: str, body: ToolBody) -> ToolDraft:
    content = body.content
    return ToolDraft(
        key=key,
        name=body.name.strip(),
        category=body.category,
        paradigm=body.paradigm,
        default_priority=body.default_priority,
        documentation_url=body.documentation_url.strip(),
        icon=body.icon or None,
        summary=body.summary.strip(),
        hints=tuple(body.hints),
        examples=tuple(body.examples),
        alternatives=tuple(body.alternatives),
        content=None
        if content is None
        else ToolContent(
            overview=content.overview,
            use_cases=tuple(content.use_cases),
            key_concepts=tuple(
                KeyConcept(term=item.term, explanation=item.explanation)
                for item in content.key_concepts
            ),
            when_to_use=content.when_to_use,
            when_not_to_use=content.when_not_to_use,
            good_to_know=tuple(content.good_to_know),
        ),
    )


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
        default_priority=summary.default_priority,
        summary=summary.summary,
        language=summary.language,
        icon=summary.icon,
        paradigm=summary.paradigm,
    )


def _detail_out(detail: ToolDetail) -> ToolDetailOut:
    return ToolDetailOut(
        key=detail.key,
        name=detail.name,
        category=detail.category,
        default_priority=detail.default_priority,
        summary=detail.summary,
        language=detail.language,
        icon=detail.icon,
        paradigm=detail.paradigm,
        documentation_url=detail.documentation_url,
        hints=list(detail.hints),
        examples=list(detail.examples),
        alternatives=[
            AlternativeOut(key=alternative.key, name=alternative.name)
            for alternative in detail.alternatives
        ],
        content=_content_out(detail.content),
    )


def _content_out(content: ToolContent | None) -> ToolContentOut | None:
    if content is None:
        return None
    return ToolContentOut(
        overview=content.overview,
        use_cases=list(content.use_cases),
        key_concepts=[
            KeyConceptOut(term=item.term, explanation=item.explanation)
            for item in content.key_concepts
        ],
        when_to_use=content.when_to_use,
        when_not_to_use=content.when_not_to_use,
        good_to_know=list(content.good_to_know),
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


@router.post("", response_model=ToolDetailOut, status_code=201)
async def create_tool(body: ToolCreate, service: ServiceDep) -> ToolDetailOut:
    try:
        return _detail_out(await service.create_tool(_draft(body.key, body)))
    except ToolRuleError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except ToolKeyTakenError as error:
        raise HTTPException(status_code=409, detail=f"Tool '{body.key}' exists already") from error


@router.put("/{key}", response_model=ToolDetailOut)
async def update_tool(key: str, body: ToolBody, service: ServiceDep) -> ToolDetailOut:
    try:
        return _detail_out(await service.update_tool(_draft(key, body)))
    except ToolRuleError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except ToolNotFoundError as error:
        raise HTTPException(status_code=404, detail=f"Tool '{key}' not found") from error


@router.delete("/{key}", status_code=204)
async def delete_tool(key: str, service: ServiceDep) -> None:
    try:
        await service.delete_tool(key)
    except ToolNotFoundError as error:
        raise HTTPException(status_code=404, detail=f"Tool '{key}' not found") from error
