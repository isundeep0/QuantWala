import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Target,
  CheckCircle2,
  Circle,
  Layers,
  BookMarked,
  FileText,
  ExternalLink,
  Flag,
  Hammer,
  FlaskConical,
  Gauge,
  BookOpen,
  PenLine,
  Book,
  ScrollText,
  GraduationCap,
  Video,
  Code2,
  FileCode,
  Check,
  Lightbulb,
} from "lucide-react";
import { getKbPhase, getKbAdjacentPhase, CURRICULUM } from "@/data/kernelBypass.js";
import { useKbProgress } from "@/context/KbProgressContext.jsx";
import GlassCard from "@/components/liquid/GlassCard.jsx";
import SwirlProgress from "@/components/liquid/SwirlProgress.jsx";
import { kbIcon } from "./kbIcons.js";

const LEVEL_COLOR = {
  Beginner: "#38bdf8",
  Intermediate: "#22d3ee",
  Advanced: "#a855f7",
  Innovator: "#f472b6",
};

const DELIVERABLE_META = {
  build: { icon: Hammer, label: "Build" },
  experiment: { icon: FlaskConical, label: "Experiment" },
  benchmark: { icon: Gauge, label: "Benchmark" },
  reading: { icon: BookOpen, label: "Reading" },
  writeup: { icon: PenLine, label: "Write-up" },
};

const REF_META = {
  book: { icon: Book, label: "Book" },
  docs: { icon: FileCode, label: "Docs" },
  spec: { icon: ScrollText, label: "Spec" },
  course: { icon: GraduationCap, label: "Course" },
  video: { icon: Video, label: "Video" },
  paper: { icon: FileText, label: "Paper" },
  code: { icon: Code2, label: "Code" },
};

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

