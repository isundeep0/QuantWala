import { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Menu, X, Cpu, Network, Boxes, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle.jsx";
import { useProgress } from "@/context/ProgressContext.jsx";
import { cn } from "@/lib/cn.js";

const LINKS = [
  { to: "/algorithms", label: "Algorithms", icon: Boxes, color: "#3b82f6" },
  { to: "/cp", label: "Road to GM", icon: Trophy, color: "#a855f7" },
  { to: "/system-design", label: "System Design", icon: Network, color: "#f59e0b" },
  { to: "/hft", label: "HFT / Low Latency", icon: Cpu, color: "#10b981" },
];

function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="glass-orb grid h-9 w-9 place-items-center transition-transform group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M6 15 L10 8 L13.5 13 L18 6"
            stroke="#60a5fa"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 4px rgba(96,165,250,0.8))" }}
          />
          <circle cx="18" cy="6" r="1.9" fill="#34d399" stroke="#fff" strokeWidth="1.1" />
        </svg>
      </span>
      <span className="text-[17px] font-extrabold tracking-tight">
        <span className="lit-text">Quant</span>
        <span className="text-brand-500" style={{ filter: "drop-shadow(0 0 8px rgba(59,130,246,0.55))" }}>
          Wala
        </span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { overallPercent, completedCount } = useProgress();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
      {/* Serpentine glass band */}
      <nav className="glass glass-sheen animate-iris mx-auto flex h-14 max-w-7xl items-center gap-3 rounded-2xl px-3 sm:px-5">
        <Logo />

        <div className="ml-3 hidden items-center gap-1 md:flex">
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
                  active ? "text-[color:rgb(var(--text))]" : "text-muted hover:text-[color:rgb(var(--text))]",
                )}
                style={{ "--c": l.color }}
              >
                {active && (
                  <motion.span
                    layoutId="nav-glass-active"
                    className="absolute inset-0 -z-10 rounded-xl"
                    style={{
                      background: `radial-gradient(120% 140% at 50% 120%, ${l.color}38, transparent 70%)`,
                      boxShadow: `inset 0 0 0 1px ${l.color}55, 0 0 18px ${l.color}33`,
                    }}
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                )}
                <Icon
                  className="h-4 w-4"
                  style={{
                    color: active ? l.color : undefined,
                    filter: active ? `drop-shadow(0 0 5px ${l.color})` : undefined,
                  }}
                />
                <span style={active ? { textShadow: `0 0 10px ${l.color}66` } : undefined}>{l.label}</span>
                {active && (
                  <motion.span
                    className="absolute -bottom-px left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                    style={{ backgroundColor: l.color, boxShadow: `0 0 8px ${l.color}` }}
                    animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.6, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Progress orb */}
          <Link
            to="/algorithms"
            className="glass-orb hidden h-9 items-center gap-2 rounded-full pl-1.5 pr-3 sm:flex"
            title={`${completedCount} algorithms complete`}
          >
            <span className="relative grid h-6 w-6 place-items-center">
              <svg viewBox="0 0 36 36" className="h-6 w-6 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgb(var(--glass-stroke) / 0.15)" strokeWidth="4" />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 15}
                  strokeDashoffset={2 * Math.PI * 15 * (1 - overallPercent / 100)}
                  style={{ filter: "drop-shadow(0 0 4px #3b82f6)" }}
                />
              </svg>
              <span
                className="animate-swirl absolute inset-1 rounded-full opacity-60"
                style={{ background: "conic-gradient(from 0deg, transparent, #3b82f6aa, transparent)", filter: "blur(2px)" }}
              />
            </span>
            <span className="etched-glow font-mono text-xs font-semibold" style={{ "--glow": "#3b82f6aa" }}>
              {overallPercent}%
            </span>
          </Link>

          <ThemeToggle />

          <button
            type="button"
            className="glass-orb grid h-9 w-9 place-items-center md:hidden"
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
            className="glass mx-auto mt-2 max-w-7xl overflow-hidden rounded-2xl md:hidden"
          >
            <div className="space-y-1 p-3">
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
