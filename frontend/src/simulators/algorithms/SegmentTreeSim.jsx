import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import SegTreeView, { buildSegTree } from "../views/SegTreeView.jsx";

const ARR = [2, 1, 5, 3, 4, 6];
const QL = 1;
const QR = 4;

const PSEUDO = [
  "query(node, lo, hi, l, r):",
  "  if [lo,hi] ∩ [l,r] = ∅: return 0      // disjoint",
  "  if [l,r] covers [lo,hi]: return val   // full cover",
  "  return query(left) + query(right)     // split",
];

function buildFrames() {
  const { nodes, edges } = buildSegTree(ARR);
  const computed = new Set();
  const frames = [];
  const renderNodes = (vals) =>
    Object.values(nodes).map((n) => ({ ...n, val: vals ? n.val : computed.has(n.id) ? n.val : "·" }));
  const push = (states, explain, line, full) =>
    frames.push({ nodes: renderNodes(full), edges, states: { ...states }, explain, line });

  // Phase 1: build (post-order sums).
  const buildRec = (id) => {
    const nd = nodes[id];
    if (nd.lo === nd.hi) {
      computed.add(String(id));
      push({ [id]: "match" }, `Leaf [${nd.lo},${nd.lo}] = a[${nd.lo}] = ${nd.val}.`, 0);
      return;
    }
    push({ [id]: "current" }, `Build node [${nd.lo},${nd.hi}]: compute children first.`, 0);
    buildRec(nd.left);
    buildRec(nd.right);
    computed.add(String(id));
    push({ [id]: "best" }, `[${nd.lo},${nd.hi}] = left + right = ${nodes[nd.left].val} + ${nodes[nd.right].val} = ${nd.val}.`, 0);
  };
  push({}, `Build a segment tree over [${ARR.join(", ")}]. Each internal node stores the sum of its range.`, 0);
  buildRec(1);

  // Phase 2: range sum query [QL, QR].
  push({}, `Now query the sum over [${QL}, ${QR}]. We descend, taking whole covered nodes and splitting partial ones.`, 0);
  let total = 0;
  const queryRec = (id) => {
    const nd = nodes[id];
    if (nd.hi < QL || QR < nd.lo) {
      push({ [id]: "discard" }, `[${nd.lo},${nd.hi}] is outside [${QL},${QR}] → contributes 0.`, 1, true);
      return;
    }
    if (QL <= nd.lo && nd.hi <= QR) {
      total += nd.val;
      push({ [id]: "match" }, `[${nd.lo},${nd.hi}] is fully inside the query → add ${nd.val}. Running sum = ${total}.`, 2, true);
      return;
    }
    push({ [id]: "current" }, `[${nd.lo},${nd.hi}] partially overlaps → split into children.`, 3, true);
    queryRec(nd.left);
    queryRec(nd.right);
  };
  queryRec(1);
  push({}, `Sum over [${QL}, ${QR}] = ${total}, gathered from O(log n) nodes.`, 0, true);
  return frames;
}

export default function SegmentTreeSim() {
  const frames = useMemo(() => buildFrames(), []);
  const player = useStepPlayer(frames);
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#ec4899"
      pseudocode={PSEUDO}
      inputPanel={
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted">array =</span>
          <span className="font-mono font-semibold">[{ARR.join(", ")}]</span>
          <span className="ml-2 text-muted">query sum [{QL}, {QR}]</span>
        </div>
      }
      legend={
        <>
          <LegendItem color="#2563eb" label="splitting / building" />
          <LegendItem color="#10b981" label="fully covered (added)" />
          <LegendItem color="rgb(var(--bg-sunken))" label="disjoint (0)" />
        </>
      }
    >
      {player.frame && <SegTreeView nodes={player.frame.nodes} edges={player.frame.edges} states={player.frame.states} />}
    </SimulatorShell>
  );
}
