import { useState } from "react";
import { motion } from "framer-motion";
import { Play, FastForward, RotateCcw } from "lucide-react";

/* A market-making game. You set a spread (and optionally let the engine skew
   quotes to manage inventory). Each tick the fair value random-walks, then
   simulated flow may lift your ask or hit your bid — tighter quotes fill more
   but get adversely selected near fair value, and inventory you carry is
   exposed to the drift. PnL = cash + inventory marked at fair value. */

const QTY = 100;
const START = 100.0;

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

export default function MarketMakingSim() {
  const [fair, setFair] = useState(START);
  const [spread, setSpread] = useState(6); // cents
  const [skew, setSkew] = useState(true);
  const [inv, setInv] = useState(0);
  const [cash, setCash] = useState(0);
  const [tick, setTick] = useState(0);
  const [tape, setTape] = useState([]);
  const [hist, setHist] = useState([START]);
  const accent = "#06b6d4";

  const skewCents = skew ? clamp(-inv / QTY, -6, 6) : 0; // long → lower quotes
  const bid = +(fair - spread / 200 + skewCents / 100).toFixed(2);
  const ask = +(fair + spread / 200 + skewCents / 100).toFixed(2);
  const pnl = cash + inv * fair;

  const stepOnce = (state) => {
    let { fair, inv, cash, tape, hist } = state;
    // Random walk of the true value (≈1.4 cent vol per tick).
    const drift = (Math.random() - 0.5) * 0.028;
    const nf = +(fair + drift).toFixed(3);
    const sk = skew ? clamp(-inv / QTY, -6, 6) : 0;
    const b = fair - spread / 200 + sk / 100;
    const a = fair + spread / 200 + sk / 100;
    // Fill probabilities: cheaper-than-fair quotes attract informed flow.
    const pBuy = clamp(0.45 + (fair - a) * 7, 0.02, 0.95); // they lift your ask
    const pSell = clamp(0.45 + (b - fair) * 7, 0.02, 0.95); // they hit your bid
    const newTape = [...tape];
    if (Math.random() < pBuy) {
      inv -= QTY;
      cash += a * QTY;
      newTape.unshift({ t: tick + 1, side: "sold", px: +a.toFixed(2) });
    } else if (Math.random() < pSell) {
      inv += QTY;
      cash -= b * QTY;
      newTape.unshift({ t: tick + 1, side: "bought", px: +b.toFixed(2) });
    }
    return {
      fair: nf,
      inv,
      cash,
      tape: newTape.slice(0, 6),
      hist: [...hist, nf].slice(-40),
    };
  };

  const next = (times = 1) => {
    let st = { fair, inv, cash, tape, hist };
    for (let i = 0; i < times; i++) st = stepOnce(st);
    setFair(st.fair);
    setInv(st.inv);
    setCash(st.cash);
    setTape(st.tape);
    setHist(st.hist);
    setTick((t) => t + times);
  };

  const reset = () => {
    setFair(START);
    setInv(0);
    setCash(0);
    setTick(0);
    setTape([]);
    setHist([START]);
  };

  // Sparkline of fair value.
  const lo = Math.min(...hist);
  const hi = Math.max(...hist);
  const range = hi - lo || 1;
  const pts = hist
    .map((v, i) => `${(i / Math.max(1, hist.length - 1)) * 100},${30 - ((v - lo) / range) * 28 - 1}`)
    .join(" ");

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="rounded-xl surface-sunken p-3 sm:p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 flex items-center justify-between text-xs text-muted">
              <span>Your spread</span>
              <span className="font-mono font-semibold" style={{ color: accent }}>{spread}¢</span>
            </label>
            <input
              type="range"
              min="2"
              max="20"
              value={spread}
              onChange={(e) => setSpread(+e.target.value)}
              className="w-full accent-cyan-500"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={skew} onChange={(e) => setSkew(e.target.checked)} className="accent-cyan-500" />
            Auto-skew to manage inventory
          </label>
          <button onClick={() => next(1)} className="btn-primary" style={{ backgroundColor: accent }}>
            <Play className="h-4 w-4" /> Next tick
          </button>
          <button onClick={() => next(20)} className="btn-ghost">
            <FastForward className="h-4 w-4" /> Run 20
          </button>
          <button onClick={reset} className="btn-ghost">
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      {/* Quotes */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border p-3 text-center" style={{ borderColor: "#10b98144" }}>
          <div className="text-xs text-muted">Your bid</div>
          <div className="font-mono text-xl font-bold text-emerald-500">{bid.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border p-3 text-center" style={{ borderColor: `${accent}55`, backgroundColor: `${accent}0d` }}>
          <div className="text-xs text-muted">Fair value</div>
          <div className="font-mono text-xl font-bold" style={{ color: accent }}>{fair.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border p-3 text-center" style={{ borderColor: "#ef444444" }}>
          <div className="text-xs text-muted">Your ask</div>
          <div className="font-mono text-xl font-bold text-red-500">{ask.toFixed(2)}</div>
        </div>
      </div>

      {/* Sparkline + stats */}
      <div className="grid gap-3 sm:grid-cols-[1fr,1fr]">
        <div className="rounded-xl border p-3" style={{ borderColor: "rgb(var(--border))" }}>
          <div className="mb-1 text-xs text-muted">Fair-value path · tick {tick}</div>
          <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-16 w-full">
            <polyline points={pts} fill="none" stroke={accent} strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border p-3 text-center" style={{ borderColor: "rgb(var(--border))" }}>
            <div className="text-xs text-muted">Inventory</div>
            <div className="font-mono text-lg font-bold" style={{ color: inv > 0 ? "#10b981" : inv < 0 ? "#ef4444" : "rgb(var(--text))" }}>
              {inv > 0 ? "+" : ""}{inv}
            </div>
          </div>
          <div className="rounded-xl border p-3 text-center" style={{ borderColor: "rgb(var(--border))" }}>
            <div className="text-xs text-muted">PnL (mark-to-fair)</div>
            <div className="font-mono text-lg font-bold" style={{ color: pnl >= 0 ? "#10b981" : "#ef4444" }}>
              {pnl >= 0 ? "+" : ""}{pnl.toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Tape */}
      <div className="rounded-xl border p-3" style={{ borderColor: "rgb(var(--border))" }}>
        <div className="mb-2 text-xs font-semibold text-muted">Your fills</div>
        {tape.length === 0 ? (
          <p className="text-xs text-faint">No fills yet — step the market. Tighten the spread to trade more often (but watch how often you get picked off right before the price moves away).</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tape.map((f, i) => (
              <motion.span
                key={`${f.t}-${i}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="chip font-mono text-xs"
                style={{
                  color: f.side === "bought" ? "#10b981" : "#ef4444",
                  background: f.side === "bought" ? "#10b98114" : "#ef444414",
                }}
              >
                #{f.t} {f.side} {QTY} @ {f.px.toFixed(2)}
              </motion.span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-xl border p-3.5" style={{ borderColor: `${accent}33`, backgroundColor: `${accent}0d` }}>
        <span className="mt-0.5 text-lg leading-none" style={{ color: accent }}>
          ⚡
        </span>
        <p className="text-sm leading-relaxed text-muted">
          Run 20 ticks at a <span className="font-semibold">2¢</span> spread, then again at{" "}
          <span className="font-semibold">16¢</span>. Tight quotes fill constantly but you keep buying right before the
          price drops and selling right before it rises — that's <span className="font-semibold">adverse selection</span>.
          Wide quotes barely trade. The art is a spread that pays you for providing liquidity faster than the drift
          and adverse flow bleed you — and skewing quotes to keep inventory near zero.
        </p>
      </div>
    </div>
  );
}
