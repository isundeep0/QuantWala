import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Clock, RotateCcw } from "lucide-react";
import { ALGORITHMS_BY_CATEGORY, TOTAL_ALGORITHMS } from "@/data/registry.js";
import { useProgress } from "@/context/ProgressContext.jsx";
import IconByName from "@/components/IconByName.jsx";
import GlassCard from "@/components/liquid/GlassCard.jsx";
import SwirlProgress from "@/components/liquid/SwirlProgress.jsx";

// Faint formulae etched into the module lens — pure decoration.
const ENGRAVINGS = [
  { t: "T(n) = 2T(n/2) + O(n)", x: "6%", y: "20%" },
  { t: "O(log n)", x: "78%", y: "16%" },
  { t: "f(n) = f(n-1) + f(n-2)", x: "10%", y: "78%" },
  { t: "Σ aᵢ·xⁱ  (mod p)", x: "70%", y: "82%" },
  { t: "dp[i][j] = dp[i-1][j] + …", x: "40%", y: "92%" },
];

/* Ambient neural conduits flowing behind a category's node cluster. The flow
   brightens as the category is completed — making the structure feel alive. */
function SynapseLayer({ color, pct }) {
  const alpha = 0.1 + (pct / 100) * 0.5;
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
      {[18, 50, 82].map((y, i) => (
        <path
          key={i}
          d={`M -2 ${y} C 25 ${y - 14}, 40 ${y + 16}, 60 ${y} S 95 ${y - 12}, 102 ${y}`}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          strokeOpacity={alpha}
          strokeDasharray="3 5"
          vectorEffect="non-scaling-stroke"
          style={{ filter: `drop-shadow(0 0 3px ${color}88)` }}
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-16" dur={`${3 + i}s`} repeatCount="indefinite" />
        </path>
      ))}
    </svg>
  );
}

function LessonVessel({ algo, color, complete, icon }) {
  return (
    <Link to={`/algorithms/${algo.slug}`} className="group relative block h-full">
      {/* Floating number / completion sphere */}
      <span
        className="glass-orb absolute -left-2 -top-2 z-10 grid h-8 w-8 place-items-center text-xs font-bold"
        style={{
          color: complete ? "#fff" : color,
          background: complete
            ? `radial-gradient(120% 120% at 30% 22%, #fff6, transparent 45%), ${color}`
            : undefined,
          boxShadow: complete ? `0 0 16px ${color}aa` : undefined,
        }}
      >
        {complete ? <Check className="h-4 w-4" /> : algo.order}
      </span>

      <GlassCard
        className="flex h-full flex-col p-4 pt-5"
        style={{
          borderRadius: "1.5rem 1.5rem 2.2rem 1.5rem",
          "--glow": `${color}aa`,
        }}
      >
        {/* Internal crystal icon assembly */}
        <span
          className="grid h-10 w-10 place-items-center rounded-2xl"
          style={{
            background: `radial-gradient(120% 120% at 30% 20%, ${color}40, ${color}10)`,
            boxShadow: `inset 0 0 12px ${color}33, 0 0 10px ${color}22`,
            color,
          }}
        >
          <IconByName name={icon} className="h-5 w-5" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        </span>

        <h4 className="mt-3 text-sm font-semibold leading-snug lit-text">{algo.title}</h4>
        {algo.tagline && (
          <p className="mt-1 line-clamp-2 text-xs text-muted">{algo.tagline}</p>
        )}

        {/* Etched data with micro-LED glow */}
        <div
          className="mt-auto flex items-center justify-between gap-2 pt-3"
          style={{ borderTop: "1px solid rgb(var(--glass-stroke) / 0.08)" }}
        >
          {algo.complexity?.time ? (
            <span className="etched-glow font-mono text-[11px]" style={{ "--glow": `${color}cc` }}>
              {algo.complexity.time}
            </span>
          ) : (
            <span />
          )}
          {algo.estMinutes && (
            <span className="etched flex items-center gap-1 font-mono text-[11px]">
              <Clock className="h-3 w-3" /> {algo.estMinutes}m
            </span>
          )}
        </div>
      </GlassCard>
    </Link>
  );
}

