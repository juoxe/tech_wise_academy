"""HTTP contract of the interview sets, with a fake service instead of the model and database."""

import asyncio
import uuid
from datetime import UTC, datetime

import pytest
from fastapi.testclient import TestClient

from tech_wise_academy.interview.embedding import EmbeddingUnavailableError, OnnxEmbedder
from tech_wise_academy.interview.model import Card, InterviewSet
from tech_wise_academy.main import create_app

PROFILE = {"X-Profile-Id": str(uuid.uuid4())}
JOB_AD = "Backend Entwickler mit Docker und Kubernetes in einem kleinen Team gesucht."
SET = InterviewSet(
    id=uuid.uuid4(),
    title="Backend Entwickler",
    created_at=datetime(2026, 11, 2, tzinfo=UTC),
    model="paraphrase-multilingual-MiniLM-L12-v2",
    cards=(Card(tool_key="docker", similarity=0.71, mentioned=True, evidence=JOB_AD),),
)


class FakeService:
    async def create_set(self, profile_id: uuid.UUID, job_ad: str) -> InterviewSet:
        return SET

    async def get_set(self, profile_id: uuid.UUID, set_id: uuid.UUID) -> InterviewSet | None:
        return None


class DownService:
    async def create_set(self, profile_id: uuid.UUID, job_ad: str) -> InterviewSet:
        raise EmbeddingUnavailableError("connection refused")


def _client(service: object) -> TestClient:
    app = create_app()
    app.state.interview_service = service
    return TestClient(app)


def test_create_returns_the_cards_with_their_similarity() -> None:
    response = _client(FakeService()).post(
        "/api/interview-sets", json={"job_ad": JOB_AD}, headers=PROFILE
    )

    assert response.status_code == 201
    body = response.json()
    assert body["embedding_model"] == "paraphrase-multilingual-MiniLM-L12-v2"
    assert body["cards"] == [
        {"tool_key": "docker", "similarity": 0.71, "mentioned": True, "evidence": JOB_AD}
    ]


def test_a_text_that_is_too_short_is_rejected() -> None:
    response = _client(FakeService()).post(
        "/api/interview-sets", json={"job_ad": "zu kurz"}, headers=PROFILE
    )

    assert response.status_code == 422


def test_a_missing_embedding_service_is_reported_as_503() -> None:
    response = _client(DownService()).post(
        "/api/interview-sets", json={"job_ad": JOB_AD}, headers=PROFILE
    )

    assert response.status_code == 503


def test_a_set_of_another_profile_is_not_found() -> None:
    response = _client(FakeService()).get(f"/api/interview-sets/{uuid.uuid4()}", headers=PROFILE)

    assert response.status_code == 404


def test_missing_model_files_are_reported_as_unavailable(tmp_path) -> None:
    with pytest.raises(EmbeddingUnavailableError):
        asyncio.run(OnnxEmbedder(str(tmp_path)).embed(["Docker und Kubernetes"]))
