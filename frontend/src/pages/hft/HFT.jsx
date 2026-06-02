import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Compass,
  BookOpen,
  LineChart,
  Sigma,
  Code2,
  Gauge,
  Network,
  Briefcase,
  Check,
  Clock,
  RotateCcw,
  Cpu,
  PlayCircle,
  ChevronRight,
} from "lucide-react";
import { HFT_LESSONS_BY_SECTION, HFT_TOTAL_LESSONS } from "@/data/hftRegistry.js";
import { HFT_LEVEL, HFT_TRACK } from "@/data/hftSections.js";
import { useHftProgress } from "@/context/HftProgressContext.jsx";
import GlassCard from "@/components/liquid/GlassCard.jsx";
import SwirlProgress from "@/components/liquid/SwirlProgress.jsx";

const SECTION_ICON = {
  foundations: Compass,
  microstructure: BookOpen,
  strategies: LineChart,
  "quant-math": Sigma,
  cpp: Code2,
  systems: Gauge,
  architecture: Network,
  interview: Briefcase,
};

const FIRMS = [
  "Jane Street",
  "Citadel Securities",
  "Hudson River Trading",
  "Jump Trading",
  "Optiver",
  "Tower Research",
  "DRW",
  "Two Sigma",
];

function LessonVessel({ lesson, color, complete, hasViz }) {
  const lvl = HFT_LEVEL[lesson.level] || null;
  return (
    <Link to={`/hft/${lesson.slug}`} className="group relative block h-full">
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
        {complete ? <Check className="h-4 w-4" /> : lesson.order}
      </span>

      <GlassCard
        className="flex h-full flex-col p-4 pt-5"
        style={{ borderRadius: "1.5rem 1.5rem 2.2rem 1.5rem", "--glow": `${color}aa` }}
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold leading-snug lit-text">{lesson.title}</h4>
          {hasViz && (
            <span title="Has an interactive visualization" className="shrink-0" style={{ color }}>
              <PlayCircle className="h-4 w-4" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
            </span>
          )}
        </div>
        {lesson.tagline && <p className="mt-1 line-clamp-2 text-xs text-muted">{lesson.tagline}</p>}

        <div className="mt-2 flex flex-wrap gap-1">
          {(lesson.track || []).slice(0, 3).map((t) => {
            const tm = HFT_TRACK[t];
            if (!tm) return null;
            return (
              <span
                key={t}
                className="rounded px-1.5 py-0.5 text-[9px] font-semibold"
                style={{ color: tm.color, background: `${tm.color}18` }}
              >
                {tm.label}
              </span>
            );
          })}
        </div>

        <div
          className="mt-auto flex items-center justify-between gap-2 pt-3"
          style={{ borderTop: "1px solid rgb(var(--glass-stroke) / 0.08)" }}
        >
          {lvl ? (
            <span className="etched-glow font-mono text-[11px]" style={{ "--glow": `${lvl.color}cc`, color: lvl.color }}>
              {lvl.label}
            </span>
          ) : (
            <span />
          )}
          {lesson.estMinutes && (
            <span className="etched flex items-center gap-1 font-mono text-[11px]">
              <Clock className="h-3 w-3" /> {lesson.estMinutes}m
            </span>
          )}
        </div>
      </GlassCard>
    </Link>
  );
}

