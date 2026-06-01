import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Network, ArrowRight, Layout, Boxes, Workflow, BookOpen } from "lucide-react";
import { SD_SECTIONS } from "@/data/systemDesign.js";

const ACCENT = "#d97706";
const SECTION_ICON = { fundamentals: BookOpen, "core-components": Boxes, "classic-designs": Layout, "interview-frameworks": Workflow };

export default function SystemDesign() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border p-8 sm:p-12" style={{ borderColor: `${ACCENT}33`, backgroundColor: `${ACCENT}0a` }}>
        <div className="absolute inset-0 dot-grid opacity-40" aria-hidden />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: ACCENT }}>
            <Network className="h-4 w-4" /> Module 02 · UI Preview
          </div>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold tracking-tight">System Design</h1>
          <p className="mt-3 max-w-2xl text-muted">
            A structured path to crack system design interviews at top tech companies — from
            fundamentals to the classic designs and a repeatable framework. The layout and
            navigation are ready; rich content drops in next.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm text-muted" style={{ borderColor: `${ACCENT}44` }}>
            <span className="h-2 w-2 animate-pulse-soft rounded-full" style={{ backgroundColor: ACCENT }} />
            Content in progress — explore the structure below
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="mt-10 space-y-10">
        {SD_SECTIONS.map((section, si) => {
          const SIcon = SECTION_ICON[section.id] || Boxes;
          return (
            <motion.section
              key={section.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}>
                  <SIcon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold">{section.title}</h2>
                  <p className="text-sm text-muted">{section.blurb}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {section.topics.map((t) => (
                  <Link key={t.id} to={`/system-design/${t.id}`} className="card card-hover group flex items-center justify-between gap-3 p-4">
                    <div>
                      <span className="chip border text-[10px]" style={{ color: ACCENT, backgroundColor: `${ACCENT}14`, borderColor: `${ACCENT}33` }}>
                        {t.tag}
                      </span>
                      <h3 className="mt-2 text-sm font-semibold leading-snug">{t.title}</h3>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-faint transition-transform group-hover:translate-x-1" style={{ color: ACCENT }} />
                  </Link>
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
