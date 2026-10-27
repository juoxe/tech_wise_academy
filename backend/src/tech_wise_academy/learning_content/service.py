"""Use cases of the learning content: list and detail of the tools."""

from collections.abc import Mapping
from dataclasses import dataclass
from typing import Protocol

from tech_wise_academy.learning_content.model import DEFAULT_LANGUAGE, Category, Tool


class ToolReader(Protocol):
    async def load_tools(self) -> tuple[Tool, ...]: ...

    async def load_alternative_pairs(self) -> tuple[tuple[str, str], ...]: ...


@dataclass(frozen=True)
class ToolSummary:
    key: str
    name: str
    category: Category
    summary: str
    language: str
    icon: str | None


@dataclass(frozen=True)
class Alternative:
    key: str
    name: str


@dataclass(frozen=True)
class ToolDetail:
    key: str
    name: str
    category: Category
    summary: str
    language: str
    icon: str | None
    documentation_url: str
    hints: tuple[str, ...]
    examples: tuple[str, ...]
    alternatives: tuple[Alternative, ...]


def _text_in_language(texts: Mapping[str, str], language: str) -> tuple[str, str]:
    """Return the text and its language; fall back to the default language."""
    if language in texts:
        return texts[language], language
    return texts[DEFAULT_LANGUAGE], DEFAULT_LANGUAGE


def _hints_in_language(hints: Mapping[str, tuple[str, ...]], language: str) -> tuple[str, ...]:
    if language in hints:
        return hints[language]
    return hints.get(DEFAULT_LANGUAGE, ())


class ToolService:
    def __init__(self, reader: ToolReader) -> None:
        self._reader = reader

    async def list_tools(self, language: str) -> list[ToolSummary]:
        tools = await self._reader.load_tools()
        summaries = []
        for tool in sorted(tools, key=lambda tool: tool.name):
            summary, used_language = _text_in_language(tool.summaries, language)
            summaries.append(
                ToolSummary(
                    key=tool.key,
                    name=tool.name,
                    category=tool.category,
                    summary=summary,
                    language=used_language,
                    icon=tool.icon,
                )
            )
        return summaries

    async def get_tool(self, key: str, language: str) -> ToolDetail | None:
        tools = await self._reader.load_tools()
        tool = next((tool for tool in tools if tool.key == key), None)
        if tool is None:
            return None

        by_key = {candidate.key: candidate for candidate in tools}
        partner_keys = _alternative_partners(key, await self._reader.load_alternative_pairs())
        alternatives = tuple(
            Alternative(key=partner.key, name=partner.name)
            for partner in sorted(
                (by_key[partner_key] for partner_key in partner_keys if partner_key in by_key),
                key=lambda partner: partner.name,
            )
        )

        summary, used_language = _text_in_language(tool.summaries, language)
        return ToolDetail(
            key=tool.key,
            name=tool.name,
            category=tool.category,
            summary=summary,
            language=used_language,
            icon=tool.icon,
            documentation_url=tool.documentation_url,
            hints=_hints_in_language(tool.hints, language),
            examples=tool.examples,
            alternatives=alternatives,
        )


def _alternative_partners(key: str, pairs: tuple[tuple[str, str], ...]) -> set[str]:
    """A pair is symmetric: it counts from both sides, although it is stored once."""
    partners: set[str] = set()
    for left, right in pairs:
        if left == key:
            partners.add(right)
        elif right == key:
            partners.add(left)
    return partners
