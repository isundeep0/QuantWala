import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-24 border-t" style={{ borderColor: "rgb(var(--glass-stroke) / 0.1)" }}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 text-base font-extrabold">
              Quant<span className="text-brand-600 dark:text-brand-400">Wala</span>
            </div>
            <p className="mt-2 text-sm text-muted">
              Master algorithms, system design, and HFT / low-latency systems through
              interactive, visual learning.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm sm:grid-cols-3">
            <Link to="/algorithms" className="text-muted hover:text-brand-600">
              Algorithms
            </Link>
            <Link to="/cp" className="text-muted hover:text-brand-600">
              Road to CM
            </Link>
            <Link to="/system-design" className="text-muted hover:text-sysd">
              System Design
            </Link>
            <Link to="/hft" className="text-muted hover:text-hft">
              HFT / Low Latency
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-xs text-faint" style={{ borderColor: "rgb(var(--glass-stroke) / 0.1)" }}>
          Built for competitive programmers, OA prep, and quant/SWE interview candidates.
          Progress is stored locally in your browser.
        </div>
      </div>
    </footer>
  );
}
