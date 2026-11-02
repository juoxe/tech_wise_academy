"""Rules of the interview sets: splitting the ad, finding named tools and ranking the cards."""

import json
from importlib import resources

from tech_wise_academy.interview.model import (
    ALIASES,
    CASE_SENSITIVE,
    MAX_CARDS,
    MIN_SIMILARITY,
    NAME_NOT_MATCHED,
    Chunk,
    ToolScore,
    find_mentions,
    rank_tools,
    split_into_chunks,
    title_of,
)


def _names() -> dict[str, str]:
    text = resources.files("tech_wise_academy.learning_content").joinpath("seed_tools.json")
    tools = json.loads(text.read_text(encoding="utf-8"))["tools"]
    return {tool["key"]: tool["name"] for tool in tools}


def _mentions(text: str) -> set[str]:
    return set(find_mentions((Chunk(0, text),), _names()))


def _score(key: str, similarity: float, chunk: int = 0) -> ToolScore:
    return ToolScore(tool_key=key, similarity=similarity, chunk_position=chunk)


def test_every_alias_and_exception_refers_to_a_tool_of_the_seed() -> None:
    names = _names()
    assert (set(ALIASES) | CASE_SENSITIVE | NAME_NOT_MATCHED) <= set(names)


def test_chunks_are_lines_and_sentences_without_bullets_and_headings() -> None:
    chunks = split_into_chunks(
        "Dein Profil:\n- Du kennst Docker und Helm sehr gut.\n"
        "Wir bieten Urlaub. Und auch ein Jobrad dazu.\n"
    )

    assert [chunk.text for chunk in chunks] == [
        "Du kennst Docker und Helm sehr gut.",
        "Wir bieten Urlaub.",
        "Und auch ein Jobrad dazu.",
    ]
    assert [chunk.position for chunk in chunks] == [0, 1, 2]


def test_title_is_the_first_line_with_text() -> None:
    assert title_of("\n\n  Backend Entwickler (m/w/d)  \nKöln") == "Backend Entwickler (m/w/d)"


def test_a_name_is_found_as_a_word_of_its_own() -> None:
    assert _mentions("Java-Kenntnisse und Kubernetes-Cluster") == {"java", "kubernetes"}
    assert "java" not in _mentions("Sehr gutes JavaScript")
    assert "git" not in _mentions("Pipelines auf GitHub")


def test_symbols_in_a_name_count() -> None:
    assert {"cpp", "csharp"} <= _mentions("Erfahrung mit C++ und C#")
    assert "c" not in _mentions("Erfahrung mit C#")


def test_other_spellings_are_found() -> None:
    assert _mentions("Wir nutzen k8s, Golang und Kafka") == {"kubernetes", "go", "apache-kafka"}
    assert "spring-boot" in _mentions("Spring-Boot Services")
    assert "nodejs" in _mentions("Backend in nodejs")


def test_ordinary_words_are_not_taken_for_tools() -> None:
    assert _mentions("Wir go live und react schnell, das ist kind of nice") == set()
    assert _mentions("Führerschein Klasse C und hohes Tempo") == set()


def test_named_tools_come_first_and_keep_the_chunk_that_names_them() -> None:
    scores = (_score("docker", 0.5, chunk=7), _score("podman", 0.9, chunk=1))

    ranked = {tool.tool_key: tool for tool in rank_tools(scores, {"docker": 3})}

    assert ranked["docker"].rank == 1
    assert ranked["docker"].mentioned
    assert ranked["docker"].chunk_position == 3
    assert ranked["docker"].similarity == 0.5
    assert ranked["podman"].rank == 2
    assert not ranked["podman"].mentioned


def test_a_tool_below_the_threshold_gets_no_card_but_keeps_its_value() -> None:
    ranked = rank_tools((_score("docker", MIN_SIMILARITY - 0.01),), {})

    assert ranked[0].rank is None
    assert ranked[0].similarity == MIN_SIMILARITY - 0.01


def test_a_set_never_exceeds_the_maximum() -> None:
    keys = [f"tool-{number}" for number in range(MAX_CARDS + 5)]
    ranked = rank_tools(tuple(_score(key, 0.9) for key in keys), dict.fromkeys(keys, 0))

    assert sum(tool.rank is not None for tool in ranked) == MAX_CARDS
    assert len(ranked) == MAX_CARDS + 5
