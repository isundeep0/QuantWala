import { useMemo, useReducer, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownUp, RotateCcw, Zap } from "lucide-react";

/* An interactive limit order book + matching engine.
   Demonstrates price–time priority: incoming aggressive orders sweep the
   opposite side best-price-first, and resting orders fill FIFO within a level. */

const SEED = {
  bids: [
    { id: "b1", px: 99.97, qty: 400 },
    { id: "b2", px: 99.96, qty: 250 },
    { id: "b3", px: 99.95, qty: 800 },
    { id: "b4", px: 99.94, qty: 300 },
    { id: "b5", px: 99.92, qty: 1200 },
  ],
  asks: [
    { id: "a1", px: 99.99, qty: 350 },
    { id: "a2", px: 100.0, qty: 600 },
    { id: "a3", px: 100.01, qty: 200 },
    { id: "a4", px: 100.03, qty: 900 },
    { id: "a5", px: 100.05, qty: 500 },
  ],
  trades: [],
  seq: 100,
};

function clone(s) {
  return {
    bids: s.bids.map((o) => ({ ...o })),
    asks: s.asks.map((o) => ({ ...o })),
    trades: [...s.trades],
    seq: s.seq,
  };
}

function reducer(state, action) {
  if (action.type === "reset") return clone(SEED);
  if (action.type !== "submit") return state;

  const s = clone(state);
  let { side, type, px, qty } = action.order;
  qty = Math.max(0, Math.round(qty));
  if (qty === 0) return state;

  const buying = side === "buy";
  // Match against the resting opposite side, best price first.
  const restingKey = buying ? "asks" : "bids";
  const myKey = buying ? "bids" : "asks";
  let book = s[restingKey];

  const crosses = (restPx) => {
    if (type === "market") return true;
    return buying ? px >= restPx : px <= restPx;
  };

  let remaining = qty;
  const newTrades = [];
  while (remaining > 0 && book.length > 0) {
    // Best resting order is at index 0 (book kept sorted).
    const best = book[0];
    if (!crosses(best.px)) break;
    const fill = Math.min(remaining, best.qty);
    best.qty -= fill;
    remaining -= fill;
    s.seq += 1;
    newTrades.unshift({ id: `t${s.seq}`, px: best.px, qty: fill, side });
    if (best.qty <= 0) book.shift();
  }

  // Any unfilled remainder of a limit order rests on the book.
  if (remaining > 0 && type === "limit") {
    s.seq += 1;
    const o = { id: `${buying ? "b" : "a"}${s.seq}`, px, qty: remaining, fresh: true };
    const mine = s[myKey];
    mine.push(o);
    // Bids: descending price; Asks: ascending price.
    mine.sort((x, y) => (buying ? y.px - x.px : x.px - y.px));
  }

  s.trades = [...newTrades, ...s.trades].slice(0, 8);
  return s;
}

function bestBid(s) {
  return s.bids.length ? s.bids[0].px : null;
}
function bestAsk(s) {
  return s.asks.length ? s.asks[0].px : null;
}

function DepthRow({ order, side, maxQty, accent }) {
  const pct = Math.min(100, (order.qty / maxQty) * 100);
  const bg = side === "bid" ? "#10b98122" : "#ef444422";
  const txt = side === "bid" ? "#10b981" : "#ef4444";
  return (
    <motion.div
      layout
      initial={order.fresh ? { opacity: 0, x: side === "bid" ? -12 : 12 } : false}
      animate={{ opacity: 1, x: 0 }}
      className="relative grid grid-cols-2 items-center px-2 py-1 font-mono text-xs"
    >
      <div
        className="absolute inset-y-0 rounded"
        style={{ [side === "bid" ? "right" : "left"]: 0, width: `${pct}%`, background: bg }}
      />
      {side === "bid" ? (
        <>
          <span className="relative z-10 text-faint">{order.qty}</span>
          <span className="relative z-10 text-right font-semibold" style={{ color: txt }}>
            {order.px.toFixed(2)}
          </span>
        </>
      ) : (
        <>
          <span className="relative z-10 font-semibold" style={{ color: txt }}>
            {order.px.toFixed(2)}
          </span>
          <span className="relative z-10 text-right text-faint">{order.qty}</span>
        </>
      )}
    </motion.div>
  );
}

