"""Rules and HTTP contract of the importance score of a tool (TWA-14), without a database."""

import asyncio
import uuid

import pytest
from fastapi.testclient import TestClient

from tech_wise_academy.main import create_app
from tech_wise_academy.training.model import is_valid_score
from tech_wise_academy.training.service import InvalidScoreError, TrainingService

PROFILE_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")
OTHER_ID = uuid.UUID("00000000-0000-0000-0000-000000000002")
HEADERS = {"X-Profile-Id": str(PROFILE_ID)}


class MemoryScores:
    """The score part of the repository, kept in a dict like the real one keeps it in a table."""

    def __init__(self) -> None:
        self.rows: dict[tuple[uuid.UUID, str], int] = {}

    async def list_scores(self, profile_id: uuid.UUID) -> dict[str, int]:
        return {key: score for (owner, key), score in self.rows.items() if owner == profile_id}

    async def set_scores(
        self, profile_id: uuid.UUID, tool_keys: list[str], score: int | None
    ) -> None:
        for key in tool_keys:
            if score is None:
                self.rows.pop((profile_id, key), None)
            else:
                self.rows[(profile_id, key)] = score

    async def reset_scores(self, profile_id: uuid.UUID) -> None:
        self.rows = {row: score for row, score in self.rows.items() if row[0] != profile_id}


def _service() -> TrainingService:
    return TrainingService(MemoryScores())  # type: ignore[arg-type]


def test_the_scale_is_zero_to_four_and_no_score_is_valid() -> None:
    assert [is_valid_score(score) for score in (-1, 0, 4, 5, None)] == [
        False,
        True,
        True,
        False,
        True,
    ]


def test_a_score_outside_the_scale_is_rejected() -> None:
    with pytest.raises(InvalidScoreError):
        asyncio.run(_service().set_scores(PROFILE_ID, ["docker"], 5))


def test_normal_is_a_score_of_its_own_and_is_stored() -> None:
    service = _service()

    asyncio.run(service.set_scores(PROFILE_ID, ["docker"], 2))

    assert asyncio.run(service.list_scores(PROFILE_ID)) == {"docker": 2}


def test_no_score_removes_the_score_of_the_tools() -> None:
    service = _service()
    asyncio.run(service.set_scores(PROFILE_ID, ["docker", "podman"], 4))

    asyncio.run(service.set_scores(PROFILE_ID, ["docker"], None))

    assert asyncio.run(service.list_scores(PROFILE_ID)) == {"podman": 4}


def test_other_players_keep_their_scores() -> None:
    service = _service()
    asyncio.run(service.set_scores(PROFILE_ID, ["docker"], 4))
    asyncio.run(service.set_scores(OTHER_ID, ["docker"], 0))

    asyncio.run(service.reset_scores(PROFILE_ID))

    assert asyncio.run(service.list_scores(PROFILE_ID)) == {}
    assert asyncio.run(service.list_scores(OTHER_ID)) == {"docker": 0}


def _client() -> TestClient:
    app = create_app()
    app.state.training_service = _service()
    return TestClient(app)


def test_api_sets_lists_unsets_and_resets_scores() -> None:
    client = _client()

    put = client.put(
        "/api/training/priorities",
        json={"tool_keys": ["docker", "git"], "score": 3},
        headers=HEADERS,
    )
    assert put.status_code == 204
    assert client.get("/api/training/priorities", headers=HEADERS).json() == [
        {"tool_key": "docker", "score": 3},
        {"tool_key": "git", "score": 3},
    ]

    unset = client.put(
        "/api/training/priorities",
        json={"tool_keys": ["docker"], "score": None},
        headers=HEADERS,
    )
    assert unset.status_code == 204
    assert client.get("/api/training/priorities", headers=HEADERS).json() == [
        {"tool_key": "git", "score": 3},
    ]

    assert client.delete("/api/training/priorities", headers=HEADERS).status_code == 204
    assert client.get("/api/training/priorities", headers=HEADERS).json() == []


def test_api_rejects_a_score_outside_the_scale_and_an_empty_list() -> None:
    client = _client()

    too_high = client.put(
        "/api/training/priorities", json={"tool_keys": ["docker"], "score": 5}, headers=HEADERS
    )
    empty = client.put(
        "/api/training/priorities", json={"tool_keys": [], "score": 3}, headers=HEADERS
    )

    assert too_high.status_code == 422
    assert empty.status_code == 422
