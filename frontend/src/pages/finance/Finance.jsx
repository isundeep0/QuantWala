import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Clock, RotateCcw, Wallet, MapPin, IndianRupee, Cake, Car } from "lucide-react";
import {
  FIN_LESSONS_BY_SECTION,
  FIN_TOTAL_LESSONS,
  FIN_DIFFICULTY,
  FIN_PERSONA,
} from "@/data/finance.js";
import { useFinanceProgress } from "@/context/FinanceProgressContext.jsx";
import FinIcon from "@/components/finance/FinIcon.jsx";
import GlassCard from "@/components/liquid/GlassCard.jsx";
import SwirlProgress from "@/components/liquid/SwirlProgress.jsx";

const ACCENT = "#14b8a6";

function LessonCard({ lesson, color, complete }) {
  const diff = FIN_DIFFICULTY[lesson.difficulty];
  return (
    <Link to={`/finance/${lesson.slug}`} className="group relative block h-full">
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
        <h4 className="text-sm font-semibold leading-snug lit-text">{lesson.title}</h4>
        {lesson.summary && <p className="mt-1 line-clamp-2 text-xs text-muted">{lesson.summary}</p>}

        <div
          className="mt-auto flex items-center justify-between gap-2 pt-3"
          style={{ borderTop: "1px solid rgb(var(--glass-stroke) / 0.08)" }}
        >
          {diff ? (
            <span className="text-[11px] font-semibold" style={{ color: diff.color }}>
              {diff.label}
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

function PersonaChip({ icon: Icon, label }) {
  return (
    <span className="glass-orb flex items-center gap-1.5 px-2.5 py-1 text-xs">
      <Icon className="h-3.5 w-3.5" style={{ color: ACCENT }} />
      <span className="text-muted">{label}</span>
    </span>
  );
}

export default function Finance() {
  const { overallPercent, completedCount, sectionCompletion, isComplete, resetAll, questionStats } =
    useFinanceProgress();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Module lens */}
      <GlassCard interactive={false} iris className="relative overflow-hidden rounded-[2rem] p-6 sm:p-9">
        <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: "#2dd4bf", textShadow: "0 0 12px rgba(20,184,166,0.6)" }}
            >
              <Wallet className="h-4 w-4" /> Module 05
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl lit-text">
              Personal Finance & Investing
            </h1>
            <p className="mt-3 text-muted">
              A complete, from-scratch masterclass for the Indian market — built so that by the end
              you can run your own money with confidence. Six modules, from budgeting and the
              emergency fund through compounding, credit, every asset class, goal-based investing,
              and taxation. Empowering, but strictly realistic: no get-rich-quick promises.
            </p>

            <div className="mt-4 rounded-2xl border p-3" style={{ borderColor: `${ACCENT}33`, backgroundColor: `${ACCENT}0a` }}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: ACCENT }}>
                Every example uses one persona
              </div>
              <div className="flex flex-wrap gap-2">
                <PersonaChip icon={Cake} label={`${FIN_PERSONA.age} years old`} />
                <PersonaChip icon={MapPin} label={FIN_PERSONA.city} />
                <PersonaChip icon={IndianRupee} label={`${FIN_PERSONA.income.toLocaleString("en-IN")}/month`} />
                <PersonaChip icon={Car} label="Car by 2031 (5-yr goal)" />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="glass-orb px-3 py-1.5 text-sm font-semibold">
                <span className="etched-glow" style={{ "--glow": `${ACCENT}aa` }}>
                  {completedCount}/{FIN_TOTAL_LESSONS}
                </span>{" "}
                <span className="text-muted">lessons done</span>
              </span>
              <span className="glass-orb px-3 py-1.5 text-sm font-semibold">
                <span className="etched-glow" style={{ "--glow": "#10b981aa" }}>
                  {questionStats.mastered}
                </span>{" "}
                <span className="text-muted">checks mastered</span>
              </span>
              <button
                onClick={() => {
                  if (confirm("Reset Personal Finance progress?")) resetAll();
                }}
                className="glass-orb glass-interactive flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted hover:text-red-400"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          </div>

          <div className="shrink-0 self-center">
            <SwirlProgress value={overallPercent} size={150} stroke={11} color={ACCENT} sublabel="complete" />
          </div>
        </div>
      </GlassCard>

      {/* Sections */}
      <div className="mt-12 space-y-14">
        {FIN_LESSONS_BY_SECTION.map((sec) => {
          const pct = sectionCompletion(sec.id);
          const done = sec.lessons.filter((l) => isComplete(l.slug)).length;
          return (
            <section key={sec.id} id={sec.id} className="scroll-mt-24">
              <GlassCard className="mb-5 flex items-center gap-4 rounded-2xl px-4 py-3" style={{ "--glow": `${sec.color}aa` }}>
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                  style={{
                    background: `radial-gradient(120% 120% at 30% 20%, ${sec.color}45, ${sec.color}12)`,
                    boxShadow: `inset 0 0 14px ${sec.color}40, 0 0 12px ${sec.color}26`,
                    color: sec.color,
                  }}
                >
                  <FinIcon name={sec.icon} className="h-5 w-5" style={{ filter: `drop-shadow(0 0 4px ${sec.color})` }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="truncate text-lg font-bold lit-text">{sec.title}</h2>
                    <span className="etched-glow shrink-0 font-mono text-xs" style={{ "--glow": `${sec.color}cc` }}>
                      {done}/{sec.lessons.length}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted">{sec.blurb}</p>
                </div>
                <div className="hidden h-2 w-40 overflow-hidden rounded-full sm:block" style={{ background: "rgb(var(--glass-stroke) / 0.12)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${sec.color}99, ${sec.color})`, boxShadow: `0 0 10px ${sec.color}aa` }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                </div>
              </GlassCard>

              {sec.lessons.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-faint" style={{ borderColor: "rgb(var(--glass-stroke) / 0.15)" }}>
                  Lessons for this section are coming soon.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {sec.lessons.map((lesson) => (
                    <LessonCard
                      key={lesson.slug}
                      lesson={lesson}
                      color={sec.color}
                      complete={isComplete(lesson.slug)}
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
