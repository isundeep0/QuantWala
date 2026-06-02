import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  ChevronDown,
  Compass,
  Check,
  RotateCcw,
  HelpCircle,
  CornerDownRight,
  ListChecks,
  ExternalLink,
} from "lucide-react";
import { SD_DIFFICULTY } from "@/data/systemDesign.js";
import { useSdProgress } from "@/context/SdProgressContext.jsx";
import { formatInline } from "@/lib/inline.jsx";

const STATUS = [
  { key: "got", label: "Got it", icon: Check, color: "#10b981" },
  { key: "review", label: "Review", icon: RotateCcw, color: "#f59e0b" },
  { key: "stuck", label: "Stuck", icon: HelpCircle, color: "#ef4444" },
];

const ACCENT = "#d97706";

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

function QuestionCard({ slug, q, index }) {
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const { getQuestionStatus, setQuestionStatus } = useSdProgress();
  const status = getQuestionStatus(slug, q.id);
  const diff = SD_DIFFICULTY[q.difficulty] || SD_DIFFICULTY.Medium;
  const statusMeta = STATUS.find((s) => s.key === status);

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
          {q.kind && (
            <span className="chip surface-sunken text-[10px] uppercase tracking-wide text-muted">
              {q.kind}
            </span>
          )}
          {q.difficulty && (
            <span
              className="chip border text-[10px]"
              style={{ color: diff.color, backgroundColor: `${diff.color}1a`, borderColor: `${diff.color}33` }}
            >
              {diff.label}
            </span>
          )}
          {q.link && (
            <a
              href={q.link}
              target="_blank"
              rel="noreferrer"
              className="ml-auto flex items-center gap-1 text-xs text-muted hover:text-[color:rgb(var(--text))]"
            >
              Reference <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        <p className="mt-3 text-[15px] font-medium leading-relaxed">{formatInline(q.prompt)}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {q.hint && (
            <button
              onClick={() => setShowHint((s) => !s)}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
              style={
                showHint
                  ? { borderColor: "#f59e0b", color: "#d97706", backgroundColor: "#f59e0b14" }
                  : { borderColor: "rgb(var(--border-strong))", color: "rgb(var(--text-muted))" }
              }
            >
              <Lightbulb className="h-3.5 w-3.5" /> Hint
            </button>
          )}
          {(q.answer?.length > 0 || q.keyPoints?.length > 0) && (
            <button
              onClick={() => setShowAnswer((s) => !s)}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
              style={
                showAnswer
                  ? { borderColor: "#0ea5e9", color: "#0ea5e9", backgroundColor: "#0ea5e914" }
                  : { borderColor: "rgb(var(--border-strong))", color: "rgb(var(--text-muted))" }
              }
            >
              <Compass className="h-3.5 w-3.5" /> Model answer
              <ChevronDown className={`h-3 w-3 transition-transform ${showAnswer ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>

        <Reveal open={showHint}>
          <div className="mt-3 flex gap-2 rounded-lg border-l-2 border-amber-400 surface-sunken p-3 text-sm">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <span>{formatInline(q.hint)}</span>
          </div>
        </Reveal>

        <Reveal open={showAnswer}>
          <div className="mt-3 space-y-3 rounded-lg border-l-2 border-sky-400 surface-sunken p-4">
            {q.answer?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
                  <Compass className="h-3.5 w-3.5" /> How to answer
                </div>
                {q.answer.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-[color:rgb(var(--text-muted))]">
                    {formatInline(p)}
                  </p>
                ))}
              </div>
            )}

            {q.keyPoints?.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  <ListChecks className="h-3.5 w-3.5" /> A strong answer hits
                </div>
                <ul className="space-y-1">
                  {q.keyPoints.map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span>{formatInline(p)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {q.followUps?.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  <CornerDownRight className="h-3.5 w-3.5" /> Likely follow-ups
                </div>
                <ul className="space-y-1">
                  {q.followUps.map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted">
                      <CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-faint" />
                      <span>{formatInline(p)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Reveal>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t px-5 py-3" style={{ borderColor: "rgb(var(--border))" }}>
        <span className="mr-1 text-xs text-faint">Self-assess:</span>
        {STATUS.map((s) => {
          const Icon = s.icon;
          const active = status === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setQuestionStatus(slug, q.id, active ? null : s.key)}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
              style={
                active
                  ? { backgroundColor: s.color, color: "#fff", borderColor: s.color }
                  : { borderColor: "rgb(var(--border-strong))", color: "rgb(var(--text-muted))" }
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

export default function PracticeSet({ slug, questions }) {
  const { getQuestionStatus } = useSdProgress();
  if (!questions || questions.length === 0) return null;
  const got = questions.filter((q) => getQuestionStatus(slug, q.id) === "got").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl surface-sunken p-4">
        <p className="text-sm text-muted">
          Think through each one out loud as if an interviewer were listening. Reveal the{" "}
          <span className="font-medium text-[color:rgb(var(--text))]">hint</span>, then the{" "}
          <span className="font-medium text-[color:rgb(var(--text))]">model answer</span> only after you
          have a structure of your own.
        </p>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Check className="h-4 w-4 text-emerald-500" />
          <span>
            {got}/{questions.length} got it
          </span>
        </div>
      </div>
      {questions.map((q, i) => (
        <QuestionCard key={q.id} slug={slug} q={q} index={i} />
      ))}
    </div>
  );
}
