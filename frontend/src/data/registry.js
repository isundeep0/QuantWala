import { CATEGORIES, CATEGORY_BY_ID } from "./categories.js";

// Eagerly import every algorithm content JSON from the single source of truth
// at <repo>/content/algorithms/<category>/<slug>.json.
const modules = import.meta.glob("../../../content/algorithms/**/*.json", {
  eager: true,
});

function normalize(raw) {
  const data = raw && raw.default ? raw.default : raw;
  return data;
}

// Build the flat list of algorithms.
export const ALGORITHMS = Object.entries(modules)
  .map(([path, raw]) => {
    const data = normalize(raw);
    const fileSlug = path.split("/").pop().replace(/\.json$/, "");
    return {
      ...data,
      slug: data.slug || fileSlug,
    };
  })
  .filter((a) => a && a.slug && a.categoryId);

export const ALGO_BY_SLUG = Object.fromEntries(ALGORITHMS.map((a) => [a.slug, a]));

// Group algorithms by category, sorted by their `order` field.
export const ALGORITHMS_BY_CATEGORY = CATEGORIES.map((cat) => {
  const items = ALGORITHMS.filter((a) => a.categoryId === cat.id).sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99),
  );
  return { ...cat, algorithms: items };
});

// Flattened, fully ordered list (category order, then algorithm order).
// This drives the linear roadmap, unlocking, and prev/next navigation.
export const ALGORITHMS_FLAT = [...ALGORITHMS_BY_CATEGORY]
  .sort((a, b) => a.order - b.order)
  .flatMap((cat) => cat.algorithms);

export const TOTAL_ALGORITHMS = ALGORITHMS_FLAT.length;

export function getAlgo(slug) {
  return ALGO_BY_SLUG[slug] || null;
}

export function getCategory(id) {
  return CATEGORY_BY_ID[id] || null;
}

export function getAdjacent(slug) {
  const idx = ALGORITHMS_FLAT.findIndex((a) => a.slug === slug);
  if (idx === -1) return { prev: null, next: null, index: -1 };
  return {
    prev: idx > 0 ? ALGORITHMS_FLAT[idx - 1] : null,
    next: idx < ALGORITHMS_FLAT.length - 1 ? ALGORITHMS_FLAT[idx + 1] : null,
    index: idx,
  };
}

// Algorithms within the same category, ordered. Unlock logic is per-category:
// the first algorithm of each category is always unlocked; subsequent ones
// unlock when the previous algorithm in that category is completed.
export function getCategoryOrderedSlugs(categoryId) {
  const cat = ALGORITHMS_BY_CATEGORY.find((c) => c.id === categoryId);
  return cat ? cat.algorithms.map((a) => a.slug) : [];
}
