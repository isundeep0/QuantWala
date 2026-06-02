/**
 * Module 05 — Kernel Bypass & Ultra-Low Latency
 * -------------------------------------------------------------------------
 * The typed contract for the interactive syllabus that powers the module's
 * internal page. The runtime data lives in
 * `content/kernel-bypass/curriculum.json` and is loaded (with these types
 * applied via JSDoc) in `src/data/kernelBypass.js`.
 *
 * The hierarchy is intentionally three levels deep so a learner can drill
 * from the "why" down to a concrete thing they build:
 *
 *   Curriculum → Phase[] → Topic[] → Deliverable[]
 *
 * Every phase also carries first-class, citable learning material:
 * `references` (books / official docs / specs) and `papers` (peer-reviewed
 * research, each with a guided reading plan so the papers are approachable).
 */

/** Skill ramp used for phases, topics, papers, and deliverables. */
export type Difficulty =
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | "Innovator";

/** What kind of citable resource a reference is — drives the icon + label. */
export type ReferenceKind =
  | "book"
  | "docs"
  | "spec"
  | "course"
  | "video"
  | "paper"
  | "code";

/** A citable learning resource: a textbook chapter, official docs, a spec… */
export interface Reference {
  kind: ReferenceKind;
  /** Full title as you would cite it. */
  title: string;
  /** Author(s) / maintainer, e.g. "Arpaci-Dusseau & Arpaci-Dusseau". */
  authors?: string;
  /** Where it was published, e.g. "O'Reilly", "USENIX NSDI '24", "kernel.org". */
  venue?: string;
  year?: number;
  /** A stable, official URL. Prefer primary sources over blog reposts. */
  url?: string;
  /** Exactly which part to read, e.g. "Ch. 36–37 — I/O Devices & HDDs". */
  locator?: string;
  /** One line on *why* this source is worth your time. */
  note?: string;
}

/** The kind of work a deliverable asks for — drives its badge + icon. */
export type DeliverableType =
  | "build"
  | "experiment"
  | "benchmark"
  | "reading"
  | "writeup";

/**
 * A concrete, checkable thing the learner produces for a topic. Deliverables
 * are the unit of progress tracked in `KbProgressContext`.
 */
export interface Deliverable {
  /** Stable id, unique within the whole curriculum (used as a progress key). */
  id: string;
  type: DeliverableType;
  title: string;
  /** What to do, in enough detail to start without further instructions. */
  detail: string;
  /** What you should be able to demonstrate / measure once it's done. */
  outcome?: string;
  difficulty?: Difficulty;
  /** Rough effort in hours, for planning. */
  estHours?: number;
}

/** A single subject within a phase, with its key ideas and deliverables. */
export interface Topic {
  id: string;
  title: string;
  /** A 1–3 sentence framing of the topic. */
  summary: string;
  /** Crisp, memorable takeaways — the things you must be able to explain. */
  keyIdeas: string[];
  deliverables: Deliverable[];
  /** Optional topic-scoped references in addition to the phase's set. */
  references?: Reference[];
}

/**
 * A peer-reviewed paper, packaged so a learner can actually read it: a TL;DR,
 * why it matters here, and a concrete reading plan (which sections, what to
 * focus on, what to skim).
 */
export interface Paper {
  id: string;
  title: string;
  authors: string;
  /** Conference / journal, e.g. "USENIX NSDI". */
  venue: string;
  year: number;
  /** Stable link (USENIX, ACM DL, arXiv, or author PDF). */
  url: string;
  difficulty: Difficulty;
  /** One-line takeaway — the result in plain language. */
  tldr: string;
  /** Why this paper belongs in this module / what it unlocks. */
  whyRead: string;
  /** Step-by-step guided reading plan (maps onto the three-pass method). */
  readingGuide: string[];
  /** What you should already understand before opening it. */
  prerequisites?: string[];
  /** Short topical tags for filtering. */
  tags?: string[];
}

/** One of the five phases of the module. */
export interface Phase {
  id: string;
  /** 1-based position in the roadmap. */
  index: number;
  title: string;
  /** A short, punchy subtitle. */
  tagline: string;
  /** The phase's learning objective (the "why you're here"). */
  objective: string;
  level: Difficulty;
  /** Neon accent hex used across the phase's UI. */
  color: string;
  /** lucide-react icon name (resolved by the page at render time). */
  icon: string;
  estHours?: number;
  topics: Topic[];
  /** "Standard Materials": the books / docs / specs that anchor the phase. */
  references: Reference[];
  /** Research papers introduced in this phase (optional for early phases). */
  papers?: Paper[];
  /** The capstone that proves you've cleared the phase. */
  milestone?: string;
}

/** The whole Module 05 syllabus. */
export interface Curriculum {
  id: string;
  /** Display code, e.g. "MODULE 05". */
  moduleCode: string;
  title: string;
  subtitle: string;
  description: string;
  /** Primary neon accent for the module. */
  color: string;
  /** Secondary accent (gradients, hovers). */
  accent: string;
  /** lucide-react icon name for the module card / header. */
  icon: string;
  /** The promises of the module — what you can do once you finish. */
  outcomes: string[];
  phases: Phase[];
  /**
   * A reusable protocol for reading research papers without drowning — surfaced
   * prominently so the papers in every phase feel approachable.
   */
  readingProtocol: {
    title: string;
    intro: string;
    steps: { title: string; detail: string }[];
    reference: Reference;
  };
}
