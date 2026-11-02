"""Domain rules of the interview sets: plain data, no framework imports."""

import re
import uuid
from collections.abc import Mapping
from dataclasses import dataclass
from datetime import datetime

type Vector = tuple[float, ...]

MAX_CHUNKS = 80
MAX_CHUNK_LENGTH = 300
MIN_CHUNK_WORDS = 3
MAX_TITLE_LENGTH = 80

# A set holds at most this many cards; a named tool always gets one, the others only fill up.
MAX_CARDS = 20
# How similar a tool that is not named has to be to a sentence of the ad to get a card.
MIN_SIMILARITY = 0.6
MAX_SIMILAR_CARDS = 6

_VENDOR_PREFIX = re.compile(r"^(Apache|Eclipse|Grafana|HashiCorp|Meta|Google|OWASP|Project) ")
_BRACKETS = re.compile(r"\s*\(.*\)$")
_SENTENCE_END = re.compile(r"(?<=[.!?;])\s+(?=[A-ZÄÖÜ])")
_BULLET = re.compile(r"^[\s\-–—*•·◦▪▶►+>]+")

# Other names of a tool that job ads use; they count written exactly like this.
ALIASES: Mapping[str, tuple[str, ...]] = {
    "kubernetes": ("k8s", "AKS", "EKS", "GKE"),
    "go": ("Golang",),
    "c": ("C/C++", "Programmiersprache C"),
    "cpp": ("C/C++", "CPP"),
    "javascript": ("JS", "ECMAScript"),
    "typescript": ("TS",),
    "nodejs": ("NodeJS", "nodejs", "Node"),
    "nextjs": ("NextJS",),
    "vue": ("Vue", "VueJS"),
    "nuxt": ("NuxtJS",),
    "gitlab-ci": ("GitLab CI", "GitLab-CI", "GitLab Pipelines"),
    "github-actions": ("GitHub Action",),
    "spark": ("PySpark",),
    "scikit-learn": ("sklearn", "scikit learn"),
    "elasticsearch": ("Elastic Search", "ELK"),
    "opentofu": ("Tofu",),
    "tailwind-css": ("Tailwind", "TailwindCSS"),
    "sass": ("SCSS",),
    "apache-kafka": ("Kafka",),
    "rabbitmq": ("Rabbit MQ",),
    "swagger-ui": ("Swagger",),
    "spring-boot": ("SpringBoot",),
    "grafana-tempo": ("Grafana Tempo",),
    "csharp": ("C-Sharp", "CSharp"),
    "visual-studio-code": ("VS Code", "VSCode"),
    "intellij-idea": ("IntelliJ",),
    "model-context-protocol": ("MCP",),
    "weights-and-biases": ("W&B", "Weights and Biases"),
    "hugging-face": ("HuggingFace",),
    "dependency-check": ("Dependency-Check", "Dependency Check"),
}

# Names that are ordinary words: they only count written exactly like this.
CASE_SENSITIVE: frozenset[str] = frozenset(
    {
        "astro",
        "bash",
        "bun",
        "c",
        "consul",
        "cursor",
        "envoy",
        "figma",
        "flux",
        "git",
        "go",
        "helm",
        "hydra",
        "lens",
        "mermaid",
        "nomad",
        "obsidian",
        "packer",
        "prettier",
        "ray",
        "react",
        "remix",
        "renovate",
        "rollup",
        "ruby",
        "rust",
        "scala",
        "sentry",
        "swift",
        "vault",
        "whisper",
    }
)

# Names that are too common to count at all; only their aliases do.
NAME_NOT_MATCHED: frozenset[str] = frozenset({"age", "c", "grafana-tempo", "kind"})


@dataclass(frozen=True)
class Chunk:
    position: int
    text: str


@dataclass(frozen=True)
class ToolScore:
    """The similarity of one tool to the closest chunk of the ad."""

    tool_key: str
    similarity: float
    chunk_position: int


@dataclass(frozen=True)
class RankedTool:
    tool_key: str
    similarity: float
    chunk_position: int
    mentioned: bool
    rank: int | None  # None: scored and stored, but not a card of the set


