import { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Menu, X, Cpu, Network, Boxes } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle.jsx";
import { useProgress } from "@/context/ProgressContext.jsx";
import { cn } from "@/lib/cn.js";

const LINKS = [
  { to: "/algorithms", label: "Algorithms", icon: Boxes, color: "#2563eb" },
  { to: "/system-design", label: "System Design", icon: Network, color: "#d97706" },
  { to: "/hft", label: "HFT / Low Latency", icon: Cpu, color: "#059669" },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 shadow-glow transition-transform group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M6 15 L10 8 L13.5 13 L18 6"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="6" r="1.9" fill="#34d399" stroke="#fff" strokeWidth="1.1" />
        </svg>
      </span>
      <span className="text-[17px] font-extrabold tracking-tight">
        Quant<span className="text-brand-600 dark:text-brand-400">Wala</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { overallPercent } = useProgress();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{ backgroundColor: "rgb(var(--bg-elev) / 0.78)", borderColor: "rgb(var(--border))" }}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="ml-4 hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const Icon = l.icon;
            const active =
              location.pathname === l.to || location.pathname.startsWith(l.to + "/");
            return (
              <NavLink
                key={l.to}
                to={l.to}
                className={cn(
                  "relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-[var(--c)]" : "text-muted hover:text-[color:rgb(var(--text))]",
                )}
                style={{ "--c": l.color }}
              >
                <Icon className="h-4 w-4" style={{ color: active ? l.color : undefined }} />
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-2 -bottom-[1px] h-0.5 rounded-full"
                    style={{ backgroundColor: l.color }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/algorithms"
            className="hidden items-center gap-2 rounded-xl border px-3 py-1.5 sm:flex"
            style={{ borderColor: "rgb(var(--border-strong))" }}
            title="Algorithms progress"
          >
            <div className="h-1.5 w-16 overflow-hidden rounded-full surface-sunken">
              <div
                className="h-full rounded-full bg-brand-600"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            <span className="font-mono text-xs font-semibold text-muted">{overallPercent}%</span>
          </Link>

          <ThemeToggle />

          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-xl border md:hidden"
            style={{ borderColor: "rgb(var(--border-strong))" }}
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t md:hidden"
            style={{ borderColor: "rgb(var(--border))" }}
          >
            <div className="space-y-1 px-4 py-3">
              {LINKS.map((l) => {
                const Icon = l.icon;
                return (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:surface-sunken"
                  >
                    <Icon className="h-4 w-4" style={{ color: l.color }} />
                    {l.label}
                  </NavLink>
                );
              })}
              <div className="flex items-center justify-between rounded-xl px-3 py-2.5 surface-sunken">
                <span className="text-sm text-muted">Algorithms progress</span>
                <span className="font-mono text-sm font-semibold">{overallPercent}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
