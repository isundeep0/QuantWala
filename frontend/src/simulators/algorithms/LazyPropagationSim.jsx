import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import SegTreeView, { buildSegTree } from "../views/SegTreeView.jsx";

const ARR = [1, 2, 3, 4, 5, 6];
const UL = 1;
const UR = 4;
const ADD = 3;
const QL = 2;
const QR = 5;

const PSEUDO = [
  "update(node, l, r, v):",
  "  if covered: val += v·len; lazy += v; return",
  "  push(node)            // flush lazy to children",
  "  recurse both children; val = left + right",
  "query(node, l, r): push(node) before splitting",
];

function buildFrames() {
  const { nodes, edges } = buildSegTree(ARR);
  const frames = [];
  const snap = (states, explain, line) =>
    frames.push({
      nodes: Object.values(nodes).map((n) => ({ id: n.id, lo: n.lo, hi: n.hi, val: n.val, lazy: n.lazy, x: n.x, y: n.y })),
      edges,
      states: { ...states },
      explain,
      line,
    });

  snap({}, `Built a segment tree over [${ARR.join(", ")}]. Lazy tags let us update a whole range in O(log n) by deferring work to children.`, 0);

  const pushDown = (id) => {
    const nd = nodes[id];
    if (!nd.lazy || nd.lo === nd.hi) return;
    for (const ch of [nd.left, nd.right]) {
      const c = nodes[ch];
      c.val += nd.lazy * (c.hi - c.lo + 1);
      c.lazy += nd.lazy;
    }
    nd.lazy = 0;
  };

  const update = (id, l, r, v) => {
    const nd = nodes[id];
    if (nd.hi < l || r < nd.lo) {
      snap({ [id]: "discard" }, `[${nd.lo},${nd.hi}] is outside the update range → skip.`, 0);
      return;
    }
    if (l <= nd.lo && nd.hi <= r) {
      nd.val += v * (nd.hi - nd.lo + 1);
      nd.lazy += v;
      snap({ [id]: "best" }, `[${nd.lo},${nd.hi}] fully covered: add ${v}×${nd.hi - nd.lo + 1} to val and stamp a lazy +${v} tag. Stop here.`, 1);
      return;
    }
    pushDown(id);
    snap({ [id]: "current" }, `[${nd.lo},${nd.hi}] partial: push any lazy down, then recurse.`, 2);
    update(nd.left, l, r, v);
    update(nd.right, l, r, v);
    nd.val = nodes[nd.left].val + nodes[nd.right].val;
    snap({ [id]: "current" }, `Recompute [${nd.lo},${nd.hi}] = ${nodes[nd.left].val} + ${nodes[nd.right].val} = ${nd.val}.`, 3);
  };

  snap({ 1: "active" }, `Range update: add ${ADD} to every element in [${UL}, ${UR}].`, 0);
  update(1, UL, UR, ADD);

  let total = 0;
  const query = (id, l, r) => {
    const nd = nodes[id];
    if (nd.hi < l || r < nd.lo) return;
    if (l <= nd.lo && nd.hi <= r) {
      total += nd.val;
      snap({ [id]: "match" }, `[${nd.lo},${nd.hi}] fully inside query → add ${nd.val}. Sum = ${total}.`, 4);
      return;
    }
    pushDown(id);
    snap({ [id]: "current" }, `Querying [${nd.lo},${nd.hi}]: flush lazy to children before splitting.`, 4);
    query(nd.left, l, r);
    query(nd.right, l, r);
  };
  snap({ 1: "active" }, `Now query the sum over [${QL}, ${QR}] — watch lazy tags flow down as we descend.`, 4);
  query(1, QL, QR);
  snap({}, `Sum over [${QL}, ${QR}] after the update = ${total}. Lazy propagation kept everything O(log n).`, 0);
  return frames;
}

export default function LazyPropagationSim() {
  const frames = useMemo(() => buildFrames(), []);
  const player = useStepPlayer(frames);
  return (
    <SimulatorShell
      player={player}
      frame={player.frame}
      accent="#ec4899"
      pseudocode={PSEUDO}
      inputPanel={
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-muted">array</span>
          <span className="font-mono font-semibold">[{ARR.join(", ")}]</span>
          <span className="text-muted">· add {ADD} to [{UL},{UR}] · then sum [{QL},{QR}]</span>
        </div>
      }
      legend={
        <>
          <LegendItem color="#10b981" label="covered (lazy stamped)" />
          <LegendItem color="#2563eb" label="recursing / pushdown" />
          <LegendItem color="#f59e0b" label="lazy tag" />
        </>
      }
    >
      {player.frame && <SegTreeView nodes={player.frame.nodes} edges={player.frame.edges} states={player.frame.states} showLazy />}
    </SimulatorShell>
  );
}
