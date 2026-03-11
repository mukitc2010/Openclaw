"""LLM service — abstraction layer over OpenAI and Anthropic."""

from typing import AsyncIterator

from app.core.config import settings


class LLMService:
    """Thin wrapper around OpenAI / Anthropic that exposes a unified async interface.

    Streaming is supported via ``stream_completion``.
    """

    def __init__(self) -> None:
        self._provider = "openai" if settings.OPENAI_API_KEY else "anthropic"

    async def complete(self, system_prompt: str, user_prompt: str) -> str:
        """Return a full completion as a single string."""
        if self._provider == "openai":
            return await self._openai_complete(system_prompt, user_prompt)
        return await self._anthropic_complete(system_prompt, user_prompt)

    async def stream_completion(
        self, system_prompt: str, user_prompt: str
    ) -> AsyncIterator[str]:
        """Yield text chunks from the LLM as they arrive."""
        if self._provider == "openai":
            async for chunk in self._openai_stream(system_prompt, user_prompt):
                yield chunk
        else:
            async for chunk in self._anthropic_stream(system_prompt, user_prompt):
                yield chunk

    # ── OpenAI ─────────────────────────────────────────────────────────────

    async def _openai_complete(self, system_prompt: str, user_prompt: str) -> str:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            temperature=settings.OPENAI_TEMPERATURE,
            max_tokens=settings.OPENAI_MAX_TOKENS,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        return response.choices[0].message.content or ""

    async def _openai_stream(
        self, system_prompt: str, user_prompt: str
    ) -> AsyncIterator[str]:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        stream = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            temperature=settings.OPENAI_TEMPERATURE,
            max_tokens=settings.OPENAI_MAX_TOKENS,
            stream=True,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta

    # ── Anthropic ───────────────────────────────────────────────────────────

    async def _anthropic_complete(self, system_prompt: str, user_prompt: str) -> str:
        import anthropic

        client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        message = await client.messages.create(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=settings.OPENAI_MAX_TOKENS,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        )
        return message.content[0].text if message.content else ""

    async def _anthropic_stream(
        self, system_prompt: str, user_prompt: str
    ) -> AsyncIterator[str]:
        import anthropic

        client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        async with client.messages.stream(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=settings.OPENAI_MAX_TOKENS,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        ) as stream:
            async for text in stream.text_stream:
                yield text
