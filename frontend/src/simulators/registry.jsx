import BinarySearchSim from "./algorithms/BinarySearchSim.jsx";
import SlidingWindowSim from "./algorithms/SlidingWindowSim.jsx";
import KadaneSim from "./algorithms/KadaneSim.jsx";
import TwoPointersSim from "./algorithms/TwoPointersSim.jsx";
import PrefixSumSim from "./algorithms/PrefixSumSim.jsx";
import SortingSim from "./algorithms/SortingSim.jsx";
import GraphTraversalSim from "./algorithms/GraphTraversalSim.jsx";
import DijkstraSim from "./algorithms/DijkstraSim.jsx";
import DSUSim from "./algorithms/DSUSim.jsx";
import TreeTraversalSim from "./algorithms/TreeTraversalSim.jsx";
import DPGridSim from "./algorithms/DPGridSim.jsx";
import NQueensSim from "./algorithms/NQueensSim.jsx";
import SubsetsSim from "./algorithms/SubsetsSim.jsx";
import MonotonicStackSim from "./algorithms/MonotonicStackSim.jsx";
import LinkedListSim from "./algorithms/LinkedListSim.jsx";
import FenwickSim from "./algorithms/FenwickSim.jsx";
import KMPSim from "./algorithms/KMPSim.jsx";
import SieveSim from "./algorithms/SieveSim.jsx";
import FastExpSim from "./algorithms/FastExpSim.jsx";
import LISSim from "./algorithms/LISSim.jsx";

// Maps a content `simulator` key to a render function.
const REGISTRY = {
  "binary-search": () => <BinarySearchSim />,
  "sliding-window": () => <SlidingWindowSim />,
  kadane: () => <KadaneSim />,
  "two-pointers": () => <TwoPointersSim />,
  "prefix-sums": () => <PrefixSumSim />,
  "merge-sort": () => <SortingSim algo="merge" />,
  "quick-sort": () => <SortingSim algo="quick" />,
  "counting-sort": () => <SortingSim algo="counting" />,
  "graph-bfs": () => <GraphTraversalSim mode="bfs" />,
  "graph-dfs": () => <GraphTraversalSim mode="dfs" />,
  dijkstra: () => <DijkstraSim />,
  "union-find": () => <DSUSim />,
  "tree-traversal": () => <TreeTraversalSim />,
  lcs: () => <DPGridSim variant="lcs" />,
  "n-queens": () => <NQueensSim />,
  subsets: () => <SubsetsSim variant="subsets" />,
  permutations: () => <SubsetsSim variant="permutations" />,
  "monotonic-stack": () => <MonotonicStackSim />,
  "linked-list-cycle": () => <LinkedListSim />,
  fenwick: () => <FenwickSim />,
  kmp: () => <KMPSim />,
  sieve: () => <SieveSim />,
  "fast-exponentiation": () => <FastExpSim />,
  lis: () => <LISSim />,
};

export function hasSimulator(key) {
  return Boolean(key && REGISTRY[key]);
}

export function renderSimulator(key) {
  const fn = REGISTRY[key];
  return fn ? fn() : null;
}
