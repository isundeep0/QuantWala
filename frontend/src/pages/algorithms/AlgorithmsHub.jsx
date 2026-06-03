import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Clock, RotateCcw } from "lucide-react";
import { ALGORITHMS_BY_CATEGORY, TOTAL_ALGORITHMS } from "@/data/registry.js";
import { useProgress } from "@/context/ProgressContext.jsx";
import IconByName from "@/components/IconByName.jsx";
import GlassCard from "@/components/liquid/GlassCard.jsx";
import SwirlProgress from "@/components/liquid/SwirlProgress.jsx";

function LessonVessel({ algo, color, complete, icon }) {
  return (
    <Link to={`/algorithms/${algo.slug}`} className="group relative block h-full">
      {/* Order / completion badge */}
      <span
        className="absolute -left-2 -top-2 z-10 grid h-8 w-8 place-items-center rounded-full border text-xs font-bold transition-colors"
        style={{
          color: complete ? "#fff" : color,
          background: complete ? color : "rgb(var(--bg-elev))",
          borderColor: complete ? color : `${color}40`,
        }}
      >
        {complete ? <Check className="h-4 w-4" /> : algo.order}
      </span>

      <GlassCard className="flex h-full flex-col rounded-3xl p-4 pt-5" style={{ "--glow": `${color}aa` }}>
        <span
          className="grid h-10 w-10 place-items-center rounded-xl"
          style={{
            background: `linear-gradient(160deg, ${color}26, ${color}0d)`,
            boxShadow: `inset 0 0 0 1px ${color}2e`,
            color,
          }}
        >
          <IconByName name={icon} className="h-5 w-5" />
        </span>

        <h4 className="mt-3 text-sm font-semibold leading-snug">{algo.title}</h4>
        {algo.tagline && (
          <p className="mt-1 line-clamp-2 text-xs text-muted">{algo.tagline}</p>
        )}

        <div
          className="mt-auto flex items-center justify-between gap-2 pt-3"
          style={{ borderTop: "1px solid rgb(var(--border))" }}
        >
          {algo.complexity?.time ? (
            <span className="font-mono text-[11px] text-muted">{algo.complexity.time}</span>
          ) : (
            <span />
          )}
          {algo.estMinutes && (
            <span className="flex items-center gap-1 font-mono text-[11px] text-faint">
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
      {/* ===== Module header ===== */}
      <GlassCard interactive={false} className="relative overflow-hidden rounded-3xl p-6 sm:p-9">
        <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500 dark:text-brand-400">
              Module 01
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Algorithm Mastery
            </h1>
            <p className="mt-3 text-muted">
              A guided roadmap through every standard algorithm — jump in anywhere. Each lesson:
              intuition → logic → dry run → interactive simulator → problems.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="glass-orb px-3 py-1.5 text-sm font-semibold">
                <span style={{ color: "#3b82f6" }}>{completedCount}/{TOTAL_ALGORITHMS}</span>{" "}
                <span className="text-muted">done</span>
              </span>
              <span className="glass-orb px-3 py-1.5 text-sm font-semibold">
                <span style={{ color: "#10b981" }}>{problemStats.solved}</span>{" "}
                <span className="text-muted">problems solved</span>
              </span>
              <button
                onClick={() => {
                  if (confirm("Reset all progress? This clears completion and problem status.")) resetAll();
                }}
                className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-faint transition-colors hover:text-red-400"
                title="Reset all progress"
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
              {/* Section header */}
              <div className="mb-5 flex items-center gap-4">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                  style={{
                    background: `linear-gradient(160deg, ${cat.color}26, ${cat.color}0d)`,
                    boxShadow: `inset 0 0 0 1px ${cat.color}2e`,
                    color: cat.color,
                  }}
                >
                  <IconByName name={cat.icon} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="truncate text-lg font-bold">{cat.title}</h2>
                    <span className="shrink-0 font-mono text-xs text-muted">
                      {done}/{cat.algorithms.length}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted">{cat.short}</p>
                </div>
                <div className="hidden h-1.5 w-40 overflow-hidden rounded-full sm:block" style={{ background: "rgb(var(--border))" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: cat.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                </div>
              </div>

              {cat.algorithms.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-faint" style={{ borderColor: "rgb(var(--border))" }}>
                  Lessons for this category are coming soon.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
