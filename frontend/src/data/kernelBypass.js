// Module 05 — Kernel Bypass & Ultra-Low Latency.
//
// The single source of truth is the hierarchical syllabus at
// content/kernel-bypass/curriculum.json (loaded via the @content alias). The
// shape is documented and type-checked against the TypeScript interfaces in
// src/types/kernelBypass.ts — applied here through JSDoc so editors get the
// same typing without converting the app to TS.

import curriculumJson from "@content/kernel-bypass/curriculum.json";

/** @typedef {import("../types/kernelBypass").Curriculum} Curriculum */
/** @typedef {import("../types/kernelBypass").Phase} Phase */
/** @typedef {import("../types/kernelBypass").Topic} Topic */
/** @typedef {import("../types/kernelBypass").Deliverable} Deliverable */
/** @typedef {import("../types/kernelBypass").Paper} Paper */
/** @typedef {import("../types/kernelBypass").Reference} Reference */

/** @type {Curriculum} */
export const CURRICULUM = curriculumJson;

export const KB_PHASES = CURRICULUM.phases;

export const KB_PHASE_BY_ID = Object.fromEntries(KB_PHASES.map((p) => [p.id, p]));

/** Every deliverable, flattened, tagged with its owning phase + topic. */
export const KB_DELIVERABLES = KB_PHASES.flatMap((phase) =>
  phase.topics.flatMap((topic) =>
    topic.deliverables.map((d) => ({
      ...d,
      phaseId: phase.id,
      phaseTitle: phase.title,
      phaseColor: phase.color,
      topicId: topic.id,
      topicTitle: topic.title,
    })),
  ),
);

export const KB_TOTAL_DELIVERABLES = KB_DELIVERABLES.length;

/** Every paper across the module, tagged with its owning phase (for filters). */
export const KB_PAPERS = KB_PHASES.flatMap((phase) =>
  (phase.papers || []).map((p) => ({
    ...p,
    phaseId: phase.id,
    phaseTitle: phase.title,
    phaseColor: phase.color,
  })),
);

export const KB_TOTAL_PAPERS = KB_PAPERS.length;

export const KB_TOTAL_TOPICS = KB_PHASES.reduce((n, p) => n + p.topics.length, 0);

export const KB_TOTAL_HOURS = KB_PHASES.reduce((n, p) => n + (p.estHours || 0), 0);

export function getKbPhase(id) {
  return KB_PHASE_BY_ID[id] || null;
}

/** Prev/next phase + linear index, for the phase pager. */
export function getKbAdjacentPhase(id) {
  const idx = KB_PHASES.findIndex((p) => p.id === id);
  if (idx === -1) return { prev: null, next: null, index: -1 };
  return {
    prev: idx > 0 ? KB_PHASES[idx - 1] : null,
    next: idx < KB_PHASES.length - 1 ? KB_PHASES[idx + 1] : null,
    index: idx,
  };
}

/** The deliverable ids that belong to a given phase — used for progress math. */
export function deliverableIdsForPhase(phaseId) {
  const phase = KB_PHASE_BY_ID[phaseId];
  if (!phase) return [];
  return phase.topics.flatMap((t) => t.deliverables.map((d) => d.id));
}
