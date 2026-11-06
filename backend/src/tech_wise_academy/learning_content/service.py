"""Use cases of the learning content: list and detail of the tools."""

import re
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Protocol

from tech_wise_academy.learning_content.model import (
    DEFAULT_LANGUAGE,
    Category,
    Paradigm,
    Tool,
    ToolContent,
    ToolDraft,
)

KEY_PATTERN = re.compile(r"[a-z0-9][a-z0-9._+#-]*")


class ToolReader(Protocol):
    async def load_tools(self) -> tuple[Tool, ...]: ...

    async def load_alternative_pairs(self) -> tuple[tuple[str, str], ...]: ...


class ToolWriter(Protocol):
    async def key_exists(self, key: str) -> bool: ...

    async def create_tool(self, draft: ToolDraft) -> None: ...

    async def update_tool(self, draft: ToolDraft) -> bool: ...

    async def delete_tool(self, key: str) -> bool: ...


class ToolRuleError(Exception):
    """The data of a tool breaks a rule; the message names the rule (German, shown in the UI)."""


class ToolKeyTakenError(Exception):
    """A tool with this key exists already (a deleted tool keeps its key)."""


class ToolNotFoundError(Exception):
    """There is no tool with this key."""


def check_draft(draft: ToolDraft, known_keys: set[str]) -> None:
    """The rules of the seed data, applied to every tool that is created or changed.

    `known_keys` are the keys of all tools that exist and are not deleted.
    """
    if not KEY_PATTERN.fullmatch(draft.key):
        raise ToolRuleError("Der Key darf nur aus Kleinbuchstaben, Ziffern und . _ + # - bestehen.")
    if not draft.name.strip():
        raise ToolRuleError("Der Name darf nicht leer sein.")
    if not draft.summary.strip():
        raise ToolRuleError("Die Zusammenfassung darf nicht leer sein.")
    if not 0 <= draft.default_priority <= 4:
        raise ToolRuleError("Die Standard-Priorität muss zwischen 0 und 4 liegen.")
    if draft.category is Category.LANGUAGE and draft.paradigm is None:
        raise ToolRuleError("Eine Programmiersprache braucht ein Paradigma.")
    if draft.category is not Category.LANGUAGE and draft.paradigm is not None:
        raise ToolRuleError("Nur eine Programmiersprache hat ein Paradigma.")
    if not draft.documentation_url.startswith(("http://", "https://")):
        raise ToolRuleError("Der Dokumentationslink muss mit http:// oder https:// beginnen.")
    name = draft.name.casefold()
    for hint in draft.hints:
        if not hint.strip():
            raise ToolRuleError("Ein Hinweis darf nicht leer sein.")
        if name in hint.casefold():
            raise ToolRuleError(f"Der Hinweis nennt den Namen des Tools: {hint}")
    if len(set(draft.alternatives)) != len(draft.alternatives):
        raise ToolRuleError("Eine Alternative ist doppelt angegeben.")
    if draft.key in draft.alternatives:
        raise ToolRuleError("Ein Tool kann nicht seine eigene Alternative sein.")
    unknown = [key for key in draft.alternatives if key not in known_keys]
    if unknown:
        raise ToolRuleError(f"Unbekannte Alternative: {', '.join(unknown)}")


@dataclass(frozen=True)
class ToolSummary:
    key: str
    name: str
    category: Category
    default_priority: int
    summary: str
    language: str
    icon: str | None
    paradigm: Paradigm | None


@dataclass(frozen=True)
class Alternative:
    key: str
    name: str


@dataclass(frozen=True)
class ToolDetail:
    key: str
    name: str
    category: Category
    default_priority: int
    summary: str
    language: str
    icon: str | None
    paradigm: Paradigm | None
    documentation_url: str
    hints: tuple[str, ...]
    examples: tuple[str, ...]
    alternatives: tuple[Alternative, ...]
    content: ToolContent | None


@dataclass(frozen=True)
class ToolText:
    """The name and the texts of a tool, for modules that work on the content (public interface)."""

    key: str
    name: str
    summary: str
    hints: tuple[str, ...]


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
    def __init__(self, reader: ToolReader, writer: ToolWriter | None = None) -> None:
        self._reader = reader
        self._writer = writer

    def _require_writer(self) -> ToolWriter:
        if self._writer is None:
            raise RuntimeError("This service was created without write access")
        return self._writer

    async def create_tool(self, draft: ToolDraft) -> ToolDetail:
        writer = self._require_writer()
        check_draft(draft, {tool.key for tool in await self._reader.load_tools()})
        if await writer.key_exists(draft.key):
            raise ToolKeyTakenError(draft.key)
        await writer.create_tool(draft)
        return await self._detail_or_fail(draft.key)

    async def update_tool(self, draft: ToolDraft) -> ToolDetail:
        writer = self._require_writer()
        check_draft(draft, {tool.key for tool in await self._reader.load_tools()})
        if not await writer.update_tool(draft):
            raise ToolNotFoundError(draft.key)
        return await self._detail_or_fail(draft.key)

    async def delete_tool(self, key: str) -> None:
        if not await self._require_writer().delete_tool(key):
            raise ToolNotFoundError(key)

    async def _detail_or_fail(self, key: str) -> ToolDetail:
        detail = await self.get_tool(key, DEFAULT_LANGUAGE)
        if detail is None:
            raise ToolNotFoundError(key)
        return detail

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
                    default_priority=tool.default_priority,
                    summary=summary,
                    language=used_language,
                    icon=tool.icon,
                    paradigm=tool.paradigm,
                )
            )
        return summaries

    async def list_tool_texts(self, language: str = DEFAULT_LANGUAGE) -> list[ToolText]:
        return [
            ToolText(
                key=tool.key,
                name=tool.name,
                summary=_text_in_language(tool.summaries, language)[0],
                hints=_hints_in_language(tool.hints, language),
            )
            for tool in await self._reader.load_tools()
        ]

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
            default_priority=tool.default_priority,
            summary=summary,
            language=used_language,
            icon=tool.icon,
            paradigm=tool.paradigm,
            documentation_url=tool.documentation_url,
            hints=_hints_in_language(tool.hints, language),
            examples=tool.examples,
            alternatives=alternatives,
            content=tool.contents.get(language, tool.contents.get(DEFAULT_LANGUAGE)),
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
