import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Boxes,
  Network,
  Cpu,
  Trophy,
  Wallet,
  ArrowRight,
  PlayCircle,
  Gauge,
  ListChecks,
  Sparkles,
  FastForward,
} from "lucide-react";
import { CP_TOTAL_PROBLEMS } from "@/data/cpRoadmap.js";
import { useProgress } from "@/context/ProgressContext.jsx";
import { useSdProgress } from "@/context/SdProgressContext.jsx";
import { useKbProgress } from "@/context/KbProgressContext.jsx";
import { TOTAL_ALGORITHMS } from "@/data/registry.js";
import { SD_TOTAL_LESSONS } from "@/data/systemDesign.js";
import {
  CURRICULUM as KB_CURRICULUM,
  KB_PHASES,
  KB_TOTAL_DELIVERABLES,
  KB_TOTAL_PAPERS,
} from "@/data/kernelBypass.js";
import { useFinanceProgress } from "@/context/FinanceProgressContext.jsx";
import { FIN_TOTAL_LESSONS } from "@/data/finance.js";
import GlassCard from "@/components/liquid/GlassCard.jsx";
import SwirlProgress from "@/components/liquid/SwirlProgress.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

function StatPill({ icon: Icon, label }) {
  return (
    <div className="glass-orb flex items-center gap-2 px-3 py-1.5 text-sm text-muted">
      <Icon className="h-4 w-4 text-brand-500 dark:text-brand-400" />
      {label}
    </div>
  );
}

