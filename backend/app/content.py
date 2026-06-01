"""Loads and caches algorithm content from the repo-root /content directory.

The frontend bundles this same content via a Vite alias, but the backend
serves it over REST so the platform can later become a public API without
duplicating the source of truth.
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

# backend/app/content.py -> parents[2] is the repository root.
ROOT = Path(__file__).resolve().parents[2]
CONTENT_DIR = ROOT / "content"
ALGO_DIR = CONTENT_DIR / "algorithms"

# Category metadata mirrors the frontend ordering so the API is self-contained.
CATEGORIES: list[dict[str, Any]] = [
    {"id": "sorting-searching", "title": "Sorting & Searching", "order": 1},
    {"id": "arrays-two-pointers", "title": "Arrays & Two Pointers", "order": 2},
    {"id": "linked-lists", "title": "Linked Lists", "order": 3},
    {"id": "stacks-queues", "title": "Stacks & Queues", "order": 4},
    {"id": "trees", "title": "Trees", "order": 5},
    {"id": "graphs", "title": "Graphs", "order": 6},
    {"id": "dynamic-programming", "title": "Dynamic Programming", "order": 7},
    {"id": "greedy", "title": "Greedy Algorithms", "order": 8},
    {"id": "backtracking", "title": "Backtracking", "order": 9},
    {"id": "segment-trees-bit", "title": "Segment Trees & BITs", "order": 10},
    {"id": "strings", "title": "String Algorithms", "order": 11},
    {"id": "math-number-theory", "title": "Math & Number Theory", "order": 12},
]

_CATEGORY_ORDER = {c["id"]: c["order"] for c in CATEGORIES}


@lru_cache(maxsize=1)
def load_algorithms() -> list[dict[str, Any]]:
    """Read every algorithm JSON, sorted by (category order, lesson order)."""
    algos: list[dict[str, Any]] = []
    if not ALGO_DIR.exists():
        return algos
    for path in ALGO_DIR.rglob("*.json"):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        data.setdefault("slug", path.stem)
        algos.append(data)
    algos.sort(
        key=lambda a: (
            _CATEGORY_ORDER.get(a.get("categoryId", ""), 99),
            a.get("order", 99),
        )
    )
    return algos


def algorithm_summaries() -> list[dict[str, Any]]:
    """Lightweight list for menus/roadmaps (no heavy step content)."""
    keep = {"slug", "categoryId", "order", "title", "tagline", "complexity", "tags", "simulator", "estMinutes"}
    return [{k: a.get(k) for k in keep if k in a} for a in load_algorithms()]


def get_algorithm(slug: str) -> dict[str, Any] | None:
    for a in load_algorithms():
        if a.get("slug") == slug:
            return a
    return None
