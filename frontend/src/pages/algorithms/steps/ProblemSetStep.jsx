import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ExternalLink, Check, RotateCcw, HelpCircle, Target } from "lucide-react";
import { DIFFICULTY } from "@/data/categories.js";
import { useProgress } from "@/context/ProgressContext.jsx";

const STATUS = [
  { key: "solved", label: "Solved", icon: Check, color: "#10b981" },
  { key: "review", label: "Needs review", icon: RotateCcw, color: "#f59e0b" },
  { key: "stuck", label: "Stuck", icon: HelpCircle, color: "#ef4444" },
];

function ProblemCard({ slug, problem }) {
  const [showHint, setShowHint] = useState(false);
  const { getProblemStatus, setProblemStatus } = useProgress();
  const status = getProblemStatus(slug, problem.id);
  const diff = DIFFICULTY[problem.difficulty] || DIFFICULTY.Medium;

  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: status ? `${(STATUS.find((s) => s.key === status) || {}).color}55` : "rgb(var(--border))" }}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip border" style={{ color: diff.color, backgroundColor: `${diff.color}1a`, borderColor: `${diff.color}33` }}>
          {diff.label}
        </span>
        <h4 className="text-base font-semibold">{problem.title}</h4>
        {problem.link && (
          <a
            href={problem.link}
            target="_blank"
            rel="noreferrer"
            className="ml-auto flex items-center gap-1 text-xs text-muted hover:text-brand-500"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">{problem.statement}</p>

      {problem.tests && (
        <div className="mt-3 flex items-start gap-2 text-xs text-muted">
          <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
          <span>
            <span className="font-semibold">Tests:</span> {problem.tests}
          </span>
        </div>
      )}

      {problem.hint && (
        <div className="mt-3">
          <button
            onClick={() => setShowHint((s) => !s)}
            className="flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400"
          >
            <Lightbulb className="h-4 w-4" /> {showHint ? "Hide hint" : "Reveal hint"}
          </button>
          <AnimatePresence>
            {showHint && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 overflow-hidden rounded-lg surface-sunken p-3 text-sm"
              >
                {problem.hint}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS.map((s) => {
          const Icon = s.icon;
          const active = status === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setProblemStatus(slug, problem.id, active ? null : s.key)}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
              style={
                active
                  ? { backgroundColor: s.color, color: "#fff", borderColor: s.color }
                  : { borderColor: "rgb(var(--border-strong))" }
              }
            >
              <Icon className="h-3.5 w-3.5" /> {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ProblemSetStep({ slug, problems }) {
  if (!problems || problems.length === 0)
    return <p className="text-muted">A curated problem set is being assembled for this lesson.</p>;
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Five problems ordered by difficulty. Reveal a hint only if you're stuck, then track your
        status — it's saved locally.
      </p>
      {problems.map((p) => (
        <ProblemCard key={p.id} slug={slug} problem={p} />
      ))}
    </div>
  );
}
