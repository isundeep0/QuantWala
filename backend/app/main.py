"""QuantWala backend — serves algorithm content over a small REST API.

Run with:  uvicorn app.main:app --reload --port 8000   (from the backend/ dir)
"""
from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .content import (
    CATEGORIES,
    algorithm_summaries,
    get_algorithm,
    load_algorithms,
)

app = FastAPI(
    title="QuantWala API",
    version="0.1.0",
    description="Serves algorithm learning content for the QuantWala platform.",
)

# Allow the Vite dev server (and previews) to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
    ],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "algorithms": len(load_algorithms())}


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
