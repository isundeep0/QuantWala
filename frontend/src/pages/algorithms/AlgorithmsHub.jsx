import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Check, ChevronRight, Clock, RotateCcw } from "lucide-react";
import { ALGORITHMS_BY_CATEGORY, TOTAL_ALGORITHMS } from "@/data/registry.js";
import { DIFFICULTY } from "@/data/categories.js";
import { useProgress } from "@/context/ProgressContext.jsx";
import IconByName from "@/components/IconByName.jsx";
import RingProgress from "@/components/ui/RingProgress.jsx";
import ProgressBar from "@/components/ui/ProgressBar.jsx";

function AlgoNode({ algo, color, unlocked, complete }) {
  const inner = (
    <motion.div
      whileHover={unlocked ? { y: -3 } : undefined}
      className={`group relative flex h-full flex-col rounded-xl border p-4 transition-shadow ${
        unlocked ? "surface card-hover cursor-pointer" : "surface-sunken cursor-not-allowed"
      }`}
      style={{ borderColor: complete ? `${color}66` : "rgb(var(--border))" }}
    >
      <div className="flex items-start justify-between">
        <span
          className="grid h-8 w-8 place-items-center rounded-lg text-sm font-bold"
          style={{ backgroundColor: complete ? color : `${color}1a`, color: complete ? "#fff" : color }}
        >
          {complete ? <Check className="h-4 w-4" /> : <span>{algo.order}</span>}
        </span>
        {!unlocked && <Lock className="h-4 w-4 text-faint" />}
      </div>
      <h4 className={`mt-3 text-sm font-semibold leading-snug ${!unlocked && "text-faint"}`}>
        {algo.title}
      </h4>
      {algo.tagline && (
        <p className="mt-1 line-clamp-2 text-xs text-muted">{algo.tagline}</p>
      )}
      <div className="mt-auto flex items-center justify-between pt-3">
        {algo.complexity?.time ? (
          <span className="font-mono text-[11px] text-faint">{algo.complexity.time}</span>
        ) : (
          <span />
        )}
        {algo.estMinutes && (
          <span className="flex items-center gap-1 text-[11px] text-faint">
            <Clock className="h-3 w-3" /> {algo.estMinutes}m
          </span>
        )}
      </div>
    </motion.div>
  );

  return unlocked ? <Link to={`/algorithms/${algo.slug}`}>{inner}</Link> : <div title="Complete the previous algorithm to unlock">{inner}</div>;
}

export default function AlgorithmsHub() {
  const { overallPercent, completedCount, categoryCompletion, isUnlocked, isComplete, resetAll, problemStats } =
    useProgress();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Module 01
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Algorithm Mastery</h1>
          <p className="mt-2 max-w-2xl text-muted">
            A guided roadmap through every standard algorithm. Complete one to unlock the
            next. Each lesson: intuition → logic → dry run → interactive simulator → problems.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <RingProgress value={overallPercent} size={84} stroke={8} color="#2563eb" />
          <div className="text-sm">
            <div className="font-semibold">
              {completedCount}/{TOTAL_ALGORITHMS} done
            </div>
            <div className="text-muted">{problemStats.solved} problems solved</div>
            <button
              onClick={() => {
                if (confirm("Reset all progress? This clears completion and problem status.")) resetAll();
              }}
              className="mt-1 flex items-center gap-1 text-xs text-faint hover:text-red-500"
            >
              <RotateCcw className="h-3 w-3" /> Reset progress
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-10 space-y-12">
        {ALGORITHMS_BY_CATEGORY.map((cat) => {
          const pct = categoryCompletion(cat.id);
          return (
            <section key={cat.id} id={cat.id} className="scroll-mt-20">
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl"
                  style={{ backgroundColor: `${cat.color}1a`, color: cat.color }}
                >
                  <IconByName name={cat.icon} className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold">{cat.title}</h2>
                    <span className="font-mono text-xs text-faint">
                      {cat.algorithms.filter((a) => isComplete(a.slug)).length}/{cat.algorithms.length}
                    </span>
                  </div>
                  <p className="text-sm text-muted">{cat.short}</p>
                </div>
                <div className="hidden w-40 sm:block">
                  <ProgressBar value={pct} color={cat.color} />
                </div>
              </div>

              {cat.algorithms.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-faint">
                  Lessons for this category are coming soon.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {cat.algorithms.map((algo) => (
                    <AlgoNode
                      key={algo.slug}
                      algo={algo}
                      color={cat.color}
                      unlocked={isUnlocked(algo.slug)}
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
