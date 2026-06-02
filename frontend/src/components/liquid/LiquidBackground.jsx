/**
 * LiquidBackground — a fixed, full-viewport "interstellar nebula" with caustic
 * light blobs that drift slowly behind the entire app. Sits at -z-10 so all
 * translucent glass surfaces refract it. Purely decorative + pointer-passthrough.
 */
export default function LiquidBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* Drifting caustic blobs (the section accent hues) */}
      <div
        className="animate-caustic absolute -left-1/4 -top-1/3 h-[70vh] w-[70vh] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(37,99,235,0.30), transparent)" }}
      />
      <div
        className="animate-caustic absolute -right-1/4 top-1/4 h-[65vh] w-[65vh] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(139,92,246,0.26), transparent)", animationDelay: "-6s" }}
      />
      <div
        className="animate-caustic absolute bottom-[-25%] left-1/3 h-[60vh] w-[60vh] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(16,185,129,0.20), transparent)", animationDelay: "-12s" }}
      />
      <div
        className="animate-caustic absolute right-1/4 bottom-0 h-[45vh] w-[45vh] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(244,114,182,0.16), transparent)", animationDelay: "-18s" }}
      />

      {/* Fine caustic grain via SVG turbulence — gives the "light through glass" texture */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.04] dark:opacity-[0.06]">
        <filter id="liquid-caustics">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#liquid-caustics)" />
      </svg>

      {/* Vignette to deepen the edges */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(130% 100% at 50% 0%, transparent 55%, rgb(0 0 0 / 0.28))" }}
      />
    </div>
  );
}
