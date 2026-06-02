import { useMemo, useState } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import GridView from "../views/GridView.jsx";

const PSEUDO = [
  "dp[0] = 0; dp[1..amount] = ∞",
  "for a in 1..amount:",
  "  for coin c in coins:",
  "    if c <= a:",
  "      dp[a] = min(dp[a], dp[a-c] + 1)",
  "return dp[amount]",
];

function buildFrames(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  const frames = [];
  const push = (states, explain, line) =>
    frames.push({ grid: [dp.slice()], states: { ...states }, explain, line });

  push({ "0,0": "best" }, `dp[a] = fewest coins to make amount a. dp[0] = 0 (no coins needed); everything else starts at ∞.`, 0);
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c > a) continue;
      const states = { [`0,${a}`]: "current", [`0,${a - c}`]: "lo" };
      const cand = dp[a - c] === Infinity ? Infinity : dp[a - c] + 1;
      if (cand < dp[a]) {
        dp[a] = cand;
        push({ ...states, [`0,${a}`]: "best" }, `a=${a}, coin ${c}: dp[${a - c}] + 1 = ${cand} improves dp[${a}] → ${dp[a]}.`, 4);
      } else {
        push(states, `a=${a}, coin ${c}: dp[${a - c}] + 1 = ${cand === Infinity ? "∞" : cand} doesn't beat dp[${a}] = ${dp[a] === Infinity ? "∞" : dp[a]}.`, 4);
      }
    }
  }
  push({ [`0,${amount}`]: "found" }, `dp[${amount}] = ${dp[amount] === Infinity ? "impossible" : dp[amount]} — the minimum number of coins.`, 5);
  return frames;
}

export default function CoinChangeSim() {
  const [coins] = useState([1, 3, 4]);
  const [amount] = useState(11);
  const frames = useMemo(() => buildFrames(coins, amount), [coins, amount]);
  const player = useStepPlayer(frames);
  const headers = Array.from({ length: amount + 1 }, (_, i) => i);
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#f59e0b"
      pseudocode={PSEUDO}
      inputPanel={
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted">coins =</span>
          <span className="font-mono font-semibold">[{coins.join(", ")}]</span>
          <span className="text-muted">target =</span>
          <span className="font-mono font-semibold">{amount}</span>
        </div>
      }
      legend={
        <>
          <LegendItem color="#2563eb" label="dp[a] being filled" />
          <LegendItem color="#0ea5e9" label="dp[a-c] (subproblem)" />
          <LegendItem color="#10b981" label="improved / answer" />
        </>
      }
    >
      {player.frame && (
        <GridView grid={player.frame.grid} states={player.frame.states} colHeaders={headers} rowHeaders={["coins"]} cornerLabel="a" cell={40} />
      )}
    </SimulatorShell>
  );
}
