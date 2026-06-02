import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import GridView from "../views/GridView.jsx";

const N = 4;
const NAMES = ["A", "B", "C", "D"];
// Directed weighted edges; missing pairs start at ∞.
const EDGES = [
  [0, 1, 3],
  [0, 3, 7],
  [1, 0, 8],
  [1, 2, 2],
  [2, 0, 5],
  [2, 3, 1],
  [3, 0, 2],
];

const PSEUDO = [
  "for k in 0..n-1:        // intermediate vertex",
  "  for i in 0..n-1:",
  "    for j in 0..n-1:",
  "      if dist[i][k]+dist[k][j] < dist[i][j]:",
  "        dist[i][j] = dist[i][k]+dist[k][j]",
];

function initDist() {
  const d = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (i === j ? 0 : Infinity)));
  for (const [u, v, w] of EDGES) d[u][v] = w;
  return d;
}

function buildFrames() {
  const dist = initDist();
  const frames = [];
  const push = (states, explain, line) =>
    frames.push({ grid: dist.map((r) => r.map((x) => (x === Infinity ? "∞" : x))), states: { ...states }, explain, line });

  push({}, "Start with the direct-edge matrix: dist[i][j] = edge weight, 0 on the diagonal, ∞ otherwise.", 0);
  for (let k = 0; k < N; k++) {
    push({ ...rowCol(k) }, `Allow vertex ${NAMES[k]} as an intermediate stop. Try routing every pair i→j through ${NAMES[k]}.`, 0);
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (i === j || i === k || j === k) continue;
        const through = dist[i][k] + dist[k][j];
        const states = { [`${i},${j}`]: "current", [`${i},${k}`]: "lo", [`${k},${j}`]: "hi" };
        if (through < dist[i][j]) {
          const old = dist[i][j];
          dist[i][j] = through;
          push({ ...states, [`${i},${j}`]: "best" }, `${NAMES[i]}→${NAMES[k]}→${NAMES[j]} = ${through} beats ${old === Infinity ? "∞" : old}. Update dist[${NAMES[i]}][${NAMES[j]}].`, 4);
        } else {
          push(states, `${NAMES[i]}→${NAMES[k]}→${NAMES[j]} = ${through === Infinity ? "∞" : through} ≥ current ${dist[i][j] === Infinity ? "∞" : dist[i][j]}. Keep it.`, 3);
        }
      }
    }
  }
  push({}, "After trying every vertex as an intermediate, the matrix holds all-pairs shortest paths.", 0);
  return frames;
}

function rowCol(k) {
  const s = {};
  for (let i = 0; i < N; i++) {
    s[`${k},${i}`] = "frontier";
    s[`${i},${k}`] = "frontier";
  }
  return s;
}

export default function FloydWarshallSim() {
  const frames = useMemo(() => buildFrames(), []);
  const player = useStepPlayer(frames);
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#22c55e"
      pseudocode={PSEUDO}
      legend={
        <>
          <LegendItem color="#2563eb" label="dist[i][j] (target)" />
          <LegendItem color="#0ea5e9" label="dist[i][k]" />
          <LegendItem color="#8b5cf6" label="dist[k][j]" />
          <LegendItem color="#10b981" label="improved" />
        </>
      }
    >
      {player.frame && (
        <GridView
          grid={player.frame.grid}
          states={player.frame.states}
          rowHeaders={NAMES}
          colHeaders={NAMES}
          cornerLabel="i\j"
          cell={46}
        />
      )}
    </SimulatorShell>
  );
}
