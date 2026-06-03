import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Check,
  Clock,
  Sparkles,
  ListChecks,
  BookOpen,
  Hash,
} from "lucide-react";
import {
  getFinLesson,
  getFinSection,
  getFinAdjacent,
  FIN_DIFFICULTY,
  FIN_LESSON_BY_SLUG,
} from "@/data/finance.js";
import { useFinanceProgress } from "@/context/FinanceProgressContext.jsx";
import FinBlockRenderer from "@/components/finance/FinBlockRenderer.jsx";
import FinPracticeSet from "@/components/finance/FinPracticeSet.jsx";
import { formatInline } from "@/lib/inline.jsx";

function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    if (!ids.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
  return active;
}

export default function FinanceLesson() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const lesson = getFinLesson(topicId);
  const { isComplete, setLessonComplete } = useFinanceProgress();
  const topRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [topicId]);

  const tocIds = useMemo(() => {
    if (!lesson) return [];
    const ids = (lesson.sections || []).map((s) => s.id);
    if (lesson.cheatsheet?.length) ids.push("takeaways");
    if (lesson.questions?.length) ids.push("practice");
    return ids;
  }, [lesson]);

  const activeId = useScrollSpy(tocIds);

  if (!lesson) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Lesson not found</h1>
        <p className="mt-2 text-muted">This personal finance topic isn't available yet.</p>
        <Link to="/finance" className="btn-primary mt-6" style={{ backgroundColor: "#14b8a6" }}>
          <ArrowLeft className="h-4 w-4" /> Back to Personal Finance
        </Link>
      </div>
    );
  }

  const section = getFinSection(lesson.sectionId);
  const accent = section?.color || "#14b8a6";
  const { prev, next } = getFinAdjacent(lesson.slug);
  const complete = isComplete(lesson.slug);
  const diff = FIN_DIFFICULTY[lesson.difficulty];

  const tocItems = [
    ...(lesson.sections || []).map((s) => ({ id: s.id, title: s.title, icon: Hash })),
    ...(lesson.cheatsheet?.length ? [{ id: "takeaways", title: "Key takeaways", icon: Sparkles }] : []),
    ...(lesson.questions?.length ? [{ id: "practice", title: "Check your understanding", icon: ListChecks }] : []),
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div ref={topRef} className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link to="/finance" className="hover:text-[color:rgb(var(--text))]">
          Personal Finance
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to={`/finance#${section?.id}`} className="hover:text-[color:rgb(var(--text))]">
          {section?.title}
        </Link>
      </div>

      {/* Header */}
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1
            className="text-3xl font-extrabold tracking-tight sm:text-4xl"
            style={{ color: accent, textShadow: `0 0 18px ${accent}44` }}
          >
            {lesson.title}
          </h1>
          {lesson.tagline && <p className="mt-2 max-w-2xl text-muted">{lesson.tagline}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {diff && (
              <span
                className="chip border"
                style={{ color: diff.color, backgroundColor: `${diff.color}1a`, borderColor: `${diff.color}33` }}
              >
                {diff.label}
              </span>
            )}
            {lesson.estMinutes && (
              <span className="chip surface-sunken font-mono">
                <Clock className="h-3 w-3" /> {lesson.estMinutes}m read
              </span>
            )}
            {(lesson.tags || []).map((t) => (
              <span key={t} className="chip surface-sunken">
                {t}
              </span>
            ))}
          </div>
          {lesson.prereqs?.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
              <BookOpen className="h-3.5 w-3.5" /> Best after:
              {lesson.prereqs.map((p) => {
                const pl = FIN_LESSON_BY_SLUG[p];
                return pl ? (
                  <Link
                    key={p}
                    to={`/finance/${p}`}
                    className="chip surface-sunken hover:text-[color:rgb(var(--text))]"
                  >
                    {pl.title}
                  </Link>
                ) : null;
              })}
            </div>
          )}
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

      <div className="mt-8 gap-10 lg:flex lg:items-start">
        {/* TOC */}
        <aside className="hidden lg:block lg:w-56 lg:shrink-0">
          <div className="sticky top-24">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-faint">On this page</div>
            <nav className="space-y-0.5 border-l" style={{ borderColor: "rgb(var(--border))" }}>
              {tocItems.map((t) => {
                const isActive = activeId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => scrollTo(t.id)}
                    className="-ml-px block w-full border-l-2 py-1.5 pl-4 text-left text-sm transition-colors"
                    style={{
                      borderColor: isActive ? accent : "transparent",
                      color: isActive ? accent : "rgb(var(--text-muted))",
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {t.title}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <div className="space-y-12">
            {(lesson.sections || []).map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <div className="mb-5 flex items-center gap-3">
                  <span
                    className="h-7 w-1 rounded-full"
                    style={{ backgroundColor: accent, boxShadow: `0 0 10px ${accent}88` }}
                  />
                  <h2 className="text-xl font-bold tracking-tight">{s.title}</h2>
                </div>
                <FinBlockRenderer blocks={s.blocks} />
              </section>
            ))}

            {lesson.cheatsheet?.length > 0 && (
              <section id="takeaways" className="scroll-mt-24">
                <div className="mb-5 flex items-center gap-3">
                  <span
                    className="grid h-8 w-8 place-items-center rounded-lg"
                    style={{ backgroundColor: `${accent}1a`, color: accent }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <h2 className="text-xl font-bold tracking-tight">Key takeaways</h2>
                </div>
                <div
                  className="rounded-2xl border p-5"
                  style={{ borderColor: `${accent}33`, backgroundColor: `${accent}0a` }}
                >
                  <p className="mb-3 text-sm text-muted">
                    The lines worth remembering. If you can recall these, you've got the lesson.
                  </p>
                  <ul className="space-y-2.5">
                    {lesson.cheatsheet.map((c, i) => (
                      <li key={i} className="flex gap-3">
                        <span
                          className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
                          style={{ backgroundColor: accent }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-[15px] leading-relaxed">{formatInline(c)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {lesson.questions?.length > 0 && (
              <section id="practice" className="scroll-mt-24">
                <div className="mb-5 flex items-center gap-3">
                  <span
                    className="grid h-8 w-8 place-items-center rounded-lg"
                    style={{ backgroundColor: `${accent}1a`, color: accent }}
                  >
                    <ListChecks className="h-4 w-4" />
                  </span>
                  <h2 className="text-xl font-bold tracking-tight">Check your understanding</h2>
                </div>
                <FinPracticeSet slug={lesson.slug} questions={lesson.questions} />
              </section>
            )}
          </div>

          {/* Complete & continue */}
          <div
            className="mt-12 flex items-center justify-between border-t pt-6"
            style={{ borderColor: "rgb(var(--border))" }}
          >
            <Link to="/finance" className="btn-ghost">
              <ArrowLeft className="h-4 w-4" /> Roadmap
            </Link>
            <button
              onClick={() => {
                setLessonComplete(lesson.slug, true);
                if (next) navigate(`/finance/${next.slug}`);
                else navigate("/finance");
              }}
              className="btn-primary"
              style={{ backgroundColor: complete ? accent : "#10b981" }}
            >
              <Check className="h-4 w-4" /> {next ? "Complete & continue" : "Complete"}
            </button>
          </div>

          {/* Adjacent */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link to={`/finance/${prev.slug}`} className="card card-hover flex items-center gap-3 p-4">
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
              <Link
                to={`/finance/${next.slug}`}
                className="card card-hover flex items-center justify-end gap-3 p-4 text-right"
              >
                <div>
                  <div className="text-xs text-faint">Next</div>
                  <div className="font-semibold">{next.title}</div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pointer-events-none fixed bottom-0 left-0 right-0 h-px"
      />
    </div>
  );
}
