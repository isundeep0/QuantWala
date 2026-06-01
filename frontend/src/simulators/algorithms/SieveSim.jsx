import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";

const PSEUDO = [
  "isPrime[2..N] = true",
  "for p = 2 .. sqrt(N):",
  "  if isPrime[p]:",
  "    for m = p*p, p*p+p, ... ≤ N:",
  "      isPrime[m] = false   // composite",
  "primes = indices still true",
];

function buildFrames(N) {
  const isPrime = new Array(N + 1).fill(true);
  isPrime[0] = isPrime[1] = false;
  const frames = [];
  const states = {};
  for (let i = 2; i <= N; i++) states[i] = "default";
  states[0] = states[1] = "discard";

  const push = (explain, line, cur) => frames.push({ states: { ...states }, explain, line, cur, N });

  push(`Assume every number 2..${N} is prime, then eliminate multiples.`, 0);
  for (let p = 2; p * p <= N; p++) {
    if (isPrime[p]) {
      states[p] = "found";
      push(`${p} is still marked prime → it IS prime. Cross out its multiples starting at ${p}².`, 2, p);
      for (let m = p * p; m <= N; m += p) {
        if (isPrime[m]) {
          isPrime[m] = false;
          states[m] = "discard";
        }
      }
      push(`Crossed out multiples of ${p}: ${p * p}, ${p * p + p}, …`, 4, p);
    }
  }
  for (let i = 2; i <= N; i++) if (isPrime[i]) states[i] = "found";
  const primes = [];
  for (let i = 2; i <= N; i++) if (isPrime[i]) primes.push(i);
  push(`Remaining numbers are prime: ${primes.join(", ")}.`, 5);
  return frames;
}

export default function SieveSim() {
  const [N, setN] = useState(40);
  const frames = useMemo(() => buildFrames(N), [N]);
  const player = useStepPlayer(frames);
  const cols = N <= 30 ? 6 : N <= 50 ? 8 : 10;
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#6366f1"
      pseudocode={PSEUDO}
      inputPanel={
        <div className="flex items-center gap-2">
          <span className="mr-1 text-xs font-medium text-muted">N =</span>
          {[20, 30, 40, 60].map((v) => (
            <button key={v} onClick={() => { setN(v); player.reset(); }} className={`h-9 w-12 rounded-lg text-sm font-semibold ${N === v ? "bg-indigo-500 text-white" : "surface-sunken"}`}>
              {v}
            </button>
          ))}
        </div>
      }
      legend={
        <>
          <LegendItem color="#10b981" label="prime" />
          <LegendItem color="rgb(var(--border-strong))" label="composite / removed" />
        </>
      }
    >
      {player.frame && (
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: N - 1 }).map((_, k) => {
            const num = k + 2;
            const st = player.frame.states[num];
            const isPrime = st === "found";
            const isComposite = st === "discard";
            const isCur = player.frame.cur === num;
            return (
              <motion.div
                key={num}
                animate={{
                  backgroundColor: isPrime ? "#10b981" : isComposite ? "rgb(var(--bg-sunken))" : "rgb(var(--bg-elev))",
                  color: isPrime ? "#fff" : isComposite ? "rgb(var(--text-faint))" : "rgb(var(--text))",
                  scale: isCur ? 1.12 : 1,
                }}
                className="grid h-9 w-9 place-items-center rounded-md border font-mono text-sm font-semibold"
                style={{ borderColor: isCur ? "#6366f1" : "rgb(var(--border))", textDecoration: isComposite ? "line-through" : "none" }}
              >
                {num}
              </motion.div>
            );
          })}
        </div>
      )}
    </SimulatorShell>
  );
}
