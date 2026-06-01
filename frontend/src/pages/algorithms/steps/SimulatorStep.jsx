import { Construction } from "lucide-react";
import { hasSimulator, renderSimulator } from "@/simulators/registry.jsx";

export default function SimulatorStep({ simulatorKey }) {
  if (hasSimulator(simulatorKey)) {
    return <div className="animate-fade-in">{renderSimulator(simulatorKey)}</div>;
  }
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed p-12 text-center" style={{ borderColor: "rgb(var(--border-strong))" }}>
      <Construction className="h-10 w-10 text-faint" />
      <h3 className="mt-3 font-semibold">Interactive simulator coming soon</h3>
      <p className="mt-1 max-w-md text-sm text-muted">
        The visual, step-by-step simulator for this algorithm is being crafted. The intuition,
        logic, dry run, and problem set above are ready to study now.
      </p>
    </div>
  );
}
