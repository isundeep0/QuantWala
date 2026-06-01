import { motion } from "framer-motion";
import { colorFor } from "./palette.js";

// Renders an array as labelled cells with per-index state colors and pointer
// markers above. `states` is { [index]: stateKey }. `pointers` is
// [{ index, label, color }]. `indices` toggles index labels below cells.
export default function ArrayView({
  array = [],
  states = {},
  pointers = [],
  indices = true,
  cellSize = 48,
}) {
  const pby = {};
  for (const p of pointers) {
    (pby[p.index] = pby[p.index] || []).push(p);
  }

  return (
    <div className="flex flex-wrap items-end justify-center gap-1.5">
      {array.map((val, i) => {
        const c = colorFor(states[i] || "default");
        const ptrs = pby[i] || [];
        return (
          <div key={i} className="flex flex-col items-center">
            {/* Pointers */}
            <div className="mb-1 flex h-5 flex-col items-center justify-end gap-0.5">
              {ptrs.map((p, k) => (
                <span
                  key={k}
                  className="rounded px-1 font-mono text-[10px] font-bold leading-tight"
                  style={{ color: p.color || "#2563eb" }}
                >
                  {p.label}
                </span>
              ))}
            </div>
            <motion.div
              layout
              animate={{
                backgroundColor: c.bg,
                color: c.fg,
                borderColor: c.border,
                scale: states[i] && states[i] !== "default" && states[i] !== "discard" ? 1.06 : 1,
              }}
              transition={{ duration: 0.25 }}
              className="grid place-items-center rounded-lg border-2 font-mono text-sm font-semibold"
              style={{ width: cellSize, height: cellSize }}
            >
              {val}
            </motion.div>
            {indices && (
              <span className="mt-1 font-mono text-[10px] text-faint">{i}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
