import { motion } from "framer-motion";
import { colorFor } from "./palette.js";

// Renders an array as proportional bars — ideal for sorting visualizations.
export default function BarsView({ array = [], states = {}, pointers = [], height = 200 }) {
  const max = Math.max(1, ...array.map((v) => Math.abs(v)));
  const pby = {};
  for (const p of pointers) (pby[p.index] = pby[p.index] || []).push(p);

  return (
    <div className="flex w-full items-end justify-center gap-1" style={{ height: height + 28 }}>
      {array.map((val, i) => {
        const c = colorFor(states[i] || "default");
        const h = Math.max(8, (Math.abs(val) / max) * height);
        const ptrs = pby[i] || [];
        return (
          <div key={i} className="flex flex-1 flex-col items-center justify-end" style={{ maxWidth: 46 }}>
            <div className="mb-1 h-4 text-center">
              {ptrs.map((p, k) => (
                <span key={k} className="font-mono text-[10px] font-bold" style={{ color: p.color }}>
                  {p.label}
                </span>
              ))}
            </div>
            <motion.div
              layout
              animate={{ backgroundColor: c.bg, borderColor: c.border }}
              transition={{ duration: 0.25 }}
              className="flex w-full items-start justify-center rounded-t-md border-2 border-b-0 pt-1"
              style={{ height: h }}
            >
              <span className="font-mono text-[10px] font-bold" style={{ color: c.fg }}>
                {val}
              </span>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
