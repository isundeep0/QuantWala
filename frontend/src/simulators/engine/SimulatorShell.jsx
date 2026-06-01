import { useEffect } from "react";
import { Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PlayerControls from "./PlayerControls.jsx";
import Pseudocode from "./Pseudocode.jsx";

// Standard layout for every simulator: input panel, stage (visualization),
// live explanation, pseudocode, and the transport controls.
export default function SimulatorShell({
  inputPanel,
  children,
  legend,
  pseudocode = [],
  frame,
  player,
  accent = "#2563eb",
}) {
  // Keyboard shortcuts: space = play/pause, arrows = step.
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        player.toggle();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        player.next();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        player.prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [player]);

  return (
    <div className="space-y-4">
      {inputPanel && (
        <div className="rounded-xl surface-sunken p-3 sm:p-4">{inputPanel}</div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr,300px]">
        <div className="space-y-4">
          {/* Stage */}
          <div
            className="relative min-h-[280px] overflow-hidden rounded-2xl border p-4 sm:p-6"
            style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--bg-elev))" }}
          >
            <div className="absolute inset-0 dot-grid opacity-40" aria-hidden />
            <div className="relative flex h-full min-h-[240px] items-center justify-center">
              {children}
            </div>
          </div>

          {/* Live explanation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={player.index}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-3 rounded-xl border p-3.5"
              style={{ borderColor: `${accent}33`, backgroundColor: `${accent}0d` }}
            >
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} />
              <p className="text-sm leading-relaxed">
                {frame?.explain ?? "Press play to watch the algorithm run."}
              </p>
            </motion.div>
          </AnimatePresence>

          <PlayerControls player={player} accent={accent} />
        </div>

        {/* Side rail: pseudocode + legend */}
        <div className="space-y-4">
          {pseudocode.length > 0 && (
            <Pseudocode lines={pseudocode} activeLine={frame?.line ?? -1} accent={accent} />
          )}
          {legend && (
            <div className="rounded-xl border p-3" style={{ borderColor: "rgb(var(--border))" }}>
              <div className="mb-2 text-xs font-semibold text-muted">Legend</div>
              <div className="flex flex-wrap gap-2">{legend}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function LegendItem({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span className="h-3 w-3 rounded" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
