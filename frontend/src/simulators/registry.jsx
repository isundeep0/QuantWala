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
// Newly added simulators completing Module 1 coverage.
import BellmanFordSim from "./algorithms/BellmanFordSim.jsx";
import FloydWarshallSim from "./algorithms/FloydWarshallSim.jsx";
import KruskalSim from "./algorithms/KruskalSim.jsx";
import PrimSim from "./algorithms/PrimSim.jsx";
import SCCSim from "./algorithms/SCCSim.jsx";
import TopoSortSim from "./algorithms/TopoSortSim.jsx";
import CoinChangeSim from "./algorithms/CoinChangeSim.jsx";
import KnapsackSim from "./algorithms/KnapsackSim.jsx";
import IntervalDPSim from "./algorithms/IntervalDPSim.jsx";
import BitmaskDPSim from "./algorithms/BitmaskDPSim.jsx";
import DigitDPSim from "./algorithms/DigitDPSim.jsx";
import LCASim from "./algorithms/LCASim.jsx";
import TreeDiameterSim from "./algorithms/TreeDiameterSim.jsx";
import TreeDPSim from "./algorithms/TreeDPSim.jsx";
import RabinKarpSim from "./algorithms/RabinKarpSim.jsx";
import ZAlgorithmSim from "./algorithms/ZAlgorithmSim.jsx";
import SuffixArraySim from "./algorithms/SuffixArraySim.jsx";
import TrieSim from "./algorithms/TrieSim.jsx";
import SegmentTreeSim from "./algorithms/SegmentTreeSim.jsx";
import LazyPropagationSim from "./algorithms/LazyPropagationSim.jsx";
import MergeListsSim from "./algorithms/MergeListsSim.jsx";
import ReverseListSim from "./algorithms/ReverseListSim.jsx";
import GcdSim from "./algorithms/GcdSim.jsx";
import ModularSim from "./algorithms/ModularSim.jsx";
import CombinatoricsSim from "./algorithms/CombinatoricsSim.jsx";
import SudokuSim from "./algorithms/SudokuSim.jsx";
import ActivitySelectionSim from "./algorithms/ActivitySelectionSim.jsx";
import ExchangeArgumentSim from "./algorithms/ExchangeArgumentSim.jsx";
import RadixSortSim from "./algorithms/RadixSortSim.jsx";
import DequeTricksSim from "./algorithms/DequeTricksSim.jsx";

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
  "radix-sort": () => <RadixSortSim />,
  "graph-bfs": () => <GraphTraversalSim mode="bfs" />,
  "graph-dfs": () => <GraphTraversalSim mode="dfs" />,
  dijkstra: () => <DijkstraSim />,
  "bellman-ford": () => <BellmanFordSim />,
  "floyd-warshall": () => <FloydWarshallSim />,
  "mst-kruskal": () => <KruskalSim />,
  "mst-prim": () => <PrimSim />,
  scc: () => <SCCSim />,
  "topological-sort": () => <TopoSortSim />,
  "union-find": () => <DSUSim />,
  "tree-traversal": () => <TreeTraversalSim />,
  lca: () => <LCASim />,
  "tree-diameter": () => <TreeDiameterSim />,
  "tree-dp": () => <TreeDPSim />,
  lcs: () => <DPGridSim variant="lcs" />,
  "coin-change": () => <CoinChangeSim />,
  knapsack: () => <KnapsackSim />,
  "interval-dp": () => <IntervalDPSim />,
  "bitmask-dp": () => <BitmaskDPSim />,
  "digit-dp": () => <DigitDPSim />,
  lis: () => <LISSim />,
  "n-queens": () => <NQueensSim />,
  subsets: () => <SubsetsSim variant="subsets" />,
  permutations: () => <SubsetsSim variant="permutations" />,
  sudoku: () => <SudokuSim />,
  "activity-selection": () => <ActivitySelectionSim />,
  "exchange-argument": () => <ExchangeArgumentSim />,
  "monotonic-stack": () => <MonotonicStackSim />,
  "deque-tricks": () => <DequeTricksSim />,
  "linked-list-cycle": () => <LinkedListSim />,
  "merge-linked-lists": () => <MergeListsSim />,
  "reverse-linked-list": () => <ReverseListSim />,
  fenwick: () => <FenwickSim />,
  "segment-tree": () => <SegmentTreeSim />,
  "lazy-propagation": () => <LazyPropagationSim />,
  kmp: () => <KMPSim />,
  "rabin-karp": () => <RabinKarpSim />,
  "z-algorithm": () => <ZAlgorithmSim />,
  "suffix-array": () => <SuffixArraySim />,
  trie: () => <TrieSim />,
  sieve: () => <SieveSim />,
  "fast-exponentiation": () => <FastExpSim />,
  "gcd-lcm": () => <GcdSim />,
  "modular-arithmetic": () => <ModularSim />,
  combinatorics: () => <CombinatoricsSim />,
};

export function hasSimulator(key) {
  return Boolean(key && REGISTRY[key]);
}

export function renderSimulator(key) {
  const fn = REGISTRY[key];
  return fn ? fn() : null;
}
