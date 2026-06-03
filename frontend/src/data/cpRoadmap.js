// Module 4 — "Road to Grandmaster".
//
// The roadmap content is generated from the LIVE Codeforces problemset by
// tools/cp-roadmap/build_roadmap.py and written to content/cp/roadmap.json
// (the single source of truth, shared with the optional backend). We import it
// through the same @content alias the algorithms module uses.
import ROADMAP from "@content/cp/roadmap.json";

export const CP_ROADMAP = ROADMAP;
export const CP_PHASES = ROADMAP.phases;

// progress slug for a theme — used as the `slug` key in ProgressContext so CP
// problem statuses live in the same localStorage store as Module 1 problems.
export const themeSlug = (phaseId, themeId) => `cp-${phaseId}-${themeId}`;

const PHASE_BY_ID = Object.fromEntries(CP_PHASES.map((p) => [p.id, p]));

export function getPhase(phaseId) {
  return PHASE_BY_ID[phaseId] || null;
}

export function getTheme(phaseId, themeId) {
  const phase = PHASE_BY_ID[phaseId];
  if (!phase) return null;
  const theme = phase.themes.find((t) => t.id === themeId) || null;
  return theme ? { phase, theme } : null;
}

// Flat, ordered list of { phase, theme } for prev/next navigation.
export const CP_THEMES_FLAT = CP_PHASES.flatMap((phase) =>
  phase.themes.map((theme) => ({ phase, theme })),
);

export function getAdjacentTheme(phaseId, themeId) {
  const idx = CP_THEMES_FLAT.findIndex(
    (x) => x.phase.id === phaseId && x.theme.id === themeId,
  );
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? CP_THEMES_FLAT[idx - 1] : null,
    next: idx < CP_THEMES_FLAT.length - 1 ? CP_THEMES_FLAT[idx + 1] : null,
  };
}

export const CP_TOTAL_PROBLEMS = ROADMAP.generatedProblemCount;
export const CP_TOTAL_THEMES = CP_THEMES_FLAT.length;

// Count solved problems for a theme given the ProgressContext `state.problems`.
export function themeSolvedCount(progressState, phaseId, themeId, theme) {
  const slug = themeSlug(phaseId, themeId);
  const map = (progressState.problems && progressState.problems[slug]) || {};
  return theme.problems.filter((p) => map[p.id] === "solved").length;
}

// Aggregate solved across the whole module.
export function cpModuleSolved(progressState) {
  let solved = 0;
  for (const { phase, theme } of CP_THEMES_FLAT) {
    const slug = themeSlug(phase.id, theme.id);
    const map = (progressState.problems && progressState.problems[slug]) || {};
    for (const p of theme.problems) if (map[p.id] === "solved") solved++;
  }
  return solved;
}

// Codeforces rating → rank color, mirroring the official CF palette. Used to
// tint each problem chip so the difficulty ramp is visible at a glance.
export function ratingColor(rating) {
  if (rating >= 2400) return "#ff0000"; // red — international grandmaster+
  if (rating >= 2100) return "#ff8c00"; // orange — master
  if (rating >= 1900) return "#aa00aa"; // violet — candidate master
  if (rating >= 1600) return "#0000ff"; // blue — expert
  if (rating >= 1400) return "#03a89e"; // cyan — specialist
  if (rating >= 1200) return "#008000"; // green — pupil
  return "#808080"; // gray — newbie
}

export function ratingRank(rating) {
  if (rating >= 2400) return "Grandmaster";
  if (rating >= 2100) return "Master";
  if (rating >= 1900) return "Candidate Master";
  if (rating >= 1600) return "Expert";
  if (rating >= 1400) return "Specialist";
  if (rating >= 1200) return "Pupil";
  return "Newbie";
}
