import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";

const ACTS = [
  { s: 1, e: 4 },
  { s: 3, e: 5 },
  { s: 0, e: 6 },
  { s: 5, e: 7 },
  { s: 3, e: 8 },
  { s: 5, e: 9 },
  { s: 6, e: 10 },
  { s: 8, e: 11 },
].sort((a, b) => a.e - b.e);

const MAXT = Math.max(...ACTS.map((a) => a.e));

const PSEUDO = [
  "sort activities by finish time",
  "last_end = -∞, count = 0",
  "for (s, e) in activities:",
  "  if s >= last_end:",
  "    pick it; count++; last_end = e",
];

function buildFrames() {
  const status = ACTS.map(() => "pending");
  const frames = [];
  let lastEnd = -Infinity;
  let count = 0;
  const snap = (cur, explain, line) =>
    frames.push({ status: [...status], cur, lastEnd: lastEnd === -Infinity ? null : lastEnd, count, explain, line });

  snap(-1, "Sort activities by finish time. Greedily keep each activity that starts after the last chosen one ends.", 0);
  for (let i = 0; i < ACTS.length; i++) {
    const { s, e } = ACTS[i];
    const prevEnd = lastEnd === -Infinity ? "−∞" : lastEnd;
    if (s >= lastEnd) {
      status[i] = "chosen";
      count++;
      lastEnd = e;
      snap(i, `Activity [${s}, ${e}] starts at ${s} ≥ last finish ${prevEnd} → pick it. Now ${count} chosen, last_end = ${e}.`, 4);
    } else {
      status[i] = "rejected";
      snap(i, `Activity [${s}, ${e}] starts at ${s} < last finish ${lastEnd} → overlaps, skip it.`, 3);
    }
  }
  snap(-1, `Maximum non-overlapping activities = ${count}. Earliest-finish-first is provably optimal.`, 0);
  return frames;
}

const FILL = { chosen: "#10b981", rejected: "#ef4444", current: "#2563eb", pending: "rgb(var(--border-strong))" };

export default function ActivitySelectionSim() {
  const frames = useMemo(() => buildFrames(), []);
  const player = useStepPlayer(frames);
  const f = player.frame;
  const W = 460;
  const padL = 30;
  const x = (t) => padL + (t / MAXT) * (W - padL - 10);
  const rowH = 26;
  return (
    <SimulatorShell
      player={player}
      frame={f}
      accent="#f97316"
      pseudocode={PSEUDO}
      legend={
        <>
          <LegendItem color="#2563eb" label="evaluating" />
          <LegendItem color="#10b981" label="chosen" />
          <LegendItem color="#ef4444" label="rejected (overlap)" />
        </>
      }
    >
      {f && (
        <div className="flex w-full flex-col items-center gap-3">
          <svg viewBox={`0 0 ${W} ${ACTS.length * rowH + 30}`} className="h-auto w-full max-w-[560px]">
            {/* time axis ticks */}
            {Array.from({ length: MAXT + 1 }).map((_, t) => (
              <g key={t}>
                <line x1={x(t)} y1={16} x2={x(t)} y2={ACTS.length * rowH + 22} stroke="rgb(var(--border))" strokeWidth="1" />
                <text x={x(t)} y={12} textAnchor="middle" className="fill-current font-mono text-[9px] text-faint">{t}</text>
              </g>
            ))}
            {/* last_end marker */}
            {f.lastEnd !== null && (
              <line x1={x(f.lastEnd)} y1={16} x2={x(f.lastEnd)} y2={ACTS.length * rowH + 22} stroke="#10b981" strokeWidth="2" strokeDasharray="4 3" />
            )}
            {ACTS.map((a, i) => {
              const st = i === f.cur ? "current" : f.status[i];
              const fill = FILL[st];
              const y = 22 + i * rowH;
              return (
                <g key={i}>
                  <rect x={x(a.s)} y={y} width={x(a.e) - x(a.s)} height={rowH - 8} rx="4" fill={fill} opacity={st === "pending" ? 0.4 : 1} />
                  <text x={x(a.s) + 4} y={y + 12} className="font-mono text-[10px] font-bold" fill={st === "pending" ? "rgb(var(--text-muted))" : "#fff"}>
                    [{a.s},{a.e}]
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="rounded-lg surface-sunken px-4 py-1.5 font-mono text-sm">
            chosen = <span className="font-bold text-emerald-500">{f.count}</span>
            {f.lastEnd !== null && <span className="ml-3 text-muted">last_end = {f.lastEnd}</span>}
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
