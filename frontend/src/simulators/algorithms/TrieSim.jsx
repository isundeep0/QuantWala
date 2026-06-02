import { useMemo } from "react";
import { useStepPlayer } from "../engine/useStepPlayer.js";
import SimulatorShell, { LegendItem } from "../engine/SimulatorShell.jsx";
import TreeView from "../views/TreeView.jsx";

const WORDS = ["CAT", "CAR", "CARD", "DOG", "DO"];

const PSEUDO = [
  "insert(word):",
  "  node = root",
  "  for c in word:",
  "    if c not in node.children: create it",
  "    node = node.children[c]",
  "  node.isEnd = true",
];

// Build the full trie structure (node id = path string) so positions are stable.
function buildTrie(words) {
  const nodes = { root: { id: "root", char: "•", depth: 0, children: [], isEnd: false } };
  for (const w of words) {
    let cur = "root";
    for (const ch of w) {
      const id = `${cur}/${ch}`;
      if (!nodes[id]) {
        nodes[id] = { id, char: ch, depth: nodes[cur].depth + 1, children: [], isEnd: false };
        nodes[cur].children.push(id);
      }
      cur = id;
    }
    nodes[cur].isEnd = true;
  }
  // Layout: leaves get sequential x slots; internal = mean of children.
  let slot = 0;
  let maxDepth = 0;
  const assign = (id) => {
    const node = nodes[id];
    maxDepth = Math.max(maxDepth, node.depth);
    node.children.sort((a, b) => nodes[a].char.localeCompare(nodes[b].char));
    if (node.children.length === 0) {
      node.slot = slot++;
    } else {
      node.children.forEach(assign);
      node.slot = node.children.reduce((s, c) => s + nodes[c].slot, 0) / node.children.length;
    }
  };
  assign("root");
  const leaves = slot;
  for (const id in nodes) {
    const nd = nodes[id];
    nd.x = (nd.slot + 0.5) / leaves;
    nd.y = maxDepth ? 0.12 + (nd.depth / maxDepth) * 0.76 : 0.5;
  }
  return nodes;
}

function buildFrames(nodes, words) {
  const frames = [];
  const revealed = new Set(["root"]);
  const ends = new Set();
  const renderNodes = () => Object.values(nodes).filter((n) => revealed.has(n.id)).map((n) => ({ id: n.id, label: n.char, x: n.x, y: n.y }));
  const renderEdges = () =>
    Object.values(nodes)
      .filter((n) => revealed.has(n.id) && n.id !== "root")
      .map((n) => ({ u: n.id.slice(0, n.id.lastIndexOf("/")), v: n.id }));
  const stateFor = (pathSet, cur) => {
    const st = {};
    for (const id of revealed) {
      if (ends.has(id)) st[id] = "match";
    }
    for (const id of pathSet) st[id] = "path";
    if (cur) st[cur] = "current";
    return st;
  };
  const push = (path, cur, explain, line, edgeHi) =>
    frames.push({
      nodes: renderNodes(),
      edges: renderEdges(),
      states: stateFor(path, cur),
      edgeStates: edgeHi || {},
      explain,
      line,
    });

  push([], null, `A trie stores words by shared prefixes. We insert ${words.length} words; nodes that finish a word are marked.`, 0);
  for (const w of words) {
    let cur = "root";
    const path = ["root"];
    push([...path], "root", `Insert "${w}": start at the root.`, 1);
    for (const ch of w) {
      const id = `${cur}/${ch}`;
      const isNew = !revealed.has(id);
      revealed.add(id);
      path.push(id);
      push([...path], id, isNew ? `'${ch}' is new → create a child node.` : `'${ch}' already exists → follow the shared edge.`, isNew ? 4 : 3, { [`${cur}-${id}`]: "path" });
      cur = id;
    }
    ends.add(cur);
    push([...path], cur, `Mark the end of "${w}" (green).`, 5);
  }
  push([], null, `Trie complete. Shared prefixes (e.g. CA in CAT/CAR/CARD) are stored once — that's the whole point.`, 0);
  return frames;
}

export default function TrieSim() {
  const nodes = useMemo(() => buildTrie(WORDS), []);
  const frames = useMemo(() => buildFrames(nodes, WORDS), [nodes]);
  const player = useStepPlayer(frames);
  const f = player.frame;
  return (
    <SimulatorShell
      player={player}
      frame={f}
      accent="#8b5cf6"
      pseudocode={PSEUDO}
      inputPanel={
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">words:</span>
          <span className="font-mono font-semibold">{WORDS.join(", ")}</span>
        </div>
      }
      legend={
        <>
          <LegendItem color="#8b5cf6" label="current insertion path" />
          <LegendItem color="#2563eb" label="current node" />
          <LegendItem color="#10b981" label="end of a word" />
        </>
      }
    >
      {f && <TreeView nodes={f.nodes} edges={f.edges} nodeStates={f.states} edgeStates={f.edgeStates} width={460} height={300} />}
    </SimulatorShell>
  );
}
