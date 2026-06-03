import { HFT_SECTIONS, HFT_SECTION_BY_ID } from "./hftSections.js";

// Eagerly import every HFT lesson JSON from the single source of truth at
// <repo>/content/hft/<sectionId>/<slug>.json. New files are auto-discovered by
// Vite's import.meta.glob — no registration step needed.
const modules = import.meta.glob("../../../content/hft/**/*.json", { eager: true });

function normalize(raw) {
  return raw && raw.default ? raw.default : raw;
}

export const HFT_LESSONS = Object.entries(modules)
  .map(([path, raw]) => {
    const data = normalize(raw);
    const fileSlug = path.split("/").pop().replace(/\.json$/, "");
    return { ...data, slug: data.slug || fileSlug };
  })
  .filter((l) => l && l.slug && l.sectionId);

export const HFT_LESSON_BY_SLUG = Object.fromEntries(HFT_LESSONS.map((l) => [l.slug, l]));

// Group lessons by section, each sorted by its `order` field.
export const HFT_LESSONS_BY_SECTION = HFT_SECTIONS.map((section) => {
  const lessons = HFT_LESSONS.filter((l) => l.sectionId === section.id).sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99),
  );
  return { ...section, lessons };
});

// Fully ordered flat list (section order, then lesson order) — drives the
// roadmap, overall progress, and prev/next navigation.
export const HFT_LESSONS_FLAT = [...HFT_LESSONS_BY_SECTION]
  .sort((a, b) => a.order - b.order)
  .flatMap((s) => s.lessons);

export const HFT_TOTAL_LESSONS = HFT_LESSONS_FLAT.length;

export function getHftLesson(slug) {
  return HFT_LESSON_BY_SLUG[slug] || null;
}

export function getHftSection(id) {
  return HFT_SECTION_BY_ID[id] || null;
}

export function getHftAdjacent(slug) {
  const idx = HFT_LESSONS_FLAT.findIndex((l) => l.slug === slug);
  if (idx === -1) return { prev: null, next: null, index: -1 };
  return {
    prev: idx > 0 ? HFT_LESSONS_FLAT[idx - 1] : null,
    next: idx < HFT_LESSONS_FLAT.length - 1 ? HFT_LESSONS_FLAT[idx + 1] : null,
    index: idx,
  };
}
