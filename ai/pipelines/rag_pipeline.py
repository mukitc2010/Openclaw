"""RAG (Retrieval-Augmented Generation) pipeline for injecting project context into agents.

This pipeline:
1. Ingests documents (architecture docs, existing code, user requirements) into Qdrant.
2. At query time, retrieves the top-k relevant chunks and injects them into agent prompts.
"""

from __future__ import annotations

from typing import List

from app.core.config import settings


class RAGPipeline:
    """Manages document ingestion and context retrieval for agent prompts."""

    CHUNK_SIZE = 512
    CHUNK_OVERLAP = 64
    TOP_K = 5
    EMBEDDING_MODEL = "text-embedding-3-small"

    def __init__(self) -> None:
        self._client = None  # Lazy-initialized Qdrant client

    def _get_client(self):
        """Lazy-initialize the Qdrant client."""
        if self._client is None:
            from qdrant_client import QdrantClient

            self._client = QdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY or None,
            )
        return self._client

    async def ingest_text(self, text: str, metadata: dict) -> None:
        """Chunk and ingest a text document into Qdrant.

        Args:
            text: Raw text content to ingest.
            metadata: Metadata dict (e.g., source, project_id, agent_name).
        """
        import uuid as _uuid

        chunks = self._chunk_text(text)
        embeddings = await self._embed_texts(chunks)
        client = self._get_client()

        from qdrant_client.models import PointStruct

        points = [
            PointStruct(
                id=str(_uuid.uuid4()),
                vector=embedding,
                payload={"text": chunk, **metadata},
            )
            for chunk, embedding in zip(chunks, embeddings)
        ]

        client.upsert(collection_name=settings.QDRANT_COLLECTION, points=points)

    async def retrieve(self, query: str, project_id: str, top_k: int = TOP_K) -> str:
        """Retrieve the most relevant context chunks for a query.

        Args:
            query: The query string (e.g., agent task description).
            project_id: Filter results to this project.
            top_k: Number of chunks to retrieve.

        Returns:
            A concatenated string of the top-k relevant chunks.
        """
        query_embedding = await self._embed_texts([query])
        client = self._get_client()

        results = client.search(
            collection_name=settings.QDRANT_COLLECTION,
            query_vector=query_embedding[0],
            query_filter={"must": [{"key": "project_id", "match": {"value": project_id}}]},
            limit=top_k,
        )

        return "\n\n".join(hit.payload.get("text", "") for hit in results)

    def _chunk_text(self, text: str) -> List[str]:
        """Split text into overlapping chunks."""
        chunks = []
        start = 0
        while start < len(text):
            end = start + self.CHUNK_SIZE
            chunks.append(text[start:end])
            start += self.CHUNK_SIZE - self.CHUNK_OVERLAP
        return chunks

    async def _embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts using OpenAI."""
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        response = await client.embeddings.create(
            model=self.EMBEDDING_MODEL,
            input=texts,
        )
        return [item.embedding for item in response.data]
