"""Rules of creating, editing and deleting tools, tested with an in-memory store (TWA-9.3/9.4)."""

import asyncio
import dataclasses
import uuid

import pytest
from fastapi.testclient import TestClient

from tech_wise_academy.learning_content.model import Category, Paradigm, Tool, ToolDraft
from tech_wise_academy.learning_content.repository import ordered_pair
from tech_wise_academy.learning_content.service import (
    ToolKeyTakenError,
    ToolNotFoundError,
    ToolRuleError,
    ToolService,
)
from tech_wise_academy.main import create_app


class MemoryStore:
    """Reader and writer in one: tools live in a dict, a deleted tool keeps its key."""

    def __init__(self) -> None:
        self.tools: dict[str, ToolDraft] = {}
        self.deleted: set[str] = set()

    async def load_tools(self) -> tuple[Tool, ...]:
        return tuple(
            Tool(
                key=draft.key,
                name=draft.name,
                category=draft.category,
                default_priority=draft.default_priority,
                documentation_url=draft.documentation_url,
                icon=draft.icon,
                summaries={"de": draft.summary},
                hints={"de": draft.hints},
                examples=draft.examples,
                contents={} if draft.content is None else {"de": draft.content},
                paradigm=draft.paradigm,
            )
            for key, draft in self.tools.items()
            if key not in self.deleted
        )

    async def load_alternative_pairs(self) -> tuple[tuple[str, str], ...]:
        return tuple(
            (key, other)
            for key, draft in self.tools.items()
            if key not in self.deleted
            for other in draft.alternatives
            if other not in self.deleted
        )

    async def key_exists(self, key: str) -> bool:
        return key in self.tools

    async def create_tool(self, draft: ToolDraft) -> None:
        self.tools[draft.key] = draft

    async def update_tool(self, draft: ToolDraft) -> bool:
        if draft.key not in self.tools or draft.key in self.deleted:
            return False
        self.tools[draft.key] = draft
        return True

    async def delete_tool(self, key: str) -> bool:
        if key not in self.tools or key in self.deleted:
            return False
        self.deleted.add(key)
        return True


def _draft(key: str = "docker", name: str = "Docker", **changes: object) -> ToolDraft:
    draft = ToolDraft(
        key=key,
        name=name,
        category=Category.DEVOPS,
        default_priority=2,
        documentation_url=f"https://example.org/{key}",
        icon=None,
        summary=f"{name} auf Deutsch.",
        hints=("Startet Container aus Images.",),
        examples=("echo example",),
        alternatives=(),
        content=None,
    )
    return dataclasses.replace(draft, **changes)


def _service() -> tuple[ToolService, MemoryStore]:
    store = MemoryStore()
    return ToolService(store, store), store


def test_a_created_tool_can_be_read_again() -> None:
    service, _ = _service()

    asyncio.run(service.create_tool(_draft()))
    detail = asyncio.run(service.get_tool("docker", "de"))

    assert detail is not None and detail.name == "Docker"


def test_a_hint_must_not_contain_the_name_of_its_tool() -> None:
    service, store = _service()

    with pytest.raises(ToolRuleError):
        asyncio.run(service.create_tool(_draft(hints=("Docker startet Container.",))))
    assert store.tools == {}


def test_the_name_check_ignores_case() -> None:
    service, _ = _service()

    with pytest.raises(ToolRuleError):
        asyncio.run(service.create_tool(_draft(hints=("das tool DOCKER startet Container.",))))


def test_a_language_needs_a_paradigm_and_other_tools_have_none() -> None:
    service, _ = _service()

    with pytest.raises(ToolRuleError):
        asyncio.run(service.create_tool(_draft("go", "Go", category=Category.LANGUAGE)))
    with pytest.raises(ToolRuleError):
        asyncio.run(service.create_tool(_draft(paradigm=Paradigm.FUNCTIONAL)))

    asyncio.run(
        service.create_tool(
            _draft("go", "Go", category=Category.LANGUAGE, paradigm=Paradigm.PROCEDURAL)
        )
    )
    detail = asyncio.run(service.get_tool("go", "de"))
    assert detail is not None and detail.paradigm is Paradigm.PROCEDURAL


def test_the_default_priority_must_be_on_the_scale() -> None:
    service, _ = _service()

    with pytest.raises(ToolRuleError):
        asyncio.run(service.create_tool(_draft(default_priority=5)))
    with pytest.raises(ToolRuleError):
        asyncio.run(service.create_tool(_draft(default_priority=-1)))
    asyncio.run(service.create_tool(_draft(default_priority=0)))