export default function HFT() {
  const { overallPercent, completedCount, sectionCompletion, isComplete, resetAll, problemStats } =
    useHftProgress();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* ===== Module lens ===== */}
      <GlassCard interactive={false} iris className="relative overflow-hidden rounded-[2rem] p-6 sm:p-9">
        <div className="absolute inset-0 dot-grid opacity-30" aria-hidden />
        <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#10b981", textShadow: "0 0 12px rgba(16,185,129,0.6)" }}>
              <Cpu className="h-4 w-4" /> Module 03
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl lit-text">
              HFT &amp; Low-Latency Systems
            </h1>
            <p className="mt-3 text-muted">
              A complete, beginner-to-job-ready path into high-frequency trading. Start with the business and the
              market, master the probability and mental-math interview core, go deep on modern C++ and the systems
              engineering where nanoseconds are won, then assemble a real trading system and drill the interview.
              Built for <span className="font-semibold">quant-dev, research, and low-latency systems</span> roles.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="glass-orb px-3 py-1.5 text-sm font-semibold">
                <span className="etched-glow" style={{ "--glow": "#10b981aa" }}>
                  {completedCount}/{HFT_TOTAL_LESSONS}
                </span>{" "}
                <span className="text-muted">lessons</span>
              </span>
              <span className="glass-orb px-3 py-1.5 text-sm font-semibold">
                <span className="etched-glow" style={{ "--glow": "#06b6d4aa" }}>{problemStats.solved}</span>{" "}
                <span className="text-muted">questions done</span>
              </span>
              <button
                onClick={() => {
                  if (confirm("Reset all HFT progress? This clears completion and question status.")) resetAll();
                }}
                className="glass-orb glass-interactive flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted hover:text-red-400"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset progress
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {FIRMS.map((f) => (
                <span key={f} className="chip border font-mono text-[11px]" style={{ borderColor: "#10b98144", color: "#10b981" }}>
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className="shrink-0 self-center">
            <SwirlProgress value={overallPercent} size={150} stroke={11} color="#10b981" sublabel="complete" />
          </div>
        </div>
      </GlassCard>

      {/* ===== How to use ===== */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { t: "Follow it in order", d: "Each section builds on the last — foundations → domain → math → C++ → systems → architecture → interview." },
          { t: "Theory + practice", d: "Every lesson ends with interview questions and build/coding problems. Answer out loud, then check yourself." },
          { t: "Play with the sims", d: "Lessons marked ▶ have a hands-on visualization — an order book, a ring buffer, a market-making game, and more." },
        ].map((c) => (
          <div key={c.t} className="rounded-2xl border p-4" style={{ borderColor: "rgb(var(--border))" }}>
            <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#10b981" }}>
              <ChevronRight className="h-4 w-4" /> {c.t}
            </div>
            <p className="mt-1.5 text-sm text-muted">{c.d}</p>
          </div>
        ))}
      </div>

      {/* ===== Sections ===== */}
      <div className="mt-12 space-y-14">
        {HFT_LESSONS_BY_SECTION.map((section) => {
          const SIcon = SECTION_ICON[section.id] || Cpu;
          const pct = sectionCompletion(section.id);
          const done = section.lessons.filter((l) => isComplete(l.slug)).length;
          return (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <GlassCard className="mb-5 flex items-center gap-4 rounded-2xl px-4 py-3" style={{ "--glow": `${section.color}aa` }}>
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                  style={{
                    background: `radial-gradient(120% 120% at 30% 20%, ${section.color}45, ${section.color}12)`,
                    boxShadow: `inset 0 0 14px ${section.color}40, 0 0 12px ${section.color}26`,
                    color: section.color,
                  }}
                >
                  <SIcon className="h-5 w-5" style={{ filter: `drop-shadow(0 0 4px ${section.color})` }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="truncate text-lg font-bold lit-text">{section.title}</h2>
                    {section.lessons.length > 0 && (
                      <span className="etched-glow shrink-0 font-mono text-xs" style={{ "--glow": `${section.color}cc` }}>
                        {done}/{section.lessons.length}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted">{section.short}</p>
                </div>
                {section.lessons.length > 0 && (
                  <div className="hidden h-2 w-40 overflow-hidden rounded-full sm:block" style={{ background: "rgb(var(--glass-stroke) / 0.12)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${section.color}99, ${section.color})`, boxShadow: `0 0 10px ${section.color}aa` }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                    />
                  </div>
                )}
              </GlassCard>

              {section.lessons.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-faint" style={{ borderColor: "rgb(var(--glass-stroke) / 0.15)" }}>
                  Lessons for this section are coming soon.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {section.lessons.map((lesson) => (
                    <LessonVessel
                      key={lesson.slug}
                      lesson={lesson}
                      color={section.color}
                      complete={isComplete(lesson.slug)}
                      hasViz={Boolean(lesson.visualizer)}
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
