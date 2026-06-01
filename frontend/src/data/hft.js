// Module 3 — HFT / Low Latency. UI structure only; content is placeholder.
export const HFT_SECTIONS = [
  {
    id: "foundations",
    title: "Foundations of HFT",
    blurb: "How modern electronic markets actually work.",
    topics: [
      { id: "what-is-hft", title: "What is HFT & Market Microstructure", tag: "Concept" },
      { id: "order-books", title: "Order Types, Order Books, Matching Engines", tag: "Concept" },
      { id: "colocation", title: "Co-location & Network Topology", tag: "Infra" },
    ],
  },
  {
    id: "low-latency-engineering",
    title: "Low Latency Systems Engineering",
    blurb: "Where nanoseconds are won and lost.",
    topics: [
      { id: "cache-memory", title: "CPU Cache Optimization & Memory Layout", tag: "Systems" },
      { id: "lock-free", title: "Lock-free & Wait-free Data Structures", tag: "Systems" },
      { id: "simd-branch", title: "SIMD, Branch Prediction, Compiler Opts", tag: "Systems" },
      { id: "kernel-bypass", title: "Kernel Bypass Networking — DPDK, RDMA", tag: "Networking" },
      { id: "cpu-numa", title: "CPU Pinning & NUMA Awareness", tag: "Systems" },
    ],
  },
  {
    id: "cpp-for-hft",
    title: "C++ for HFT",
    blurb: "The language-level techniques desks actually grill you on.",
    topics: [
      { id: "zero-cost", title: "Zero-cost Abstractions & Templates", tag: "C++" },
      { id: "allocators", title: "Memory Allocators, Avoiding the Heap", tag: "C++" },
      { id: "benchmarking", title: "Benchmarking & Profiling Hot Paths", tag: "C++" },
    ],
  },
  {
    id: "trading-architecture",
    title: "Trading System Architecture",
    blurb: "The end-to-end pipeline of a trading system.",
    topics: [
      { id: "feed-handlers", title: "Market Data Feed Handlers", tag: "Architecture" },
      { id: "oms", title: "Order Management Systems", tag: "Architecture" },
      { id: "risk", title: "Risk Management Systems", tag: "Architecture" },
      { id: "backtesting", title: "Backtesting Infrastructure", tag: "Architecture" },
    ],
  },
  {
    id: "interview-prep",
    title: "Interview Prep",
    blurb: "What the top desks really look for.",
    topics: [
      { id: "question-types", title: "Common HFT Interview Question Types", tag: "Prep" },
      { id: "quant-vs-swe", title: "Quant Dev vs Pure SWE Roles", tag: "Prep" },
      { id: "firms", title: "What Firms Look For — Jane Street, Citadel, Tower, HRT", tag: "Prep" },
    ],
  },
];

export const HFT_TOPIC_BY_ID = Object.fromEntries(
  HFT_SECTIONS.flatMap((s) => s.topics.map((t) => [t.id, { ...t, sectionTitle: s.title }])),
);