def test_a_tool_of_the_development_area_has_no_paradigm() -> None:
    service, _ = _service()

    asyncio.run(service.create_tool(_draft("obsidian", "Obsidian", category=Category.DEV_ENV)))
    with pytest.raises(ToolRuleError):
        asyncio.run(
            service.create_tool(
                _draft("vim", "Vim", category=Category.DEV_ENV, paradigm=Paradigm.PROCEDURAL)
            )
        )


def test_an_alternative_must_exist_and_not_be_the_tool_itself() -> None:
    service, _ = _service()

    with pytest.raises(ToolRuleError):
        asyncio.run(service.create_tool(_draft(alternatives=("podman",))))
    with pytest.raises(ToolRuleError):
        asyncio.run(service.create_tool(_draft(alternatives=("docker",))))


def test_an_alternative_counts_from_both_sides() -> None:
    service, _ = _service()
    asyncio.run(service.create_tool(_draft("podman", "Podman")))

    asyncio.run(service.create_tool(_draft(alternatives=("podman",))))
    docker = asyncio.run(service.get_tool("docker", "de"))
    podman = asyncio.run(service.get_tool("podman", "de"))

    assert docker is not None and [a.key for a in docker.alternatives] == ["podman"]
    assert podman is not None and [a.key for a in podman.alternatives] == ["docker"]


def test_a_taken_key_is_rejected() -> None:
    service, _ = _service()
    asyncio.run(service.create_tool(_draft()))

    with pytest.raises(ToolKeyTakenError):
        asyncio.run(service.create_tool(_draft()))


def test_a_deleted_tool_is_hidden_and_keeps_its_key() -> None:
    service, _ = _service()
    asyncio.run(service.create_tool(_draft()))

    asyncio.run(service.delete_tool("docker"))

    assert asyncio.run(service.get_tool("docker", "de")) is None
    assert asyncio.run(service.list_tools("de")) == []
    with pytest.raises(ToolKeyTakenError):
        asyncio.run(service.create_tool(_draft()))
    with pytest.raises(ToolNotFoundError):
        asyncio.run(service.delete_tool("docker"))


def test_a_deleted_tool_cannot_be_an_alternative() -> None:
    service, _ = _service()
    asyncio.run(service.create_tool(_draft("podman", "Podman")))
    asyncio.run(service.delete_tool("podman"))

    with pytest.raises(ToolRuleError):
        asyncio.run(service.create_tool(_draft(alternatives=("podman",))))


def test_editing_an_unknown_tool_is_not_found() -> None:
    service, _ = _service()

    with pytest.raises(ToolNotFoundError):
        asyncio.run(service.update_tool(_draft()))


def _client() -> TestClient:
    app = create_app()
    store = MemoryStore()
    app.state.tool_service = ToolService(store, store)
    return TestClient(app)


_BODY = {
    "name": "Docker",
    "category": "DEVOPS",
    "default_priority": 3,
    "documentation_url": "https://docs.docker.com/",
    "summary": "Container-Laufzeit.",
    "hints": ["Startet Container aus Images."],
    "examples": ["docker run nginx"],
    "alternatives": [],
}


def test_api_creates_edits_and_deletes_a_tool() -> None:
    client = _client()

    created = client.post("/api/tools", json={"key": "docker", **_BODY})
    assert created.status_code == 201 and created.json()["key"] == "docker"

    changed = client.put("/api/tools/docker", json={**_BODY, "summary": "Neu."})
    assert changed.status_code == 200 and changed.json()["summary"] == "Neu."

    assert client.delete("/api/tools/docker").status_code == 204
    assert client.get("/api/tools/docker").status_code == 404
    assert client.delete("/api/tools/docker").status_code == 404


def test_api_rejects_a_hint_with_the_tool_name_and_a_taken_key() -> None:
    client = _client()

    bad = client.post("/api/tools", json={"key": "docker", **_BODY, "hints": ["Docker ist toll."]})
    assert bad.status_code == 422 and "Namen" in bad.json()["detail"]

    assert client.post("/api/tools", json={"key": "docker", **_BODY}).status_code == 201
    assert client.post("/api/tools", json={"key": "docker", **_BODY}).status_code == 409


def test_a_pair_is_stored_with_the_smaller_id_first() -> None:
    low = uuid.UUID(int=1)
    high = uuid.UUID(int=2)

    assert ordered_pair(high, low) == {"tool_id": low, "alternative_tool_id": high}
    assert ordered_pair(low, high) == {"tool_id": low, "alternative_tool_id": high}
