import { motion } from "framer-motion";

/**
 * SwirlProgress — a sophisticated liquid-glass progress core: a frosted well
 * holding a swirling nebula of internal light whose intensity tracks `value`,
 * a glowing progress arc, a pulsing rim, and an etched percentage suspended in
 * the centre. Replaces the flat RingProgress in showcase areas.
 */
export default function SwirlProgress({
  value = 0,
  size = 120,
  stroke = 9,
  color = "#3b82f6",
  label,
  sublabel,
}) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  const id = `swirl-${color.replace("#", "")}`;
  // Internal light grows with progress (always faintly alive, even at 0%).
  const fluidOpacity = 0.22 + (v / 100) * 0.6;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      {/* Frosted well */}
      <div className="glass-orb absolute inset-0" />

      {/* Swirling internal fluid, clipped to the well */}
      <div
        className="absolute overflow-hidden rounded-full"
        style={{ inset: stroke + 2 }}
      >
        <div
          className="animate-swirl absolute -inset-1/2"
          style={{
            opacity: fluidOpacity,
            background: `conic-gradient(from 0deg, ${color}00, ${color}, ${color}55, ${color}dd, ${color}00)`,
            filter: "blur(10px)",
          }}
        />
        <div
          className="animate-swirl absolute -inset-1/4"
          style={{
            opacity: fluidOpacity * 0.7,
            animationDirection: "reverse",
            animationDuration: "5s",
            background: `radial-gradient(closest-side, ${color}cc, transparent 70%)`,
            filter: "blur(6px)",
          }}
        />
      </div>

      {/* Pulsing rim */}
      <div
        className="animate-pulse-ring absolute rounded-full"
        style={{
          inset: 1,
          border: `1px solid ${color}`,
          boxShadow: `0 0 18px ${color}66, inset 0 0 12px ${color}33`,
        }}
      />

      {/* Progress arc */}
      <svg width={size} height={size} className="absolute -rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke="rgb(var(--glass-stroke) / 0.12)"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke={`url(#${id})`}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${color}aa)` }}
        />
      </svg>

      {/* Suspended label */}
      <div className="relative z-10 grid place-items-center text-center">
        {label ?? (
          <span
            className="etched-glow font-extrabold leading-none"
            style={{ "--glow": `${color}aa`, fontSize: Math.round(size * 0.24) }}
          >
            {v}%
          </span>
        )}
        {sublabel && size >= 96 && (
          <span className="etched mt-0.5 text-[10px] font-medium uppercase tracking-wider">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
