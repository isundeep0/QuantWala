import { useMemo, useState } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import ArrayView from "../views/ArrayView.jsx";

const PSEUDO = [
  "result = 1, base = a mod m",
  "while n > 0:",
  "  if n is odd: result = result·base mod m",
  "  base = base·base mod m",
  "  n = n >> 1",
  "return result",
];

function buildFrames(a, n, m) {
  const bits = n.toString(2).split("").map(Number); // MSB first
  const frames = [];
  let result = 1;
  let base = a % m;
  let nn = n;
  let processed = 0; // count of bits consumed from LSB
  const snap = (explain, line) => {
    const idx = bits.length - 1 - processed; // position of bit being processed (MSB-first array)
    frames.push({ bits, active: idx, result, base, n: nn, explain, line });
  };

  snap(`Compute ${a}^${n} mod ${m} by squaring. result = 1, base = ${a} mod ${m} = ${base}. We read n's bits from the least significant.`, 0);
  while (nn > 0) {
    const odd = nn & 1;
    if (odd) {
      const old = result;
      result = (result * base) % m;
      snap(`Bit = 1 → multiply result in: ${old}·${base} mod ${m} = ${result}.`, 2);
    } else {
      snap(`Bit = 0 → skip the multiply; result stays ${result}.`, 2);
    }
    const oldBase = base;
    base = (base * base) % m;
    nn = nn >> 1;
    processed++;
    snap(`Square the base for the next bit: ${oldBase}² mod ${m} = ${base}. n → ${nn}.`, 3);
  }
  snap(`n is 0 → done. ${a}^${n} mod ${m} = ${result}.`, 5);
  return frames;
}

export default function ModularSim() {
  const [a] = useState(3);
  const [n] = useState(13);
  const [m] = useState(7);
  const frames = useMemo(() => buildFrames(a, n, m), [a, n, m]);
  const player = useStepPlayer(frames);
  const f = player.frame;
  return (
    <SimulatorShell
      player={player}
      frame={f}
      accent="#6366f1"
      pseudocode={PSEUDO}
      inputPanel={
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono font-semibold">{a}</span>
          <sup className="font-mono font-semibold">{n}</sup>
          <span className="text-muted">mod</span>
          <span className="font-mono font-semibold">{m}</span>
          <span className="ml-2 text-muted">via fast (binary) exponentiation</span>
        </div>
      }
      legend={
        <>
          <LegendItem color="#f59e0b" label="bit being processed" />
          <LegendItem color="#10b981" label="result accumulator" />
        </>
      }
    >
      {f && (
        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-faint">n = {n} in binary (read right → left)</span>
            <ArrayView array={f.bits} states={f.active >= 0 ? { [f.active]: "mid" } : {}} cellSize={38} indices={false} />
          </div>
          <div className="flex gap-5 font-mono text-sm">
            <div className="rounded-lg surface-sunken px-4 py-2">result = <span className="font-bold text-emerald-500">{f.result}</span></div>
            <div className="rounded-lg surface-sunken px-4 py-2">base = <span className="font-bold text-indigo-500">{f.base}</span></div>
            <div className="rounded-lg surface-sunken px-4 py-2">n = <span className="font-bold">{f.n}</span></div>
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