/* ---- A single checkable deliverable ---- */
function DeliverableRow({ deliverable, accent }) {
  const { isDone, toggleDeliverable } = useKbProgress();
  const done = isDone(deliverable.id);
  const meta = DELIVERABLE_META[deliverable.type] || DELIVERABLE_META.build;
  const Icon = meta.icon;

  return (
    <div
      className="rounded-xl border p-4 transition-colors"
      style={{
        borderColor: done ? `${accent}66` : "rgb(var(--border))",
        backgroundColor: done ? `${accent}0d` : undefined,
      }}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => toggleDeliverable(deliverable.id)}
          className="mt-0.5 shrink-0"
          aria-label={done ? "Mark not done" : "Mark done"}
        >
          {done ? (
            <CheckCircle2 className="h-5 w-5" style={{ color: accent }} />
          ) : (
            <Circle className="h-5 w-5 text-faint transition-colors hover:text-[color:rgb(var(--text))]" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="chip border text-[10px] font-semibold"
              style={{ color: accent, backgroundColor: `${accent}14`, borderColor: `${accent}33` }}
            >
              <Icon className="h-3 w-3" /> {meta.label}
            </span>
            {deliverable.difficulty && (
              <span className="chip surface-sunken text-[10px] text-muted">{deliverable.difficulty}</span>
            )}
            {deliverable.estHours && (
              <span className="chip surface-sunken font-mono text-[10px] text-muted">~{deliverable.estHours}h</span>
            )}
          </div>
          <h4 className={`mt-1.5 font-semibold leading-snug ${done ? "line-through opacity-70" : ""}`}>
            {deliverable.title}
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-muted">{deliverable.detail}</p>
          {deliverable.outcome && (
            <div className="mt-2 flex items-start gap-2 text-xs text-muted">
              <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
              <span>
                <span className="font-semibold">Outcome:</span> {deliverable.outcome}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- A topic card with its key ideas + deliverables ---- */
function TopicBlock({ topic, accent, index }) {
  const [open, setOpen] = useState(index === 0);
  const { isDone } = useKbProgress();
  const doneCount = topic.deliverables.filter((d) => isDone(d.id)).length;

  return (
    <GlassCard interactive={false} className="overflow-hidden rounded-2xl">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-start gap-3 p-5 text-left">
        <span
          className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg font-mono text-xs font-bold text-white"
          style={{ backgroundColor: accent }}
        >
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold lit-text">{topic.title}</h3>
            <span className="chip surface-sunken text-[10px] font-mono text-faint">
              {doneCount}/{topic.deliverables.length}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">{topic.summary}</p>
        </div>
        <ChevronDown className={`mt-1 h-5 w-5 shrink-0 text-faint transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <Reveal open={open}>
        <div className="border-t px-5 py-5" style={{ borderColor: "rgb(var(--border))" }}>
          {/* Key ideas */}
          <div className="mb-5">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>
              <Lightbulb className="h-3.5 w-3.5" /> Key ideas
            </div>
            <ul className="space-y-1.5">
              {topic.keyIdeas.map((k, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                  <span>{k}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Deliverables */}
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>
            <Target className="h-3.5 w-3.5" /> Deliverables
          </div>
          <div className="space-y-3">
            {topic.deliverables.map((d) => (
              <DeliverableRow key={d.id} deliverable={d} accent={accent} />
            ))}
          </div>

          {/* Topic-scoped references */}
          {topic.references?.length > 0 && (
            <div className="mt-4 space-y-2">
              {topic.references.map((r, i) => (
                <ReferenceRow key={i} reference={r} accent={accent} compact />
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </GlassCard>
  );
}

/* ---- A citable reference (book / docs / spec) ---- */
function ReferenceRow({ reference, accent, compact }) {
  const meta = REF_META[reference.kind] || REF_META.docs;
  const Icon = meta.icon;
  const inner = (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${reference.url ? "hover:brightness-110" : ""}`}
      style={{ borderColor: "rgb(var(--border))" }}
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
        style={{ backgroundColor: `${accent}14`, color: accent }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold leading-snug">{reference.title}</span>
          {reference.url && <ExternalLink className="h-3.5 w-3.5 shrink-0 text-faint" />}
        </div>
        <div className="mt-0.5 text-xs text-faint">
          {[reference.authors, reference.venue, reference.year].filter(Boolean).join(" · ")}
        </div>
        {reference.locator && (
          <div className="mt-1 text-xs font-medium" style={{ color: accent }}>
            {reference.locator}
          </div>
        )}
        {!compact && reference.note && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{reference.note}</p>
        )}
      </div>
    </div>
  );

  if (reference.url) {
    return (
      <a href={reference.url} target="_blank" rel="noreferrer" className="block">
        {inner}
      </a>
    );
  }
  return inner;
}

/* ---- A research paper, with guided reading + read toggle ---- */
function PaperCard({ paper, accent }) {
  const [open, setOpen] = useState(false);
  const { isRead, togglePaper } = useKbProgress();
  const read = isRead(paper.id);
  const diffColor = LEVEL_COLOR[paper.difficulty] || accent;

  return (
    <div
      className="overflow-hidden rounded-2xl border transition-colors"
      style={{
        borderColor: read ? `${accent}66` : "rgb(var(--border))",
        backgroundColor: read ? `${accent}08` : undefined,
      }}
    >
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="chip border text-[10px] font-mono"
            style={{ color: diffColor, backgroundColor: `${diffColor}1a`, borderColor: `${diffColor}33` }}
          >
            {paper.difficulty}
          </span>
          <span className="chip surface-sunken text-[10px] font-mono text-muted">
            {paper.venue} '{String(paper.year).slice(2)}
          </span>
          {(paper.tags || []).slice(0, 3).map((t) => (
            <span key={t} className="chip surface-sunken text-[10px] text-faint">
              #{t}
            </span>
          ))}
        </div>

        <a
          href={paper.url}
          target="_blank"
          rel="noreferrer"
          className="group mt-2 flex items-start gap-1.5"
        >
          <h3 className="font-bold leading-snug group-hover:underline" style={{ textDecorationColor: accent }}>
            {paper.title}
          </h3>
          <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-faint" />
        </a>
        <div className="mt-0.5 text-xs text-faint">{paper.authors}</div>

        <p className="mt-3 text-sm leading-relaxed">
          <span className="font-semibold" style={{ color: accent }}>
            TL;DR
          </span>{" "}
          <span className="text-muted">{paper.tldr}</span>
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          <span className="font-semibold text-[color:rgb(var(--text))]">Why read it: </span>
          {paper.whyRead}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
            style={open ? { backgroundColor: `${accent}14`, borderColor: `${accent}55`, color: accent } : { borderColor: "rgb(var(--border-strong))" }}
          >
            <ScrollText className="h-3.5 w-3.5" /> Reading guide
            <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={() => togglePaper(paper.id)}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
            style={read ? { backgroundColor: accent, color: "#fff", borderColor: accent } : { borderColor: "rgb(var(--border-strong))" }}
          >
            <Check className="h-3.5 w-3.5" /> {read ? "Read" : "Mark read"}
          </button>
        </div>

        <Reveal open={open}>
          <div className="mt-3 rounded-xl surface-sunken p-4">
            {paper.prerequisites?.length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-faint">Before you open it</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {paper.prerequisites.map((p, i) => (
                    <span key={i} className="chip surface-raised text-[11px] text-muted" style={{ backgroundColor: `${accent}10` }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>
              Guided read (three-pass method)
            </div>
            <ol className="mt-2 space-y-2">
              {paper.readingGuide.map((g, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                  <span
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: accent }}
                  >
                    {i + 1}
                  </span>
                  <span>{g}</span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

export default function KernelBypassPhase() {
  const { phaseId } = useParams();
  const navigate = useNavigate();
  const phase = getKbPhase(phaseId);
  const { phaseCompletion, phaseDoneCount } = useKbProgress();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [phaseId]);

  if (!phase) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Phase not found</h1>
        <p className="mt-2 text-muted">This phase isn't available.</p>
        <Link to="/kernel-bypass" className="btn-primary mt-6" style={{ backgroundColor: CURRICULUM.color }}>
          <ArrowLeft className="h-4 w-4" /> Back to Module 05
        </Link>
      </div>
    );
  }

  const accent = phase.color;
  const Icon = kbIcon(phase.icon);
  const levelColor = LEVEL_COLOR[phase.level] || accent;
  const { prev, next } = getKbAdjacentPhase(phase.id);
  const pct = phaseCompletion(phase.id);
  const { done, total } = phaseDoneCount(phase.id);
  const papers = phase.papers || [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link to="/kernel-bypass" className="hover:text-[color:rgb(var(--text))]">
          {CURRICULUM.moduleCode} · Kernel Bypass
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>Phase {phase.index}</span>
      </div>

      {/* Header */}
      <GlassCard interactive={false} className="mt-3 overflow-hidden rounded-[1.75rem] p-6 sm:p-8" style={{ "--glow": `${accent}aa` }}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
                style={{
                  background: `radial-gradient(120% 120% at 30% 20%, ${accent}45, ${accent}12)`,
                  boxShadow: `inset 0 0 16px ${accent}40, 0 0 14px ${accent}26`,
                  color: accent,
                }}
              >
                <Icon className="h-6 w-6" style={{ filter: `drop-shadow(0 0 5px ${accent})` }} />
              </span>
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: accent }}>
                  Phase {phase.index}
                  <span
                    className="chip border text-[10px] font-mono"
                    style={{ color: levelColor, backgroundColor: `${levelColor}1a`, borderColor: `${levelColor}33` }}
                  >
                    {phase.level}
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lit-text">{phase.title}</h1>
              </div>
            </div>
            <p className="mt-3 text-sm font-medium" style={{ color: accent }}>
              {phase.tagline}
            </p>
            <p className="mt-2 leading-relaxed text-muted">{phase.objective}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" style={{ color: accent }} /> {phase.topics.length} topics
              </span>
              <span className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" style={{ color: accent }} /> {total} deliverables
              </span>
              {papers.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" style={{ color: accent }} /> {papers.length} papers
                </span>
              )}
              {phase.estHours && (
                <span className="flex items-center gap-1.5 font-mono">~{phase.estHours}h</span>
              )}
            </div>
          </div>
          <div className="shrink-0 self-center">
            <SwirlProgress value={pct} size={120} stroke={9} color={accent} sublabel={`${done}/${total} done`} />
          </div>
        </div>
      </GlassCard>

      {/* Topics + deliverables */}
      <div className="mt-8 flex items-center gap-2">
        <Layers className="h-5 w-5" style={{ color: accent }} />
        <h2 className="text-lg font-bold lit-text">Topics &amp; deliverables</h2>
      </div>
      <div className="mt-4 space-y-4">
        {phase.topics.map((t, i) => (
          <TopicBlock key={t.id} topic={t} accent={accent} index={i} />
        ))}
      </div>

      {/* Standard materials */}
      {phase.references?.length > 0 && (
        <>
          <div className="mt-10 flex items-center gap-2">
            <BookMarked className="h-5 w-5" style={{ color: accent }} />
            <h2 className="text-lg font-bold lit-text">Standard materials</h2>
          </div>
          <p className="mt-1 text-sm text-muted">
            The peer-reviewed and official sources that anchor this phase — learn from the primary references, not blog reposts.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {phase.references.map((r, i) => (
              <ReferenceRow key={i} reference={r} accent={accent} />
            ))}
          </div>
        </>
      )}

      {/* Reading room (papers) */}
      {papers.length > 0 && (
        <>
          <div className="mt-10 flex items-center gap-2">
            <ScrollText className="h-5 w-5" style={{ color: "#f472b6" }} />
            <h2 className="text-lg font-bold lit-text">Reading room — research papers</h2>
          </div>
          <p className="mt-1 text-sm text-muted">
            Each paper comes with a TL;DR, why it matters, and a guided three-pass reading plan so the frontier stays approachable. Mark them read as you go.
          </p>
          <div className="mt-4 space-y-4">
            {papers.map((p) => (
              <PaperCard key={p.id} paper={p} accent="#f472b6" />
            ))}
          </div>
        </>
      )}

      {/* Milestone */}
      {phase.milestone && (
        <GlassCard interactive={false} className="mt-10 rounded-[1.5rem] p-6" style={{ "--glow": `${accent}aa` }}>
          <div className="flex items-start gap-3">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
              style={{ backgroundColor: `${accent}14`, color: accent }}
            >
              <Flag className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>
                Phase milestone
              </div>
              <p className="mt-1 font-medium leading-relaxed">{phase.milestone}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Phase pager */}
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link to={`/kernel-bypass/${prev.id}`} className="card card-hover flex items-center gap-3 p-4">
            <ChevronLeft className="h-5 w-5 text-muted" />
            <div>
              <div className="text-xs text-faint">Previous · Phase {prev.index}</div>
              <div className="font-semibold">{prev.title}</div>
            </div>
          </Link>
        ) : (
          <Link to="/kernel-bypass" className="card card-hover flex items-center gap-3 p-4">
            <ArrowLeft className="h-5 w-5 text-muted" />
            <div>
              <div className="text-xs text-faint">Back to</div>
              <div className="font-semibold">Module 05 overview</div>
            </div>
          </Link>
        )}
        {next ? (
          <button
            onClick={() => navigate(`/kernel-bypass/${next.id}`)}
            className="card card-hover flex items-center justify-end gap-3 p-4 text-right"
          >
            <div>
              <div className="text-xs text-faint">Next · Phase {next.index}</div>
              <div className="font-semibold">{next.title}</div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted" />
          </button>
        ) : (
          <Link to="/kernel-bypass" className="card card-hover flex items-center justify-end gap-3 p-4 text-right">
            <div>
              <div className="text-xs text-faint">You've reached the frontier</div>
              <div className="font-semibold">Back to Module 05</div>
            </div>
            <CheckCircle2 className="h-5 w-5" style={{ color: accent }} />
          </Link>
        )}
      </div>

      <div className="h-8" />
    </div>
  );
}
