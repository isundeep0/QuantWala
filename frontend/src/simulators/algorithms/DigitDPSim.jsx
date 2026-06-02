import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import ArrayView from "../views/ArrayView.jsx";

// Concrete task: count integers in [0, N] that contain no digit '4'.
const N_STR = "325";
const FORBID = 4;

const PSEUDO = [
  "free[len] = 1",
  "free[pos] = 9 · free[pos+1]   // 0-9 minus '4'",
  "ans = 0; walk N left→right:",
  "  for d < digit[pos], d ≠ 4:",
  "    ans += free[pos+1]   // suffix is free",
  "  if digit[pos] == 4: stop matching",
  "if prefix valid: ans += 1   // N itself",
];

function buildFrames() {
  const digits = N_STR.split("").map(Number);
  const len = digits.length;
  const free = new Array(len + 1).fill(0);
  free[len] = 1;
  const frames = [];
  const push = (extra) =>
    frames.push({ digits, free: [...free], ...extra });

  push({ pos: -1, phase: "A", ans: 0, explain: `Goal: count numbers in [0, ${N_STR}] with no digit '4'. First, free[pos] = how many valid ways to fill an unconstrained suffix from position pos.`, line: 0 });
  for (let pos = len - 1; pos >= 0; pos--) {
    free[pos] = 9 * free[pos + 1];
    push({ pos, phase: "A", ans: 0, explain: `free[${pos}] = 9 × free[${pos + 1}] = ${free[pos]} (each free slot picks any digit except '4').`, line: 1 });
  }

  let ans = 0;
  let valid = true;
  push({ pos: -1, phase: "B", ans, explain: `Now walk N's digits. At each position, count numbers that go strictly below N here (then the rest is free).`, line: 2 });
  for (let pos = 0; pos < len; pos++) {
    const lower = [];
    for (let d = 0; d < digits[pos]; d++) if (d !== FORBID) lower.push(d);
    const gain = lower.length * free[pos + 1];
    ans += gain;
    push({ pos, phase: "B", ans, explain: `Position ${pos} (digit ${digits[pos]}): smaller choices {${lower.join(",")}} each free the ${len - pos - 1} trailing slots → +${lower.length}×${free[pos + 1]} = ${gain}. ans = ${ans}.`, line: 4 });
    if (digits[pos] === FORBID) {
      valid = false;
      push({ pos, phase: "B", ans, explain: `Digit at position ${pos} is '4' (forbidden) — the tight prefix can't continue, so stop.`, line: 5 });
      break;
    }
  }
  if (valid) {
    ans += 1;
    push({ pos: len - 1, phase: "B", ans, explain: `N = ${N_STR} itself has no '4', so it counts too → ans = ${ans}.`, line: 6 });
  }
  push({ pos: -1, phase: "done", ans, explain: `${ans} integers in [0, ${N_STR}] avoid the digit '4'.`, line: 6 });
  return frames;
}

export default function DigitDPSim() {
  const frames = useMemo(() => buildFrames(), []);
  const player = useStepPlayer(frames);
  const f = player.frame;
  return (
    <SimulatorShell
      player={player}
      frame={f}
      accent="#f59e0b"
      pseudocode={PSEUDO}
      inputPanel={
        <div className="text-sm text-muted">
          Count integers in <span className="font-mono text-[color:rgb(var(--text))]">[0, {N_STR}]</span> with no digit{" "}
          <span className="font-mono font-semibold text-amber-500">4</span>.
        </div>
      }
      legend={
        <>
          <LegendItem color="#f59e0b" label="current position" />
          <LegendItem color="#10b981" label="free-suffix count" />
        </>
      }
    >
      {f && (
        <div className="flex flex-col items-center gap-5">
          <ArrayView
            array={f.digits}
            states={f.pos >= 0 ? { [f.pos]: "mid" } : {}}
            pointers={f.pos >= 0 ? [{ index: f.pos, label: "pos", color: "#f59e0b" }] : []}
          />
          <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
            <span className="text-muted">free[]:</span>
            {f.free.map((v, i) => (
              <span key={i} className="rounded bg-emerald-500/15 px-2 py-1 text-emerald-600 dark:text-emerald-400">
                {v}
              </span>
            ))}
          </div>
          <div className="rounded-lg surface-sunken px-5 py-2 font-mono text-sm">
            answer = <span className="font-bold text-amber-500">{f.ans}</span>
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
