import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Target, CalendarClock, Flame, ArrowRight, BookOpen } from "lucide-react";
import {
  CP_ROADMAP,
  CP_PHASES,
  CP_TOTAL_PROBLEMS,
  CP_TOTAL_THEMES,
  themeSolvedCount,
  cpModuleSolved,
  ratingColor,
} from "@/data/cpRoadmap.js";
import { useProgress } from "@/context/ProgressContext.jsx";
import IconByName from "@/components/IconByName.jsx";
import GlassCard from "@/components/liquid/GlassCard.jsx";
import SwirlProgress from "@/components/liquid/SwirlProgress.jsx";

const MODULE_COLOR = "#a855f7";

const HOW_IT_WORKS = [
  {
    icon: Target,
    title: "Recognise the pattern",
    text: "Each theme opens with the signals that should fire in your head — the exact phrases and constraints that scream which tool to reach for.",
  },
  {
    icon: BookOpen,
    title: "Climb the ladder",
    text: "Problems are real Codeforces tasks, ordered by rating and curated by how many people have solved them — so you always practise the famous, worth-doing ones first.",
  },
  {
    icon: Flame,
    title: "Don't peek early",
    text: "Mark each problem Solved / Review / Stuck. Struggle for 30–45 min before looking anything up; the struggle is what builds intuition.",
  },
];

function themeRange(theme) {
  if (!theme.problems.length) return null;
  const lo = theme.problems[0].rating;
  const hi = theme.problems[theme.problems.length - 1].rating;
  return { lo, hi };
}

