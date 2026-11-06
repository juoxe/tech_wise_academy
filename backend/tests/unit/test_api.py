"""HTTP contract of the tool API, with a fake repository instead of a database."""

from fastapi.testclient import TestClient

from tech_wise_academy.learning_content.model import Category, Tool
from tech_wise_academy.learning_content.service import ToolService
from tech_wise_academy.main import create_app


class FakeReader:
    async def load_tools(self) -> tuple[Tool, ...]:
        return (
            Tool(
                key="docker",
                name="Docker",
                category=Category.DEVOPS,
                default_priority=2,
                documentation_url="https://docs.docker.com/",
                icon="docker",
                summaries={"de": "Container-Laufzeit."},
                hints={"de": ("Startet Container aus Images.",)},
                examples=("docker run nginx",),
            ),
        )

    async def load_alternative_pairs(self) -> tuple[tuple[str, str], ...]:
        return ()


def _client() -> TestClient:
    app = create_app()
    app.state.tool_service = ToolService(FakeReader())
    return TestClient(app)


def test_list_returns_summaries_in_german_by_default() -> None:
    response = _client().get("/api/tools")

    assert response.status_code == 200
    assert response.json() == [
        {
            "key": "docker",
            "name": "Docker",
            "category": "DEVOPS",
            "default_priority": 2,
            "summary": "Container-Laufzeit.",
            "language": "de",
            "icon": "docker",
            "paradigm": None,
        }
    ]


def test_detail_returns_hints_examples_and_documentation() -> None:
    body = _client().get("/api/tools/docker?lang=de").json()

    assert body["documentation_url"] == "https://docs.docker.com/"
    assert body["hints"] == ["Startet Container aus Images."]
    assert body["examples"] == ["docker run nginx"]
    assert body["alternatives"] == []


def test_unknown_tool_returns_404() -> None:
    assert _client().get("/api/tools/nope").status_code == 404


def test_unknown_language_is_rejected() -> None:
    assert _client().get("/api/tools?lang=fr").status_code == 422
