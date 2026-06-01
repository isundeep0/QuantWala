import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Cpu, ArrowRight, Activity, Gauge, Code2, Network, Briefcase } from "lucide-react";
import { HFT_SECTIONS } from "@/data/hft.js";

const ACCENT = "#059669";
const SECTION_ICON = {
  foundations: Activity,
  "low-latency-engineering": Gauge,
  "cpp-for-hft": Code2,
  "trading-architecture": Network,
  "interview-prep": Briefcase,
};

const FIRMS = ["Jane Street", "Citadel Securities", "Tower Research", "Hudson River Trading", "Jump Trading", "Optiver"];

export default function HFT() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border p-8 sm:p-12" style={{ borderColor: `${ACCENT}33`, backgroundColor: `${ACCENT}0a` }}>
        <div className="absolute inset-0 dot-grid opacity-40" aria-hidden />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: ACCENT }}>
            <Cpu className="h-4 w-4" /> Module 03 · UI Preview
          </div>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight">
            HFT & Low-Latency Systems
          </h1>
          <p className="mt-3 max-w-2xl text-muted">
            Understand the engineering landscape of quantitative trading — market microstructure,
            the relentless pursuit of low latency, C++ mastery, and the architecture of real
            trading systems. Built for cracking quant-dev and low-latency SWE interviews.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {FIRMS.map((f) => (
              <span key={f} className="chip border font-mono text-xs" style={{ borderColor: `${ACCENT}44`, color: ACCENT }}>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="mt-10 space-y-10">
        {HFT_SECTIONS.map((section) => {
          const SIcon = SECTION_ICON[section.id] || Cpu;
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
                  <Link key={t.id} to={`/hft/${t.id}`} className="card card-hover group flex items-center justify-between gap-3 p-4">
                    <div>
                      <span className="chip border text-[10px] font-mono" style={{ color: ACCENT, backgroundColor: `${ACCENT}14`, borderColor: `${ACCENT}33` }}>
                        {t.tag}
                      </span>
                      <h3 className="mt-2 text-sm font-semibold leading-snug">{t.title}</h3>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" style={{ color: ACCENT }} />
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
