import { useState } from "react";
import { motion } from "framer-motion";

/* Order-book imbalance → microprice. With a bid at Pb (size Qb) and ask at Pa
   (size Qa), the naive mid is (Pb+Pa)/2, but the *microprice* weights toward
   the thin side: imbalance I = Qb / (Qb + Qa) pulls the fair price toward the
   ask when bids dominate (buyers are queued up, price likely to tick up). */

export default function MicropriceSim() {
  const [bidSz, setBidSz] = useState(800);
  const [askSz, setAskSz] = useState(200);
  const bid = 99.99;
  const ask = 100.01;
  const accent = "#06b6d4";

  const total = bidSz + askSz;
  const imbalance = total ? bidSz / total : 0.5; // 0..1, high = bid-heavy
  const mid = (bid + ask) / 2;
  // Microprice pulls toward the ask when bids dominate (imbalance high).
  const micro = ask * imbalance + bid * (1 - imbalance);
  const signal = imbalance > 0.62 ? "up" : imbalance < 0.38 ? "down" : "flat";

  // Position of micro within [bid, ask] as a percentage.
  const microPct = ((micro - bid) / (ask - bid)) * 100;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl surface-sunken p-4">
          <label className="mb-1 flex items-center justify-between text-xs text-muted">
            <span>Bid size @ {bid.toFixed(2)}</span>
            <span className="font-mono font-semibold text-emerald-500">{bidSz}</span>
          </label>
          <input type="range" min="0" max="1500" step="50" value={bidSz} onChange={(e) => setBidSz(+e.target.value)} className="w-full accent-emerald-500" />
        </div>
        <div className="rounded-xl surface-sunken p-4">
          <label className="mb-1 flex items-center justify-between text-xs text-muted">
            <span>Ask size @ {ask.toFixed(2)}</span>
            <span className="font-mono font-semibold text-red-500">{askSz}</span>
          </label>
          <input type="range" min="0" max="1500" step="50" value={askSz} onChange={(e) => setAskSz(+e.target.value)} className="w-full accent-red-500" />
        </div>
      </div>

      {/* Imbalance bar */}
      <div className="rounded-xl border p-4" style={{ borderColor: "rgb(var(--border))" }}>
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-emerald-500">Bids {Math.round(imbalance * 100)}%</span>
          <span className="text-muted">Queue imbalance</span>
          <span className="text-red-500">Asks {Math.round((1 - imbalance) * 100)}%</span>
        </div>
        <div className="flex h-4 overflow-hidden rounded-full surface-sunken">
          <motion.div className="h-full bg-emerald-500" animate={{ width: `${imbalance * 100}%` }} />
          <motion.div className="h-full bg-red-500" animate={{ width: `${(1 - imbalance) * 100}%` }} />
        </div>
      </div>

      {/* Price line bid → ask with mid and micro markers */}
      <div className="rounded-xl border p-4" style={{ borderColor: "rgb(var(--border))" }}>
        <div className="relative mx-2 mt-6 h-1 rounded-full" style={{ background: "linear-gradient(90deg,#10b981,#ef4444)" }}>
          {/* mid marker */}
          <div className="absolute -top-6 -translate-x-1/2 text-center" style={{ left: "50%" }}>
            <div className="text-[10px] text-muted">mid</div>
            <div className="font-mono text-xs font-semibold">{mid.toFixed(3)}</div>
            <div className="mx-auto mt-0.5 h-2 w-px bg-[color:rgb(var(--text-faint))]" />
          </div>
          {/* micro marker */}
          <motion.div className="absolute -bottom-9 -translate-x-1/2 text-center" animate={{ left: `${microPct}%` }}>
            <div className="mx-auto mb-0.5 h-2 w-px" style={{ background: accent }} />
            <div className="font-mono text-xs font-bold" style={{ color: accent }}>{micro.toFixed(3)}</div>
            <div className="text-[10px]" style={{ color: accent }}>microprice</div>
          </motion.div>
          <div className="absolute -left-1 top-3 font-mono text-[10px] text-emerald-500">{bid.toFixed(2)}</div>
          <div className="absolute -right-1 top-3 font-mono text-[10px] text-red-500">{ask.toFixed(2)}</div>
        </div>
        <div className="mt-12 flex items-center justify-center gap-2 text-sm">
          <span className="text-muted">Predicted next move:</span>
          <span
            className="chip font-semibold"
            style={{
              color: signal === "up" ? "#10b981" : signal === "down" ? "#ef4444" : "rgb(var(--text-muted))",
              background:
                signal === "up" ? "#10b98114" : signal === "down" ? "#ef444414" : "rgb(var(--bg-sunken) / 0.5)",
            }}
          >
            {signal === "up" ? "▲ tick up" : signal === "down" ? "▼ tick down" : "— balanced"}
          </span>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border p-3.5" style={{ borderColor: `${accent}33`, backgroundColor: `${accent}0d` }}>
        <span className="mt-0.5 text-lg leading-none" style={{ color: accent }}>
          ⚡
        </span>
        <p className="text-sm leading-relaxed text-muted">
          Pile size onto the bid: the microprice slides toward the ask, predicting an up-tick. The intuition — when a
          big bid queue sits under a thin ask, buyers are lined up and the ask is likely to get lifted, so the true
          price is above the naive mid. <span className="font-semibold">Order-flow imbalance</span> is one of the most
          robust short-horizon alpha signals in HFT, and the microprice is a better fair-value anchor than the mid for
          quoting.
        </p>
      </div>
    </div>
  );
}
