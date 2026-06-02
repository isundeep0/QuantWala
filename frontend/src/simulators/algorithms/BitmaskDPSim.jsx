import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import GridView from "../views/GridView.jsx";

const CITIES = ["A", "B", "C", "D"];
const N = CITIES.length;
const DIST = [
  [0, 10, 15, 20],
  [10, 0, 35, 25],
  [15, 35, 0, 30],
  [20, 25, 30, 0],
];

const PSEUDO = [
  "dp[mask][i] = min cost to visit 'mask', end at i",
  "dp[{0}][0] = 0",
  "for mask, for i in mask:",
  "  for j not in mask:",
  "    nm = mask | (1<<j)",
  "    dp[nm][j] = min(dp[nm][j], dp[mask][i]+d[i][j])",
  "answer = min(dp[full][i] + d[i][0])",
];

const bin = (m) => m.toString(2).padStart(N, "0").split("").reverse().join("");

function buildFrames() {
  const SZ = 1 << N;
  const dp = Array.from({ length: SZ }, () => new Array(N).fill(Infinity));
  dp[1][0] = 0;
  const frames = [];
  const rowHeaders = Array.from({ length: SZ }, (_, m) => bin(m));
  const push = (states, explain, line) =>
    frames.push({ grid: dp.map((r) => [...r]), states: { ...states }, explain, line, rowHeaders });

  push({ "1,0": "best" }, `dp[mask][i] = cheapest way to visit set 'mask' and stop at city i. Start: visited only {A}, at A → dp[0001][A] = 0.`, 1);
  for (let mask = 1; mask < SZ; mask++) {
    if (!(mask & 1)) continue; // tours start at city 0
    for (let i = 0; i < N; i++) {
      if (!(mask & (1 << i)) || dp[mask][i] === Infinity) continue;
      for (let j = 0; j < N; j++) {
        if (mask & (1 << j)) continue;
        const nm = mask | (1 << j);
        const cand = dp[mask][i] + DIST[i][j];
        const states = { [`${mask},${i}`]: "lo", [`${nm},${j}`]: "current" };
        if (cand < dp[nm][j]) {
          dp[nm][j] = cand;
          push({ ...states, [`${nm},${j}`]: "best" }, `From ${bin(mask)}@${CITIES[i]} go to ${CITIES[j]}: ${dp[mask][i]} + ${DIST[i][j]} = ${cand}. Update dp[${bin(nm)}][${CITIES[j]}].`, 5);
        }
      }
    }
  }
  const full = SZ - 1;
  let best = Infinity;
  let bestI = 0;
  for (let i = 0; i < N; i++) {
    const tour = dp[full][i] + DIST[i][0];
    if (tour < best) {
      best = tour;
      bestI = i;
    }
  }
  push({ [`${full},${bestI}`]: "found" }, `Close the loop: best is end at ${CITIES[bestI]} then back to A = ${dp[full][bestI]} + ${DIST[bestI][0]} = ${best}. Optimal TSP tour cost.`, 6);
  return frames;
}

export default function BitmaskDPSim() {
  const frames = useMemo(() => buildFrames(), []);
  const player = useStepPlayer(frames);
  const rowHeaders = Array.from({ length: 1 << N }, (_, m) => bin(m));
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#f59e0b"
      pseudocode={PSEUDO}
      inputPanel={
        <div className="text-sm text-muted">
          4-city Travelling Salesman. <span className="font-mono text-[color:rgb(var(--text))]">mask</span> bits = visited cities (A=bit&nbsp;0). Rows are subsets, columns the ending city.
        </div>
      }
      legend={
        <>
          <LegendItem color="#0ea5e9" label="dp[mask][i] (from)" />
          <LegendItem color="#2563eb" label="dp[nm][j] (to)" />
          <LegendItem color="#10b981" label="updated / answer" />
        </>
      }
    >
      {player.frame && (
        <div className="max-h-[360px] overflow-auto">
          <GridView grid={player.frame.grid} states={player.frame.states} rowHeaders={rowHeaders} colHeaders={CITIES} cornerLabel="mask" cell={34} />
        </div>
      )}
    </SimulatorShell>
  );
}
