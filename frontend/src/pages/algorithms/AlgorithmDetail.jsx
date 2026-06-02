import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Cpu,
  Footprints,
  PlayCircle,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  Lock,
  Check,
  ArrowLeft,
} from "lucide-react";
import { getAlgo, getCategory, getAdjacent } from "@/data/registry.js";
import { useProgress, STEP_KEYS } from "@/context/ProgressContext.jsx";
import IntuitionStep from "./steps/IntuitionStep.jsx";
import LogicStep from "./steps/LogicStep.jsx";
import DryRunStep from "./steps/DryRunStep.jsx";
import SimulatorStep from "./steps/SimulatorStep.jsx";
import ProblemSetStep from "./steps/ProblemSetStep.jsx";

const STEPS = [
  { key: "intuition", label: "Intuition", icon: Lightbulb },
  { key: "logic", label: "Logic", icon: Cpu },
  { key: "dryrun", label: "Dry Run", icon: Footprints },
  { key: "simulator", label: "Simulator", icon: PlayCircle },
  { key: "problems", label: "Problems", icon: ListChecks },
];

export default function AlgorithmDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const algo = getAlgo(slug);
  const { isUnlocked, isComplete, setAlgoComplete, markStepViewed, getViewedSteps } = useProgress();
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [slug]);

  useEffect(() => {
    if (algo) markStepViewed(algo.slug, STEP_KEYS[active]);
  }, [active, algo, markStepViewed]);

  if (!algo) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Lesson not found</h1>
        <p className="mt-2 text-muted">This algorithm isn't available yet.</p>
        <Link to="/algorithms" className="btn-primary mt-6">
          <ArrowLeft className="h-4 w-4" /> Back to roadmap
        </Link>
      </div>
    );
  }

  const category = getCategory(algo.categoryId);
  const accent = category?.color || "#2563eb";
  const unlocked = isUnlocked(algo.slug);
  const { prev, next } = getAdjacent(algo.slug);
  const viewed = getViewedSteps(algo.slug);
  const complete = isComplete(algo.slug);

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl surface-sunken">
          <Lock className="h-6 w-6 text-faint" />
        </span>
        <h1 className="mt-4 text-2xl font-bold">{algo.title} is locked</h1>
        <p className="mt-2 text-muted">
          Complete the previous algorithm in <strong>{category?.title}</strong> to unlock this lesson.
        </p>
        <Link to="/algorithms" className="btn-primary mt-6">
          <ArrowLeft className="h-4 w-4" /> Back to roadmap
        </Link>
      </div>
    );
  }

  const ActiveStep = () => {
    switch (STEPS[active].key) {
      case "intuition":
        return <IntuitionStep data={algo.intuition} />;
      case "logic":
        return <LogicStep data={algo.logic} />;
      case "dryrun":
        return <DryRunStep data={algo.dryRun} />;
      case "simulator":
        return <SimulatorStep simulatorKey={algo.simulator} />;
      case "problems":
        return <ProblemSetStep slug={algo.slug} problems={algo.problems} />;
      default:
        return null;
    }
  };

  const goNextStep = () => {
    if (active < STEPS.length - 1) setActive(active + 1);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link to="/algorithms" className="hover:text-brand-500">
          Algorithms
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to={`/algorithms#${category?.id}`} className="hover:text-brand-500">
          {category?.title}
        </Link>
      </div>

      {/* Header */}
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: accent, textShadow: `0 0 18px ${accent}55` }}>
            {algo.title}
          </h1>
          {algo.tagline && <p className="mt-1.5 max-w-2xl text-muted">{algo.tagline}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {algo.complexity?.time && (
              <span className="chip surface-sunken font-mono">⏱ {algo.complexity.time}</span>
            )}
            {algo.complexity?.space && (
              <span className="chip surface-sunken font-mono">▢ {algo.complexity.space}</span>
            )}
            {algo.logic?.codes?.length > 1 && (
              <span className="chip surface-sunken">C++ · Python</span>
            )}
            {(algo.tags || []).map((t) => (
              <span key={t} className="chip surface-sunken">
                {t}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={() => setAlgoComplete(algo.slug, !complete)}
          className="btn shrink-0 border"
          style={
            complete
              ? { backgroundColor: "#10b981", color: "#fff", borderColor: "#10b981" }
              : { borderColor: "rgb(var(--border-strong))" }
          }
        >
          <Check className="h-4 w-4" /> {complete ? "Completed" : "Mark complete"}
        </button>
      </div>

      {/* Step tabs */}
      <div className="glass mt-6 flex gap-1.5 overflow-x-auto rounded-2xl p-1.5 no-scrollbar">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === active;
          const wasViewed = viewed[s.key];
          return (
            <button
              key={s.key}
              onClick={() => setActive(i)}
              className="relative flex flex-1 min-w-[110px] items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
              style={isActive ? { backgroundColor: accent, color: "#fff", boxShadow: `0 0 18px ${accent}77` } : undefined}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{s.label}</span>
              <span className="font-mono text-xs opacity-70">{i + 1}</span>
              {wasViewed && !isActive && (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Step content */}
      <div className="mt-6 min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${slug}-${active}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <ActiveStep />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step pager */}
      <div className="mt-8 flex items-center justify-between border-t pt-5" style={{ borderColor: "rgb(var(--border))" }}>
        <button
          onClick={() => setActive(Math.max(0, active - 1))}
          disabled={active === 0}
          className="btn-ghost disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Previous step
        </button>
        {active < STEPS.length - 1 ? (
          <button onClick={goNextStep} className="btn-primary" style={{ backgroundColor: accent }}>
            Next step <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              setAlgoComplete(algo.slug, true);
              if (next) navigate(`/algorithms/${next.slug}`);
              else navigate("/algorithms");
            }}
            className="btn-primary"
            style={{ backgroundColor: "#10b981" }}
          >
            <Check className="h-4 w-4" /> Complete & continue
          </button>
        )}
      </div>

      {/* Adjacent algorithms */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link to={`/algorithms/${prev.slug}`} className="card card-hover flex items-center gap-3 p-4">
            <ChevronLeft className="h-5 w-5 text-muted" />
            <div>
              <div className="text-xs text-faint">Previous</div>
              <div className="font-semibold">{prev.title}</div>
            </div>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/algorithms/${next.slug}`} className="card card-hover flex items-center justify-end gap-3 p-4 text-right">
            <div>
              <div className="text-xs text-faint">Next</div>
              <div className="font-semibold">{next.title}</div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted" />
          </Link>
        )}
      </div>
    </div>
  );
}
