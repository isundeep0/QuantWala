import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import GridView from "../views/GridView.jsx";

const ITEMS = [
  { wt: 1, val: 1 },
  { wt: 3, val: 4 },
  { wt: 4, val: 5 },
  { wt: 5, val: 7 },
];
const W = 7;

const PSEUDO = [
  "dp[i][w] = best value, first i items, cap w",
  "for each item i, capacity w:",
  "  skip = dp[i-1][w]",
  "  take = dp[i-1][w-wt[i]] + val[i]   (if wt[i] ≤ w)",
  "  dp[i][w] = max(skip, take)",
];

function buildFrames() {
  const n = ITEMS.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
  const frames = [];
  const rowHeaders = ["∅", ...ITEMS.map((it) => `${it.wt}kg/$${it.val}`)];
  const colHeaders = Array.from({ length: W + 1 }, (_, w) => w);
  const push = (states, explain, line) =>
    frames.push({ grid: dp.map((r) => [...r]), states: { ...states }, explain, line, rowHeaders, colHeaders });

  push({}, "Row 0 = no items, so every capacity holds value 0. We fill row by row, each cell choosing skip vs take.", 0);
  for (let i = 1; i <= n; i++) {
    const { wt, val } = ITEMS[i - 1];
    for (let w = 0; w <= W; w++) {
      const skip = dp[i - 1][w];
      const fits = wt <= w;
      const take = fits ? dp[i - 1][w - wt] + val : -Infinity;
      dp[i][w] = Math.max(skip, take);
      const states = { [`${i},${w}`]: "current", [`${i - 1},${w}`]: "compare" };
      if (fits) states[`${i - 1},${w - wt}`] = "lo";
      const chose = take > skip ? "take" : "skip";
      if (chose === "take") states[`${i},${w}`] = "best";
      push(
        states,
        fits
          ? `Item ${i} (${wt}kg, $${val}), cap ${w}: skip=${skip}, take=${take} → ${chose} (dp=${dp[i][w]}).`
          : `Item ${i} (${wt}kg) doesn't fit cap ${w} → must skip (dp=${dp[i][w]}).`,
        fits ? 4 : 2,
      );
    }
  }
  push({ [`${n},${W}`]: "found" }, `dp[${n}][${W}] = ${dp[n][W]} — the maximum value within capacity ${W}.`, 0);
  return frames;
}

export default function KnapsackSim() {
  const frames = useMemo(() => buildFrames(), []);
  const player = useStepPlayer(frames);
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#f59e0b"
      pseudocode={PSEUDO}
      inputPanel={
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted">items (wt/val):</span>
          <span className="font-mono font-semibold">{ITEMS.map((it) => `${it.wt}/$${it.val}`).join("  ")}</span>
          <span className="ml-2 text-muted">capacity</span>
          <span className="font-mono font-semibold">{W}</span>
        </div>
      }
      legend={
        <>
          <LegendItem color="#2563eb" label="dp[i][w]" />
          <LegendItem color="#f59e0b" label="skip (above)" />
          <LegendItem color="#0ea5e9" label="take source" />
          <LegendItem color="#10b981" label="took the item" />
        </>
      }
    >
      {player.frame && (
        <GridView grid={player.frame.grid} states={player.frame.states} rowHeaders={player.frame.rowHeaders} colHeaders={player.frame.colHeaders} cornerLabel="i\w" cell={40} />
      )}
    </SimulatorShell>
  );
}
