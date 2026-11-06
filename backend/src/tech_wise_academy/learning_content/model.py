"""Domain model of the learning content: plain data, no framework imports."""

from collections.abc import Mapping
from dataclasses import dataclass, field
from enum import StrEnum

DEFAULT_LANGUAGE = "de"
SUPPORTED_LANGUAGES: frozenset[str] = frozenset({"de"})


class Category(StrEnum):
    DEVOPS = "DEVOPS"
    BACKEND = "BACKEND"
    FRONTEND = "FRONTEND"
    SECURITY = "SECURITY"
    AI_DATA = "AI_DATA"
    LANGUAGE = "LANGUAGE"


class Paradigm(StrEnum):
    """How a programming language works: a feature of a language, not an area of its own."""

    OBJECT_ORIENTED = "OBJECT_ORIENTED"
    FUNCTIONAL = "FUNCTIONAL"
    PROCEDURAL = "PROCEDURAL"
    DECLARATIVE = "DECLARATIVE"
    MULTI_PARADIGM = "MULTI_PARADIGM"


@dataclass(frozen=True)
class KeyConcept:
    term: str
    explanation: str


@dataclass(frozen=True)
class ToolContent:
    """What a learner reads on the card of a tool or language, in one language."""

    overview: str
    use_cases: tuple[str, ...]
    key_concepts: tuple[KeyConcept, ...]
    when_to_use: str
    when_not_to_use: str
    good_to_know: tuple[str, ...]


@dataclass(frozen=True)
class Tool:
    key: str
    name: str
    category: Category
    default_priority: int
    documentation_url: str
    icon: str | None
    summaries: Mapping[str, str]
    hints: Mapping[str, tuple[str, ...]]
    examples: tuple[str, ...]
    contents: Mapping[str, ToolContent] = field(default_factory=dict)
    paradigm: Paradigm | None = None


@dataclass(frozen=True)
class ToolDraft:
    """The data a maintainer enters for a tool (create and edit); the texts are German."""

    key: str
    name: str
    category: Category
    default_priority: int
    documentation_url: str
    icon: str | None
    summary: str
    hints: tuple[str, ...]
    examples: tuple[str, ...]
    alternatives: tuple[str, ...]
    content: ToolContent | None
    paradigm: Paradigm | None = None
