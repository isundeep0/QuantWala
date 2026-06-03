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
  MessageSquare,
  Terminal,
} from "lucide-react";
import { useHftProgress } from "@/context/HftProgressContext.jsx";
import CodeTabs from "@/components/CodeTabs.jsx";
import { HFT_LEVEL } from "@/data/hftSections.js";

const STATUS = [
  { key: "solved", label: "Got it", icon: Check, color: "#10b981" },
  { key: "review", label: "Review", icon: RotateCcw, color: "#f59e0b" },
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

function levelMeta(level) {
  return HFT_LEVEL[level] || { label: level || "Core", color: "#10b981" };
}

/* ---- Conceptual interview question (reveal-answer) ---- */
function InterviewCard({ slug, item, index, accent }) {
  const [open, setOpen] = useState(false);
  const { getProblemStatus, setProblemStatus } = useHftProgress();
  const id = item.id || `q${index}`;
  const status = getProblemStatus(slug, id);
  const statusMeta = STATUS.find((s) => s.key === status);

  return (
    <div
      className="overflow-hidden rounded-2xl border transition-colors"
      style={{ borderColor: statusMeta ? `${statusMeta.color}55` : "rgb(var(--border))" }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 p-5 text-left"
      >
        <span
          className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md font-mono text-xs font-bold text-white"
          style={{ backgroundColor: accent }}
        >
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            {item.tag && (
              <span
                className="chip border text-[10px] font-mono"
                style={{ color: accent, backgroundColor: `${accent}14`, borderColor: `${accent}33` }}
              >
                {item.tag}
              </span>
            )}
            {item.askedBy && <span className="chip surface-sunken text-[10px]">Asked at {item.askedBy}</span>}
          </div>
          <p className="font-semibold leading-snug">{item.q}</p>
        </div>
        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-faint transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <Reveal open={open}>
        <div className="border-t px-5 py-4" style={{ borderColor: "rgb(var(--border))" }}>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>
            <Compass className="h-3.5 w-3.5" /> Model answer
          </div>
          <div className="space-y-2">
            {(item.a || []).map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted">
                {p}
              </p>
            ))}
          </div>
          {item.codes?.length > 0 && (
            <div className="mt-3">
              <CodeTabs blocks={item.codes} />
            </div>
          )}
          {item.followups?.length > 0 && (
            <div className="mt-3 rounded-lg surface-sunken p-3">
              <div className="text-xs font-semibold text-muted">They'll follow up with…</div>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-muted">
                {item.followups.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Reveal>

      <div className="flex flex-wrap items-center gap-2 border-t px-5 py-3" style={{ borderColor: "rgb(var(--border))" }}>
        <span className="mr-1 text-xs text-faint">Self-rate:</span>
        {STATUS.map((s) => {
          const Icon = s.icon;
          const active = status === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setProblemStatus(slug, id, active ? null : s.key)}
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
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

/* ---- Coding / build problem (progressive disclosure) ---- */
function ProblemCard({ slug, problem, index, accent }) {
  const [showHint, setShowHint] = useState(false);
  const [showApproach, setShowApproach] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const { getProblemStatus, setProblemStatus } = useHftProgress();
  const status = getProblemStatus(slug, problem.id);
  const lvl = levelMeta(problem.difficulty);
  const statusMeta = STATUS.find((s) => s.key === status);
  const sol = problem.solution;
  const sc = sol?.complexity;

  return (
    <div
      className="overflow-hidden rounded-2xl border transition-colors"
      style={{ borderColor: statusMeta ? `${statusMeta.color}55` : "rgb(var(--border))" }}
    >
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md surface-sunken font-mono text-xs font-bold text-faint">
            {index + 1}
          </span>
          <span
            className="chip border"
            style={{ color: lvl.color, backgroundColor: `${lvl.color}1a`, borderColor: `${lvl.color}33` }}
          >
            {lvl.label}
          </span>
          <h4 className="text-base font-semibold">{problem.title}</h4>
          {problem.link && (
            <a
              href={problem.link}
              target="_blank"
              rel="noreferrer"
              className="ml-auto flex items-center gap-1 text-xs text-muted hover:text-[color:rgb(var(--text))]"
            >
              Open <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted">{problem.statement}</p>

        {problem.tests && (
          <div className="mt-3 flex items-start gap-2 text-xs text-muted">
            <Target className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
            <span>
              <span className="font-semibold">Skill tested:</span> {problem.tests}
            </span>
          </div>
        )}

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
              <Code2 className="h-3.5 w-3.5" /> Solution
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

export default function PracticeStep({ slug, data, accent = "#10b981" }) {
  if (!data || (!data.interviewQuestions?.length && !data.problems?.length)) {
    return <p className="text-muted">A practice set is being assembled for this lesson.</p>;
  }
  const questions = data.interviewQuestions || [];
  const problems = data.problems || [];

  return (
    <div className="space-y-8">
      {data.intro && (
        <div className="rounded-2xl surface-sunken p-4 text-sm leading-relaxed text-muted">{data.intro}</div>
      )}

      {questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" style={{ color: accent }} />
            <h3 className="font-semibold">Interview questions</h3>
            <span className="chip surface-sunken text-faint">{questions.length}</span>
          </div>
          <p className="text-sm text-muted">
            Try to answer out loud first, the way you would in a room — then expand to compare with a
            model answer. Self-rate so you know what to revisit.
          </p>
          {questions.map((item, i) => (
            <InterviewCard key={item.id || i} slug={slug} item={item} index={i} accent={accent} />
          ))}
        </div>
      )}

      {problems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4" style={{ color: accent }} />
            <h3 className="font-semibold">Coding &amp; build problems</h3>
            <span className="chip surface-sunken text-faint">{problems.length}</span>
          </div>
          <p className="text-sm text-muted">
            Implement these yourself first. Reveal the hint, then the approach, then a reference
            solution in C++ &amp; Python — exactly the progressive help a good mentor would give.
          </p>
          {problems.map((p, i) => (
            <ProblemCard key={p.id || i} slug={slug} problem={p} index={i} accent={accent} />
          ))}
        </div>
      )}
    </div>
  );
}
