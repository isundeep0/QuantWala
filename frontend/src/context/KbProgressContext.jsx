import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import {
  KB_PHASES,
  KB_TOTAL_DELIVERABLES,
  deliverableIdsForPhase,
} from "@/data/kernelBypass.js";

const KbProgressContext = createContext(null);
const STORAGE_KEY = "qw-kb-progress-v1";

const EMPTY = {
  done: {}, // { [deliverableId]: true }
  read: {}, // { [paperId]: true }  — papers marked as read
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

export function KbProgressProvider({ children }) {
  const [state, setState] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full / disabled — fail silently */
    }
  }, [state]);

  const toggleDeliverable = useCallback((id, value) => {
    setState((s) => {
      const done = { ...s.done };
      const next = value === undefined ? !done[id] : value;
      if (next) done[id] = true;
      else delete done[id];
      return { ...s, done };
    });
  }, []);

  const togglePaper = useCallback((id, value) => {
    setState((s) => {
      const read = { ...s.read };
      const next = value === undefined ? !read[id] : value;
      if (next) read[id] = true;
      else delete read[id];
      return { ...s, read };
    });
  }, []);

  const resetAll = useCallback(() => setState(EMPTY), []);

  const value = useMemo(() => {
    const isDone = (id) => !!state.done[id];
    const isRead = (id) => !!state.read[id];

    const phaseCompletion = (phaseId) => {
      const ids = deliverableIdsForPhase(phaseId);
      if (ids.length === 0) return 0;
      const done = ids.filter((id) => state.done[id]).length;
      return Math.round((done / ids.length) * 100);
    };

    const phaseDoneCount = (phaseId) => {
      const ids = deliverableIdsForPhase(phaseId);
      return {
        done: ids.filter((id) => state.done[id]).length,
        total: ids.length,
      };
    };

    const completedCount = Object.keys(state.done).length;
    const overallPercent =
      KB_TOTAL_DELIVERABLES === 0
        ? 0
        : Math.round((completedCount / KB_TOTAL_DELIVERABLES) * 100);

    const papersRead = Object.keys(state.read).length;

    // Highest phase index the learner has started — used to spotlight "where you are".
    let currentPhaseIndex = 0;
    KB_PHASES.forEach((p, i) => {
      const { done } = phaseDoneCount(p.id);
      if (done > 0) currentPhaseIndex = i;
    });

    return {
      state,
      toggleDeliverable,
      togglePaper,
      resetAll,
      isDone,
      isRead,
      phaseCompletion,
      phaseDoneCount,
      completedCount,
      overallPercent,
      papersRead,
      currentPhaseIndex,
    };
  }, [state, toggleDeliverable, togglePaper, resetAll]);

  return <KbProgressContext.Provider value={value}>{children}</KbProgressContext.Provider>;
}

export function useKbProgress() {
  const ctx = useContext(KbProgressContext);
  if (!ctx) throw new Error("useKbProgress must be used within a KbProgressProvider");
  return ctx;
}
