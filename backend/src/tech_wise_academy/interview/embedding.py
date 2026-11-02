"""Embedding model inside the backend: MiniLM through ONNX Runtime (ADR-0006). No data leaves the
machine; the model file is downloaded once and found through `EMBEDDING_MODEL_DIR`."""

import asyncio
from pathlib import Path
from typing import Any

from tech_wise_academy.interview.model import Vector

MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
MODEL_FILE = "model_quint8_avx2.onnx"
TOKENIZER_FILE = "tokenizer.json"
MAX_TOKENS = 256
BATCH_SIZE = 32


class EmbeddingUnavailableError(Exception):
    """The model files are missing or cannot be loaded."""


class OnnxEmbedder:
    """Sentence vectors of MiniLM: mean of the token vectors, normalised to length 1.

    The model is loaded on the first call, so the backend starts without it; the inference runs in a
    thread, so it does not block other requests."""

    model = MODEL_NAME

    def __init__(self, model_dir: str) -> None:
        self._folder = Path(model_dir)
        self._session: Any = None
        self._tokenizer: Any = None
        self._load_lock = asyncio.Lock()

    async def embed(self, texts: list[str]) -> list[Vector]:
        async with self._load_lock:
            if self._session is None:
                await asyncio.to_thread(self._load)
        return await asyncio.to_thread(self._embed, texts)

    def _load(self) -> None:
        import onnxruntime
        from tokenizers import Tokenizer

        model, tokenizer = self._folder / MODEL_FILE, self._folder / TOKENIZER_FILE
        if not model.is_file() or not tokenizer.is_file():
            raise EmbeddingUnavailableError(f"model files missing in {self._folder}")
        self._tokenizer = Tokenizer.from_file(str(tokenizer))
        self._tokenizer.enable_truncation(max_length=MAX_TOKENS)
        self._tokenizer.enable_padding()
        self._session = onnxruntime.InferenceSession(str(model))

    def _embed(self, texts: list[str]) -> list[Vector]:
        import numpy

        inputs = {item.name for item in self._session.get_inputs()}
        vectors: list[Vector] = []
        for start in range(0, len(texts), BATCH_SIZE):
            encodings = self._tokenizer.encode_batch(texts[start : start + BATCH_SIZE])
            ids = numpy.array([encoding.ids for encoding in encodings], dtype=numpy.int64)
            mask = numpy.array([encoding.attention_mask for encoding in encodings], numpy.int64)
            feed = {"input_ids": ids, "attention_mask": mask}
            if "token_type_ids" in inputs:
                feed["token_type_ids"] = numpy.zeros_like(ids)
            tokens = self._session.run(None, feed)[0]
            pooled = (tokens * mask[..., None]).sum(axis=1) / mask.sum(axis=1, keepdims=True)
            pooled /= numpy.linalg.norm(pooled, axis=1, keepdims=True)
            vectors += [tuple(float(number) for number in row) for row in pooled]
        return vectors
