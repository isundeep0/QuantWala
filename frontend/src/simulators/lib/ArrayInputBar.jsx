import { useState } from "react";
import { Shuffle, Check } from "lucide-react";
import { randomArray } from "./parse.js";

// Reusable input bar: an array text field, an optional scalar (e.g. target),
// plus Randomize + Apply actions. Calls onApply(text, scalar).
export default function ArrayInputBar({
  defaultArray = "",
  scalarLabel,
  defaultScalar = "",
  arrayLabel = "Array",
  onApply,
  accent = "#2563eb",
  randomize = true,
  sorted = false,
}) {
  const [arrText, setArrText] = useState(defaultArray);
  const [scalar, setScalar] = useState(defaultScalar);

  const apply = () => onApply(arrText, scalar);
  const onRandom = () => {
    let a = randomArray(Math.floor(Math.random() * 5) + 8);
    if (sorted) a = a.sort((x, y) => x - y);
    const text = a.join(", ");
    setArrText(text);
    onApply(text, scalar);
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex-1 min-w-[200px]">
        <span className="mb-1 block text-xs font-medium text-muted">{arrayLabel}</span>
        <input
          className="input w-full font-mono"
          value={arrText}
          onChange={(e) => setArrText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          placeholder="e.g. 1, 3, 5, 7, 9"
        />
      </label>
      {scalarLabel && (
        <label className="w-28">
          <span className="mb-1 block text-xs font-medium text-muted">{scalarLabel}</span>
          <input
            className="input w-full font-mono"
            value={scalar}
            onChange={(e) => setScalar(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
          />
        </label>
      )}
      <div className="flex items-center gap-2">
        {randomize && (
          <button onClick={onRandom} className="btn-ghost" title="Randomize">
            <Shuffle className="h-4 w-4" /> Random
          </button>
        )}
        <button onClick={apply} className="btn-primary" style={{ backgroundColor: accent }}>
          <Check className="h-4 w-4" /> Apply
        </button>
      </div>
    </div>
  );
}
