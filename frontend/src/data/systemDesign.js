// Module 2 — System Design. Content-driven, mirroring the algorithms module.
// Lessons live at <repo>/content/system-design/<sectionId>/<slug>.json and are
// auto-discovered via Vite's import.meta.glob — drop a new JSON file in and it
// shows up on the roadmap, no wiring required.

// ----- Curriculum sections (the roadmap groups) ----------------------------
export const SD_SECTIONS = [
  {
    id: "start-here",
    title: "Start Here",
    short: "How SD interviews work & how to use this module",
    blurb:
      "Brand new to system design? Start here. What these interviews actually test, the mental model, and a roadmap so you never feel lost.",
    icon: "Compass",
    color: "#d97706",
    order: 1,
  },
  {
    id: "fundamentals",
    title: "Fundamentals",
    short: "The vocabulary every answer is built on",
    blurb:
      "Scalability, availability, consistency, the CAP theorem, networking, and the numbers every engineer should know by heart.",
    icon: "BookOpen",
    color: "#f59e0b",
    order: 2,
  },
  {
    id: "building-blocks",
    title: "Building Blocks",
    short: "The components you wire together on the whiteboard",
    blurb:
      "Load balancers, caches, CDNs, databases, queues, API gateways — the Lego bricks of every large-scale system.",
    icon: "Boxes",
    color: "#0ea5e9",
    order: 3,
  },
  {
    id: "distributed-systems",
    title: "Distributed Systems",
    short: "The hard parts that separate senior from junior",
    blurb:
      "Replication, partitioning, consensus, consistent hashing, idempotency, and the failure modes that make distributed systems hard.",
    icon: "Share2",
    color: "#8b5cf6",
    order: 4,
  },
  {
    id: "case-studies",
    title: "Case Studies",
    short: "The canonical questions, end to end",
    blurb:
      "Full, structured walkthroughs of the designs that actually get asked — from requirements and estimation to deep dives and trade-offs.",
    icon: "Layout",
    color: "#10b981",
    order: 5,
  },
  {
    id: "interview-playbook",
    title: "Interview Playbook",
    short: "A repeatable structure so you never freeze",
    blurb:
      "The framework, capacity-estimation cheats, communication tips, and exactly how junior vs senior candidates are graded.",
    icon: "Workflow",
    color: "#ef4444",
    order: 6,
  },
];

export const SD_SECTION_BY_ID = Object.fromEntries(SD_SECTIONS.map((s) => [s.id, s]));

// ----- Auto-discover lesson content ----------------------------------------
const modules = import.meta.glob("../../../content/system-design/**/*.json", {
  eager: true,
});

function normalize(raw) {
  return raw && raw.default ? raw.default : raw;
}

export const SD_LESSONS = Object.entries(modules)
  .map(([path, raw]) => {
    const data = normalize(raw);
    const fileSlug = path.split("/").pop().replace(/\.json$/, "");
    return { ...data, slug: data.slug || fileSlug };
  })
  .filter((l) => l && l.slug && l.sectionId);

export const SD_LESSON_BY_SLUG = Object.fromEntries(SD_LESSONS.map((l) => [l.slug, l]));

// Group lessons by section, each ordered by its `order` field.
export const SD_LESSONS_BY_SECTION = SD_SECTIONS.map((section) => {
  const lessons = SD_LESSONS.filter((l) => l.sectionId === section.id).sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99),
  );
  return { ...section, lessons };
});

// Flattened, fully ordered list — drives prev/next navigation across the module.
export const SD_LESSONS_FLAT = [...SD_LESSONS_BY_SECTION]
  .sort((a, b) => a.order - b.order)
  .flatMap((s) => s.lessons);

export const SD_TOTAL_LESSONS = SD_LESSONS_FLAT.length;

export function getSdLesson(slug) {
  return SD_LESSON_BY_SLUG[slug] || null;
}

export function getSdSection(id) {
  return SD_SECTION_BY_ID[id] || null;
}

export function getSdAdjacent(slug) {
  const idx = SD_LESSONS_FLAT.findIndex((l) => l.slug === slug);
  if (idx === -1) return { prev: null, next: null, index: -1 };
  return {
    prev: idx > 0 ? SD_LESSONS_FLAT[idx - 1] : null,
    next: idx < SD_LESSONS_FLAT.length - 1 ? SD_LESSONS_FLAT[idx + 1] : null,
    index: idx,
  };
}

export const SD_DIFFICULTY = {
  Beginner: { label: "Beginner", color: "#10b981" },
  Intermediate: { label: "Intermediate", color: "#f59e0b" },
  Advanced: { label: "Advanced", color: "#ef4444" },
  Easy: { label: "Easy", color: "#10b981" },
  Medium: { label: "Medium", color: "#f59e0b" },
  Hard: { label: "Hard", color: "#ef4444" },
};
