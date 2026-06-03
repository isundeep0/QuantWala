# QuantWala

A learning platform for competitive programmers and engineers prepping for
top‑company OAs, system‑design interviews, and HFT / low‑latency roles.

Three modules:

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
├── content/                      # Source of truth for all lesson content
│   ├── schema.json               # JSON schema for an algorithm lesson file
│   ├── algorithms/
│   │   ├── sorting-searching/    # one JSON per algorithm
│   │   ├── arrays-two-pointers/
│   │   ├── linked-lists/
│   │   ├── stacks-queues/
│   │   ├── trees/
│   │   ├── graphs/
│   │   ├── dynamic-programming/
│   │   ├── greedy/
│   │   ├── backtracking/
│   │   ├── segment-trees-bit/
│   │   ├── strings/
│   │   └── math-number-theory/
│   └── system-design/            # one JSON per system-design lesson
│       ├── schema.json           # JSON schema for an SD lesson file
│       ├── start-here/
│       ├── fundamentals/
│       ├── building-blocks/
│       ├── distributed-systems/
│       ├── case-studies/
│       └── interview-playbook/
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

## Adding / editing system‑design content

1. Create `content/system-design/<sectionId>/<slug>.json` following
   `content/system-design/schema.json`. Valid `sectionId`s: `start-here`,
   `fundamentals`, `building-blocks`, `distributed-systems`, `case-studies`,
   `interview-playbook`.
2. Set `order` to position the lesson within its section roadmap.
3. The lesson body is a list of `sections`, each containing `blocks`. The renderer
   (`frontend/src/components/system-design/BlockRenderer.jsx`) supports these block
   `type`s: `text`, `analogy`, `key`, `callout` (variants: tip/warning/note/insight/
   interview/junior/senior), `bullets`, `steps`, `compare` (tables), `tradeoffs`,
   `diagram`, `code`, `metrics`, `stat`. Inline markdown (`**bold**`, `` `code` ``,
   `*italic*`) works inside strings.
4. Add an `cheatsheet` (string array) and a `questions` array (prompt → hint → model
   answer → follow‑ups) for the interview‑prep panels.

Section metadata (titles, colors, icons, order) lives in
`frontend/src/data/systemDesign.js`. Like the Algorithms module, new JSON files are
auto‑discovered via `import.meta.glob` — no wiring required.

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
