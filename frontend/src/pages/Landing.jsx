import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Boxes,
  Network,
  Cpu,
  ArrowRight,
  PlayCircle,
  Route as RouteIcon,
  Gauge,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { useProgress } from "@/context/ProgressContext.jsx";
import { TOTAL_ALGORITHMS } from "@/data/registry.js";
import RingProgress from "@/components/ui/RingProgress.jsx";

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
    <div className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm text-muted"
      style={{ borderColor: "rgb(var(--border))" }}>
      <Icon className="h-4 w-4 text-brand-500" />
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
      color: "#2563eb",
      status: "Fully available",
      live: true,
    },
    {
      to: "/system-design",
      eyebrow: "Module 02",
      title: "System Design",
      desc: "Fundamentals, core components, classic designs, and a repeatable interview framework — structured to crack any SD round at top companies.",
      icon: Network,
      color: "#d97706",
      status: "UI preview",
      live: false,
    },
    {
      to: "/hft",
      eyebrow: "Module 03",
      title: "HFT / Low Latency",
      desc: "Market microstructure, low-latency systems engineering, C++ for HFT, and trading system architecture — the quant-dev landscape, end to end.",
      icon: Cpu,
      color: "#059669",
      status: "UI preview",
      live: false,
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-60" aria-hidden />
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(37,99,235,0.22), transparent)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pt-28">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted"
            style={{ borderColor: "rgb(var(--border-strong))" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-500" />
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
            <Link to="/system-design" className="btn-outline px-5 py-2.5 text-base">
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

      {/* Module cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
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
                <Link to={m.to} className="card card-hover group block h-full p-6">
                  <div className="flex items-start justify-between">
                    <span
                      className="grid h-12 w-12 place-items-center rounded-xl"
                      style={{ backgroundColor: `${m.color}1a`, color: m.color }}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    {m.live ? (
                      <RingProgress value={overallPercent} size={52} stroke={5} color={m.color} />
                    ) : (
                      <span
                        className="chip border"
                        style={{
                          color: m.color,
                          backgroundColor: `${m.color}14`,
                          borderColor: `${m.color}33`,
                        }}
                      >
                        {m.status}
                      </span>
                    )}
                  </div>

                  <div className="mt-5 text-xs font-semibold uppercase tracking-wider text-faint">
                    {m.eyebrow}
                  </div>
                  <h3 className="mt-1 text-xl font-bold">{m.title}</h3>
                  <p className="mt-2 text-sm text-muted">{m.desc}</p>

                  <div
                    className="mt-5 flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: m.color }}
                  >
                    Enter
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Your progress snapshot */}
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="card p-6 sm:p-8">
          <div className="grid items-center gap-8 sm:grid-cols-[auto,1fr]">
            <RingProgress value={overallPercent} size={120} stroke={10} color="#2563eb" />
            <div>
              <h3 className="text-lg font-bold">Your algorithms journey</h3>
              <p className="mt-1 text-sm text-muted">
                {completedCount} of {TOTAL_ALGORITHMS} algorithms completed. Keep going to
                unlock the next milestones on your roadmap.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-4 text-center sm:max-w-md">
                <div className="rounded-xl surface-sunken p-3">
                  <div className="text-xl font-bold text-emerald-500">
                    {problemStats.solved}
                  </div>
                  <div className="text-xs text-muted">Solved</div>
                </div>
                <div className="rounded-xl surface-sunken p-3">
                  <div className="text-xl font-bold text-amber-500">{problemStats.review}</div>
                  <div className="text-xs text-muted">To review</div>
                </div>
                <div className="rounded-xl surface-sunken p-3">
                  <div className="text-xl font-bold text-red-500">{problemStats.stuck}</div>
                  <div className="text-xs text-muted">Stuck</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-10" />
    </div>
  );
}
