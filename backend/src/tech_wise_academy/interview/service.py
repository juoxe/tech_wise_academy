"""Use cases of the interview sets: generate a card set from a job advertisement."""

import asyncio
import hashlib
import uuid
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Protocol

from tech_wise_academy.interview.model import (
    InterviewSet,
    InterviewSetSummary,
    Vector,
    find_mentions,
    rank_tools,
    split_into_chunks,
    title_of,
    tool_document,
)
from tech_wise_academy.interview.repository import InterviewRepository
from tech_wise_academy.learning_content.service import ToolService


class Embedder(Protocol):
    model: str

    async def embed(self, texts: list[str]) -> list[Vector]: ...


class EmptyJobAdError(Exception):
    """The text holds no sentence that can be matched."""


@dataclass(frozen=True)
class _ToolText:
    key: str
    name: str
    document: str


class InterviewService:
    def __init__(
        self,
        tools: ToolService,
        embedder: Embedder,
        repository: InterviewRepository,
    ) -> None:
        self._tools = tools
        self._embedder = embedder
        self._repository = repository
        self._index_lock = asyncio.Lock()

    async def create_set(self, profile_id: uuid.UUID, job_ad: str) -> InterviewSet:
        chunks = split_into_chunks(job_ad)
        if not chunks:
            raise EmptyJobAdError
        tools = await self._load_tool_texts()
        await self._update_tool_embeddings(tools)
        vectors = await self._embedder.embed([chunk.text for chunk in chunks])
        mentions = find_mentions(chunks, {tool.key: tool.name for tool in tools})

        summary = InterviewSetSummary(
            id=uuid.uuid4(),
            title=title_of(job_ad),
            created_at=datetime.now(UTC),
            card_count=0,
        )
        await self._repository.create_set(
            summary,
            profile_id,
            job_ad,
            self._embedder.model,
            chunks,
            vectors,
            lambda scores: rank_tools(scores, mentions),
        )
        created = await self._repository.load_set(profile_id, summary.id)
        assert created is not None
        return created

    async def list_sets(self, profile_id: uuid.UUID) -> tuple[InterviewSetSummary, ...]:
        return await self._repository.list_sets(profile_id)

    async def get_set(self, profile_id: uuid.UUID, set_id: uuid.UUID) -> InterviewSet | None:
        return await self._repository.load_set(profile_id, set_id)

    async def delete_set(self, profile_id: uuid.UUID, set_id: uuid.UUID) -> bool:
        return await self._repository.delete_set(profile_id, set_id)

    async def _load_tool_texts(self) -> list[_ToolText]:
        return [
            _ToolText(
                key=tool.key,
                name=tool.name,
                document=tool_document(tool.name, tool.summary),
            )
            for tool in await self._tools.list_tool_texts()
        ]

    async def _update_tool_embeddings(self, tools: list[_ToolText]) -> None:
        """Embeds only what is new or changed, so the first call is the slow one."""
        model = self._embedder.model
        async with self._index_lock:
            stored = await self._repository.load_text_hashes(model)
            hashes = {tool.key: _hash(tool.document) for tool in tools}
            changed = [tool for tool in tools if stored.get(tool.key) != hashes[tool.key]]
            removed = stored.keys() - hashes.keys()
            if not changed and not removed:
                return
            vectors = await self._embedder.embed([tool.document for tool in changed])
            await self._repository.save_tool_embeddings(
                model,
                [
                    (tool.key, hashes[tool.key], vector)
                    for tool, vector in zip(changed, vectors, strict=True)
                ],
                removed,
            )


def _hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()