export default function Landing() {
  const { overallPercent, completedCount, problemStats } = useProgress();
  const { overallPercent: sdPercent } = useSdProgress();
  const { overallPercent: kbPercent } = useKbProgress();
  const { overallPercent: finPercent } = useFinanceProgress();

  const modules = [
    {
      to: "/algorithms",
      eyebrow: "Module 01",
      title: "Algorithm Mastery",
      desc: "Every standard algorithm, taught through a 5-step flow — intuition, logic decoding, dry run, an interactive simulator, and a curated problem set.",
      icon: Boxes,
      color: "#3b82f6",
      status: "Fully available",
      live: true,
      percent: overallPercent,
    },
    {
      to: "/cp",
      eyebrow: "Module 04",
      title: "Road to Grandmaster",
      desc: `A Codeforces-only ladder of ${CP_TOTAL_PROBLEMS} real, curated problems that turns the Module 1 toolbox into rating — grouped by pattern, ramped by difficulty, from Newbie all the way to International Grandmaster.`,
      icon: Trophy,
      color: "#a855f7",
      status: "Fully available",
      live: false,
    },
    {
      to: "/system-design",
      eyebrow: "Module 02",
      title: "System Design",
      desc: `Fundamentals, building blocks, distributed systems, ${SD_TOTAL_LESSONS} in-depth lessons, real case studies, and a full interview playbook — structured to crack any SD round at top companies.`,
      icon: Network,
      color: "#f59e0b",
      status: "Fully available",
      live: true,
      percent: sdPercent,
    },
    {
      to: "/hft",
      eyebrow: "Module 03",
      title: "HFT / Low Latency",
      desc: "Market microstructure, low-latency systems engineering, C++ for HFT, and trading system architecture — the quant-dev landscape, end to end.",
      icon: Cpu,
      color: "#10b981",
      status: "UI preview",
      live: false,
      percent: 0,
    },
    {
      to: "/finance",
      eyebrow: "Module 05",
      title: "Personal Finance & Investing",
      desc: `A from-scratch money masterclass for the Indian market — ${FIN_TOTAL_LESSONS} lessons across budgeting, compounding, credit & CIBIL, every asset class, goal-based investing, and taxation. Every example built on one real beginner persona.`,
      icon: Wallet,
      color: "#14b8a6",
      status: "Fully available",
      live: true,
      percent: finPercent,
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="glass-orb inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted"
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-500 dark:text-brand-400" />
            Learn by seeing — interactive, visual, from-scratch
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-4xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl"
          >
            Go from <span className="gradient-text">solving</span> to{" "}
            <span className="gradient-text">understanding</span>.
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-5 max-w-2xl text-lg text-muted"
          >
            QuantWala is a learning platform for competitive programmers, OA prep, system
            design, and HFT / low-latency interviews. Master the algorithms behind 90% of
            CP and top-company problems — one interactive lesson at a time.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link to="/algorithms" className="btn-primary px-5 py-2.5 text-base">
              Start learning <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/system-design" className="glass glass-interactive btn px-5 py-2.5 text-base">
              <PlayCircle className="h-4 w-4" /> Explore modules
            </Link>
          </motion.div>

          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-10 flex flex-wrap gap-3"
          >
            <StatPill icon={Boxes} label={`${TOTAL_ALGORITHMS} algorithms`} />
            <StatPill icon={Network} label={`${SD_TOTAL_LESSONS} system design lessons`} />
            <StatPill icon={Wallet} label={`${FIN_TOTAL_LESSONS} personal finance lessons`} />
            <StatPill icon={ListChecks} label="Curated problem sets" />
          </motion.div>
        </div>
      </section>

      {/* Module orbs */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {modules.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.to}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
              >
                <Link to={m.to} className="group block h-full">
                  <GlassCard className="h-full rounded-[1.75rem] p-6" style={{ "--glow": `${m.color}aa` }}>
                    <div className="flex items-start justify-between">
                      <span
                        className="grid h-12 w-12 place-items-center rounded-2xl"
                        style={{
                          background: `linear-gradient(160deg, ${m.color}26, ${m.color}0d)`,
                          boxShadow: `inset 0 0 0 1px ${m.color}2e`,
                          color: m.color,
                        }}
                      >
                        <Icon className="h-6 w-6" />
                      </span>
                      {m.live ? (
                        <SwirlProgress value={m.percent} size={58} stroke={6} color={m.color} />
                      ) : (
                        <span
                          className="chip"
                          style={{
                            color: m.color,
                            background: `${m.color}1a`,
                            boxShadow: `inset 0 0 0 1px ${m.color}44`,
                          }}
                        >
                          {m.status}
                        </span>
                      )}
                    </div>

                    <div className="mt-5 text-xs font-semibold uppercase tracking-wider text-faint">
                      {m.eyebrow}
                    </div>
                    <h3 className="mt-1 text-xl font-bold lit-text">{m.title}</h3>
                    <p className="mt-2 text-sm text-muted">{m.desc}</p>

                    <div
                      className="mt-5 flex items-center gap-1.5 text-sm font-semibold"
                      style={{ color: m.color }}
                    >
                      Enter
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Featured: Module 05 — Kernel Bypass */}
      <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          <Link to="/kernel-bypass" className="group block">
            <GlassCard
              iris
              className="relative overflow-hidden rounded-[1.75rem] p-6 sm:p-8"
              style={{ "--glow": "#22d3eeaa" }}
            >
              <div className="absolute inset-0 dot-grid opacity-20" aria-hidden />
              {/* dual-neon aura */}
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-50 blur-3xl"
                style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)" }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full opacity-40 blur-3xl"
                style={{ background: "radial-gradient(circle, #22d3ee, transparent 70%)" }}
                aria-hidden
              />

              <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-3">
                    <span
                      className="relative grid h-14 w-14 place-items-center rounded-2xl"
                      style={{
                        background:
                          "radial-gradient(120% 120% at 30% 20%, #22d3ee55, #a855f712)",
                        boxShadow: "inset 0 0 18px #22d3ee40, 0 0 18px #a855f733",
                        color: "#22d3ee",
                      }}
                    >
                      <Cpu className="h-7 w-7" style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }} />
                      <FastForward
                        className="absolute -bottom-1.5 -right-1.5 h-5 w-5"
                        style={{ color: "#a855f7", filter: "drop-shadow(0 0 5px #a855f7)" }}
                      />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-faint">
                          {KB_CURRICULUM.moduleCode}
                        </span>
                        <span
                          className="chip text-[10px] font-bold"
                          style={{ color: "#22d3ee", background: "#22d3ee1a", boxShadow: "inset 0 0 0 1px #22d3ee55" }}
                        >
                          NEW
                        </span>
                      </div>
                      <h3 className="mt-0.5 text-2xl font-extrabold tracking-tight lit-text">
                        Kernel Bypass &amp; Ultra-Low Latency
                      </h3>
                    </div>
                  </div>

                  <p className="mt-3 text-muted">{KB_CURRICULUM.description}</p>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {KB_PHASES.map((p) => (
                      <span
                        key={p.id}
                        className="chip border text-[11px] font-medium"
                        style={{ borderColor: `${p.color}55`, color: p.color }}
                      >
                        {p.index}. {p.title}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <span
                      className="btn inline-flex items-center gap-1.5 px-5 py-2.5 text-base font-semibold text-white"
                      style={{
                        background: "linear-gradient(120deg, #22d3ee, #a855f7)",
                        boxShadow: "0 0 24px #22d3ee55",
                      }}
                    >
                      Enter
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                    </span>
                    <span className="text-sm text-muted">
                      {KB_PHASES.length} phases · {KB_TOTAL_DELIVERABLES} deliverables ·{" "}
                      {KB_TOTAL_PAPERS} curated papers
                    </span>
                  </div>
                </div>

                <div className="shrink-0 self-center">
                  <SwirlProgress value={kbPercent} size={140} stroke={11} color="#22d3ee" sublabel="complete" />
                </div>
              </div>
            </GlassCard>
          </Link>
        </motion.div>
      </section>

      {/* Progress snapshot */}
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <GlassCard interactive={false} className="rounded-[1.75rem] p-6 sm:p-8">
          <div className="grid items-center gap-8 sm:grid-cols-[auto,1fr]">
            <div className="justify-self-center">
              <SwirlProgress value={overallPercent} size={130} stroke={11} color="#3b82f6" sublabel="complete" />
            </div>
            <div>
              <h3 className="text-lg font-bold lit-text">Your algorithms journey</h3>
              <p className="mt-1 text-sm text-muted">
                {completedCount} of {TOTAL_ALGORITHMS} algorithms completed. Keep going to
                light up the next nodes on your roadmap.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-4 text-center sm:max-w-md">
                {[
                  { v: problemStats.solved, label: "Solved", color: "#10b981" },
                  { v: problemStats.review, label: "To review", color: "#f59e0b" },
                  { v: problemStats.stuck, label: "Stuck", color: "#ef4444" },
                ].map((s) => (
                  <div key={s.label} className="glass-orb p-3">
                    <div className="text-xl font-bold etched-glow" style={{ "--glow": `${s.color}cc`, color: s.color }}>
                      {s.v}
                    </div>
                    <div className="text-xs text-muted">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      <div className="h-10" />
    </div>
  );
}
