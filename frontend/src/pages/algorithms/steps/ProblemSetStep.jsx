import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  ExternalLink,
  Check,
  RotateCcw,
  HelpCircle,
  Target,
  ChevronDown,
  Compass,
  Code2,
} from "lucide-react";
import { DIFFICULTY } from "@/data/categories.js";
import { useProgress } from "@/context/ProgressContext.jsx";
import CodeTabs from "@/components/CodeTabs.jsx";

const STATUS = [
  { key: "solved", label: "Solved", icon: Check, color: "#10b981" },
  { key: "review", label: "Needs review", icon: RotateCcw, color: "#f59e0b" },
  { key: "stuck", label: "Stuck", icon: HelpCircle, color: "#ef4444" },
];

function Reveal({ open, children }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProblemCard({ slug, problem, index }) {
  const [showHint, setShowHint] = useState(false);
  const [showApproach, setShowApproach] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const { getProblemStatus, setProblemStatus } = useProgress();
  const status = getProblemStatus(slug, problem.id);
  const diff = DIFFICULTY[problem.difficulty] || DIFFICULTY.Medium;
  const statusMeta = STATUS.find((s) => s.key === status);
  const sol = problem.solution;
  const sc = sol?.complexity;

  return (
    <div
      className="overflow-hidden rounded-2xl border transition-colors"
      style={{ borderColor: statusMeta ? `${statusMeta.color}55` : "rgb(var(--border))" }}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md surface-sunken font-mono text-xs font-bold text-faint">
            {index + 1}
          </span>
          <span
            className="chip border"
            style={{ color: diff.color, backgroundColor: `${diff.color}1a`, borderColor: `${diff.color}33` }}
          >
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

        {/* Progressive disclosure toggle row */}
        <div className="mt-4 flex flex-wrap gap-2">
          {problem.hint && (
            <button
              onClick={() => setShowHint((s) => !s)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                showHint ? "border-amber-400 text-amber-600 dark:text-amber-400" : "text-muted"
              }`}
              style={showHint ? { backgroundColor: "#f59e0b14" } : { borderColor: "rgb(var(--border-strong))" }}
            >
              <Lightbulb className="h-3.5 w-3.5" /> Hint
            </button>
          )}
          {sol?.approach?.length > 0 && (
            <button
              onClick={() => setShowApproach((s) => !s)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                showApproach ? "border-sky-400 text-sky-600 dark:text-sky-400" : "text-muted"
              }`}
              style={showApproach ? { backgroundColor: "#0ea5e914" } : { borderColor: "rgb(var(--border-strong))" }}
            >
              <Compass className="h-3.5 w-3.5" /> Approach
              <ChevronDown className={`h-3 w-3 transition-transform ${showApproach ? "rotate-180" : ""}`} />
            </button>
          )}
          {sol?.codes?.length > 0 && (
            <button
              onClick={() => setShowCode((s) => !s)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                showCode ? "border-emerald-400 text-emerald-600 dark:text-emerald-400" : "text-muted"
              }`}
              style={showCode ? { backgroundColor: "#10b98114" } : { borderColor: "rgb(var(--border-strong))" }}
            >
              <Code2 className="h-3.5 w-3.5" /> Full solution
              <ChevronDown className={`h-3 w-3 transition-transform ${showCode ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>

        <Reveal open={showHint}>
          <div className="mt-3 flex gap-2 rounded-lg border-l-2 border-amber-400 surface-sunken p-3 text-sm">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <span>{problem.hint}</span>
          </div>
        </Reveal>

        <Reveal open={showApproach}>
          <div className="mt-3 space-y-2 rounded-lg border-l-2 border-sky-400 surface-sunken p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
              <Compass className="h-3.5 w-3.5" /> Approach
            </div>
            {sol?.approach?.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted">
                {p}
              </p>
            ))}
            {sc && (
              <div className="flex flex-wrap gap-2 pt-1">
                {sc.time && <span className="chip surface-raised font-mono text-xs">⏱ {sc.time}</span>}
                {sc.space && <span className="chip surface-raised font-mono text-xs">▢ {sc.space}</span>}
              </div>
            )}
          </div>
        </Reveal>

        <Reveal open={showCode}>
          <div className="mt-3 rounded-lg border-l-2 border-emerald-400 surface-sunken p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              <Code2 className="h-3.5 w-3.5" /> Reference solution
            </div>
            {sol?.codes?.length > 0 && <CodeTabs blocks={sol.codes} />}
          </div>
        </Reveal>
      </div>

      {/* Status footer */}
      <div className="flex flex-wrap items-center gap-2 border-t px-5 py-3" style={{ borderColor: "rgb(var(--border))" }}>
        <span className="mr-1 text-xs text-faint">Your status:</span>
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
  const { getProblemStatus } = useProgress();
  if (!problems || problems.length === 0)
    return <p className="text-muted">A curated problem set is being assembled for this lesson.</p>;

  const solved = problems.filter((p) => getProblemStatus(slug, p.id) === "solved").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl surface-sunken p-4">
        <p className="text-sm text-muted">
          Five problems ordered by difficulty. Try first, then peek progressively — <span className="font-medium text-[color:rgb(var(--text))]">hint</span>,{" "}
          <span className="font-medium text-[color:rgb(var(--text))]">approach</span>, then the{" "}
          <span className="font-medium text-[color:rgb(var(--text))]">full solution</span> with C++ &amp; Python.
        </p>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Check className="h-4 w-4 text-emerald-500" />
          <span>
            {solved}/{problems.length} solved
          </span>
        </div>
      </div>
      {problems.map((p, i) => (
        <ProblemCard key={p.id} slug={slug} problem={p} index={i} />
      ))}
    </div>
  );
}
