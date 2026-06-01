# QuantWala

A learning platform for competitive programmers and engineers prepping for
top‑company OAs, system‑design interviews, and HFT / low‑latency roles.

Three modules:

- **Module 1 — Algorithms** *(fully implemented)*: 55 lessons across 12 categories,
  each with a 5‑step flow (Intuition → Logic → Dry Run → Interactive Simulator →
  Problem Set), 25 interactive simulators, and `localStorage`‑based progress with a
  locked/unlocked roadmap.
- **Module 2 — System Design** *(UI shell only)*: full navigation and placeholder
  panels (concept, architecture diagram, key points, common questions).
- **Module 3 — HFT / Low Latency** *(UI shell only)*: full navigation and placeholder
  panels (concept, code snippet, benchmark table, interview questions).

---

## Tech stack

| Layer    | Choice                                                        |
| -------- | ------------------------------------------------------------- |
| Frontend | React 18 + React Router 6, Vite, Tailwind CSS, Framer Motion, lucide-react |
| Backend  | Python + FastAPI (serves content over REST; optional)         |
| Data     | JSON files in `/content`; user progress in browser `localStorage` |

The frontend reads content **directly** from `/content` via a Vite alias, so it runs
fully standalone. The FastAPI backend is an optional REST layer over the same files,
ready for when the platform goes public.

---

## Folder structure

```
Gare/
├── content/                      # Source of truth for algorithm content
│   ├── schema.json               # JSON schema for a lesson file
│   └── algorithms/
│       ├── sorting-searching/    # one JSON per algorithm
│       ├── arrays-two-pointers/
│       ├── linked-lists/
│       ├── stacks-queues/
│       ├── trees/
│       ├── graphs/
│       ├── dynamic-programming/
│       ├── greedy/
│       ├── backtracking/
│       ├── segment-trees-bit/
│       ├── strings/
│       └── math-number-theory/
│
├── frontend/                     # React + Tailwind app (Vite)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js            # @ -> src, @content -> ../content
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx  App.jsx     # router + providers
│       ├── context/              # ThemeContext, ProgressContext (localStorage)
│       ├── data/                 # categories.js, registry.js (import.meta.glob), module2/3 data
│       ├── components/           # layout (Navbar/Footer), ui primitives, CodeBlock…
│       ├── pages/                # Landing, algorithms/, system-design/, hft/
│       └── simulators/           # engine (player), views (array/graph/tree/grid), 20 sims
│
└── backend/                      # FastAPI (optional)
    ├── requirements.txt
    └── app/
        ├── main.py               # /api/health, /api/categories, /api/algorithms[/{slug}]
        └── content.py            # loads + caches /content
```

---

## Running locally

### 1. Frontend (required)

> **Note:** this environment only has a bundled `node` (v20) with no `npm`. Install
> Node.js (which includes `npm`) locally from <https://nodejs.org> or via `nvm`.

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Build for production:

```bash
npm run build && npm run preview
```

### 2. Backend (optional)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API:

- `GET /api/health` → `{ status, algorithms }`
- `GET /api/categories` → categories with lesson counts
- `GET /api/algorithms` → lightweight lesson summaries
- `GET /api/algorithms/{slug}` → full lesson

---

## Adding / editing algorithm content

1. Create `content/algorithms/<categoryId>/<slug>.json` following `content/schema.json`.
2. Set `order` to position it in the category roadmap.
3. To attach an interactive simulator, set `"simulator": "<key>"` and register that key in
   `frontend/src/simulators/registry.jsx`. Leave it `null` for a clean "coming soon" state.

No rebuild config needed — Vite's `import.meta.glob` auto‑discovers new JSON files.

---

## What to build next

**Module 1 (polish):**
- Add simulators for the remaining lessons currently set to `null` (radix sort,
  Bellman‑Ford, Floyd‑Warshall, topological sort, SCC, MST, segment trees w/ lazy
  propagation, Z‑algorithm, Rabin‑Karp, trie, suffix array, etc.).
- A few categories are intentionally lean (greedy, stacks/queues) — expand the catalog.
- Per‑problem notes and a spaced‑repetition "review queue".

**Module 2 — System Design (content):**
- Fill the placeholder panels with real concept text, diagrams (consider an
  Excalidraw‑style embed), key interview points, and question banks.
- Add an interactive "design canvas" for drawing architectures.

**Module 3 — HFT / Low Latency (content):**
- Real C++/Python snippets with syntax highlighting, runnable benchmarks, and the
  benchmark/comparison tables.
- Firm‑specific interview tracks (Jane Street, Citadel, Tower, HRT, Optiver).

**Platform:**
- Optional accounts + DB to sync progress across devices (the current `localStorage`
  layer is intentionally swappable behind `ProgressContext`).
- Wire the frontend to the FastAPI backend (toggle the data source in `registry.js`)
  for a public deployment.
```
