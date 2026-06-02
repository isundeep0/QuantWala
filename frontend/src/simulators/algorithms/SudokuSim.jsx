import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";

const SOLVED = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];
const BLANKS = [
  [0, 2], [0, 5], [1, 4], [2, 0], [3, 6], [4, 4], [5, 1], [6, 8], [7, 3], [8, 0],
];
const MAX_FRAMES = 380;

const PSEUDO = [
  "find next empty cell",
  "for digit 1..9:",
  "  if digit is valid here:",
  "    place it; recurse",
  "    if solved: done",
  "    else: erase it (backtrack)",
];

function makePuzzle() {
  const g = SOLVED.map((r) => [...r]);
  const given = SOLVED.map((r) => r.map(() => true));
  for (const [r, c] of BLANKS) {
    g[r][c] = 0;
    given[r][c] = false;
  }
  return { g, given };
}

function valid(g, r, c, d) {
  for (let i = 0; i < 9; i++) {
    if (g[r][i] === d || g[i][c] === d) return false;
    const br = 3 * Math.floor(r / 3) + Math.floor(i / 3);
    const bc = 3 * Math.floor(c / 3) + (i % 3);
    if (g[br][bc] === d) return false;
  }
  return true;
}

function buildFrames() {
  const { g, given } = makePuzzle();
  const empties = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (!given[r][c]) empties.push([r, c]);
  const frames = [];
  let capped = false;
  const snap = (cur, trying, explain, line) => {
    if (frames.length >= MAX_FRAMES) {
      capped = true;
      return;
    }
    frames.push({ grid: g.map((r) => [...r]), given, cur, trying, explain, line });
  };

  snap(null, 0, "Backtracking: find an empty cell, try digits 1–9, and recurse. If a choice leads to a dead end, erase it and try the next.", 0);
  const solve = (idx) => {
    if (capped) return true;
    if (idx === empties.length) return true;
    const [r, c] = empties[idx];
    for (let d = 1; d <= 9; d++) {
      snap([r, c], d, `Cell (${r},${c}): try ${d}.`, 1);
      if (valid(g, r, c, d)) {
        g[r][c] = d;
        snap([r, c], 0, `${d} is valid at (${r},${c}) — place it and move on.`, 3);
        if (solve(idx + 1)) return true;
        g[r][c] = 0;
        snap([r, c], 0, `Dead end below (${r},${c}) — erase ${d} and backtrack.`, 5);
      } else {
        snap([r, c], d, `${d} conflicts with its row, column, or box — skip.`, 2);
      }
    }
    return false;
  };
  solve(0);
  snap(null, 0, "Puzzle solved — every cell satisfies the row, column, and 3×3 box constraints.", 0);
  return frames;
}

export default function SudokuSim() {
  const frames = useMemo(() => buildFrames(), []);
  const player = useStepPlayer(frames);
  const f = player.frame;
  return (
    <SimulatorShell
      player={player}
      frame={f}
      accent="#ef4444"
      pseudocode={PSEUDO}
      legend={
        <>
          <LegendItem color="rgb(var(--text))" label="given clue" />
          <LegendItem color="#2563eb" label="current cell" />
          <LegendItem color="#10b981" label="filled by solver" />
        </>
      }
    >
      {f && (
        <div className="inline-grid grid-cols-9 overflow-hidden rounded-lg border-2" style={{ borderColor: "rgb(var(--border-strong))" }}>
          {f.grid.map((row, r) =>
            row.map((v, c) => {
              const isCur = f.cur && f.cur[0] === r && f.cur[1] === c;
              const isGiven = f.given[r][c];
              const display = v !== 0 ? v : isCur && f.trying ? f.trying : "";
              const bg = isCur ? "#2563eb" : "transparent";
              const color = isCur ? "#fff" : isGiven ? "rgb(var(--text))" : v !== 0 ? "#10b981" : "rgb(var(--text-faint))";
              return (
                <div
                  key={`${r}-${c}`}
                  className="grid h-8 w-8 place-items-center font-mono text-sm font-bold sm:h-9 sm:w-9"
                  style={{
                    backgroundColor: bg,
                    color,
                    borderRight: c % 3 === 2 && c !== 8 ? "2px solid rgb(var(--border-strong))" : "1px solid rgb(var(--border))",
                    borderBottom: r % 3 === 2 && r !== 8 ? "2px solid rgb(var(--border-strong))" : "1px solid rgb(var(--border))",
                    opacity: isCur && v === 0 && f.trying ? 0.85 : 1,
                  }}
                >
                  {display}
                </div>
              );
            }),
          )}
        </div>
      )}
    </SimulatorShell>
  );
}
