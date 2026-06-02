import { Construction } from "lucide-react";
import { hasHftSim, renderHftSim } from "@/simulators/hftRegistry.jsx";

export default function VisualizeStep({ visualizerKey }) {
  if (hasHftSim(visualizerKey)) {
    return <div className="animate-fade-in">{renderHftSim(visualizerKey)}</div>;
  }
  return (
    <div
      className="grid place-items-center rounded-2xl border border-dashed p-12 text-center"
      style={{ borderColor: "rgb(var(--border-strong))" }}
    >
      <Construction className="h-10 w-10 text-faint" />
      <h3 className="mt-3 font-semibold">Interactive visualization coming soon</h3>
      <p className="mt-1 max-w-md text-sm text-muted">
        A visual, hands-on simulator for this concept is being crafted. The concept, deep dive,
        and practice sections are ready to study now.
      </p>
    </div>
  );
}
