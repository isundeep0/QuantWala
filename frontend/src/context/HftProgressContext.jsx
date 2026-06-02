import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import {
  HFT_LESSONS_BY_SECTION,
  HFT_LESSONS_FLAT,
  HFT_TOTAL_LESSONS,
} from "@/data/hftRegistry.js";

const HftProgressContext = createContext(null);
const STORAGE_KEY = "qw-hft-progress-v1";

const EMPTY = {
  completed: {}, // { [slug]: true }
  problems: {}, // { [slug]: { [problemId]: "solved" | "review" | "stuck" } }
  steps: {}, // { [slug]: { concept: true, deepdive: true, ... } }
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

export function HftProgressProvider({ children }) {
  const [state, setState] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full / disabled — fail silently */
    }
  }, [state]);

  const markStepViewed = useCallback((slug, stepKey) => {
    setState((s) => {
      const cur = s.steps[slug] || {};
      if (cur[stepKey]) return s;
      return { ...s, steps: { ...s.steps, [slug]: { ...cur, [stepKey]: true } } };
    });
  }, []);

  const setLessonComplete = useCallback((slug, value = true) => {
    setState((s) => {
      const completed = { ...s.completed };
      if (value) completed[slug] = true;
      else delete completed[slug];
      return { ...s, completed };
    });
  }, []);

  const setProblemStatus = useCallback((slug, problemId, status) => {
    setState((s) => {
      const cur = { ...(s.problems[slug] || {}) };
      if (!status) delete cur[problemId];
      else cur[problemId] = status;
      return { ...s, problems: { ...s.problems, [slug]: cur } };
    });
  }, []);

  const resetAll = useCallback(() => setState(EMPTY), []);

  const value = useMemo(() => {
    const isComplete = (slug) => !!state.completed[slug];
    const getProblemStatus = (slug, problemId) =>
      (state.problems[slug] && state.problems[slug][problemId]) || null;
    const getViewedSteps = (slug) => state.steps[slug] || {};

    const sectionCompletion = (sectionId) => {
      const sec = HFT_LESSONS_BY_SECTION.find((s) => s.id === sectionId);
      if (!sec || sec.lessons.length === 0) return 0;
      const done = sec.lessons.filter((l) => isComplete(l.slug)).length;
      return Math.round((done / sec.lessons.length) * 100);
    };

    const completedCount = HFT_LESSONS_FLAT.filter((l) => isComplete(l.slug)).length;
    const overallPercent =
      HFT_TOTAL_LESSONS === 0 ? 0 : Math.round((completedCount / HFT_TOTAL_LESSONS) * 100);

    let solved = 0;
    let review = 0;
    let stuck = 0;
    for (const slug of Object.keys(state.problems)) {
      for (const st of Object.values(state.problems[slug])) {
        if (st === "solved") solved++;
        else if (st === "review") review++;
        else if (st === "stuck") stuck++;
      }
    }

    return {
      state,
      markStepViewed,
      setLessonComplete,
      setProblemStatus,
      resetAll,
      isComplete,
      getProblemStatus,
      getViewedSteps,
      sectionCompletion,
      completedCount,
      overallPercent,
      problemStats: { solved, review, stuck },
    };
  }, [state, markStepViewed, setLessonComplete, setProblemStatus, resetAll]);

  return <HftProgressContext.Provider value={value}>{children}</HftProgressContext.Provider>;
}

export function useHftProgress() {
  const ctx = useContext(HftProgressContext);
  if (!ctx) throw new Error("useHftProgress must be used within an HftProgressProvider");
  return ctx;
}
