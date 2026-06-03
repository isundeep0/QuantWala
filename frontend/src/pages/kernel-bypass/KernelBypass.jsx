import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  ArrowRight,
  RotateCcw,
  BookOpen,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Target,
  Layers,
  ScrollText,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  CURRICULUM,
  KB_PHASES,
  KB_TOTAL_DELIVERABLES,
  KB_TOTAL_PAPERS,
  KB_TOTAL_TOPICS,
  KB_TOTAL_HOURS,
} from "@/data/kernelBypass.js";
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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: "easeOut" },
  }),
};

function ReadingProtocol({ accent }) {
  const [open, setOpen] = useState(false);
  const rp = CURRICULUM.readingProtocol;
  return (
    <GlassCard
      interactive={false}
      className="mt-8 overflow-hidden rounded-[1.5rem]"
      style={{ "--glow": `${accent}aa` }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
          style={{
            background: `radial-gradient(120% 120% at 30% 20%, ${accent}45, ${accent}12)`,
            boxShadow: `inset 0 0 14px ${accent}40, 0 0 12px ${accent}26`,
            color: accent,
          }}
        >
          <ScrollText className="h-5 w-5" style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold lit-text">{rp.title}</div>
          <p className="truncate text-xs text-muted">{rp.intro.split(".")[0]}.</p>
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-faint transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t px-5 py-5" style={{ borderColor: "rgb(var(--border))" }}>
              <p className="text-sm leading-relaxed text-muted">{rp.intro}</p>
              <ol className="mt-4 space-y-3">
                {rp.steps.map((s, i) => (
                  <li
                    key={i}
                    className="flex gap-4 rounded-xl border p-4"
                    style={{ borderColor: "rgb(var(--border))" }}
                  >
                    <span
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: accent }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-semibold">{s.title}</div>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <a
                href={rp.reference.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl surface-sunken px-3 py-2 text-sm font-medium hover:brightness-110"
              >
                <FileText className="h-4 w-4" style={{ color: accent }} />
                <span>
                  {rp.reference.title}
                  <span className="text-faint">
                    {" "}
                    · {rp.reference.authors}, {rp.reference.venue} {rp.reference.year}
                  </span>
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-faint" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function PhaseCard({ phase, index }) {
  const Icon = kbIcon(phase.icon);
  const { phaseCompletion, phaseDoneCount } = useKbProgress();
  const pct = phaseCompletion(phase.id);
  const { done, total } = phaseDoneCount(phase.id);
  const color = phase.color;
  const levelColor = LEVEL_COLOR[phase.level] || color;
  const paperCount = (phase.papers || []).length;

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
    >
      <Link to={`/kernel-bypass/${phase.id}`} className="group relative block h-full">
        {/* Phase index medallion */}
        <span
          className="glass-orb absolute -left-2 -top-2 z-10 grid h-9 w-9 place-items-center font-mono text-sm font-bold"
          style={{
            color: pct === 100 ? "#fff" : color,
            background:
              pct === 100
                ? `radial-gradient(120% 120% at 30% 22%, #fff6, transparent 45%), ${color}`
                : undefined,
            boxShadow: pct === 100 ? `0 0 16px ${color}aa` : undefined,
          }}
        >
          {pct === 100 ? <CheckCircle2 className="h-5 w-5" /> : phase.index}
        </span>

        <GlassCard
          className="flex h-full flex-col rounded-[1.6rem] p-6"
          style={{ "--glow": `${color}aa` }}
        >
          <div className="flex items-start justify-between gap-3">
            <span
              className="grid h-12 w-12 place-items-center rounded-2xl"
              style={{
                background: `radial-gradient(120% 120% at 30% 20%, ${color}45, ${color}12)`,
                boxShadow: `inset 0 0 16px ${color}40, 0 0 14px ${color}26`,
                color,
              }}
            >
              <Icon className="h-6 w-6" style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
            </span>
            <SwirlProgress value={pct} size={56} stroke={6} color={color} />
          </div>

          <div className="mt-5 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-faint">
              Phase {phase.index}
            </span>
            <span
              className="chip border text-[10px] font-mono"
              style={{ color: levelColor, backgroundColor: `${levelColor}1a`, borderColor: `${levelColor}33` }}
            >
              {phase.level}
            </span>
          </div>
          <h3 className="mt-1 text-xl font-bold lit-text">{phase.title}</h3>
          <p className="mt-1 text-sm font-medium" style={{ color }}>
            {phase.tagline}
          </p>
          <p className="mt-2 line-clamp-3 text-sm text-muted">{phase.objective}</p>

          {/* Topic preview chips */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {phase.topics.slice(0, 4).map((t) => (
              <span key={t.id} className="chip surface-sunken text-[11px] text-muted">
                {t.title}
              </span>
            ))}
          </div>

          <div
            className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-5 text-xs text-muted"
            style={{ borderTop: "1px solid rgb(var(--glass-stroke) / 0.08)", marginTop: "1.25rem" }}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" style={{ color }} /> {phase.topics.length} topics
            </span>
            <span className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" style={{ color }} />
              <span style={{ color: done > 0 ? color : undefined }}>
                {done}/{total}
              </span>{" "}
              deliverables
            </span>
            {paperCount > 0 && (
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" style={{ color }} /> {paperCount} papers
              </span>
            )}
          </div>

          <div
            className="mt-4 flex items-center gap-1.5 text-sm font-semibold"
            style={{ color, textShadow: `0 0 10px ${color}55` }}
          >
            Enter Phase {phase.index}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}

export default function KernelBypass() {
  const accent = CURRICULUM.color;
  const { overallPercent, completedCount, papersRead, resetAll } = useKbProgress();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* ===== Module lens ===== */}
      <GlassCard interactive={false} iris className="relative overflow-hidden rounded-[2rem] p-6 sm:p-9">
        <div className="absolute inset-0 dot-grid opacity-30" aria-hidden />
        <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: accent, textShadow: `0 0 12px ${accent}99` }}
            >
              <Cpu className="h-4 w-4" /> {CURRICULUM.moduleCode}
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl lit-text">
              {CURRICULUM.title}
            </h1>
            <p className="mt-3 text-muted">{CURRICULUM.description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="glass-orb px-3 py-1.5 text-sm font-semibold">
                <span className="etched-glow" style={{ "--glow": `${accent}aa` }}>
                  {completedCount}/{KB_TOTAL_DELIVERABLES}
                </span>{" "}
                <span className="text-muted">deliverables</span>
              </span>
              <span className="glass-orb px-3 py-1.5 text-sm font-semibold">
                <span className="etched-glow" style={{ "--glow": "#f472b6aa" }}>
                  {papersRead}/{KB_TOTAL_PAPERS}
                </span>{" "}
                <span className="text-muted">papers read</span>
              </span>
              <button
                onClick={() => {
                  if (confirm("Reset all Module 05 progress? This clears deliverables and papers read."))
                    resetAll();
                }}
                className="glass-orb glass-interactive flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted hover:text-red-400"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset progress
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {["DPDK", "SPDK", "eBPF / XDP", "AF_XDP", "RDMA", "Unikernels", "Dataplane OS"].map((f) => (
                <span
                  key={f}
                  className="chip border font-mono text-[11px]"
                  style={{ borderColor: `${accent}44`, color: accent }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className="shrink-0 self-center">
            <SwirlProgress value={overallPercent} size={150} stroke={11} color={accent} sublabel="complete" />
          </div>
        </div>
      </GlassCard>

      {/* ===== At a glance ===== */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { v: KB_PHASES.length, label: "Phases", color: "#38bdf8" },
          { v: KB_TOTAL_TOPICS, label: "Topics", color: accent },
          { v: KB_TOTAL_DELIVERABLES, label: "Deliverables", color: "#a855f7" },
          { v: `${KB_TOTAL_PAPERS} · ~${KB_TOTAL_HOURS}h`, label: "Papers · effort", color: "#f472b6" },
        ].map((s) => (
          <GlassCard key={s.label} interactive={false} className="rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold etched-glow" style={{ "--glow": `${s.color}cc`, color: s.color }}>
              {s.v}
            </div>
            <div className="mt-0.5 text-xs text-muted">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* ===== Reading protocol (paper-reading requirement) ===== */}
      <ReadingProtocol accent="#f472b6" />

      {/* ===== Outcomes ===== */}
      <GlassCard interactive={false} className="mt-6 rounded-[1.5rem] p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4" style={{ color: accent }} />
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">What you'll be able to do</h2>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {CURRICULUM.outcomes.map((o, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} />
              <span className="text-muted">{o}</span>
            </li>
          ))}
        </ul>
      </GlassCard>

      {/* ===== How to use ===== */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { t: "Follow the five phases in order", d: "Each phase earns the next: you can't appreciate DPDK until you've measured why the kernel is slow. Start at Phase 1." },
          { t: "Build the deliverables", d: "Every topic ends in concrete, checkable deliverables — build it, benchmark it, write it up. That's how the ideas stick." },
          { t: "Read the papers with the protocol", d: "Use the three-pass method above. Every paper ships a guided reading plan so the research frontier stays approachable." },
        ].map((c) => (
          <div key={c.t} className="rounded-2xl border p-4" style={{ borderColor: "rgb(var(--border))" }}>
            <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: accent }}>
              <ChevronRight className="h-4 w-4" /> {c.t}
            </div>
            <p className="mt-1.5 text-sm text-muted">{c.d}</p>
          </div>
        ))}
      </div>

      {/* ===== Phases ===== */}
      <div className="mt-10 flex items-center gap-2">
        <BookOpen className="h-5 w-5" style={{ color: accent }} />
        <h2 className="text-lg font-bold lit-text">The roadmap — beginner to innovator</h2>
      </div>
      <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {KB_PHASES.map((phase, i) => (
          <PhaseCard key={phase.id} phase={phase} index={i} />
        ))}
      </div>

      <div className="h-8" />
    </div>
  );
}
