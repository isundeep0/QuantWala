import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import GridView from "../views/GridView.jsx";

// Matrix-chain multiplication. p has n+1 dims; matrix i is p[i-1] x p[i].
const P = [40, 20, 30, 10, 30];
const N = P.length - 1; // 4 matrices

const PSEUDO = [
  "dp[l][l] = 0   (single matrix)",
  "for len = 2..n:",
  "  for l, r = l+len-1:",
  "    for split k in l..r-1:",
  "      cost = dp[l][k] + dp[k+1][r]",
  "           + p[l-1]·p[k]·p[r]",
  "      dp[l][r] = min(dp[l][r], cost)",
];

function buildFrames() {
  // 1-indexed l,r in 1..N. Use (N+1)x(N+1) grid, display 1..N.
  const dp = Array.from({ length: N + 1 }, () => new Array(N + 1).fill(0));
  const show = () => {
    const g = [];
    for (let l = 1; l <= N; l++) {
      const row = [];
      for (let r = 1; r <= N; r++) row.push(l > r ? "" : dp[l][r]);
      g.push(row);
    }
    return g;
  };
  const frames = [];
  const headers = Array.from({ length: N }, (_, i) => `M${i + 1}`);
  // map (l,r) 1-indexed to grid coords (l-1, r-1)
  const cell = (l, r) => `${l - 1},${r - 1}`;
  const push = (states, explain, line) =>
    frames.push({ grid: show(), states: { ...states }, explain, line, headers });

  const diag = {};
  for (let l = 1; l <= N; l++) diag[cell(l, l)] = "best";
  push(diag, "A single matrix needs no multiplication, so the diagonal dp[l][l] = 0. We fill by increasing chain length.", 0);

  for (let len = 2; len <= N; len++) {
    for (let l = 1; l + len - 1 <= N; l++) {
      const r = l + len - 1;
      dp[l][r] = Infinity;
      for (let k = l; k < r; k++) {
        const cost = dp[l][k] + dp[k + 1][r] + P[l - 1] * P[k] * P[r];
        const states = { [cell(l, r)]: "current", [cell(l, k)]: "lo", [cell(k + 1, r)]: "hi" };
        if (cost < dp[l][r]) {
          dp[l][r] = cost;
          push({ ...states, [cell(l, r)]: "best" }, `dp[${l}][${r}] split at k=${k}: ${dp[l][k]} + ${dp[k + 1][r]} + ${P[l - 1]}·${P[k]}·${P[r]} = ${cost}. New best.`, 6);
        } else {
          push(states, `dp[${l}][${r}] split at k=${k}: cost ${cost} ≥ current best ${dp[l][r]}. Keep best.`, 6);
        }
      }
    }
  }
  push({ [cell(1, N)]: "found" }, `dp[1][${N}] = ${dp[1][N]} scalar multiplications — the optimal parenthesisation cost.`, 0);
  return frames;
}

export default function IntervalDPSim() {
  const frames = useMemo(() => buildFrames(), []);
  const player = useStepPlayer(frames);
  const headers = Array.from({ length: N }, (_, i) => `M${i + 1}`);
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#f59e0b"
      pseudocode={PSEUDO}
      inputPanel={
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted">dimensions p =</span>
          <span className="font-mono font-semibold">[{P.join(", ")}]</span>
          <span className="text-muted">→ matrices M1..M{N}</span>
        </div>
      }
      legend={
        <>
          <LegendItem color="#2563eb" label="dp[l][r]" />
          <LegendItem color="#0ea5e9" label="left part dp[l][k]" />
          <LegendItem color="#8b5cf6" label="right part dp[k+1][r]" />
          <LegendItem color="#10b981" label="best split" />
        </>
      }
    >
      {player.frame && (
        <GridView grid={player.frame.grid} states={player.frame.states} rowHeaders={headers} colHeaders={headers} cornerLabel="l\r" cell={50} />
      )}
    </SimulatorShell>
  );
}
