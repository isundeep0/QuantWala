import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Cpu,
  PlayCircle,
  BarChart3,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowLeft,
  BookMarked,
  ExternalLink,
} from "lucide-react";
import { getHftLesson, getHftSection, getHftAdjacent } from "@/data/hftRegistry.js";
import { HFT_LEVEL, HFT_TRACK } from "@/data/hftSections.js";
import { useHftProgress } from "@/context/HftProgressContext.jsx";
import ConceptStep from "./steps/ConceptStep.jsx";
import DeepDiveStep from "./steps/DeepDiveStep.jsx";
import VisualizeStep from "./steps/VisualizeStep.jsx";
import BenchmarkStep from "./steps/BenchmarkStep.jsx";
import PracticeStep from "./steps/PracticeStep.jsx";

export default function HFTTopic() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const lesson = getHftLesson(topicId);
  const { isComplete, setLessonComplete, markStepViewed, getViewedSteps } = useHftProgress();
  const [active, setActive] = useState(0);

  // Build the step list dynamically from what the lesson provides.
  const steps = useMemo(() => {
    if (!lesson) return [];
    const s = [];
    if (lesson.concept) s.push({ key: "concept", label: "Concept", icon: Lightbulb });
    if (lesson.deepDive) s.push({ key: "deepdive", label: "Deep Dive", icon: Cpu });
    if (lesson.visualizer) s.push({ key: "visualize", label: "Visualize", icon: PlayCircle });
    if (lesson.benchmark) s.push({ key: "benchmark", label: "Benchmark", icon: BarChart3 });
    if (lesson.practice) s.push({ key: "practice", label: "Practice", icon: ListChecks });
    return s;
  }, [lesson]);

  useEffect(() => {
    setActive(0);
  }, [topicId]);

  useEffect(() => {
    if (lesson && steps[active]) markStepViewed(lesson.slug, steps[active].key);
  }, [active, lesson, steps, markStepViewed]);

  if (!lesson) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Lesson not found</h1>
        <p className="mt-2 text-muted">This topic isn't available yet.</p>
        <Link to="/hft" className="btn-primary mt-6" style={{ backgroundColor: "#10b981" }}>
          <ArrowLeft className="h-4 w-4" /> Back to HFT
        </Link>
      </div>
    );
  }

  const section = getHftSection(lesson.sectionId);
  const accent = section?.color || "#10b981";
  const { prev, next } = getHftAdjacent(lesson.slug);
  const viewed = getViewedSteps(lesson.slug);
  const complete = isComplete(lesson.slug);
  const lvl = HFT_LEVEL[lesson.level];

  const renderStep = () => {
    switch (steps[active]?.key) {
      case "concept":
        return <ConceptStep data={lesson.concept} accent={accent} />;
      case "deepdive":
        return <DeepDiveStep data={lesson.deepDive} accent={accent} />;
      case "visualize":
        return <VisualizeStep visualizerKey={lesson.visualizer} />;
      case "benchmark":
        return <BenchmarkStep data={lesson.benchmark} accent={accent} />;
      case "practice":
        return <PracticeStep slug={lesson.slug} data={lesson.practice} accent={accent} />;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link to="/hft" className="hover:text-[color:rgb(var(--text))]">
          HFT / Low Latency
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to={`/hft#${section?.id}`} className="hover:text-[color:rgb(var(--text))]">
          {section?.title}
        </Link>
      </div>

      {/* Header */}
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: accent }}>
            {lesson.title}
          </h1>
          {lesson.tagline && <p className="mt-1.5 max-w-2xl text-muted">{lesson.tagline}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {lvl && (
              <span className="chip border" style={{ color: lvl.color, backgroundColor: `${lvl.color}1a`, borderColor: `${lvl.color}33` }}>
                {lvl.label}
              </span>
            )}
            {(lesson.track || []).map((t) => {
              const tm = HFT_TRACK[t];
              if (!tm) return null;
              return (
                <span key={t} className="chip surface-sunken" style={{ color: tm.color }}>
                  {tm.label}
                </span>
              );
            })}
            {lesson.estMinutes && <span className="chip surface-sunken font-mono">⏱ {lesson.estMinutes}m</span>}
          </div>
        </div>
        <button
          onClick={() => setLessonComplete(lesson.slug, !complete)}
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
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === active;
          const wasViewed = viewed[s.key];
          return (
            <button
              key={s.key}
              onClick={() => setActive(i)}
              className="relative flex flex-1 min-w-[104px] items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
              style={isActive ? { backgroundColor: accent, color: "#fff" } : undefined}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{s.label}</span>
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
            key={`${topicId}-${active}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Resources */}
      {lesson.resources?.length > 0 && (
        <div className="mt-8 rounded-2xl border p-5" style={{ borderColor: "rgb(var(--border))" }}>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <BookMarked className="h-4 w-4" style={{ color: accent }} /> Go deeper
          </div>
          <ul className="space-y-2">
            {lesson.resources.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                <span className="text-muted">
                  {r.link ? (
                    <a href={r.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-[color:rgb(var(--text))] hover:underline">
                      {r.title} <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="font-medium text-[color:rgb(var(--text))]">{r.title}</span>
                  )}
                  {r.by && <span className="text-faint"> · {r.by}</span>}
                  {r.note && <span> — {r.note}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Step pager */}
      <div className="mt-8 flex items-center justify-between border-t pt-5" style={{ borderColor: "rgb(var(--border))" }}>
        <button onClick={() => setActive(Math.max(0, active - 1))} disabled={active === 0} className="btn-ghost disabled:opacity-40">
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>
        {active < steps.length - 1 ? (
          <button onClick={() => setActive(active + 1)} className="btn-primary" style={{ backgroundColor: accent }}>
            Next <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              setLessonComplete(lesson.slug, true);
              if (next) navigate(`/hft/${next.slug}`);
              else navigate("/hft");
            }}
            className="btn-primary"
            style={{ backgroundColor: "#10b981" }}
          >
            <Check className="h-4 w-4" /> Complete &amp; continue
          </button>
        )}
      </div>

      {/* Adjacent lessons */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link to={`/hft/${prev.slug}`} className="card card-hover flex items-center gap-3 p-4">
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
          <Link to={`/hft/${next.slug}`} className="card card-hover flex items-center justify-end gap-3 p-4 text-right">
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
