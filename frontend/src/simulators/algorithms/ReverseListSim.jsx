import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";

const VALUES = [1, 2, 3, 4, 5];

const PSEUDO = [
  "prev = null, cur = head",
  "while cur:",
  "  next = cur.next      // save",
  "  cur.next = prev      // flip pointer",
  "  prev = cur           // advance prev",
  "  cur = next           // advance cur",
  "return prev            // new head",
];

function buildFrames() {
  const n = VALUES.length;
  const frames = [];
  let prev = -1; // index, -1 = null
  let cur = 0;
  // reversed.has(i) => node i's pointer now goes to i-1 (or null)
  const reversed = new Set();
  const snap = (explain, line, next) =>
    frames.push({ prev, cur, next: next ?? null, reversed: new Set(reversed), explain, line });

  snap("Reverse in place by walking once and flipping each node's next pointer. prev starts at null.", 0);
  while (cur !== -1) {
    const next = cur + 1 < n ? cur + 1 : -1;
    snap(`Save next = ${next === -1 ? "null" : `node ${next + 1}`} before we overwrite cur.next.`, 2, next);
    reversed.add(cur);
    snap(`Flip: node ${cur + 1}.next now points to ${prev === -1 ? "null" : `node ${prev + 1}`}.`, 3, next);
    prev = cur;
    cur = next;
    snap(`Advance: prev = node ${prev + 1}, cur = ${cur === -1 ? "null" : `node ${cur + 1}`}.`, 5, next);
  }
  snap(`cur is null → done. prev = node ${prev + 1} is the new head; the list now runs ${[...VALUES].reverse().join(" → ")}.`, 6, null);
  return frames;
}

function ListView({ frame }) {
  const n = VALUES.length;
  const R = 22;
  const gap = 96;
  const width = n * gap + 30;
  const y = 80;
  const nodeX = (i) => 28 + i * gap + R;
  return (
    <svg viewBox={`0 0 ${width} 150`} className="h-auto w-full max-w-[680px]">
      <defs>
        <marker id="rl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="rgb(var(--text-faint))" />
        </marker>
      </defs>
      {VALUES.map((_, i) => {
        if (frame.reversed.has(i)) {
          if (i === 0) return null; // points to null
          const x1 = nodeX(i) - R;
          const x2 = nodeX(i - 1) + R;
          return <line key={i} x1={x1} y1={y} x2={x2} y2={y} stroke="#8b5cf6" strokeWidth="2.5" markerEnd="url(#rl)" />;
        }
        if (i === n - 1) return null;
        const x1 = nodeX(i) + R;
        const x2 = nodeX(i + 1) - R;
        return <line key={i} x1={x1} y1={y} x2={x2} y2={y} stroke="rgb(var(--border-strong))" strokeWidth="2" markerEnd="url(#rl)" />;
      })}
      {VALUES.map((v, i) => {
        const isPrev = frame.prev === i;
        const isCur = frame.cur === i;
        const isNext = frame.next === i;
        const fill = isCur ? "#2563eb" : isPrev ? "#10b981" : isNext ? "#f59e0b" : "rgb(var(--bg-sunken))";
        const fg = isCur || isPrev || isNext ? "#fff" : "rgb(var(--text))";
        return (
          <g key={i}>
            <circle cx={nodeX(i)} cy={y} r={R} fill={fill} stroke="rgb(var(--border-strong))" strokeWidth="2" />
            <text x={nodeX(i)} y={y} dy="4.5" textAnchor="middle" fontWeight="700" style={{ fill: fg }} className="font-mono text-sm">
              {v}
            </text>
            {isPrev && <text x={nodeX(i)} y={y - 34} textAnchor="middle" className="font-mono text-[11px] font-bold" fill="#10b981">prev</text>}
            {isCur && <text x={nodeX(i)} y={y - 34} textAnchor="middle" className="font-mono text-[11px] font-bold" fill="#2563eb">cur</text>}
            {isNext && !isCur && <text x={nodeX(i)} y={y + 44} textAnchor="middle" className="font-mono text-[11px] font-bold" fill="#f59e0b">next</text>}
          </g>
        );
      })}
    </svg>
  );
}

export default function ReverseListSim() {
  const frames = useMemo(() => buildFrames(), []);
  const player = useStepPlayer(frames);
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#06b6d4"
      pseudocode={PSEUDO}
      legend={
        <>
          <LegendItem color="#10b981" label="prev" />
          <LegendItem color="#2563eb" label="cur" />
          <LegendItem color="#f59e0b" label="next" />
          <LegendItem color="#8b5cf6" label="flipped pointer" />
        </>
      }
    >
      {player.frame && <ListView frame={player.frame} />}
    </SimulatorShell>
  );
}
