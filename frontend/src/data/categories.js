// Category metadata for Module 1 (Algorithms). Order here defines the roadmap
// order across the whole module. Each algorithm JSON references one categoryId.
export const CATEGORIES = [
  {
    id: "sorting-searching",
    title: "Sorting & Searching",
    short: "Binary search & the sorting toolbox",
    icon: "Search",
    color: "#2563eb",
    order: 1,
  },
  {
    id: "arrays-two-pointers",
    title: "Arrays & Two Pointers",
    short: "Sliding window, prefix sums, Kadane",
    icon: "MoveHorizontal",
    color: "#0ea5e9",
    order: 2,
  },
  {
    id: "linked-lists",
    title: "Linked Lists",
    short: "Fast/slow pointers, reversal, merge",
    icon: "Link2",
    color: "#06b6d4",
    order: 3,
  },
  {
    id: "stacks-queues",
    title: "Stacks & Queues",
    short: "Monotonic stack & deque tricks",
    icon: "Layers",
    color: "#14b8a6",
    order: 4,
  },
  {
    id: "trees",
    title: "Trees",
    short: "DFS, BFS, LCA, diameter, tree DP",
    icon: "GitBranch",
    color: "#10b981",
    order: 5,
  },
  {
    id: "graphs",
    title: "Graphs",
    short: "Shortest paths, SCC, DSU, MST",
    icon: "Share2",
    color: "#22c55e",
    order: 6,
  },
  {
    id: "dynamic-programming",
    title: "Dynamic Programming",
    short: "1D/2D, bitmask, interval, digit DP",
    icon: "Grid3x3",
    color: "#f59e0b",
    order: 7,
  },
  {
    id: "greedy",
    title: "Greedy Algorithms",
    short: "Exchange arguments & classic patterns",
    icon: "Coins",
    color: "#f97316",
    order: 8,
  },
  {
    id: "backtracking",
    title: "Backtracking",
    short: "Subsets, permutations, N-Queens, Sudoku",
    icon: "Undo2",
    color: "#ef4444",
    order: 9,
  },
  {
    id: "segment-trees-bit",
    title: "Segment Trees & BITs",
    short: "Range queries, lazy propagation, Fenwick",
    icon: "Binary",
    color: "#ec4899",
    order: 10,
  },
  {
    id: "strings",
    title: "String Algorithms",
    short: "KMP, Z, Rabin-Karp, Trie, suffix arrays",
    icon: "Type",
    color: "#8b5cf6",
    order: 11,
  },
  {
    id: "math-number-theory",
    title: "Math & Number Theory",
    short: "Sieve, modular math, fast power, combinatorics",
    icon: "Sigma",
    color: "#6366f1",
    order: 12,
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export const DIFFICULTY = {
  Easy: { label: "Easy", color: "#10b981" },
  Medium: { label: "Medium", color: "#f59e0b" },
  Hard: { label: "Hard", color: "#ef4444" },
  Variation: { label: "Variation", color: "#6366f1" },
};
