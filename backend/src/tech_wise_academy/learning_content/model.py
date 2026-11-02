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
    level: int
    documentation_url: str
    icon: str | None
    summaries: Mapping[str, str]
    hints: Mapping[str, tuple[str, ...]]
    examples: tuple[str, ...]
    contents: Mapping[str, ToolContent] = field(default_factory=dict)
