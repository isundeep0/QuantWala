import { motion } from "framer-motion";

/**
 * SwirlProgress — a calm liquid-glass progress core: a frosted well holding a
 * soft pool of accent light whose intensity tracks `value`, a clean glowing
 * progress arc, and a crisp percentage suspended in the centre. Settles into
 * place instead of animating perpetually.
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
  // A faint internal pool that fills in with progress (always gently alive).
  const fluidOpacity = 0.12 + (v / 100) * 0.4;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      {/* Frosted well */}
      <div className="glass-orb absolute inset-0" />

      {/* Soft internal light pool, clipped to the well */}
      <div className="absolute overflow-hidden rounded-full" style={{ inset: stroke + 2 }}>
        <div
          className="absolute inset-0"
          style={{
            opacity: fluidOpacity,
            background: `radial-gradient(120% 120% at 50% 115%, ${color}, transparent 70%)`,
            filter: "blur(6px)",
          }}
        />
      </div>

      {/* Progress arc */}
      <svg width={size} height={size} className="absolute -rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke="rgb(var(--glass-stroke) / 0.1)"
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
          style={{ filter: `drop-shadow(0 0 4px ${color}66)` }}
        />
      </svg>

      {/* Suspended label */}
      <div className="relative z-10 grid place-items-center text-center">
        {label ?? (
          <span
            className="font-extrabold leading-none"
            style={{ color: "rgb(var(--text))", fontSize: Math.round(size * 0.24) }}
          >
            {v}%
          </span>
        )}
        {sublabel && size >= 96 && (
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-faint">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
