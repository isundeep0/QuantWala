import { useCallback, useRef } from "react";

/**
 * GlassCard — a liquid-glass surface that reacts to the pointer: a specular
 * caustic follows the cursor (via --mx/--my CSS vars) and the iridescent rim
 * intensifies on hover. Renders any element via `as` and forwards the rest.
 */
export default function GlassCard({
  as: Tag = "div",
  interactive = true,
  iris = false,
  className = "",
  style,
  children,
  ...rest
}) {
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  }, []);

  return (
    <Tag
      ref={ref}
      onPointerMove={interactive ? onMove : undefined}
      className={`glass ${interactive ? "glass-interactive" : ""} ${iris ? "animate-iris" : ""} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
