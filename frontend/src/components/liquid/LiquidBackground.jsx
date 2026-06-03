/**
 * LiquidBackground — a fixed, full-viewport ambient wash. A few soft,
 * very low-opacity colour fields sit far behind the app so translucent glass
 * surfaces pick up a gentle tint without the background ever competing with
 * content. Intentionally calm: no fast motion, no hard edges. Decorative and
 * pointer-passthrough.
 */
export default function LiquidBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* Soft colour fields — the section accent hues, barely there. */}
      <div
        className="absolute -left-1/4 -top-1/3 h-[70vh] w-[70vh] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(37,99,235,0.14), transparent)" }}
      />
      <div
        className="absolute -right-1/4 top-1/4 h-[60vh] w-[60vh] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(139,92,246,0.10), transparent)" }}
      />
      <div
        className="absolute bottom-[-25%] left-1/3 h-[55vh] w-[55vh] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(16,185,129,0.08), transparent)" }}
      />

      {/* Fine grain via SVG turbulence — a whisper of texture, no movement. */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.025] dark:opacity-[0.04]">
        <filter id="liquid-caustics">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#liquid-caustics)" />
      </svg>

      {/* Gentle vignette to settle the edges. */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(130% 100% at 50% 0%, transparent 60%, rgb(0 0 0 / 0.18))" }}
      />
    </div>
  );
}
