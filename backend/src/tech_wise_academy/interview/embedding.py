"""Client of the local embedding service (Ollama, ADR-0006). No data leaves the local network."""

import httpx

from tech_wise_academy.interview.model import Vector

BATCH_SIZE = 32
TIMEOUT_SECONDS = 300.0


class EmbeddingUnavailableError(Exception):
    """The embedding service cannot be reached or does not know the model."""


class OllamaEmbedder:
    def __init__(self, url: str, model: str) -> None:
        self._url = url.rstrip("/")
        self.model = model

    async def embed(self, texts: list[str]) -> list[Vector]:
        vectors: list[Vector] = []
        async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
            for start in range(0, len(texts), BATCH_SIZE):
                vectors.extend(await self._embed_batch(client, texts[start : start + BATCH_SIZE]))
        return vectors

    async def _embed_batch(self, client: httpx.AsyncClient, texts: list[str]) -> list[Vector]:
        try:
            response = await client.post(
                f"{self._url}/api/embed", json={"model": self.model, "input": texts}
            )
            response.raise_for_status()
        except httpx.HTTPError as error:
            raise EmbeddingUnavailableError(str(error)) from error
        return [tuple(vector) for vector in response.json()["embeddings"]]