function ThemeCard({ phase, theme, solved }) {
  const range = themeRange(theme);
  const pct = theme.problems.length ? Math.round((solved / theme.problems.length) * 100) : 0;
  return (
    <Link to={`/cp/${phase.id}/${theme.id}`} className="group block h-full">
      <GlassCard className="flex h-full flex-col rounded-3xl p-4" style={{ "--glow": `${phase.color}aa` }}>
        <div className="flex items-start gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
            style={{
              background: `linear-gradient(160deg, ${phase.color}26, ${phase.color}0d)`,
              boxShadow: `inset 0 0 0 1px ${phase.color}2e`,
              color: phase.color,
            }}
          >
            <IconByName name={theme.icon} className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold leading-snug">{theme.title}</h4>
            {range && (
              <div className="mt-1 flex items-center gap-1.5">
                <span className="font-mono text-[11px]" style={{ color: ratingColor(range.lo) }}>{range.lo}</span>
                <span className="text-[10px] text-faint">→</span>
                <span className="font-mono text-[11px]" style={{ color: ratingColor(range.hi) }}>{range.hi}</span>
              </div>
            )}
          </div>
        </div>

        <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted">{theme.blurb}</p>

        <div className="mt-auto pt-3" style={{ borderTop: "1px solid rgb(var(--border))" }}>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="font-mono text-muted">
              {solved}/{theme.problems.length} solved
            </span>
            <span className="text-faint">{theme.lessons.length} lesson{theme.lessons.length === 1 ? "" : "s"}</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgb(var(--border))" }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: phase.color }}
            />
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}

export default function CPHub() {
  const { state } = useProgress();
  const solvedTotal = cpModuleSolved(state);
  const overallPct = CP_TOTAL_PROBLEMS ? Math.round((solvedTotal / CP_TOTAL_PROBLEMS) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* ===== Module header ===== */}
      <GlassCard interactive={false} className="relative overflow-hidden rounded-3xl p-6 sm:p-9">
        <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: MODULE_COLOR }}>
              Module 04 · Competitive Programming
            </div>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-extrabold tracking-tight sm:text-4xl lit-text">
              <Trophy className="h-8 w-8" style={{ color: MODULE_COLOR, filter: `drop-shadow(0 0 8px ${MODULE_COLOR})` }} />
              {CP_ROADMAP.title}
            </h1>
            <p className="mt-3 text-muted">
              You finished the algorithm course — now turn that toolbox into rating. {CP_ROADMAP.tagline}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="glass-orb px-3 py-1.5 text-sm font-semibold">
                <span style={{ color: MODULE_COLOR }}>{solvedTotal}/{CP_TOTAL_PROBLEMS}</span>{" "}
                <span className="text-muted">problems solved</span>
              </span>
              <span className="glass-orb px-3 py-1.5 text-sm font-semibold">
                <span style={{ color: "#06b6d4" }}>{CP_TOTAL_THEMES}</span>{" "}
                <span className="text-muted">patterns</span>
              </span>
              <span className="glass-orb px-3 py-1.5 text-sm font-semibold">
                <span style={{ color: "#22c55e" }}>{CP_PHASES.length}</span>{" "}
                <span className="text-muted">rating tiers</span>
              </span>
            </div>
          </div>

          <div className="shrink-0 self-center">
            <SwirlProgress value={overallPct} size={150} stroke={11} color={MODULE_COLOR} sublabel="of ladder" />
          </div>
        </div>
      </GlassCard>

      {/* ===== Plan card ===== */}
      <GlassCard interactive={false} className="mt-6 rounded-3xl p-6">
        <div className="flex flex-wrap items-center gap-3">
          <CalendarClock className="h-5 w-5" style={{ color: MODULE_COLOR }} />
          <h2 className="text-lg font-bold">The 2-hours-a-day plan</h2>
        </div>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Work the tiers in order. In each session, pick the lowest theme that isn't green yet and solve 1–3 problems
          from it. When a tier is ~80% solved, move up. Two focused hours a day, sustained over a couple of years, takes
          you from the basics through Candidate Master and Master toward Grandmaster — the ladder below is the path;
          your job is to think hard on each rung before peeking at anything.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {HOW_IT_WORKS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="rounded-2xl border p-4" style={{ borderColor: "rgb(var(--border))" }}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" style={{ color: MODULE_COLOR }} />
                  <span className="text-sm font-semibold">{s.title}</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{s.text}</p>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* ===== Phases / tiers ===== */}
      <div className="mt-12 space-y-14">
        {CP_PHASES.map((phase, pi) => {
          const solved = phase.themes.reduce(
            (acc, t) => acc + themeSolvedCount(state, phase.id, t.id, t),
            0,
          );
          const pct = phase.problemCount ? Math.round((solved / phase.problemCount) * 100) : 0;
          return (
            <section key={phase.id} id={phase.id} className="scroll-mt-24">
              <div className="mb-5">
                <div className="flex flex-wrap items-center gap-4">
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-lg font-extrabold"
                    style={{
                      background: `linear-gradient(160deg, ${phase.color}26, ${phase.color}0d)`,
                      boxShadow: `inset 0 0 0 1px ${phase.color}2e`,
                      color: phase.color,
                    }}
                  >
                    {pi + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h2 className="text-xl font-bold">{phase.title}</h2>
                      <span
                        className="chip border font-semibold"
                        style={{ color: phase.color, background: `${phase.color}1a`, borderColor: `${phase.color}44` }}
                      >
                        {phase.rank}
                      </span>
                      <span className="font-mono text-xs text-muted">CF {phase.ratingLabel}</span>
                    </div>
                    <p className="mt-1 max-w-3xl text-sm text-muted">{phase.summary}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono text-sm font-semibold text-muted">
                      {solved}/{phase.problemCount}
                    </span>
                    <div className="h-1.5 w-40 overflow-hidden rounded-full" style={{ background: "rgb(var(--border))" }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: phase.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {phase.themes.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    phase={phase}
                    theme={theme}
                    solved={themeSolvedCount(state, phase.id, theme.id, theme)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* ===== Closing ===== */}
      <GlassCard interactive={false} className="mt-14 rounded-3xl p-6 text-center sm:p-8">
        <Trophy className="mx-auto h-8 w-8" style={{ color: MODULE_COLOR }} />
        <h3 className="mt-3 text-lg font-bold">Solve the ladder, earn the rank</h3>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted">
          {CP_TOTAL_PROBLEMS} hand-curated Codeforces problems take you from Newbie all the way to International
          Grandmaster — over {">"}480 of them rated 1900+. They cover every algorithm in Module 1 with hard variations,
          so you should never meet an idea you haven't trained. Pick a tier and start climbing.
        </p>
        <Link
          to={`/cp/${CP_PHASES[0].id}/${CP_PHASES[0].themes[0].id}`}
          className="btn-primary mt-5 inline-flex"
          style={{ backgroundColor: MODULE_COLOR }}
        >
          Start the first rung <ArrowRight className="h-4 w-4" />
        </Link>
      </GlassCard>
    </div>
  );
}
