import { Quote, Sparkles, Info, AlertTriangle, Lightbulb } from "lucide-react";

const CALLOUT = {
  info: { icon: Info, color: "#0ea5e9" },
  tip: { icon: Lightbulb, color: "#10b981" },
  warn: { icon: AlertTriangle, color: "#f59e0b" },
};

export default function ConceptStep({ data, accent = "#10b981" }) {
  if (!data) return <p className="text-muted">Concept content is being written for this lesson.</p>;

  return (
    <div className="space-y-6">
      {data.analogy && (
        <div
          className="flex items-start gap-3 rounded-2xl border p-5"
          style={{ borderColor: `${accent}33`, backgroundColor: `${accent}0d` }}
        >
          <Quote className="mt-0.5 h-5 w-5 shrink-0" style={{ color: accent }} />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>
              The mental model
            </div>
            <p className="mt-1 leading-relaxed">{data.analogy}</p>
          </div>
        </div>
      )}

      <div className="prose-qw space-y-4">
        {(data.paragraphs || []).map((p, i) => (
          <p key={i} className="leading-relaxed text-[15px]">
            {p}
          </p>
        ))}
      </div>

      {data.points?.length > 0 && (
        <ul className="space-y-2">
          {data.points.map((p, i) => (
            <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed">
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: accent }}
              />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}

      {data.callouts?.length > 0 && (
        <div className="space-y-3">
          {data.callouts.map((c, i) => {
            const meta = CALLOUT[c.type] || CALLOUT.info;
            const Icon = meta.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border p-4"
                style={{ borderColor: `${meta.color}44`, backgroundColor: `${meta.color}0d` }}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: meta.color }} />
                <div>
                  {c.title && <div className="text-sm font-semibold">{c.title}</div>}
                  <p className="mt-0.5 text-sm leading-relaxed text-muted">{c.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {data.keyIdea && (
        <div className="flex items-start gap-3 rounded-xl surface-sunken p-4">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">The key idea</div>
            <p className="mt-1 font-medium">{data.keyIdea}</p>
          </div>
        </div>
      )}
    </div>
  );
}
