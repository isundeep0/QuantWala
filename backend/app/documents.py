"""Document library storage — upload, list, serve and delete user textbooks.

Uploaded files (PDF / DOCX) live on disk under ``backend/storage/documents/``
with a sidecar ``index.json`` holding lightweight metadata. The actual binary
files are never committed to git (see ``backend/storage/.gitignore``); only the
folder skeleton is tracked.

This is intentionally dependency-light: a JSON index + a flat file store, guarded
by a process-wide lock so concurrent uploads/deletes don't corrupt the index.
"""
from __future__ import annotations

import json
import threading
import time
import uuid
from pathlib import Path
from typing import Any

# backend/app/documents.py -> parents[1] is the backend/ dir.
BACKEND_DIR = Path(__file__).resolve().parents[1]
STORAGE_DIR = BACKEND_DIR / "storage" / "documents"
INDEX_PATH = STORAGE_DIR / "index.json"

# What we accept and how we label it on the client.
ALLOWED_EXTENSIONS: dict[str, str] = {
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

# 200 MB ceiling keeps a single textbook reasonable while still allowing big
# image-heavy scans.
MAX_UPLOAD_BYTES = 200 * 1024 * 1024

_LOCK = threading.Lock()


def _ensure_storage() -> None:
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    if not INDEX_PATH.exists():
        INDEX_PATH.write_text("[]", encoding="utf-8")


def _read_index() -> list[dict[str, Any]]:
    _ensure_storage()
    try:
        data = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []


def _write_index(entries: list[dict[str, Any]]) -> None:
    _ensure_storage()
    tmp = INDEX_PATH.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(entries, indent=2), encoding="utf-8")
    tmp.replace(INDEX_PATH)


def _doc_dir(doc_id: str) -> Path:
    return STORAGE_DIR / doc_id


def _public_meta(entry: dict[str, Any]) -> dict[str, Any]:
    """Strip server-only fields before returning to the client."""
    return {
        "id": entry["id"],
        "title": entry.get("title") or entry.get("originalName", "Untitled"),
        "originalName": entry.get("originalName"),
        "ext": entry.get("ext"),
        "contentType": entry.get("contentType"),
        "size": entry.get("size", 0),
        "uploadedAt": entry.get("uploadedAt"),
    }


def list_documents() -> list[dict[str, Any]]:
    entries = _read_index()
    entries.sort(key=lambda e: e.get("uploadedAt", 0), reverse=True)
    return [_public_meta(e) for e in entries]


def get_document(doc_id: str) -> dict[str, Any] | None:
    for e in _read_index():
        if e.get("id") == doc_id:
            return e
    return None


def document_meta(doc_id: str) -> dict[str, Any] | None:
    entry = get_document(doc_id)
    return _public_meta(entry) if entry else None


def file_path(doc_id: str) -> Path | None:
    entry = get_document(doc_id)
    if not entry:
        return None
    path = _doc_dir(doc_id) / entry["storedName"]
    return path if path.exists() else None


def _derive_title(original_name: str) -> str:
    stem = Path(original_name).stem.strip()
    # Turn "deep_learning-goodfellow.v2" into something human-friendly.
    cleaned = stem.replace("_", " ").replace("-", " ").strip()
    cleaned = " ".join(cleaned.split())
    return cleaned[:160] if cleaned else original_name


def save_document(original_name: str, ext: str, content: bytes) -> dict[str, Any]:
    """Persist an uploaded file and register it in the index."""
    ext = ext.lower().lstrip(".")
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type: .{ext}")
    if len(content) == 0:
        raise ValueError("Empty file")
    if len(content) > MAX_UPLOAD_BYTES:
        raise ValueError("File exceeds the 200 MB limit")

    doc_id = uuid.uuid4().hex
    stored_name = f"document.{ext}"
    with _LOCK:
        doc_dir = _doc_dir(doc_id)
        doc_dir.mkdir(parents=True, exist_ok=True)
        (doc_dir / stored_name).write_bytes(content)

        entry = {
            "id": doc_id,
            "title": _derive_title(original_name),
            "originalName": original_name,
            "storedName": stored_name,
            "ext": ext,
            "contentType": ALLOWED_EXTENSIONS[ext],
            "size": len(content),
            "uploadedAt": int(time.time() * 1000),
        }
        entries = _read_index()
        entries.append(entry)
        _write_index(entries)

    return _public_meta(entry)


def rename_document(doc_id: str, title: str) -> dict[str, Any] | None:
    title = (title or "").strip()[:160]
    if not title:
        return None
    with _LOCK:
        entries = _read_index()
        updated = None
        for e in entries:
            if e.get("id") == doc_id:
                e["title"] = title
                updated = e
                break
        if updated is None:
            return None
        _write_index(entries)
    return _public_meta(updated)


def delete_document(doc_id: str) -> bool:
    with _LOCK:
        entries = _read_index()
        remaining = [e for e in entries if e.get("id") != doc_id]
        if len(remaining) == len(entries):
            return False
        _write_index(remaining)

    # Remove files outside the lock; best-effort cleanup.
    doc_dir = _doc_dir(doc_id)
    if doc_dir.exists():
        for child in doc_dir.iterdir():
            try:
                child.unlink()
            except OSError:
                pass
        try:
            doc_dir.rmdir()
        except OSError:
            pass
    return True
