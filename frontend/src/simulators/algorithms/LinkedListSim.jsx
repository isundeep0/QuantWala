import { useMemo, useState } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";

const PSEUDO = [
  "slow = head, fast = head",
  "while fast and fast.next:",
  "  slow = slow.next        // 1 step",
  "  fast = fast.next.next   // 2 steps",
  "  if slow == fast: cycle found",
  "return no cycle",
];

function buildFrames(n, cycleTo) {
  // nodes 0..n-1; node i -> i+1, last -> cycleTo (or null if -1)
  const next = (i) => (i === n - 1 ? cycleTo : i + 1);
  const frames = [];
  let slow = 0;
  let fast = 0;
  const push = (explain, line, found = false) => frames.push({ slow, fast, n, explain, line, found });

  push("Floyd's cycle detection: a slow pointer (1 step) and a fast pointer (2 steps).", 0);
  let safety = 0;
  while (fast !== -1 && next(fast) !== -1 && safety++ < 50) {
    slow = next(slow);
    fast = next(next(fast));
    if (fast === -1) break;
    if (slow === fast) {
      push(`slow and fast meet at node ${slow} → there is a cycle!`, 4, true);
      return frames;
    }
    push(`Step: slow→${slow}, fast→${fast}. ${slow === fast ? "" : "Not equal yet, keep going."}`, 3);
  }
  push("fast reached the end (null) → the list has no cycle.", 5);
  return frames;
}

function ListView({ frame, cycleTo }) {
  const { n, slow, fast } = frame;
  const R = 22;
  const gap = 78;
  const width = n * gap + 40;
  const y = 70;
  const nodeX = (i) => 30 + i * gap + R;
  return (
    <svg viewBox={`0 0 ${width} 150`} className="h-auto w-full max-w-[640px]">
      {Array.from({ length: n }).map((_, i) => {
        const to = i === n - 1 ? cycleTo : i + 1;
        if (to === -1 || to === undefined) return null;
        const x1 = nodeX(i) + R;
        const x2 = nodeX(to) - R;
        if (to === i + 1) {
          return <line key={i} x1={x1} y1={y} x2={x2} y2={y} stroke="rgb(var(--border-strong))" strokeWidth="2" markerEnd="url(#a)" />;
        }
        // back edge (cycle) - draw an arc below
        const cx = (nodeX(i) + nodeX(to)) / 2;
        return (
          <path
            key={i}
            d={`M ${nodeX(i)} ${y + R} Q ${cx} ${y + 70} ${nodeX(to)} ${y + R}`}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            markerEnd="url(#a)"
          />
        );
      })}
      <defs>
        <marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="rgb(var(--text-faint))" />
        </marker>
      </defs>
      {Array.from({ length: n }).map((_, i) => {
        const isSlow = slow === i;
        const isFast = fast === i;
        const fill = isSlow && isFast ? "#10b981" : isSlow ? "#0ea5e9" : isFast ? "#ef4444" : "rgb(var(--bg-sunken))";
        const fg = isSlow || isFast ? "#fff" : "rgb(var(--text))";
        return (
          <g key={i}>
            <circle cx={nodeX(i)} cy={y} r={R} fill={fill} stroke="rgb(var(--border-strong))" strokeWidth="2" />
            <text x={nodeX(i)} y={y} dy="4.5" textAnchor="middle" fontWeight="700" style={{ fill: fg }} className="font-mono text-sm">
              {i}
            </text>
            {isSlow && (
              <text x={nodeX(i)} y={y - 34} textAnchor="middle" className="font-mono text-[11px] font-bold" fill="#0ea5e9">
                slow
              </text>
            )}
            {isFast && (
              <text x={nodeX(i)} y={y - 48} textAnchor="middle" className="font-mono text-[11px] font-bold" fill="#ef4444">
                fast
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function LinkedListSim() {
  const [hasCycle, setHasCycle] = useState(true);
  const n = 7;
  const cycleTo = hasCycle ? 2 : -1;
  const frames = useMemo(() => buildFrames(n, cycleTo), [cycleTo]);
  const player = useStepPlayer(frames);
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#06b6d4"
      pseudocode={PSEUDO}
      inputPanel={
        <div className="flex items-center gap-2">
          <span className="mr-1 text-xs font-medium text-muted">List shape</span>
          <button
            onClick={() => {
              setHasCycle(true);
              player.reset();
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${hasCycle ? "bg-cyan-500 text-white" : "surface-sunken"}`}
          >
            With cycle (→ node 2)
          </button>
          <button
            onClick={() => {
              setHasCycle(false);
              player.reset();
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${!hasCycle ? "bg-cyan-500 text-white" : "surface-sunken"}`}
          >
            No cycle
          </button>
        </div>
      }
      legend={
        <>
          <LegendItem color="#0ea5e9" label="slow (×1)" />
          <LegendItem color="#ef4444" label="fast (×2)" />
          <LegendItem color="#10b981" label="meeting point" />
        </>
      }
    >
      {player.frame && <ListView frame={player.frame} cycleTo={cycleTo} />}
    </SimulatorShell>
  );
}
