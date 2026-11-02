"""Measurement of ADR-0006: which variant finds the tools a job ad only describes.

Not a unit test: it starts PostgreSQL with pgvector in a container (Testcontainers, TD-03), runs all
migrations, and compares three variants on the five real ads that J provided and labelled.
Variant E (LLM extraction) was not chosen in ADR-0006 and is not measured. It runs only on
request:

    uv run pytest -m measurement -s

Inputs: `ads/*.txt` and `labels.json` (from J), `concepts.json` (A+), `keywords_en.json` (B)
and the MiniLM model in `MEASUREMENT_MODEL_DIR` (C). A missing input skips its variant. The
numbers are written to `results.json` and copied into ADR-0006 by hand.
"""

import asyncio
import json
import math
import os
import re
import uuid
from collections import Counter
from collections.abc import Callable
from pathlib import Path

import pytest

from tech_wise_academy.interview.embedding import MODEL_FILE, OnnxEmbedder
from tech_wise_academy.interview.model import Chunk, find_mentions, split_into_chunks
from tech_wise_academy.learning_content.service import ToolText

pytestmark = pytest.mark.measurement

HERE = Path(__file__).parent
EXTRA_CARDS = 6
DEFAULT_MODEL_DIR = "D:/models/paraphrase-multilingual-MiniLM-L12-v2"
STOP_WORDS = frozenset(
    [
        "der",
        "die",
        "das",
        "und",
        "oder",
        "mit",
        "von",
        "für",
        "ein",
        "eine",
        "einer",
        "einem",
        "einen",
        "den",
        "dem",
        "des",
        "ist",
        "sind",
        "wir",
        "du",
        "dich",
        "dein",
        "deine",
        "unser",
        "unsere",
        "im",
        "in",
        "am",
        "an",
        "auf",
        "aus",
        "bei",
        "zu",
        "zum",
        "zur",
        "als",
        "auch",
        "nicht",
        "sich",
        "wie",
        "was",
        "the",
        "and",
        "or",
        "of",
        "for",
        "to",
        "on",
        "with",
        "a",
        "an",
        "is",
        "are",
        "we",
        "you",
        "your",
        "our",
        "as",
        "by",
        "at",
        "from",
        "be",
        "it",
        "this",
        "that",
        "their",
        "its",
        "into",
        "sehr",
        "gute",
        "gut",
        "erfahrung",
        "experience",
        "knowledge",
        "kenntnisse",
    ]
)


def _load_json(name: str) -> dict:
    data = json.loads((HERE / name).read_text(encoding="utf-8"))
    return {key: value for key, value in data.items() if not key.startswith("_")}


def _ads() -> dict[str, str]:
    folder = HERE / "ads"
    if not folder.is_dir() or not (HERE / "labels.json").exists():
        pytest.skip("the five ads and labels.json from J are missing")
    return {path.name: path.read_text(encoding="utf-8") for path in sorted(folder.glob("*.txt"))}


# --- A+: curated concepts -----------------------------------------------------------------------


def concept_cards(text: str, named: set[str]) -> list[str]:
    hits: list[tuple[int, str]] = []
    for pattern, keys in _load_json("concepts.json").items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            hits += [(match.start(), key) for key in keys]
    cards: list[str] = []
    for _, key in sorted(hits):
        if key not in named and key not in cards:
            cards.append(key)
    return cards[:EXTRA_CARDS]


# --- B: BM25 with English keywords --------------------------------------------------------------


def _words(text: str) -> list[str]:
    return [
        word for word in re.findall(r"[a-zäöüß0-9+#/]{3,}", text.lower()) if word not in STOP_WORDS
    ]


def bm25_cards(chunks: tuple[Chunk, ...], tools: list[ToolText], named: set[str]) -> list[str]:
    keywords = _load_json("keywords_en.json")
    documents = {
        tool.key: _words(f"{tool.name} {tool.summary} {' '.join(tool.hints)} {keywords[tool.key]}")
        for tool in tools
    }
    count = len(documents)
    average = sum(map(len, documents.values())) / count
    frequency = Counter(word for words in documents.values() for word in set(words))

    def score(query: list[str], words: list[str]) -> float:
        terms = Counter(words)
        total = 0.0
        for word in set(query) & terms.keys():
            idf = math.log(1 + (count - frequency[word] + 0.5) / (frequency[word] + 0.5))
            tf = terms[word]
            total += idf * tf * 2.2 / (tf + 1.2 * (0.25 + 0.75 * len(words) / average))
        return total

    best = {
        key: max(score(_words(chunk.text), words) for chunk in chunks)
        for key, words in documents.items()
    }
    ranked = sorted(
        (key for key in best if key not in named and best[key] > 0), key=lambda key: best[key]
    )
    return list(reversed(ranked))[:EXTRA_CARDS]


