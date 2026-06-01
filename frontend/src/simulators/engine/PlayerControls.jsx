import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn.js";

const SPEEDS = [0.5, 1, 2, 4];

export default function PlayerControls({ player, accent = "#2563eb" }) {
  const { index, count, isPlaying, speed, atStart, atEnd, toggle, next, prev, reset, seek, setSpeed } =
    player;

  return (
    <div className="space-y-3">
      {/* Timeline scrubber */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-faint tabular-nums">
          {String(index + 1).padStart(2, "0")}/{String(count).padStart(2, "0")}
        </span>
        <input
          type="range"
          min={0}
          max={Math.max(0, count - 1)}
          value={index}
          onChange={(e) => seek(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
          style={{
            background: `linear-gradient(90deg, ${accent} ${(index / Math.max(1, count - 1)) * 100}%, rgb(var(--border-strong)) ${(index / Math.max(1, count - 1)) * 100}%)`,
            accentColor: accent,
          }}
          aria-label="Timeline"
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={reset}
            disabled={atStart}
            className="grid h-9 w-9 place-items-center rounded-lg surface-sunken disabled:opacity-40"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={prev}
            disabled={atStart}
            className="grid h-9 w-9 place-items-center rounded-lg surface-sunken disabled:opacity-40"
            title="Previous (←)"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            onClick={toggle}
            className="grid h-11 w-11 place-items-center rounded-xl text-white shadow-soft transition-transform active:scale-95"
            style={{ backgroundColor: accent }}
            title={isPlaying ? "Pause (space)" : "Play (space)"}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-[1px]" />}
          </button>
          <button
            onClick={next}
            disabled={atEnd}
            className="grid h-9 w-9 place-items-center rounded-lg surface-sunken disabled:opacity-40"
            title="Next (→)"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 rounded-lg surface-sunken p-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={cn(
                "rounded-md px-2 py-1 font-mono text-xs font-semibold transition-colors",
                speed === s ? "text-white" : "text-muted hover:text-[color:rgb(var(--text))]",
              )}
              style={speed === s ? { backgroundColor: accent } : undefined}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
