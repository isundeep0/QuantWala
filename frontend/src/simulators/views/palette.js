// Semantic state -> color mapping for visualizations. Works in light & dark.
export const STATE_COLORS = {
  default: { bg: "rgb(var(--bg-sunken))", fg: "rgb(var(--text))", border: "rgb(var(--border-strong))" },
  active: { bg: "#2563eb", fg: "#fff", border: "#1d4ed8" },
  lo: { bg: "#0ea5e9", fg: "#fff", border: "#0284c7" },
  hi: { bg: "#8b5cf6", fg: "#fff", border: "#7c3aed" },
  mid: { bg: "#f59e0b", fg: "#fff", border: "#d97706" },
  match: { bg: "#10b981", fg: "#fff", border: "#059669" },
  found: { bg: "#10b981", fg: "#fff", border: "#059669" },
  discard: { bg: "rgb(var(--bg-sunken))", fg: "rgb(var(--text-faint))", border: "rgb(var(--border))" },
  window: { bg: "#2563eb22", fg: "rgb(var(--text))", border: "#2563eb" },
  sorted: { bg: "#10b981", fg: "#fff", border: "#059669" },
  pivot: { bg: "#ef4444", fg: "#fff", border: "#dc2626" },
  compare: { bg: "#f59e0b", fg: "#fff", border: "#d97706" },
  swap: { bg: "#ec4899", fg: "#fff", border: "#db2777" },
  min: { bg: "#06b6d4", fg: "#fff", border: "#0891b2" },
  visited: { bg: "#10b981", fg: "#fff", border: "#059669" },
  frontier: { bg: "#f59e0b", fg: "#fff", border: "#d97706" },
  current: { bg: "#2563eb", fg: "#fff", border: "#1d4ed8" },
  path: { bg: "#8b5cf6", fg: "#fff", border: "#7c3aed" },
  best: { bg: "#10b981", fg: "#fff", border: "#059669" },
};

export function colorFor(state) {
  return STATE_COLORS[state] || STATE_COLORS.default;
}
