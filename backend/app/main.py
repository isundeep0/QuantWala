"""QuantWala backend — serves algorithm content + the document library API.

Run with:  uvicorn app.main:app --reload --port 8000   (from the backend/ dir)
"""
from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from . import documents as docs
from .content import (
    CATEGORIES,
    algorithm_summaries,
    get_algorithm,
    load_algorithms,
)

app = FastAPI(
    title="QuantWala API",
    version="0.2.0",
    description="Serves algorithm learning content + the document library for QuantWala.",
)

# Allow local dev + deployed frontend origins. You can override/extend this
# with QUANTWALA_CORS_ORIGINS as a comma-separated list.
default_origins = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "https://isundeep0.github.io",
}
extra_origins_raw = os.getenv("QUANTWALA_CORS_ORIGINS", "")
extra_origins = {
    origin.strip()
    for origin in extra_origins_raw.split(",")
    if origin.strip()
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=sorted(default_origins | extra_origins),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    return {
        "status": "ok",
        "algorithms": len(load_algorithms()),
        "documents": len(docs.list_documents()),
    }


@app.get("/api/categories")
def categories() -> dict:
    summaries = algorithm_summaries()
    by_cat: dict[str, int] = {}
    for a in summaries:
        by_cat[a["categoryId"]] = by_cat.get(a["categoryId"], 0) + 1
    enriched = [{**c, "count": by_cat.get(c["id"], 0)} for c in CATEGORIES]
    return {"categories": enriched}


@app.get("/api/algorithms")
def algorithms() -> dict:
    return {"algorithms": algorithm_summaries()}


@app.get("/api/algorithms/{slug}")
def algorithm_detail(slug: str) -> dict:
    algo = get_algorithm(slug)
    if not algo:
        raise HTTPException(status_code=404, detail=f"Algorithm '{slug}' not found")
    return algo


# ---------------------------------------------------------------------------
# Document library
# ---------------------------------------------------------------------------
@app.get("/api/documents")
def list_documents() -> dict:
    return {"documents": docs.list_documents()}


@app.post("/api/documents")
async def upload_document(file: UploadFile = File(...)) -> dict:
    original_name = file.filename or "document"
    ext = Path(original_name).suffix.lower().lstrip(".")
    if ext not in docs.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only .pdf and .docx files are supported.",
        )
    content = await file.read()
    try:
        meta = docs.save_document(original_name, ext, content)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return meta


@app.get("/api/documents/{doc_id}")
def document_detail(doc_id: str) -> dict:
    meta = docs.document_meta(doc_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Document not found")
    return meta


@app.patch("/api/documents/{doc_id}")
def rename_document(doc_id: str, body: dict) -> dict:
    meta = docs.rename_document(doc_id, body.get("title", ""))
    if not meta:
        raise HTTPException(status_code=404, detail="Document not found or invalid title")
    return meta


@app.get("/api/documents/{doc_id}/file")
def document_file(doc_id: str):
    entry = docs.get_document(doc_id)
    path = docs.file_path(doc_id)
    if not entry or not path:
        raise HTTPException(status_code=404, detail="Document file not found")
    return FileResponse(
        path,
        media_type=entry.get("contentType", "application/octet-stream"),
        # Inline so the browser/pdf.js renders it instead of downloading.
        headers={
            "Content-Disposition": f'inline; filename="{entry.get("originalName", "document")}"',
            # Allow the PDF/DOCX bytes to be fetched cross-origin by the reader.
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "private, max-age=3600",
        },
    )


@app.delete("/api/documents/{doc_id}")
def delete_document(doc_id: str) -> dict:
    if not docs.delete_document(doc_id):
        raise HTTPException(status_code=404, detail="Document not found")
    return {"ok": True, "id": doc_id}
