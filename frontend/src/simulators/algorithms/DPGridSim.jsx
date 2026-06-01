import { useMemo, useState } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import GridView from "../views/GridView.jsx";

const PSEUDO = {
  lcs: [
    "dp[i][j] = LCS of A[:i], B[:j]",
    "if A[i-1] == B[j-1]:",
    "  dp[i][j] = dp[i-1][j-1] + 1",
    "else:",
    "  dp[i][j] = max(dp[i-1][j], dp[i][j-1])",
  ],
  knapsack: [
    "dp[i][w] = best value using first i items, cap w",
    "for each item i, capacity w:",
    "  skip = dp[i-1][w]",
    "  take = dp[i-1][w - wt[i]] + val[i]  (if fits)",
    "  dp[i][w] = max(skip, take)",
  ],
};

function lcsFrames(A, B) {
  const n = A.length;
  const m = B.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  const frames = [];
  const colHeaders = ["∅", ...B.split("")];
  const rowHeaders = ["∅", ...A.split("")];
  const push = (states, explain, line) =>
    frames.push({ grid: dp.map((r) => [...r]), states: { ...states }, explain, line, colHeaders, rowHeaders, corner: "" });

  push({}, `Row 0 and column 0 are 0 (empty string has no common subsequence).`, 0);
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const match = A[i - 1] === B[j - 1];
      const states = { [`${i},${j}`]: "current" };
      if (match) {
        states[`${i - 1},${j - 1}`] = "best";
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        states[`${i - 1},${j}`] = "compare";
        states[`${i},${j - 1}`] = "compare";
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
      push(
        states,
        match
          ? `A[${i - 1}]='${A[i - 1]}' == B[${j - 1}]='${B[j - 1]}' → dp[${i}][${j}] = diagonal + 1 = ${dp[i][j]}.`
          : `Characters differ → dp[${i}][${j}] = max(up, left) = ${dp[i][j]}.`,
        match ? 2 : 4,
      );
    }
  }
  const states = {};
  for (let i = 0; i <= n; i++) states[`${i},${m}`] = states[`${i},${m}`];
  states[`${n},${m}`] = "found";
  push(states, `Answer = dp[${n}][${m}] = ${dp[n][m]} — the LCS length.`, 0);
  return frames;
}

export default function DPGridSim({ variant = "lcs" }) {
  const [a, setA] = useState("AGCAT");
  const [b, setB] = useState("GAC");
  const frames = useMemo(() => lcsFrames(a, b), [a, b]);
  const player = useStepPlayer(frames);

  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#f59e0b"
      pseudocode={PSEUDO.lcs}
      inputPanel={
        <div className="flex flex-wrap items-end gap-3">
          <label>
            <span className="mb-1 block text-xs font-medium text-muted">String A</span>
            <input
              className="input w-32 font-mono uppercase"
              value={a}
              maxLength={8}
              onChange={(e) => {
                setA(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""));
                player.reset();
              }}
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-muted">String B</span>
            <input
              className="input w-32 font-mono uppercase"
              value={b}
              maxLength={8}
              onChange={(e) => {
                setB(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""));
                player.reset();
              }}
            />
          </label>
        </div>
      }
      legend={
        <>
          <LegendItem color="#2563eb" label="computing" />
          <LegendItem color="#10b981" label="diagonal (match)" />
          <LegendItem color="#f59e0b" label="up/left (max)" />
        </>
      }
    >
      {player.frame && (
        <GridView
          grid={player.frame.grid}
          states={player.frame.states}
          rowHeaders={player.frame.rowHeaders}
          colHeaders={player.frame.colHeaders}
        />
      )}
    </SimulatorShell>
  );
}
