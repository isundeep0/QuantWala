import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";

const PSEUDO = [
  "solve(row):",
  "  if row == n: record solution; return",
  "  for col in 0..n-1:",
  "    if safe(row, col):",
  "      place queen; solve(row + 1)",
  "      remove queen   // backtrack",
];

function buildFrames(n) {
  const frames = [];
  const cols = new Array(n).fill(-1);
  let solved = false;

  const safe = (r, c) => {
    for (let i = 0; i < r; i++) {
      if (cols[i] === c) return false;
      if (Math.abs(cols[i] - c) === Math.abs(i - r)) return false;
    }
    return true;
  };

  const push = (explain, line, extra = {}) =>
    frames.push({ cols: [...cols], explain, line, ...extra });

  push(`Place one queen per row so none attack each other (n=${n}).`, 0);

  const solve = (r) => {
    if (solved) return;
    if (r === n) {
      solved = true;
      push("All rows filled with no conflicts — a valid solution!", 1, { done: true });
      return;
    }
    for (let c = 0; c < n && !solved; c++) {
      if (safe(r, c)) {
        cols[r] = c;
        push(`Row ${r}: (${r},${c}) is safe — place a queen and move to the next row.`, 4, { tryCell: [r, c] });
        solve(r + 1);
        if (!solved) {
          cols[r] = -1;
          push(`Dead end below row ${r}. Backtrack: remove queen from (${r},${c}) and try the next column.`, 5, { backtrack: [r, c] });
        }
      } else {
        push(`Row ${r}: (${r},${c}) is attacked — skip.`, 3, { conflict: [r, c] });
      }
    }
  };
  solve(0);
  return frames;
}

function Board({ frame, n }) {
  const { cols, tryCell, conflict, backtrack } = frame;
  return (
    <div
      className="grid overflow-hidden rounded-xl border-2"
      style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, borderColor: "rgb(var(--border-strong))", width: Math.min(360, n * 52) }}
    >
      {Array.from({ length: n * n }).map((_, idx) => {
        const r = Math.floor(idx / n);
        const c = idx % n;
        const dark = (r + c) % 2 === 1;
        const hasQueen = cols[r] === c;
        const isTry = tryCell && tryCell[0] === r && tryCell[1] === c;
        const isConflict = conflict && conflict[0] === r && conflict[1] === c;
        const isBack = backtrack && backtrack[0] === r && backtrack[1] === c;
        let bg = dark ? "rgb(var(--bg-sunken))" : "rgb(var(--bg-elev))";
        if (isConflict) bg = "#ef444455";
        if (isTry) bg = "#10b98155";
        if (isBack) bg = "#f59e0b55";
        return (
          <div key={idx} className="grid aspect-square place-items-center" style={{ backgroundColor: bg }}>
            {hasQueen && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl">
                ♛
              </motion.span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function NQueensSim() {
  const [n, setN] = useState(6);
  const frames = useMemo(() => buildFrames(n), [n]);
  const player = useStepPlayer(frames);

  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#ef4444"
      pseudocode={PSEUDO}
      inputPanel={
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted">Board size n</span>
          {[4, 5, 6, 7, 8].map((v) => (
            <button
              key={v}
              onClick={() => {
                setN(v);
                player.reset();
              }}
              className={`h-9 w-9 rounded-lg text-sm font-semibold ${n === v ? "bg-red-500 text-white" : "surface-sunken"}`}
            >
              {v}
            </button>
          ))}
        </div>
      }
      legend={
        <>
          <LegendItem color="#10b981" label="placing" />
          <LegendItem color="#ef4444" label="attacked" />
          <LegendItem color="#f59e0b" label="backtrack" />
        </>
      }
    >
      {player.frame && <Board frame={player.frame} n={n} />}
    </SimulatorShell>
  );
}
