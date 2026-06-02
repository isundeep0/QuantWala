import { useMemo } from "react";
import { motion } from "framer-motion";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";

const ROWS = 7;

const PSEUDO = [
  "C(n, 0) = C(n, n) = 1   // edges",
  "C(n, k) = C(n-1, k-1) + C(n-1, k)",
  "// each entry is the sum of the two above it",
];

function buildFrames() {
  const tri = [];
  for (let n = 0; n < ROWS; n++) tri.push(new Array(n + 1).fill(null));
  const frames = [];
  const snap = (states, explain, line) =>
    frames.push({ tri: tri.map((r) => [...r]), states: { ...states }, explain, line });

  snap({}, "Pascal's triangle: row n holds C(n,0)…C(n,n). The edges are 1, and every interior entry is the sum of the two directly above.", 0);
  for (let n = 0; n < ROWS; n++) {
    for (let k = 0; k <= n; k++) {
      if (k === 0 || k === n) {
        tri[n][k] = 1;
        snap({ [`${n},${k}`]: "best" }, `C(${n},${k}) sits on an edge → 1.`, 0);
      } else {
        tri[n][k] = tri[n - 1][k - 1] + tri[n - 1][k];
        snap(
          { [`${n},${k}`]: "current", [`${n - 1},${k - 1}`]: "lo", [`${n - 1},${k}`]: "hi" },
          `C(${n},${k}) = C(${n - 1},${k - 1}) + C(${n - 1},${k}) = ${tri[n - 1][k - 1]} + ${tri[n - 1][k]} = ${tri[n][k]}.`,
          1,
        );
      }
    }
  }
  snap({}, `Row ${ROWS - 1} gives the binomial coefficients C(${ROWS - 1},k). In code we precompute factorials + modular inverses for O(1) C(n,k).`, 0);
  return frames;
}

const COLOR = {
  current: "#2563eb",
  lo: "#0ea5e9",
  hi: "#8b5cf6",
  best: "#10b981",
};

export default function CombinatoricsSim() {
  const frames = useMemo(() => buildFrames(), []);
  const player = useStepPlayer(frames);
  const f = player.frame;
  return (
    <SimulatorShell
      player={player}
      frame={f}
      accent="#6366f1"
      pseudocode={PSEUDO}
      legend={
        <>
          <LegendItem color="#2563eb" label="computing C(n,k)" />
          <LegendItem color="#0ea5e9" label="upper-left" />
          <LegendItem color="#8b5cf6" label="upper-right" />
        </>
      }
    >
      {f && (
        <div className="flex flex-col items-center gap-1.5">
          {f.tri.map((row, n) => (
            <div key={n} className="flex justify-center gap-1.5">
              {row.map((val, k) => {
                const st = f.states[`${n},${k}`];
                const bg = st ? COLOR[st] : null;
                return (
                  <motion.div
                    key={k}
                    animate={{
                      backgroundColor: bg || "rgb(var(--bg-sunken))",
                      color: bg ? "#fff" : val === null ? "rgb(var(--text-faint))" : "rgb(var(--text))",
                    }}
                    className="grid h-9 w-11 place-items-center rounded-lg border font-mono text-sm font-semibold"
                    style={{ borderColor: bg || "rgb(var(--border))" }}
                  >
                    {val === null ? "·" : val}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </SimulatorShell>
  );
}