@dataclass(frozen=True)
class Card:
    tool_key: str
    similarity: float
    mentioned: bool
    evidence: str


@dataclass(frozen=True)
class InterviewSetSummary:
    id: uuid.UUID
    title: str
    created_at: datetime
    card_count: int


@dataclass(frozen=True)
class InterviewSet:
    id: uuid.UUID
    title: str
    created_at: datetime
    model: str
    cards: tuple[Card, ...]


def tool_document(name: str, summary: str, hints: tuple[str, ...]) -> str:
    """The text of a tool that is embedded."""
    return f"{name}: {summary} {' '.join(hints)}"


def split_into_chunks(job_ad: str) -> tuple[Chunk, ...]:
    """One chunk per line or sentence. Short lines such as headings carry no meaning."""
    texts: list[str] = []
    for line in job_ad.splitlines():
        for sentence in _SENTENCE_END.split(_BULLET.sub("", line).strip()):
            if len(sentence.split()) >= MIN_CHUNK_WORDS:
                texts.append(sentence[:MAX_CHUNK_LENGTH])
    return tuple(
        Chunk(position=position, text=text) for position, text in enumerate(texts[:MAX_CHUNKS])
    )


def title_of(job_ad: str) -> str:
    """The first line of the ad, which usually is the job title."""
    first_line = next((line.strip() for line in job_ad.splitlines() if line.strip()), "")
    return first_line[:MAX_TITLE_LENGTH]


def _name_terms(key: str, name: str) -> list[str]:
    if key in NAME_NOT_MATCHED:
        return []
    plain = _BRACKETS.sub("", name)
    return [plain, _VENDOR_PREFIX.sub("", plain)]


def _alternatives(terms: list[str]) -> str:
    longest_first = sorted(set(terms), key=lambda term: len(term), reverse=True)
    return "|".join(re.escape(term).replace(r"\ ", r"[\s-]+") for term in longest_first)


def _pattern_of(key: str, name: str) -> re.Pattern[str] | None:
    """A term stands alone: `Java` is not found in `JavaScript`, but in `Java-Kenntnisse`."""
    names = _name_terms(key, name)
    aliases = list(ALIASES.get(key, ()))
    parts = []
    if names and key not in CASE_SENSITIVE:
        parts.append(f"(?i:{_alternatives(names)})")
    if aliases or (names and key in CASE_SENSITIVE):
        parts.append(_alternatives(aliases + (names if key in CASE_SENSITIVE else [])))
    if not parts:
        return None
    return re.compile(rf"(?<![\w#+.])(?:{'|'.join(parts)})(?![\w#+])")


def find_mentions(chunks: tuple[Chunk, ...], names: Mapping[str, str]) -> dict[str, int]:
    """The tools the ad names, each with the position of the first chunk that names it."""
    mentions: dict[str, int] = {}
    for key, name in names.items():
        pattern = _pattern_of(key, name)
        if pattern is None:
            continue
        position = next((chunk.position for chunk in chunks if pattern.search(chunk.text)), None)
        if position is not None:
            mentions[key] = position
    return mentions


def rank_tools(
    scores: tuple[ToolScore, ...], mentions: Mapping[str, int]
) -> tuple[RankedTool, ...]:
    """Every tool keeps its similarity; the named ones come first, then the most similar ones."""
    named = sorted(
        (score for score in scores if score.tool_key in mentions),
        key=lambda score: -score.similarity,
    )
    similar = sorted(
        (
            score
            for score in scores
            if score.tool_key not in mentions and score.similarity >= MIN_SIMILARITY
        ),
        key=lambda score: -score.similarity,
    )[:MAX_SIMILAR_CARDS]
    ranks = {
        score.tool_key: rank for rank, score in enumerate((named + similar)[:MAX_CARDS], start=1)
    }
    return tuple(
        RankedTool(
            tool_key=score.tool_key,
            similarity=score.similarity,
            chunk_position=mentions.get(score.tool_key, score.chunk_position),
            mentioned=score.tool_key in mentions,
            rank=ranks.get(score.tool_key),
        )
        for score in scores
    )
