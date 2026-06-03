import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ExternalLink,
  Radar,
  Wrench,
  AlertTriangle,
  Flag,
  Check,
  RotateCcw,
  HelpCircle,
  BookOpen,
  Trophy,
} from "lucide-react";
import {
  getTheme,
  getAdjacentTheme,
  themeSlug,
  ratingColor,
  ratingRank,
} from "@/data/cpRoadmap.js";
import { ALGO_BY_SLUG } from "@/data/registry.js";
import { useProgress } from "@/context/ProgressContext.jsx";
import GlassCard from "@/components/liquid/GlassCard.jsx";
import IconByName from "@/components/IconByName.jsx";

const STATUS = [
  { key: "solved", label: "Solved", icon: Check, color: "#10b981" },
  { key: "review", label: "Review", icon: RotateCcw, color: "#f59e0b" },
  { key: "stuck", label: "Stuck", icon: HelpCircle, color: "#ef4444" },
];

function ProblemRow({ slug, problem, index, accent }) {
  const { getProblemStatus, setProblemStatus } = useProgress();
  const status = getProblemStatus(slug, problem.id);
  const statusMeta = STATUS.find((s) => s.key === status);
  const rc = ratingColor(problem.rating);

  return (
    <div
      className="rounded-2xl border p-4 transition-colors"
      style={{ borderColor: statusMeta ? `${statusMeta.color}66` : "rgb(var(--border))" }}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md surface-sunken font-mono text-xs font-bold text-faint">
          {index + 1}
        </span>
        <span
          className="chip border font-mono font-semibold"
          style={{ color: rc, background: `${rc}1a`, borderColor: `${rc}55` }}
          title={ratingRank(problem.rating)}
        >
          {problem.rating}
        </span>
        <a
          href={problem.link}
          target="_blank"
          rel="noreferrer"
          className="text-base font-semibold hover:text-brand-500"
        >
          {problem.name}
        </a>
        <a
          href={problem.link}
          target="_blank"
          rel="noreferrer"
          className="ml-auto flex items-center gap-1 text-xs text-muted hover:text-brand-500"
        >
          Open on Codeforces <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {problem.tags.map((t) => (
          <span key={t} className="chip surface-sunken text-[11px]">{t}</span>
        ))}
        <span className="ml-auto text-[11px] text-faint">
          {problem.solved.toLocaleString()} solved on CF
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3" style={{ borderColor: "rgb(var(--border))" }}>
        <span className="mr-1 text-xs text-faint">Status:</span>
        {STATUS.map((s) => {
          const Icon = s.icon;
          const active = status === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setProblemStatus(slug, problem.id, active ? null : s.key)}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
              style={active ? { backgroundColor: s.color, color: "#fff", borderColor: s.color } : { borderColor: "rgb(var(--border-strong))" }}
            >
              <Icon className="h-3.5 w-3.5" /> {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PatternPanel({ icon: Icon, title, accent, children }) {
  return (
    <GlassCard interactive={false} className="rounded-2xl p-4" style={{ "--glow": `${accent}aa` }}>
      <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: accent }}>
        <Icon className="h-4 w-4" /> {title}
      </div>
      <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>
    </GlassCard>
  );
}

export default function CPThemeDetail() {
  const { phaseId, themeId } = useParams();
  const found = getTheme(phaseId, themeId);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [phaseId, themeId]);

  if (!found) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Theme not found</h1>
        <Link to="/cp" className="btn-primary mt-6">
          <ArrowLeft className="h-4 w-4" /> Back to the ladder
        </Link>
      </div>
    );
  }

  const { phase, theme } = found;
  const accent = phase.color;
  const slug = themeSlug(phase.id, theme.id);
  const { getProblemStatus } = useProgress();
  const { prev, next } = getAdjacentTheme(phase.id, theme.id);

  const solved = theme.problems.filter((p) => getProblemStatus(slug, p.id) === "solved").length;
  const pct = theme.problems.length ? Math.round((solved / theme.problems.length) * 100) : 0;

  const lessons = theme.lessons.map((s) => ALGO_BY_SLUG[s]).filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link to="/cp" className="hover:text-brand-500">Road to CM</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to={`/cp#${phase.id}`} className="hover:text-brand-500">{phase.title}</Link>
      </div>

      {/* Header */}
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
              style={{
                background: `linear-gradient(160deg, ${accent}26, ${accent}0d)`,
                boxShadow: `inset 0 0 0 1px ${accent}2e`,
                color: accent,
              }}
            >
              <IconByName name={theme.icon} className="h-5 w-5" />
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: accent }}>
              {theme.title}
            </h1>
          </div>
          <p className="mt-2 max-w-2xl text-muted">{theme.blurb}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="chip border font-semibold" style={{ color: accent, background: `${accent}1a`, borderColor: `${accent}44` }}>
              {phase.rank}
            </span>
            <span className="chip surface-sunken font-mono">CF {phase.ratingLabel}</span>
            {theme.tags.map((t) => (
              <span key={t} className="chip surface-sunken">{t}</span>
            ))}
          </div>
        </div>
        <div className="shrink-0 rounded-2xl surface-sunken px-4 py-3 text-center">
          <div className="font-mono text-2xl font-bold" style={{ color: accent }}>
            {solved}/{theme.problems.length}
          </div>
          <div className="text-xs text-faint">solved</div>
          <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full" style={{ background: "rgb(var(--border))" }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: accent }} />
          </div>
        </div>
      </div>

      {/* Linked Module 1 lessons */}
      {lessons.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-faint">
            <BookOpen className="h-3.5 w-3.5" /> Revise the theory:
          </span>
          {lessons.map((l) => (
            <Link
              key={l.slug}
              to={`/algorithms/${l.slug}`}
              className="chip border transition-colors hover:text-brand-500"
              style={{ borderColor: "rgb(var(--border-strong))" }}
            >
              {l.title}
            </Link>
          ))}
        </div>
      )}

      {/* Pattern recognition */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <PatternPanel icon={Radar} title="Signals — when to reach for this" accent="#06b6d4">
          <ul className="space-y-1.5">
            {theme.signals.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#06b6d4" }} />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </PatternPanel>
        <div className="grid gap-4">
          <PatternPanel icon={Wrench} title="Technique" accent="#10b981">
            {theme.technique}
          </PatternPanel>
          <PatternPanel icon={AlertTriangle} title="Classic trap" accent="#f59e0b">
            {theme.trap}
          </PatternPanel>
        </div>
      </div>

      {theme.goal && (
        <div className="mt-4 flex items-center gap-2.5 rounded-2xl border-l-2 p-3 surface-sunken" style={{ borderColor: accent }}>
          <Flag className="h-4 w-4 shrink-0" style={{ color: accent }} />
          <span className="text-sm"><span className="font-semibold">Mastery goal:</span> {theme.goal}</span>
        </div>
      )}

      {/* Problem ladder */}
      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl surface-sunken p-4">
          <p className="text-sm text-muted">
            {theme.problems.length} real Codeforces problems, ordered by rating. Try each for 30–45 min before looking
            anything up, then mark your status to track the climb.
          </p>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Check className="h-4 w-4 text-emerald-500" />
            <span>{solved}/{theme.problems.length} solved</span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {theme.problems.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3) }}
            >
              <ProblemRow slug={slug} problem={p} index={i} accent={accent} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pager */}
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link to={`/cp/${prev.phase.id}/${prev.theme.id}`} className="card card-hover flex items-center gap-3 p-4">
            <ChevronLeft className="h-5 w-5 text-muted" />
            <div>
              <div className="text-xs text-faint">Previous pattern</div>
              <div className="font-semibold">{prev.theme.title}</div>
            </div>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/cp/${next.phase.id}/${next.theme.id}`} className="card card-hover flex items-center justify-end gap-3 p-4 text-right">
            <div>
              <div className="text-xs text-faint">Next pattern</div>
              <div className="font-semibold">{next.theme.title}</div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted" />
          </Link>
        ) : (
          <Link to="/cp" className="card card-hover flex items-center justify-end gap-3 p-4 text-right">
            <div>
              <div className="text-xs text-faint">You reached the top</div>
              <div className="font-semibold">Back to the full ladder</div>
            </div>
            <Trophy className="h-5 w-5" style={{ color: accent }} />
          </Link>
        )}
      </div>
    </div>
  );
}
