import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import {
  ALGORITHMS_BY_CATEGORY,
  ALGORITHMS_FLAT,
  TOTAL_ALGORITHMS,
  getCategoryOrderedSlugs,
} from "@/data/registry.js";

const ProgressContext = createContext(null);
const STORAGE_KEY = "qw-progress-v1";

const EMPTY = {
  completed: {}, // { [slug]: true }
  problems: {}, // { [slug]: { [problemId]: "solved" | "review" | "stuck" } }
  steps: {}, // { [slug]: { intuition: true, logic: true, ... } }
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

export const STEP_KEYS = ["intuition", "logic", "dryrun", "simulator", "problems"];

export function ProgressProvider({ children }) {
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

  const setAlgoComplete = useCallback((slug, value = true) => {
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

    // Per-category linear unlocking: first algo unlocked; next unlocks when the
    // previous algorithm in the category is completed.
    const isUnlocked = (slug) => {
      const algo = ALGORITHMS_FLAT.find((a) => a.slug === slug);
      if (!algo) return true;
      const ordered = getCategoryOrderedSlugs(algo.categoryId);
      const idx = ordered.indexOf(slug);
      if (idx <= 0) return true;
      return isComplete(ordered[idx - 1]);
    };

    const categoryCompletion = (categoryId) => {
      const cat = ALGORITHMS_BY_CATEGORY.find((c) => c.id === categoryId);
      if (!cat || cat.algorithms.length === 0) return 0;
      const done = cat.algorithms.filter((a) => isComplete(a.slug)).length;
      return Math.round((done / cat.algorithms.length) * 100);
    };

    const completedCount = ALGORITHMS_FLAT.filter((a) => isComplete(a.slug)).length;
    const overallPercent =
      TOTAL_ALGORITHMS === 0 ? 0 : Math.round((completedCount / TOTAL_ALGORITHMS) * 100);

    // Aggregate problem stats across everything.
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
      setAlgoComplete,
      setProblemStatus,
      resetAll,
      isComplete,
      getProblemStatus,
      getViewedSteps,
      isUnlocked,
      categoryCompletion,
      completedCount,
      overallPercent,
      problemStats: { solved, review, stuck },
    };
  }, [state, markStepViewed, setAlgoComplete, setProblemStatus, resetAll]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within a ProgressProvider");
  return ctx;
}
