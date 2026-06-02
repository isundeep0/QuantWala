import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Boxes,
  Network,
  Cpu,
  Trophy,
  ArrowRight,
  PlayCircle,
  Route as RouteIcon,
  Gauge,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { CP_TOTAL_PROBLEMS } from "@/data/cpRoadmap.js";
import { useProgress } from "@/context/ProgressContext.jsx";
import { TOTAL_ALGORITHMS } from "@/data/registry.js";
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
      <Icon className="h-4 w-4 text-brand-400" style={{ filter: "drop-shadow(0 0 4px rgba(59,130,246,0.6))" }} />
      {label}
    </div>
  );
}

export default function Landing() {
  const { overallPercent, completedCount, problemStats } = useProgress();

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
    },
    {
      to: "/cp",
      eyebrow: "Module 04",
      title: "Road to Candidate Master",
      desc: `A Codeforces-only ladder of ${CP_TOTAL_PROBLEMS} real, curated problems that turns the Module 1 toolbox into rating — grouped by pattern, ramped by difficulty, from Newbie all the way to Master.`,
      icon: Trophy,
      color: "#a855f7",
      status: "Fully available",
      live: false,
    },
    {
      to: "/system-design",
      eyebrow: "Module 02",
      title: "System Design",
      desc: "Fundamentals, core components, classic designs, and a repeatable interview framework — structured to crack any SD round at top companies.",
      icon: Network,
      color: "#f59e0b",
      status: "UI preview",
      live: false,
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
            <Sparkles className="h-3.5 w-3.5 text-brand-400" style={{ filter: "drop-shadow(0 0 4px rgba(59,130,246,0.7))" }} />
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
            <Link to="/algorithms" className="btn-primary px-5 py-2.5 text-base" style={{ boxShadow: "0 0 24px rgba(37,99,235,0.45)" }}>
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
            <StatPill icon={RouteIcon} label="12 categories · guided roadmap" />
            <StatPill icon={Gauge} label="Step-by-step simulators" />
            <StatPill icon={ListChecks} label="Curated problem sets" />
          </motion.div>
        </div>
      </section>

      {/* Module orbs */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                          background: `radial-gradient(120% 120% at 30% 20%, ${m.color}45, ${m.color}12)`,
                          boxShadow: `inset 0 0 16px ${m.color}40, 0 0 14px ${m.color}26`,
                          color: m.color,
                        }}
                      >
                        <Icon className="h-6 w-6" style={{ filter: `drop-shadow(0 0 5px ${m.color})` }} />
                      </span>
                      {m.live ? (
                        <SwirlProgress value={overallPercent} size={58} stroke={6} color={m.color} />
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
                      style={{ color: m.color, textShadow: `0 0 10px ${m.color}55` }}
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
