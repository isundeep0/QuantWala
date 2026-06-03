import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Minus,
  Plus,
  Maximize2,
  Sun,
  Coffee,
  Moon,
  FileWarning,
} from "lucide-react";
import PdfReader from "@/components/library/PdfReader.jsx";
import DocxReader from "@/components/library/DocxReader.jsx";
import { cn } from "@/lib/cn.js";

const TINTS = [
  { id: "paper", label: "Paper", icon: Sun },
  { id: "sepia", label: "Sepia", icon: Coffee },
  { id: "night", label: "Night", icon: Moon },
];

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.6;
const ZOOM_STEP = 0.15;

function prefKey(doc) {
  return `qw.reader.local.${doc?.id || "temp"}`;
}

export default function DocumentReader() {
  const location = useLocation();
  const navigate = useNavigate();
  const doc = location.state?.doc || null;

  const [status, setStatus] = useState(doc?.fileUrl ? "ready" : "missing"); // ready | missing
  const [tint, setTint] = useState("night");
  const [zoom, setZoom] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const stageRef = useRef(null);
  const [stageWidth, setStageWidth] = useState(820);
  const readerRef = useRef(null);
  const restoredRef = useRef(false);

  useEffect(() => {
    if (!doc?.fileUrl) return;
    try {
      const saved = JSON.parse(localStorage.getItem(prefKey(doc)) || "{}");
      if (saved.tint) setTint(saved.tint);
      if (saved.zoom) setZoom(saved.zoom);
    } catch {
      /* ignore */
    }
  }, [doc]);

  // Persist prefs (+ last page) so reopening lands where you left off.
  useEffect(() => {
    if (status !== "ready") return;
    const saved = { tint, zoom, page: currentPage };
    try {
      localStorage.setItem(prefKey(doc), JSON.stringify(saved));
    } catch {
      /* ignore */
    }
  }, [doc, tint, zoom, currentPage, status]);

  useEffect(() => {
    // The upload flow creates an object URL; release it when leaving reader.
    return () => {
      if (doc?.localOnly && doc?.fileUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(doc.fileUrl);
      }
    };
  }, [doc]);

  // Track the stage width so pages scale to the available space.
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setStageWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [status]);

  const isPdf = doc?.ext === "pdf";
  const base = Math.min(Math.max(stageWidth - 32, 320), isPdf ? 1000 : 860);
  const pageWidth = Math.round(base * zoom);

  const onNumPages = useCallback(
    (n) => {
      setNumPages(n);
      // Restore last page once we know the count.
      if (!restoredRef.current) {
        restoredRef.current = true;
        try {
          const saved = JSON.parse(localStorage.getItem(prefKey(doc)) || "{}");
          if (saved.page && saved.page > 1 && saved.page <= n) {
            setTimeout(() => readerRef.current?.scrollToPage(saved.page), 120);
          }
        } catch {
          /* ignore */
        }
      }
    },
    [doc],
  );

  const jump = (n) => {
    const target = Math.min(Math.max(1, n), numPages || 1);
    setCurrentPage(target);
    readerRef.current?.scrollToPage(target);
  };

  const setZoomClamped = (z) =>
    setZoom(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 100) / 100)));

  // Keyboard shortcuts for a focused reading session.
  useEffect(() => {
    if (status !== "ready" || !isPdf) return;
    const onKey = (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === "j") jump(currentPage + 1);
      else if (e.key === "ArrowLeft" || e.key === "PageUp" || e.key === "k") jump(currentPage - 1);
      else if (e.key === "+" || e.key === "=") setZoomClamped(zoom + ZOOM_STEP);
      else if (e.key === "-") setZoomClamped(zoom - ZOOM_STEP);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, isPdf, currentPage, zoom, numPages]);

  if (status === "missing") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="glass mx-auto grid h-16 w-16 place-items-center rounded-3xl">
          <FileWarning className="h-7 w-7 text-amber-400" />
        </div>
        <h1 className="mt-5 text-xl font-bold lit-text">No active local document</h1>
        <p className="mt-2 text-sm text-muted">
          This reader is stateless. Choose a file again from the Library page.
        </p>
        <Link to="/library" className="btn-primary mt-6 inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-2 pb-24 sm:px-4">
      {/* Reading toolbar — glass, sticks just under the global nav */}
      <div className="sticky top-[76px] z-40 mt-3">
        <div className="glass animate-iris mx-auto flex flex-wrap items-center gap-2 rounded-2xl px-2.5 py-2 sm:gap-3 sm:px-3.5">
          <button
            onClick={() => navigate("/library")}
            className="glass-orb glass-interactive flex h-9 items-center gap-1.5 rounded-full pl-2.5 pr-3 text-sm"
            title="Back to Library"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Library</span>
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-sm font-semibold lit-text sm:text-base" title={doc?.title}>
                {doc?.title}
              </h1>
              <span className="chip surface-sunken shrink-0 uppercase tracking-wide text-faint">
                {doc?.ext}
              </span>
            </div>
          </div>

          {/* Page navigation (PDF only) */}
          {isPdf && numPages > 0 && (
            <div className="glass-orb flex items-center gap-1 rounded-full px-1.5 py-1">
              <button
                onClick={() => jump(currentPage - 1)}
                disabled={currentPage <= 1}
                className="grid h-7 w-7 place-items-center rounded-full hover:surface-sunken disabled:opacity-30"
                title="Previous page"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1 px-1 font-mono text-xs">
                <input
                  type="number"
                  value={currentPage}
                  min={1}
                  max={numPages}
                  onChange={(e) => setCurrentPage(Number(e.target.value) || 1)}
                  onKeyDown={(e) => e.key === "Enter" && jump(currentPage)}
                  onBlur={() => jump(currentPage)}
                  className="w-9 rounded-md bg-transparent text-center outline-none focus:bg-[rgb(var(--bg-sunken))]"
                />
                <span className="text-faint">/ {numPages}</span>
              </div>
              <button
                onClick={() => jump(currentPage + 1)}
                disabled={currentPage >= numPages}
                className="grid h-7 w-7 place-items-center rounded-full hover:surface-sunken disabled:opacity-30"
                title="Next page"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Zoom */}
          <div className="glass-orb flex items-center gap-0.5 rounded-full px-1.5 py-1">
            <button
              onClick={() => setZoomClamped(zoom - ZOOM_STEP)}
              className="grid h-7 w-7 place-items-center rounded-full hover:surface-sunken"
              title="Zoom out"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="w-12 text-center font-mono text-xs hover:text-[color:rgb(var(--text))]"
              title="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => setZoomClamped(zoom + ZOOM_STEP)}
              className="grid h-7 w-7 place-items-center rounded-full hover:surface-sunken"
              title="Zoom in"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="ml-0.5 grid h-7 w-7 place-items-center rounded-full hover:surface-sunken"
              title="Fit width"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Reading tint */}
          <div className="glass-orb flex items-center gap-0.5 rounded-full p-1">
            {TINTS.map((t) => {
              const Icon = t.icon;
              const active = tint === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTint(t.id)}
                  title={`${t.label} reading mode`}
                  className={cn(
                    "flex h-7 items-center gap-1.5 rounded-full px-2 text-xs font-medium transition-colors",
                    active
                      ? "bg-[rgb(var(--bg-sunken))] text-[color:rgb(var(--text))]"
                      : "text-muted hover:text-[color:rgb(var(--text))]",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reading stage — transparent so the liquid nebula glows around the page */}
      <div ref={stageRef} className={cn("reader-stage tint-" + tint, "mt-6 overflow-x-auto")}>
        <div className="min-w-fit">
          {isPdf ? (
            <PdfReader
              ref={readerRef}
              fileUrl={doc.fileUrl}
              pageWidth={pageWidth}
              onNumPages={onNumPages}
              onVisiblePage={setCurrentPage}
            />
          ) : (
            <DocxReader fileUrl={doc.fileUrl} pageWidth={pageWidth} zoom={zoom} />
          )}
        </div>
      </div>
    </div>
  );
}
