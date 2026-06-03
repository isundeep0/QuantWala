// Module 5 — Personal Finance & Investing (India). Content-driven, mirroring the
// system-design module. Lessons live at <repo>/content/finance/<sectionId>/<slug>.json
// and are auto-discovered via Vite's import.meta.glob — drop a new JSON file in and
// it shows up on the roadmap, no wiring required.
//
// The whole curriculum is anchored to one beginner persona so every number is
// concrete: 22 years old, living in Bengaluru, earning Rs 20,000/month, saving
// for a car by 2031.

// ----- The persona every example is built on -------------------------------
export const FIN_PERSONA = {
  name: "Aarav",
  age: 22,
  city: "Bengaluru",
  income: 20000,
  goal: "Buy a car by 2031 (a strict 5-year horizon)",
};

// ----- Curriculum sections (the roadmap groups) ----------------------------
export const FIN_SECTIONS = [
  {
    id: "start-here",
    title: "Start Here",
    short: "Mindset, the persona, and how to use this course",
    blurb:
      "Brand new to money? Start here. The psychology that decides whether you build wealth, the one persona we'll use for every example, and how the rest of the course is structured.",
    icon: "Compass",
    color: "#14b8a6",
    order: 1,
  },
  {
    id: "cash-flow",
    title: "Module 1 — Cash Flow & The Defensive Game",
    short: "Budgeting and the emergency fund",
    blurb:
      "You can't invest money you never kept. The 50/30/20 rule adapted for a real Bengaluru budget, the 'pay yourself first' habit, and exactly where to park your emergency fund.",
    icon: "Wallet",
    color: "#10b981",
    order: 2,
  },
  {
    id: "compounding",
    title: "Module 2 — The Mechanics of Compounding",
    short: "The offensive game: time + rate",
    blurb:
      "Compound interest is the engine of every rupee of wealth. The time value of money, the Rule of 72, and the brutal maths of why starting at 22 beats starting at 30 by more than 2x.",
    icon: "TrendingUp",
    color: "#22c55e",
    order: 3,
  },
  {
    id: "debt-credit",
    title: "Module 3 — Debt, Credit Cards & CIBIL",
    short: "Billing cycles, the minimum-due trap, building a 750+ score",
    blurb:
      "Credit is a tool that builds you or buries you. How credit cards actually work, the minimum-due debt trap, and a from-scratch plan to build a 750+ CIBIL score before you ever need a loan.",
    icon: "CreditCard",
    color: "#f59e0b",
    order: 4,
  },
  {
    id: "investment-arsenal",
    title: "Module 4 — The Investment Arsenal",
    short: "FD/RD, mutual funds, stocks, gold/SGB, expense ratios",
    blurb:
      "Every asset class on the table, with real Indian risks and historical returns: FDs & RDs, active vs index mutual funds, direct equity, and gold/SGBs — plus why Direct mutual funds quietly beat Regular ones.",
    icon: "Layers",
    color: "#0ea5e9",
    order: 5,
  },
  {
    id: "goal-investing",
    title: "Module 5 — Goal-Based Investing",
    short: "Matching a vehicle to a timeline · the 2031 car plan",
    blurb:
      "Money for 5 years away is invested completely differently from money for 30 years away. How to match the asset to the timeline, and a concrete step-up SIP plan to fund the 2031 car down payment.",
    icon: "Target",
    color: "#8b5cf6",
    order: 6,
  },
  {
    id: "taxation",
    title: "Module 6 — Taxation & The Indian System",
    short: "Old vs New regime, LTCG vs STCG, tax harvesting",
    blurb:
      "Tax is the silent expense on every gain. Old vs New regime decoded, capital-gains rules on equity after the 2024 overhaul, and how tax harvesting legally shrinks your bill.",
    icon: "Landmark",
    color: "#ef4444",
    order: 7,
  },
  {
    id: "capstone",
    title: "Your Money System",
    short: "Putting all six modules into one repeatable routine",
    blurb:
      "Everything assembled into a single monthly money routine and a one-page checklist, so that when you finish this course you can run your own finances with confidence.",
    icon: "ClipboardCheck",
    color: "#14b8a6",
    order: 8,
  },
];

export const FIN_SECTION_BY_ID = Object.fromEntries(FIN_SECTIONS.map((s) => [s.id, s]));

// ----- Auto-discover lesson content ----------------------------------------
const modules = import.meta.glob("../../../content/finance/**/*.json", {
  eager: true,
});

function normalize(raw) {
  return raw && raw.default ? raw.default : raw;
}

export const FIN_LESSONS = Object.entries(modules)
  .map(([path, raw]) => {
    const data = normalize(raw);
    const fileSlug = path.split("/").pop().replace(/\.json$/, "");
    return { ...data, slug: data.slug || fileSlug };
  })
  .filter((l) => l && l.slug && l.sectionId);

export const FIN_LESSON_BY_SLUG = Object.fromEntries(FIN_LESSONS.map((l) => [l.slug, l]));

// Group lessons by section, each ordered by its `order` field.
export const FIN_LESSONS_BY_SECTION = FIN_SECTIONS.map((section) => {
  const lessons = FIN_LESSONS.filter((l) => l.sectionId === section.id).sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99),
  );
  return { ...section, lessons };
});

// Flattened, fully ordered list — drives prev/next navigation across the module.
export const FIN_LESSONS_FLAT = [...FIN_LESSONS_BY_SECTION]
  .sort((a, b) => a.order - b.order)
  .flatMap((s) => s.lessons);

export const FIN_TOTAL_LESSONS = FIN_LESSONS_FLAT.length;

export function getFinLesson(slug) {
  return FIN_LESSON_BY_SLUG[slug] || null;
}

export function getFinSection(id) {
  return FIN_SECTION_BY_ID[id] || null;
}

export function getFinAdjacent(slug) {
  const idx = FIN_LESSONS_FLAT.findIndex((l) => l.slug === slug);
  if (idx === -1) return { prev: null, next: null, index: -1 };
  return {
    prev: idx > 0 ? FIN_LESSONS_FLAT[idx - 1] : null,
    next: idx < FIN_LESSONS_FLAT.length - 1 ? FIN_LESSONS_FLAT[idx + 1] : null,
    index: idx,
  };
}

export const FIN_DIFFICULTY = {
  Beginner: { label: "Beginner", color: "#10b981" },
  Intermediate: { label: "Intermediate", color: "#f59e0b" },
  Advanced: { label: "Advanced", color: "#ef4444" },
  Easy: { label: "Easy", color: "#10b981" },
  Medium: { label: "Medium", color: "#f59e0b" },
  Hard: { label: "Hard", color: "#ef4444" },
};
