import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { FIN_LESSONS_BY_SECTION, FIN_LESSONS_FLAT, FIN_TOTAL_LESSONS } from "@/data/finance.js";

const FinanceProgressContext = createContext(null);
const STORAGE_KEY = "qw-finance-progress-v1";

const EMPTY = {
  completed: {}, // { [slug]: true }
  questions: {}, // { [slug]: { [questionId]: "got" | "review" | "stuck" } }
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return EMPTY;
  }
}

export function FinanceProgressProvider({ children }) {
  const [state, setState] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full / disabled — fail silently */
    }
  }, [state]);

  const setLessonComplete = useCallback((slug, value = true) => {
    setState((s) => {
      const completed = { ...s.completed };
      if (value) completed[slug] = true;
      else delete completed[slug];
      return { ...s, completed };
    });
  }, []);

  const setQuestionStatus = useCallback((slug, questionId, status) => {
    setState((s) => {
      const cur = { ...(s.questions[slug] || {}) };
      if (!status) delete cur[questionId];
      else cur[questionId] = status;
      return { ...s, questions: { ...s.questions, [slug]: cur } };
    });
  }, []);

  const resetAll = useCallback(() => setState(EMPTY), []);

  const value = useMemo(() => {
    const isComplete = (slug) => !!state.completed[slug];
    const getQuestionStatus = (slug, questionId) =>
      (state.questions[slug] && state.questions[slug][questionId]) || null;

    const sectionCompletion = (sectionId) => {
      const sec = FIN_LESSONS_BY_SECTION.find((s) => s.id === sectionId);
      if (!sec || sec.lessons.length === 0) return 0;
      const done = sec.lessons.filter((l) => isComplete(l.slug)).length;
      return Math.round((done / sec.lessons.length) * 100);
    };

    const completedCount = FIN_LESSONS_FLAT.filter((l) => isComplete(l.slug)).length;
    const overallPercent =
      FIN_TOTAL_LESSONS === 0 ? 0 : Math.round((completedCount / FIN_TOTAL_LESSONS) * 100);

    let mastered = 0;
    for (const slug of Object.keys(state.questions)) {
      for (const st of Object.values(state.questions[slug])) {
        if (st === "got") mastered++;
      }
    }

    return {
      state,
      setLessonComplete,
      setQuestionStatus,
      resetAll,
      isComplete,
      getQuestionStatus,
      sectionCompletion,
      completedCount,
      overallPercent,
      questionStats: { mastered },
    };
  }, [state, setLessonComplete, setQuestionStatus, resetAll]);

  return <FinanceProgressContext.Provider value={value}>{children}</FinanceProgressContext.Provider>;
}

export function useFinanceProgress() {
  const ctx = useContext(FinanceProgressContext);
  if (!ctx) throw new Error("useFinanceProgress must be used within a FinanceProgressProvider");
  return ctx;
}
