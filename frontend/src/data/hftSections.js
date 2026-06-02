// Module 3 — HFT / Low Latency. Section (track) metadata. The `order` field
// defines the linear roadmap order across the whole module; each lesson JSON
// under content/hft/<sectionId>/<slug>.json references one sectionId.
//
// The module is sequenced as a complete beginner → HFT-ready path:
//   1. understand the business & the market,
//   2. learn the domain (microstructure) and the research/quant side,
//   3. master the probability + mental-math interview core,
//   4. master modern C++ and low-latency systems engineering,
//   5. assemble it into a real trading-system architecture,
//   6. and finally drill the interview itself.
export const HFT_SECTIONS = [
  {
    id: "foundations",
    title: "Foundations & The HFT Landscape",
    short: "What HFT is, who plays, and which role fits you.",
    blurb:
      "Start here. Understand the business of high-frequency trading, the players, where the edge comes from, and the difference between the quant-dev, researcher, and systems tracks — so the rest of the roadmap makes sense.",
    icon: "Compass",
    color: "#10b981",
    order: 1,
  },
  {
    id: "microstructure",
    title: "Market Microstructure",
    short: "Order books, matching engines, and market data.",
    blurb:
      "The domain knowledge every quant role assumes you have: order types, the limit order book, how a matching engine pairs trades, the market-data protocols (ITCH/OUCH/FIX), and how price is actually formed tick by tick.",
    icon: "BookOpen",
    color: "#14b8a6",
    order: 2,
  },
  {
    id: "strategies",
    title: "Strategies & Quant Research",
    short: "Market making, stat-arb, signals, backtesting.",
    blurb:
      "The research track. How HFT strategies actually make money — market making and inventory risk, statistical arbitrage, alpha signals from order flow, optimal execution, and the backtesting discipline that keeps you honest.",
    icon: "LineChart",
    color: "#06b6d4",
    order: 3,
  },
  {
    id: "quant-math",
    title: "Probability, Stats & Mental Math",
    short: "EV, Bayes, mental math, market-making games.",
    blurb:
      "The interview core for every quant role. Expected value and conditional probability, Bayesian updating, fast mental arithmetic (the Optiver/Zetamac filter), and the market-making games that traders are graded on.",
    icon: "Sigma",
    color: "#0ea5e9",
    order: 4,
  },
  {
    id: "cpp",
    title: "Modern C++ for Low Latency",
    short: "RAII, templates, allocators, the memory model.",
    blurb:
      "The language desks grill you on. Value semantics and the cost model, zero-cost abstractions (templates & CRTP over virtuals), heap avoidance with custom allocators, and the C++ memory model that underpins lock-free code.",
    icon: "Code2",
    color: "#6366f1",
    order: 5,
  },
  {
    id: "systems",
    title: "Low-Latency Systems Engineering",
    short: "Caches, lock-free, kernel bypass, measurement.",
    blurb:
      "Where nanoseconds are won and lost. CPU caches and false sharing, branch prediction, lock-free SPSC queues and the Disruptor, SIMD, NUMA and core pinning, kernel-bypass networking, FPGAs, and how to actually measure latency.",
    icon: "Gauge",
    color: "#8b5cf6",
    order: 6,
  },
  {
    id: "architecture",
    title: "Trading System Architecture",
    short: "Feed handler → book → strategy → OMS → risk.",
    blurb:
      "Assembling the pieces into a real system. The end-to-end tick-to-trade path: market-data feed handlers, a fast order book, the strategy engine, order management and smart routing, pre-trade risk and the kill switch, plus networking and time sync.",
    icon: "Network",
    color: "#ec4899",
    order: 7,
  },
  {
    id: "interview",
    title: "Interview Mastery",
    short: "The process, firm guides, and a readiness checklist.",
    blurb:
      "Turn knowledge into offers. The hiring funnel by firm and track, the low-latency coding patterns interviewers look for, how to run a live systems-design round, firm-by-firm guides, and a final HFT-ready checklist.",
    icon: "Briefcase",
    color: "#f59e0b",
    order: 8,
  },
];

export const HFT_SECTION_BY_ID = Object.fromEntries(HFT_SECTIONS.map((s) => [s.id, s]));

// Difficulty / level badges used on lesson cards and headers.
export const HFT_LEVEL = {
  Core: { label: "Core", color: "#10b981" },
  Intermediate: { label: "Intermediate", color: "#0ea5e9" },
  Advanced: { label: "Advanced", color: "#8b5cf6" },
  Elite: { label: "Elite", color: "#ec4899" },
};

// Which career track(s) a lesson is most relevant to. Shown as small chips so a
// learner can follow the dev, research, or systems thread through the module.
export const HFT_TRACK = {
  dev: { label: "Quant Dev", color: "#6366f1" },
  research: { label: "Research", color: "#06b6d4" },
  systems: { label: "Systems", color: "#8b5cf6" },
  trader: { label: "Trader", color: "#f59e0b" },
};
