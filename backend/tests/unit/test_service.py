"""Rules of the learning content service, tested with a fake repository."""

import asyncio

from tech_wise_academy.learning_content.model import Category, Tool
from tech_wise_academy.learning_content.service import ToolService


class FakeReader:
    def __init__(self, tools: tuple[Tool, ...], pairs: tuple[tuple[str, str], ...]) -> None:
        self._tools = tools
        self._pairs = pairs

    async def load_tools(self) -> tuple[Tool, ...]:
        return self._tools

    async def load_alternative_pairs(self) -> tuple[tuple[str, str], ...]:
        return self._pairs


def _tool(key: str, name: str, *, summaries: dict[str, str] | None = None) -> Tool:
    return Tool(
        key=key,
        name=name,
        category=Category.DEVOPS,
        documentation_url=f"https://example.org/{key}",
        icon=None,
        summaries=summaries if summaries is not None else {"de": f"{name} auf Deutsch."},
        hints={"de": (f"Hinweis zu {key}.",)},
        examples=("echo example",),
    )


def test_a_pair_stored_once_is_an_alternative_from_both_sides() -> None:
    reader = FakeReader(
        tools=(_tool("docker", "Docker"), _tool("podman", "Podman")),
        pairs=(("docker", "podman"),),
    )
    service = ToolService(reader)

    docker = asyncio.run(service.get_tool("docker", "de"))
    podman = asyncio.run(service.get_tool("podman", "de"))

    assert docker is not None and [a.key for a in docker.alternatives] == ["podman"]
    assert podman is not None and [a.key for a in podman.alternatives] == ["docker"]


def test_alternatives_are_sorted_by_name() -> None:
    reader = FakeReader(
        tools=(_tool("gradle", "Gradle"), _tool("maven", "Maven"), _tool("ant", "Apache Ant")),
        pairs=(("gradle", "maven"), ("ant", "gradle")),
    )
    detail = asyncio.run(ToolService(reader).get_tool("gradle", "de"))

    assert detail is not None
    assert [a.name for a in detail.alternatives] == ["Apache Ant", "Maven"]


def test_missing_translation_falls_back_to_the_default_language() -> None:
    tool = _tool("vite", "Vite", summaries={"de": "Dev-Server."})
    detail = asyncio.run(ToolService(FakeReader((tool,), ())).get_tool("vite", "en"))

    assert detail is not None
    assert detail.summary == "Dev-Server."
    assert detail.language == "de"


def test_unknown_key_returns_none() -> None:
    assert asyncio.run(ToolService(FakeReader((), ())).get_tool("nope", "de")) is None


def test_list_is_sorted_by_name() -> None:
    reader = FakeReader(tools=(_tool("vite", "Vite"), _tool("docker", "Docker")), pairs=())
    summaries = asyncio.run(ToolService(reader).list_tools("de"))

    assert [summary.name for summary in summaries] == ["Docker", "Vite"]