export default function OrderBookSim() {
  const [state, dispatch] = useReducer(reducer, SEED, clone);
  const [side, setSide] = useState("buy");
  const [type, setType] = useState("limit");
  const [px, setPx] = useState("100.00");
  const [qty, setQty] = useState("500");
  const accent = "#14b8a6";

  const bb = bestBid(state);
  const ba = bestAsk(state);
  const spread = bb != null && ba != null ? ba - bb : null;
  const mid = bb != null && ba != null ? (bb + ba) / 2 : null;
  const maxQty = useMemo(
    () => Math.max(1, ...state.bids.map((o) => o.qty), ...state.asks.map((o) => o.qty)),
    [state],
  );

  const submit = () => {
    dispatch({
      type: "submit",
      order: { side, type, px: parseFloat(px), qty: parseFloat(qty) || 0 },
    });
  };

  return (
    <div className="space-y-4">
      {/* Order ticket */}
      <div className="rounded-xl surface-sunken p-3 sm:p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs text-muted">Side</label>
            <div className="flex overflow-hidden rounded-lg border" style={{ borderColor: "rgb(var(--border-strong))" }}>
              {["buy", "sell"].map((sd) => (
                <button
                  key={sd}
                  onClick={() => setSide(sd)}
                  className="px-3 py-1.5 text-sm font-semibold transition-colors"
                  style={
                    side === sd
                      ? { backgroundColor: sd === "buy" ? "#10b981" : "#ef4444", color: "#fff" }
                      : undefined
                  }
                >
                  {sd === "buy" ? "Buy" : "Sell"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Type</label>
            <div className="flex overflow-hidden rounded-lg border" style={{ borderColor: "rgb(var(--border-strong))" }}>
              {["limit", "market"].map((tp) => (
                <button
                  key={tp}
                  onClick={() => setType(tp)}
                  className="px-3 py-1.5 text-sm font-medium capitalize transition-colors"
                  style={type === tp ? { backgroundColor: accent, color: "#fff" } : undefined}
                >
                  {tp}
                </button>
              ))}
            </div>
          </div>
          <div className={type === "market" ? "opacity-40" : ""}>
            <label className="mb-1 block text-xs text-muted">Limit price</label>
            <input
              value={px}
              onChange={(e) => setPx(e.target.value)}
              disabled={type === "market"}
              className="input w-24 font-mono"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Quantity</label>
            <input value={qty} onChange={(e) => setQty(e.target.value)} className="input w-24 font-mono" />
          </div>
          <button onClick={submit} className="btn-primary" style={{ backgroundColor: accent }}>
            <Zap className="h-4 w-4" /> Send order
          </button>
          <button
            onClick={() => dispatch({ type: "reset" })}
            className="btn-ghost"
            title="Reset the book"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      {/* Top-of-book stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Best bid", value: bb?.toFixed(2) ?? "—", color: "#10b981" },
          { label: "Best ask", value: ba?.toFixed(2) ?? "—", color: "#ef4444" },
          { label: "Spread", value: spread != null ? `${(spread * 100).toFixed(1)}¢` : "—", color: accent },
          { label: "Mid", value: mid?.toFixed(3) ?? "—", color: "rgb(var(--text))" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border p-3 text-center" style={{ borderColor: "rgb(var(--border))" }}>
            <div className="text-xs text-muted">{s.label}</div>
            <div className="mt-0.5 font-mono text-lg font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr,260px]">
        {/* The book */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border p-2" style={{ borderColor: "#10b98133" }}>
            <div className="mb-1 flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-500">
              <span>Qty</span>
              <span>Bids</span>
            </div>
            <div className="space-y-0.5">
              <AnimatePresence>
                {state.bids.map((o) => (
                  <DepthRow key={o.id} order={o} side="bid" maxQty={maxQty} accent={accent} />
                ))}
              </AnimatePresence>
            </div>
          </div>
          <div className="rounded-xl border p-2" style={{ borderColor: "#ef444433" }}>
            <div className="mb-1 flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-wide text-red-500">
              <span>Asks</span>
              <span>Qty</span>
            </div>
            <div className="space-y-0.5">
              <AnimatePresence>
                {state.asks.map((o) => (
                  <DepthRow key={o.id} order={o} side="ask" maxQty={maxQty} accent={accent} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Trade tape */}
        <div className="rounded-xl border p-3" style={{ borderColor: "rgb(var(--border))" }}>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted">
            <ArrowDownUp className="h-3.5 w-3.5" /> Trade tape
          </div>
          {state.trades.length === 0 ? (
            <p className="text-xs text-faint">No prints yet. Send a crossing order to lift the offer or hit the bid.</p>
          ) : (
            <div className="space-y-1">
              <AnimatePresence>
                {state.trades.map((t) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between font-mono text-xs"
                  >
                    <span style={{ color: t.side === "buy" ? "#10b981" : "#ef4444" }}>
                      {t.side === "buy" ? "▲" : "▼"} {t.qty}
                    </span>
                    <span className="font-semibold">@ {t.px.toFixed(2)}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border p-3.5" style={{ borderColor: `${accent}33`, backgroundColor: `${accent}0d` }}>
        <Zap className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} />
        <p className="text-sm leading-relaxed text-muted">
          Try a <span className="font-semibold">market buy 800</span>: it sweeps 99.99 (350) then 100.00 (450),
          printing two trades — it pays a worse price for the second slice. A{" "}
          <span className="font-semibold">limit buy 600 @ 99.98</span> doesn't cross, so it rests as the new best bid
          and you'd earn the spread if someone sells into you. That trade-off — cross and pay, or rest and wait — is
          the heart of market making.
        </p>
      </div>
    </div>
  );
}
