import { useMemo, useState } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";

const PSEUDO = [
  "result = 1",
  "while exp > 0:",
  "  if exp is odd: result = result * base",
  "  base = base * base",
  "  exp = exp >> 1   // divide by 2",
  "return result",
];

function buildFrames(base, exp, mod) {
  const frames = [];
  let result = 1n;
  let b = BigInt(base) % BigInt(mod);
  let e = BigInt(exp);
  const M = BigInt(mod);
  const push = (explain, line, bit) =>
    frames.push({
      result: result.toString(),
      base: b.toString(),
      exp: e.toString(),
      bits: exp.toString(2),
      explain,
      line,
      bit,
    });

  push(`Compute ${base}^${exp} mod ${mod}. Idea: square the base and halve the exponent each step (binary exponentiation).`, 0);
  while (e > 0n) {
    const odd = e % 2n === 1n;
    if (odd) {
      result = (result * b) % M;
      push(`exp=${e} is odd → multiply this power of base into result. result = ${result}.`, 2, 1);
    } else {
      push(`exp=${e} is even → skip multiply; this bit is 0.`, 2, 0);
    }
    b = (b * b) % M;
    e = e / 2n;
    push(`Square base → ${b}; halve exp → ${e}.`, 4);
  }
  push(`Done in O(log exp) multiplications. ${base}^${exp} mod ${mod} = ${result}.`, 5);
  return frames;
}

export default function FastExpSim() {
  const [p, setP] = useState({ base: 3, exp: 13, mod: 1000000007 });
  const frames = useMemo(() => buildFrames(p.base, p.exp, p.mod), [p]);
  const player = useStepPlayer(frames);
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#6366f1"
      pseudocode={PSEUDO}
      inputPanel={
        <div className="flex flex-wrap items-end gap-3">
          {[
            ["base", "Base"],
            ["exp", "Exponent"],
            ["mod", "Mod"],
          ].map(([k, label]) => (
            <label key={k}>
              <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
              <input
                className="input w-28 font-mono"
                defaultValue={p[k]}
                onBlur={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (Number.isFinite(v) && v > 0) {
                    setP((s) => ({ ...s, [k]: v }));
                    player.reset();
                  }
                }}
              />
            </label>
          ))}
        </div>
      }
    >
      {player.frame && (
        <div className="flex flex-col items-center gap-5 font-mono">
          <div className="flex gap-1.5">
            {player.frame.bits.split("").map((bit, i) => (
              <span key={i} className="grid h-8 w-8 place-items-center rounded-md border surface-sunken text-sm font-bold">
                {bit}
              </span>
            ))}
            <span className="ml-2 self-center text-xs text-faint">binary of exponent</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div className="rounded-lg surface-sunken px-4 py-3">
              <div className="text-xs text-muted">base</div>
              <div className="text-lg font-bold text-indigo-500">{player.frame.base}</div>
            </div>
            <div className="rounded-lg surface-sunken px-4 py-3">
              <div className="text-xs text-muted">exp</div>
              <div className="text-lg font-bold text-amber-500">{player.frame.exp}</div>
            </div>
            <div className="rounded-lg surface-sunken px-4 py-3">
              <div className="text-xs text-muted">result</div>
              <div className="text-lg font-bold text-emerald-500">{player.frame.result}</div>
            </div>
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
