# QuantWala

A learning platform for competitive programmers and engineers prepping for
top‑company OAs, system‑design interviews, and HFT / low‑latency roles.

Four modules:

- **Module 1 — Algorithms** *(complete, end‑to‑end)*: 55 lessons across 12 categories,
  each with a 5‑step flow (Intuition → Logic → Dry Run → Interactive Simulator →
  Problem Set). Every lesson ships **both C++ and Python** implementations behind a
  language switcher, a curated 5‑problem set, and an interactive step‑by‑step
  simulator — **all 55 lessons have a simulator** (50 simulator components, several
  parametrised). Progress is `localStorage`‑based with a locked/unlocked roadmap.
- **Module 2 — System Design** *(complete, end‑to‑end)*: **55 in‑depth lessons across 6
  sections** — Start Here, Fundamentals, Building Blocks, Distributed Systems, Case
  Studies (21 canonical designs), and a full Interview Playbook. Each lesson is a
  block‑based long‑form article (text, analogies, callouts, comparison tables,
  architecture diagrams, code, metrics) with a sticky scroll‑spy table of contents, an
  **interview cheat sheet**, and a **practice question set** with progressive reveal
  (hint → model answer → follow‑ups) and per‑question self‑assessment. Progress is
  `localStorage`‑based, tracked independently from the Algorithms module.
- **Module 4 — Road to Candidate Master** *(complete, content)*: a Codeforces‑only
  practice ladder that picks up where Module 1 ends. **393 real, curated Codeforces
  problems** across **5 rating tiers** (Newbie→Pupil … CM→Master) and **33 themed
  patterns**, each mapped back to the exact Module 1 lessons that teach the
  algorithm. Every theme leads with *pattern‑recognition* coaching (signals →
  technique → classic trap → mastery goal). Problems are pulled from the live
  Codeforces API, ordered by rating, and ranked by popularity (`solvedCount`).
  Per‑problem Solved/Review/Stuck status shares the same `localStorage` store.
- **Module 2 — System Design** *(UI shell only)*: full navigation and placeholder
  panels (concept, architecture diagram, key points, common questions).
- **Module 3 — HFT / Low Latency** *(UI shell only)*: full navigation and placeholder
  panels (concept, code snippet, benchmark table, interview questions).
- **Module 5 — Personal Finance & Investing** *(complete, content)*: a from‑scratch
  personal‑finance masterclass for the Indian market. **17 lessons across 8 sections**
  (mindset → budgeting & emergency fund → compounding → credit/CIBIL → asset classes →
  goal‑based investing → taxation → a capstone "money system"). Every lesson follows the
  same shape — *core concept → strict rule of thumb → a worked example* — and every
  number is anchored to one beginner persona (22, Bengaluru, ₹20,000/month, saving for a
  car by 2031). Content‑driven like System Design: drop a JSON file in
  `content/finance/<sectionId>/` and it appears on the roadmap. Progress (lessons +
  self‑assessed checks) is `localStorage`‑based via `FinanceProgressContext`.

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
│   ├── cp/
│   │   └── roadmap.json          # Module 4 ladder (generated from the CF API)
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
│       ├── components/           # layout (Navbar/Footer), ui primitives, CodeBlock, CodeTabs…
│       ├── pages/                # Landing, algorithms/, system-design/, hft/
│       └── simulators/           # engine (player), views (array/graph/tree/grid/segtree), 50 sims
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
3. Provide implementations in the `logic.codes` array (C++ first, then Python); the
   `LogicStep` renders them in a language switcher (`CodeTabs`). The legacy single
   `logic.code` object is still rendered for backward compatibility.
4. To attach an interactive simulator, set `"simulator": "<key>"` and register that key in
   `frontend/src/simulators/registry.jsx`. Leave it `null` for a clean "coming soon" state.

No rebuild config needed — Vite's `import.meta.glob` auto‑discovers new JSON files.

---

## Regenerating the Module 4 ladder (Road to Candidate Master)

The CP ladder is **generated**, not hand‑written, so links and ratings stay
accurate. The authored part (rating tiers, themes, and the signals/technique/trap
pattern‑recognition prose) lives in the generator; the problems are pulled live
from Codeforces.

```bash
python3 tools/cp-roadmap/build_roadmap.py     # → content/cp/roadmap.json
```

It fetches `https://codeforces.com/api/problemset.problems`, then for each theme
keeps problems matching the theme's tag filter, ramps the rating in sub‑bands,
ranks each band by `solvedCount` (popularity ≈ "famous, worth‑doing"), globally
de‑duplicates, and sorts the final ladder ascending. To add a theme or retune a
rating window, edit the `PHASES` list in `tools/cp-roadmap/build_roadmap.py` and
re‑run. The frontend reads `content/cp/roadmap.json` via the `@content` alias
(`frontend/src/data/cpRoadmap.js`), so no other wiring is needed.

---

## What to build next

**Module 1 — done.** Every lesson has dual‑language code, a 5‑problem set, and an
interactive simulator. Possible future enhancements:
- Editable inputs on more simulators (several already accept custom input).
- Per‑problem notes and a spaced‑repetition "review queue".
- Expand the intentionally lean categories (greedy, stacks/queues) with more lessons.

**Module 2 — System Design — done.** 55 lessons across 6 sections, each with diagrams,
an interview cheat sheet, and a practice question set. Possible future enhancements:
- More case studies (e.g., distributed cache, web search, ad-serving, payments ledger).
- An interactive "design canvas" for drawing architectures.
- Spaced‑repetition review queue across the practice questions.

**Platform:**
- Optional accounts + DB to sync progress across devices (the current `localStorage`
  layer is intentionally swappable behind `ProgressContext`).
- Wire the frontend to the FastAPI backend (toggle the data source in `registry.js`)
  for a public deployment.
```
