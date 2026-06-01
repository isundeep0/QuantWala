import { Sparkles, Quote } from "lucide-react";

export default function IntuitionStep({ data }) {
  if (!data) return <Empty />;
  return (
    <div className="space-y-6">
      {data.analogy && (
        <div
          className="flex items-start gap-3 rounded-2xl border p-5"
          style={{ borderColor: "#2563eb33", backgroundColor: "#2563eb0d" }}
        >
          <Quote className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
              Real-world analogy
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

function Empty() {
  return <p className="text-muted">Intuition content is being written for this lesson.</p>;
}
