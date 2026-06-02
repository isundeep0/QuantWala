import { useMemo, useState } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";

const PSEUDO = [
  "gcd(a, b):",
  "  while b != 0:",
  "    r = a mod b",
  "    a = b",
  "    b = r",
  "  return a",
];

function buildFrames(a0, b0) {
  const frames = [];
  let a = a0;
  let b = b0;
  const max = Math.max(a0, b0, 1);
  const snap = (explain, line, r) => frames.push({ a, b, r, max, explain, line });

  snap(`gcd(${a}, ${b}): repeatedly replace (a, b) with (b, a mod b). The geometric idea: tile an a×1 strip with b-length tiles; the leftover is a mod b.`, 0);
  let safety = 0;
  while (b !== 0 && safety++ < 50) {
    const r = a % b;
    const q = Math.floor(a / b);
    snap(`${a} = ${q}·${b} + ${r}, so ${a} mod ${b} = ${r}.`, 2, r);
    a = b;
    b = r;
    snap(`Shift down: (a, b) becomes (${a}, ${b}).`, 4, r);
  }
  snap(`b reached 0 → gcd = ${a}. (lcm would be a·b / gcd.)`, 5);
  return frames;
}

function Bars({ frame }) {
  const { a, b, max } = frame;
  const W = 460;
  const scale = W / max;
  const q = b ? Math.floor(a / b) : 0;
  const r = b ? a % b : 0;
  return (
    <svg viewBox={`0 0 ${W + 20} 130`} className="h-auto w-full max-w-[560px]">
      {/* a bar split into q tiles of width b + remainder */}
      {b > 0 &&
        Array.from({ length: q }).map((_, k) => (
          <rect key={k} x={10 + k * b * scale} y={20} width={b * scale - 2} height={34} rx="5" fill="#6366f133" stroke="#6366f1" strokeWidth="2" />
        ))}
      {b > 0 && r > 0 && (
        <rect x={10 + q * b * scale} y={20} width={r * scale - 2} height={34} rx="5" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
      )}
      {b === 0 && <rect x={10} y={20} width={a * scale - 2} height={34} rx="5" fill="#10b981" stroke="#059669" strokeWidth="2" />}
      <text x={12} y={14} className="fill-current font-mono text-[11px] font-bold">a = {a}{b > 0 && r > 0 ? `  (${q} tiles of ${b} + remainder ${r})` : ""}</text>

      {/* b bar */}
      {b > 0 && (
        <>
          <rect x={10} y={72} width={b * scale - 2} height={34} rx="5" fill="#6366f1" stroke="#4f46e5" strokeWidth="2" />
          <text x={12} y={66} className="fill-current font-mono text-[11px] font-bold">b = {b}</text>
        </>
      )}
    </svg>
  );
}

export default function GcdSim() {
  const [a] = useState(48);
  const [b] = useState(36);
  const frames = useMemo(() => buildFrames(a, b), [a, b]);
  const player = useStepPlayer(frames);
  const f = player.frame;
  return (
    <SimulatorShell
      player={player}
      frame={f}
      accent="#6366f1"
      pseudocode={PSEUDO}
      inputPanel={
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted">gcd(</span>
          <span className="font-mono font-semibold">{a}</span>
          <span className="text-muted">,</span>
          <span className="font-mono font-semibold">{b}</span>
          <span className="text-muted">)</span>
        </div>
      }
      legend={
        <>
          <LegendItem color="#6366f1" label="b (divisor / tile)" />
          <LegendItem color="#f59e0b" label="remainder a mod b" />
          <LegendItem color="#10b981" label="gcd" />
        </>
      }
    >
      {f && (
        <div className="flex flex-col items-center gap-4">
          <Bars frame={f} />
          <div className="flex gap-5 font-mono text-sm">
            <div className="rounded-lg surface-sunken px-4 py-2">a = <span className="font-bold text-indigo-500">{f.a}</span></div>
            <div className="rounded-lg surface-sunken px-4 py-2">b = <span className="font-bold text-indigo-500">{f.b}</span></div>
            {f.r !== undefined && f.b !== 0 && (
              <div className="rounded-lg surface-sunken px-4 py-2">r = <span className="font-bold text-amber-500">{f.r}</span></div>
            )}
          </div>
        </div>
      )}
    </SimulatorShell>
  );
}