export default function AlgorithmsHub() {
  const { overallPercent, completedCount, categoryCompletion, isComplete, resetAll, problemStats } =
    useProgress();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* ===== Module lens ===== */}
      <GlassCard
        interactive={false}
        iris
        className="relative overflow-hidden rounded-[2rem] p-6 sm:p-9"
      >
        {/* Micro-engravings */}
        {ENGRAVINGS.map((e, i) => (
          <span
            key={i}
            className="etched pointer-events-none absolute select-none font-mono text-[11px] opacity-40"
            style={{ left: e.x, top: e.y }}
          >
            {e.t}
          </span>
        ))}

        <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div
              className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400"
              style={{ textShadow: "0 0 12px rgba(59,130,246,0.6)" }}
            >
              Module 01
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl lit-text">
              Algorithm Mastery
            </h1>
            <p className="mt-3 text-muted">
              A guided roadmap through every standard algorithm — jump in anywhere. Each lesson:
              intuition → logic → dry run → interactive simulator → problems.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="glass-orb px-3 py-1.5 text-sm font-semibold">
                <span className="etched-glow" style={{ "--glow": "#3b82f6aa" }}>
                  {completedCount}/{TOTAL_ALGORITHMS}
                </span>{" "}
                <span className="text-muted">done</span>
              </span>
              <span className="glass-orb px-3 py-1.5 text-sm font-semibold">
                <span className="etched-glow" style={{ "--glow": "#10b981aa" }}>
                  {problemStats.solved}
                </span>{" "}
                <span className="text-muted">problems solved</span>
              </span>
              <button
                onClick={() => {
                  if (confirm("Reset all progress? This clears completion and problem status.")) resetAll();
                }}
                className="glass-orb glass-interactive flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted hover:text-red-400"
                title="Drain all progress"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset progress
              </button>
            </div>
          </div>

          <div className="shrink-0 self-center">
            <SwirlProgress value={overallPercent} size={150} stroke={11} color="#3b82f6" sublabel="complete" />
          </div>
        </div>
      </GlassCard>

      {/* ===== Categories ===== */}
      <div className="mt-12 space-y-14">
        {ALGORITHMS_BY_CATEGORY.map((cat) => {
          const pct = categoryCompletion(cat.id);
          const done = cat.algorithms.filter((a) => isComplete(a.slug)).length;
          return (
            <section key={cat.id} id={cat.id} className="scroll-mt-24">
              {/* Floating glass section header */}
              <GlassCard
                className="mb-5 flex items-center gap-4 rounded-2xl px-4 py-3"
                style={{ "--glow": `${cat.color}aa` }}
              >
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                  style={{
                    background: `radial-gradient(120% 120% at 30% 20%, ${cat.color}45, ${cat.color}12)`,
                    boxShadow: `inset 0 0 14px ${cat.color}40, 0 0 12px ${cat.color}26`,
                    color: cat.color,
                  }}
                >
                  <IconByName name={cat.icon} className="h-5 w-5" style={{ filter: `drop-shadow(0 0 4px ${cat.color})` }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="truncate text-lg font-bold lit-text">{cat.title}</h2>
                    <span className="etched-glow shrink-0 font-mono text-xs" style={{ "--glow": `${cat.color}cc` }}>
                      {done}/{cat.algorithms.length}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted">{cat.short}</p>
                </div>
                {/* Liquid fill bar */}
                <div className="hidden h-2 w-40 overflow-hidden rounded-full sm:block" style={{ background: "rgb(var(--glass-stroke) / 0.12)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${cat.color}99, ${cat.color})`,
                      boxShadow: `0 0 10px ${cat.color}aa`,
                    }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                </div>
              </GlassCard>

              {cat.algorithms.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-faint" style={{ borderColor: "rgb(var(--glass-stroke) / 0.15)" }}>
                  Lessons for this category are coming soon.
                </div>
              ) : (
                <div className="relative">
                  <SynapseLayer color={cat.color} pct={pct} />
                  <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {cat.algorithms.map((algo) => (
                      <LessonVessel
                        key={algo.slug}
                        algo={algo}
                        color={cat.color}
                        icon={cat.icon}
                        complete={isComplete(algo.slug)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
