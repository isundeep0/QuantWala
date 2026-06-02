import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";

// Jobs with processing time p and weight w. Minimise Σ w·(completion time).
const JOBS = [
  { id: "A", p: 3, w: 1 },
  { id: "B", p: 1, w: 2 },
  { id: "C", p: 2, w: 2 },
  { id: "D", p: 4, w: 3 },
];

const PSEUDO = [
  "// minimise Σ wᵢ · Cᵢ  (Cᵢ = completion time)",
  "sort jobs by ratio p / w  (ascending)",
  "t = 0, cost = 0",
  "for job in order:",
  "  t += job.p; cost += job.w · t",
];

const COLORS = ["#f97316", "#2563eb", "#10b981", "#8b5cf6", "#ec4899"];

function buildFrames() {
  const sorted = [...JOBS].sort((a, b) => a.p / a.w - b.p / b.w);
  const frames = [];
  let t = 0;
  let cost = 0;
  const placed = [];
  const snap = (cur, explain, line) => frames.push({ sorted, placed: [...placed], cur, t, cost, explain, line });

  snap(-1, `Schedule jobs to minimise total weighted completion time. The exchange argument proves sorting by the ratio p/w is optimal.`, 0);
  snap(-1, `Sorted by p/w: ${sorted.map((j) => `${j.id}(${(j.p / j.w).toFixed(2)})`).join(", ")}. Smallest ratio first.`, 1);
  for (let i = 0; i < sorted.length; i++) {
    const j = sorted[i];
    t += j.p;
    cost += j.w * t;
    placed.push({ ...j, start: t - j.p, end: t });
    snap(i, `Run ${j.id} (p=${j.p}, w=${j.w}). It finishes at t=${t}; add w·C = ${j.w}·${t} = ${j.w * t}. Total cost = ${cost}.`, 4);
  }
  snap(-1, `Minimum total weighted completion time = ${cost}. Swapping any adjacent pair out of ratio order can only increase it.`, 0);
  return frames;
}

export default function ExchangeArgumentSim() {
  const frames = useMemo(() => buildFrames(), []);
  const player = useStepPlayer(frames);
  const f = player.frame;
  const totalP = JOBS.reduce((s, j) => s + j.p, 0);
  const W = 460;
  const x = (t) => 10 + (t / totalP) * (W - 20);
  return (
    <SimulatorShell
      player={player}
      frame={f}
      accent="#f97316"
      pseudocode={PSEUDO}
      legend={<><LegendItem color="#f97316" label="just scheduled" /><LegendItem color="#2563eb" label="on the timeline" /></>}
    >
      {f && (
        <div className="flex w-full flex-col items-center gap-4">
          {/* sorted queue */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-muted">order (p/w):</span>
            {f.sorted.map((j, i) => (
              <span key={j.id} className={`rounded px-2 py-1 font-mono ${i === f.cur ? "bg-orange-500 text-white" : "surface-sunken text-muted"}`}>
                {j.id} {(j.p / j.w).toFixed(2)}
              </span>
            ))}
          </div>
          {/* timeline */}
          <svg viewBox={`0 0 ${W} 80`} className="h-auto w-full max-w-[560px]">
            {Array.from({ length: totalP + 1 }).map((_, t) => (
              <g key={t}>
                <line x1={x(t)} y1={18} x2={x(t)} y2={56} stroke="rgb(var(--border))" strokeWidth="1" />
                <text x={x(t)} y={14} textAnchor="middle" className="fill-current font-mono text-[9px] text-faint">{t}</text>
              </g>
            ))}
            {f.placed.map((j, i) => (
              <g key={j.id}>
                <rect x={x(j.start)} y={22} width={x(j.end) - x(j.start) - 1} height={30} rx="4" fill={COLORS[i % COLORS.length]} />
                <text x={(x(j.start) + x(j.end)) / 2} y={41} textAnchor="middle" className="font-mono text-[11px] font-bold" fill="#fff">
                  {j.id}
                </text>
              </g>
            ))}
          </svg>
          <div className="rounded-lg surface-sunken px-4 py-1.5 font-mono text-sm">
            t = <span className="font-bold">{f.t}</span> · total weighted cost = <span className="font-bold text-orange-500">{f.cost}</span>
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
