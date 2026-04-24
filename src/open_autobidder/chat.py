"""LLM chat client helpers for dashboard Q&A."""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from uuid import uuid4
from urllib import error, request

logger = logging.getLogger(__name__)
DEFAULT_GROK_MODEL = "grok-4.20-0309-non-reasoning"


@dataclass(frozen=True)
class ChatSettings:
    """Runtime chat settings loaded from environment variables."""

    provider: str
    model: str
    base_url: str
    api_key: str | None
    timeout_seconds: int
    temperature: float


@dataclass(frozen=True)
class ChatRequestConfig:
    """Per-request overrides for response speed and quality."""

    model: str | None = None
    timeout_seconds: int | None = None
    temperature: float | None = None
    max_history_messages: int = 6


@dataclass(frozen=True)
class SpeechToTextSettings:
    """Settings for optional voice transcription endpoint."""

    base_url: str | None
    model: str
    api_key: str | None
    timeout_seconds: int


def _load_local_env_file() -> None:
    """
    Load environment variables from a local `.env` file if present.

    Existing environment variables are preserved and take precedence.
    """
    env_path = Path(__file__).resolve().parents[2] / ".env"
    if not env_path.exists():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def _humanize_chat_error(status_code: int, response_text: str) -> str:
    """Return a concise, user-friendly error message for common API failures."""
    lower = response_text.lower()
    if status_code in (402, 403, 429) and (
        "credit" in lower or "license" in lower or "spending limit" in lower or "exhausted" in lower
    ):
        return (
            "Your xAI team has no remaining credits/licensing budget. "
            "Add credits in xAI console or switch to a cheaper/faster model."
        )
    if status_code == 401:
        return "Invalid API key. Please check OPENAUTOBIDDER_CHAT_API_KEY."
    if status_code == 404:
        return "Model or endpoint not found. Verify model name and base URL."
    if status_code >= 500:
        return "Provider server error. Please retry in a few moments."
    return f"Chat API error ({status_code}): {response_text}"


def load_chat_settings() -> ChatSettings:
    """
    Load chat settings from environment.

    Env vars:
    - OPENAUTOBIDDER_CHAT_PROVIDER (default: xai)
    - OPENAUTOBIDDER_CHAT_MODEL (default: grok-4.20-0309-non-reasoning)
    - OPENAUTOBIDDER_CHAT_BASE_URL (default: xAI chat completions endpoint)
    - OPENAUTOBIDDER_CHAT_API_KEY (fallback: XAI_API_KEY)
    - OPENAUTOBIDDER_CHAT_TIMEOUT_SECONDS (default: 30)
    - OPENAUTOBIDDER_CHAT_TEMPERATURE (default: 0.2)
    """
    _load_local_env_file()
    return ChatSettings(
        provider=os.getenv("OPENAUTOBIDDER_CHAT_PROVIDER", "xai"),
        model=os.getenv("OPENAUTOBIDDER_CHAT_MODEL", "grok-4.20-0309-non-reasoning"),
        base_url=os.getenv("OPENAUTOBIDDER_CHAT_BASE_URL", "https://api.x.ai/v1/chat/completions"),
        api_key=os.getenv("OPENAUTOBIDDER_CHAT_API_KEY") or os.getenv("XAI_API_KEY"),
        timeout_seconds=int(os.getenv("OPENAUTOBIDDER_CHAT_TIMEOUT_SECONDS", "30")),
        temperature=float(os.getenv("OPENAUTOBIDDER_CHAT_TEMPERATURE", "0.2")),
    )


def load_stt_settings() -> SpeechToTextSettings:
    """
    Load speech-to-text settings from environment.

    Env vars:
    - OPENAUTOBIDDER_STT_BASE_URL (optional, OpenAI-compatible transcription endpoint)
    - OPENAUTOBIDDER_STT_MODEL (default: whisper-1)
    - OPENAUTOBIDDER_STT_API_KEY (fallbacks: OPENAUTOBIDDER_CHAT_API_KEY, XAI_API_KEY)
    - OPENAUTOBIDDER_STT_TIMEOUT_SECONDS (default: 45)
    """
    _load_local_env_file()
    return SpeechToTextSettings(
        base_url=os.getenv("OPENAUTOBIDDER_STT_BASE_URL"),
        model=os.getenv("OPENAUTOBIDDER_STT_MODEL", "whisper-1"),
        api_key=(
            os.getenv("OPENAUTOBIDDER_STT_API_KEY")
            or os.getenv("OPENAUTOBIDDER_CHAT_API_KEY")
            or os.getenv("XAI_API_KEY")
        ),
        timeout_seconds=int(os.getenv("OPENAUTOBIDDER_STT_TIMEOUT_SECONDS", "45")),
    )


def _parse_response(payload: dict[str, Any]) -> str:
    """Extract assistant response from an OpenAI-compatible response schema."""
    choices = payload.get("choices", [])
    if not choices:
        raise ValueError("No choices found in LLM response.")
    message = choices[0].get("message", {})
    content = message.get("content")
    if not isinstance(content, str) or not content.strip():
        raise ValueError("LLM returned empty assistant content.")
    return content