# --- C: MiniLM through ONNX Runtime, similarity in pgvector -------------------------------------


async def embedding_cards(engine, job_ads: dict[str, str], folder: Path) -> dict[str, list[str]]:
    import sqlalchemy as sa

    from tech_wise_academy.interview.repository import InterviewRepository
    from tech_wise_academy.interview.service import InterviewService
    from tech_wise_academy.learning_content.repository import ToolRepository
    from tech_wise_academy.learning_content.service import ToolService

    service = InterviewService(
        ToolService(ToolRepository(engine)), OnnxEmbedder(str(folder)), InterviewRepository(engine)
    )
    cards: dict[str, list[str]] = {}
    for name, text in job_ads.items():
        created = await service.create_set(uuid.uuid4(), text)
        async with engine.connect() as connection:
            rows = await connection.execute(
                sa.text(
                    "SELECT tool_key FROM interview_set_tool WHERE set_id = :id AND NOT mentioned"
                    " ORDER BY similarity DESC LIMIT :limit"
                ),
                {"id": created.id, "limit": EXTRA_CARDS},
            )
            cards[name] = [row[0] for row in rows]
    return cards


# --- The run ------------------------------------------------------------------------------------


def _score(cards: dict[str, list[str]], labels: dict) -> dict:
    shown = sum(len(keys) for keys in cards.values())
    correct = sum(len(set(keys) & set(labels[name]["implied"])) for name, keys in cards.items())
    implied = sum(len(labels[name]["implied"]) for name in cards)
    return {
        "extra_cards": shown,
        "correct_extra_cards": correct,
        "precision": round(correct / shown, 3) if shown else None,
        "implied_found": round(correct / implied, 3) if implied else None,
        "cards": cards,
    }


def _run(main: Callable[[], object]) -> None:
    from tech_wise_academy.local_loop import selector_loop

    asyncio.run(main(), loop_factory=selector_loop if os.name == "nt" else None)  # ty: ignore


def test_measure_matching_variants() -> None:
    job_ads = _ads()
    labels = _load_json("labels.json")
    assert set(job_ads) == set(labels), "every ad needs labels and every label an ad"
    postgres_module = pytest.importorskip("testcontainers.postgres")

    from alembic import command
    from alembic.config import Config
    from sqlalchemy.ext.asyncio import create_async_engine

    PostgresContainer = postgres_module.PostgresContainer

    with PostgresContainer("pgvector/pgvector:pg16", driver="psycopg") as postgres:
        os.environ["DATABASE_URL"] = postgres.get_connection_url()
        command.upgrade(Config(str(HERE.parents[1] / "alembic.ini")), "head")
        results: dict = {}

        async def main() -> None:
            from tech_wise_academy.learning_content.repository import ToolRepository
            from tech_wise_academy.learning_content.service import ToolService

            engine = create_async_engine(os.environ["DATABASE_URL"])
            tools = await ToolService(ToolRepository(engine)).list_tool_texts()
            names = {tool.key: tool.name for tool in tools}
            chunks = {name: split_into_chunks(text) for name, text in job_ads.items()}
            named = {name: set(find_mentions(chunks[name], names)) for name in job_ads}

            results["named"] = {
                name: {
                    "found": len(named[name] & set(labels[name]["named"])),
                    "labelled": len(labels[name]["named"]),
                    "wrong": sorted(named[name] - set(labels[name]["named"])),
                }
                for name in job_ads
            }
            results["A+"] = _score(
                {name: concept_cards(job_ads[name], named[name]) for name in job_ads}, labels
            )
            results["B"] = _score(
                {name: bm25_cards(chunks[name], tools, named[name]) for name in job_ads}, labels
            )
            folder = Path(os.environ.get("MEASUREMENT_MODEL_DIR", DEFAULT_MODEL_DIR))
            if (folder / MODEL_FILE).exists():
                results["C"] = _score(await embedding_cards(engine, job_ads, folder), labels)
            else:
                results["C"] = f"skipped: no model in {folder}"
            await engine.dispose()

        _run(main)

    (HERE / "results.json").write_text(json.dumps(results, indent=2, ensure_ascii=False), "utf-8")
    for variant in ("A+", "B", "C"):
        value = results[variant]
        summary = value if isinstance(value, str) else {k: value[k] for k in list(value)[:4]}
        print(variant, summary)
