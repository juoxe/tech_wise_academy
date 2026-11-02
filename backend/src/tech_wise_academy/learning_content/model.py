"""Domain model of the learning content: plain data, no framework imports."""

from collections.abc import Mapping
from dataclasses import dataclass
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
