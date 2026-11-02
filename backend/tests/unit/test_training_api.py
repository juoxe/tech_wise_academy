"""HTTP contract of resetting the progress of a game, with a fake service."""

import uuid

from fastapi.testclient import TestClient

from tech_wise_academy.main import create_app

PROFILE_ID = uuid.uuid4()
HEADERS = {"X-Profile-Id": str(PROFILE_ID)}


class FakeService:
    def __init__(self) -> None:
        self.resets: list[tuple[uuid.UUID, str]] = []

    async def reset_progress(self, profile_id: uuid.UUID, game: str) -> None:
        self.resets.append((profile_id, game))


def _client(service: FakeService) -> TestClient:
    app = create_app()
    app.state.training_service = service
    return TestClient(app)


def test_a_reset_deletes_the_progress_of_one_game_of_the_player() -> None:
    service = FakeService()

    response = _client(service).delete("/api/training/progress?game=clearing", headers=HEADERS)

    assert response.status_code == 204
    assert service.resets == [(PROFILE_ID, "clearing")]


def test_an_unknown_game_is_rejected() -> None:
    service = FakeService()

    response = _client(service).delete("/api/training/progress?game=other", headers=HEADERS)

    assert response.status_code == 422
    assert service.resets == []


def test_a_reset_without_a_player_is_rejected() -> None:
    service = FakeService()

    response = _client(service).delete("/api/training/progress?game=level0")

    assert response.status_code == 422
    assert service.resets == []