def ask_about_dashboard(
    question: str,
    dashboard_context: str,
    chat_history: list[dict[str, str]] | None = None,
    request_config: ChatRequestConfig | None = None,
) -> str:
    """Send a dashboard-aware question to the configured LLM backend."""
    settings = load_chat_settings()
    cfg = request_config or ChatRequestConfig()
    if settings.provider.lower() != "xai":
        raise ValueError("Only xAI/Grok is allowed. Set OPENAUTOBIDDER_CHAT_PROVIDER=xai.")
    if not settings.api_key:
        raise ValueError(
            "Missing API key. Set OPENAUTOBIDDER_CHAT_API_KEY or XAI_API_KEY to enable chat."
        )
    requested_model = (cfg.model or settings.model).strip()
    # Normalize common shorthand aliases to a valid xAI model id.
    alias_map = {
        "grok-4.2": DEFAULT_GROK_MODEL,
        "grok-4.20": DEFAULT_GROK_MODEL,
        "grok-4.20-non-reasoning": DEFAULT_GROK_MODEL,
    }
    effective_model = alias_map.get(requested_model, requested_model)
    if "grok" not in effective_model.lower():
        raise ValueError("Only Grok models are allowed. Please choose a model containing 'grok'.")

    system_prompt = (
        "You are OpenAutobidder-DE Copilot, an expert in BESS market optimization. "
        "Answer with direct, practical insights about the shown dashboard results. "
        "When possible, cite concrete values from the provided context. "
        "Keep answers concise and action-oriented."
    )

    messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]
    if chat_history:
        messages.extend(chat_history[-cfg.max_history_messages :])
    messages.append(
        {
            "role": "user",
            "content": (
                "Dashboard context:\n"
                f"{dashboard_context}\n\n"
                "Question:\n"
                f"{question}"
            ),
        }
    )

    body = json.dumps(
        {
            "model": effective_model,
            "temperature": settings.temperature if cfg.temperature is None else cfg.temperature,
            "messages": messages,
        }
    ).encode("utf-8")

    req = request.Request(
        settings.base_url,
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {settings.api_key}",
            "Content-Type": "application/json",
        },
    )

    logger.debug(
        "Sending chat request provider=%s model=%s url=%s message_count=%d",
        settings.provider,
        settings.model,
        settings.base_url,
        len(messages),
    )
    try:
        with request.urlopen(req, timeout=cfg.timeout_seconds or settings.timeout_seconds) as response:
            response_bytes = response.read()
            payload = json.loads(response_bytes.decode("utf-8"))
            return _parse_response(payload)
    except error.HTTPError as exc:
        response_text = exc.read().decode("utf-8", errors="replace")
        logger.exception(
            "Chat HTTP error status=%s body=%s request_url=%s model=%s",
            exc.code,
            response_text,
            settings.base_url,
            cfg.model or settings.model,
        )
        raise RuntimeError(_humanize_chat_error(exc.code, response_text)) from exc
    except error.URLError as exc:
        logger.exception("Chat URL error request_url=%s", settings.base_url)
        raise RuntimeError(f"Chat network error: {exc.reason}") from exc


def transcribe_audio(audio_bytes: bytes, filename: str = "voice.wav", mime_type: str = "audio/wav") -> str:
    """
    Transcribe recorded audio using an OpenAI-compatible transcription endpoint.

    Configure with:
    - OPENAUTOBIDDER_STT_BASE_URL
    - OPENAUTOBIDDER_STT_MODEL
    - OPENAUTOBIDDER_STT_API_KEY (or chat key fallback)
    """
    stt = load_stt_settings()
    if "xai" != os.getenv("OPENAUTOBIDDER_CHAT_PROVIDER", "xai").lower():
        raise ValueError("Only xAI/Grok is allowed. Set OPENAUTOBIDDER_CHAT_PROVIDER=xai.")
    if not stt.base_url:
        raise ValueError(
            "Voice input endpoint is not configured. Set OPENAUTOBIDDER_STT_BASE_URL "
            "(xAI-compatible transcription endpoint)."
        )
    if "x.ai" not in stt.base_url:
        raise ValueError("Only xAI endpoints are allowed for voice transcription.")
    if not stt.api_key:
        raise ValueError("Missing STT API key. Set OPENAUTOBIDDER_STT_API_KEY.")

    boundary = f"----openautobidder-{uuid4().hex}"
    fields = [
        (
            "model",
            None,
            "text/plain; charset=utf-8",
            stt.model.encode("utf-8"),
        ),
        (
            "file",
            filename,
            mime_type,
            audio_bytes,
        ),
    ]

    body = bytearray()
    for name, file_name, content_type, data in fields:
        body.extend(f"--{boundary}\r\n".encode("utf-8"))
        if file_name:
            body.extend(
                (
                    f'Content-Disposition: form-data; name="{name}"; '
                    f'filename="{file_name}"\r\n'
                ).encode("utf-8")
            )
        else:
            body.extend(f'Content-Disposition: form-data; name="{name}"\r\n'.encode("utf-8"))
        body.extend(f"Content-Type: {content_type}\r\n\r\n".encode("utf-8"))
        body.extend(data)
        body.extend(b"\r\n")
    body.extend(f"--{boundary}--\r\n".encode("utf-8"))

    req = request.Request(
        stt.base_url,
        data=bytes(body),
        method="POST",
        headers={
            "Authorization": f"Bearer {stt.api_key}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
    )

    try:
        with request.urlopen(req, timeout=stt.timeout_seconds) as response:
            payload = json.loads(response.read().decode("utf-8"))
            text = payload.get("text")
            if not isinstance(text, str) or not text.strip():
                raise ValueError("Transcription API returned no text.")
            return text.strip()
    except error.HTTPError as exc:
        response_text = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(_humanize_chat_error(exc.code, response_text)) from exc
    except error.URLError as exc:
        raise RuntimeError(f"Voice transcription network error: {exc.reason}") from exc
