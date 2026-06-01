// Reusable placeholder panel for module shells (content TBD).
export function SkeletonLines({ lines = 3 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-3.5"
          style={{ width: `${[100, 92, 78, 88, 70][i % 5]}%` }}
        />
      ))}
    </div>
  );
}

export default function PlaceholderPanel({ icon: Icon, title, accent = "#2563eb", children, hint }) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        {Icon && (
          <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ backgroundColor: `${accent}1a`, color: accent }}>
            <Icon className="h-4 w-4" />
          </span>
        )}
        <h3 className="font-semibold">{title}</h3>
        <span className="ml-auto chip surface-sunken text-faint">Placeholder</span>
      </div>
      {children}
      {hint && <p className="mt-3 text-xs text-faint">{hint}</p>}
    </section>
  );
}
