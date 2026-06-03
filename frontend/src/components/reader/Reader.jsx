import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Type,
  Maximize2,
  Minimize2,
  Highlighter,
  Trash2,
  BookOpen,
} from "lucide-react";
import {
  serializeSelection,
  applyHighlights,
  clearMarks,
  findMark,
} from "@/lib/highlighter.js";
import { useHighlights } from "@/lib/useHighlights.js";

const GAP = 56; // dead space between columns (only seen mid page-turn)
const SIZES = [0.9, 1, 1.15, 1.3, 1.5];

const COLORS = [
  { key: "yellow", value: "rgba(250, 204, 21, 0.40)", dot: "#facc15" },
  { key: "green", value: "rgba(16, 185, 129, 0.36)", dot: "#10b981" },
  { key: "blue", value: "rgba(59, 130, 246, 0.36)", dot: "#3b82f6" },
  { key: "pink", value: "rgba(244, 114, 182, 0.38)", dot: "#f472b6" },
];

let HL_SEQ = 0;
const newId = () => `hl_${Date.now().toString(36)}_${(HL_SEQ++).toString(36)}`;

export default function Reader({
  title,
  subtitle,
  accent = "#2563eb",
  storageKey,
  onClose,
  children,
}) {
  const rootRef = useRef(null);
  const areaRef = useRef(null); // relative wrapper for absolute toolbar
  const viewportRef = useRef(null); // overflow-hidden window
  const contentRef = useRef(null); // multi-column flow

  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [colW, setColW] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(1);
  const [isFs, setIsFs] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toolbar, setToolbar] = useState(null); // { x, y, below, mode, id }

  const scale = SIZES[sizeIdx];
  const { highlights, loaded, add, remove, clearAll } = useHighlights(storageKey);
  const pendingAnchor = useRef(null);

  // ---- pagination measurement -------------------------------------------
  const relayout = useCallback(() => {
    const vp = viewportRef.current;
    const ct = contentRef.current;
    if (!vp || !ct) return;
    const W = vp.clientWidth;
    if (W <= 0) return;
    ct.style.columnWidth = `${W}px`;
    const sw = ct.scrollWidth;
    const step = W + GAP;
    const count = Math.max(1, Math.round((sw + GAP) / step));
    setColW(W);
    setPageCount(count);
    setPage((p) => Math.min(Math.max(0, p), count - 1));
  }, []);

  // Re-apply highlights + relayout whenever inputs that affect flow change.
  useLayoutEffect(() => {
    if (!loaded) return;
    const ct = contentRef.current;
    if (!ct) return;
    clearMarks(ct);
    applyHighlights(ct, highlights);
    relayout();
  }, [highlights, loaded, scale, isFs, relayout]);

  // Initial + responsive measurement.
  useLayoutEffect(() => {
    relayout();
    const vp = viewportRef.current;
    if (!vp || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => relayout());
    ro.observe(vp);
    return () => ro.disconnect();
  }, [relayout]);

  // Recompute once webfonts finish loading (reflow changes page count).
  useEffect(() => {
    if (document.fonts?.ready) document.fonts.ready.then(() => relayout());
  }, [relayout]);

  // Lock background scroll while the reader overlay is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ---- navigation --------------------------------------------------------
  const go = useCallback(
    (dir) => {
      setToolbar(null);
      setPage((p) => Math.min(Math.max(0, p + dir), pageCount - 1));
    },
    [pageCount],
  );
  const goTo = useCallback(
    (p) => {
      setToolbar(null);
      setPage(Math.min(Math.max(0, p), pageCount - 1));
    },
    [pageCount],
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Escape") {
        if (isFs && document.fullscreenElement) document.exitFullscreen?.();
        else onClose?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose, isFs]);

  // ---- fullscreen --------------------------------------------------------
  const toggleFs = useCallback(async () => {
    const el = rootRef.current;
    try {
      if (!document.fullscreenElement) await el?.requestFullscreen?.();
      else await document.exitFullscreen?.();
    } catch {
      // Fullscreen API unavailable (e.g. iOS Safari) — the overlay already
      // covers the whole viewport, so this is a no-op fallback.
      setIsFs((v) => !v);
    }
  }, []);

  useEffect(() => {
    const onFs = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // ---- selection / highlight toolbar ------------------------------------
  const showSelectionToolbar = useCallback(() => {
    const sel = window.getSelection();
    const ct = contentRef.current;
    const area = areaRef.current;
    if (!sel || sel.isCollapsed || sel.rangeCount === 0 || !ct || !area) {
      return false;
    }
    const range = sel.getRangeAt(0);
    if (!ct.contains(range.commonAncestorContainer)) return false;
    const rect = range.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) return false;
    const ar = area.getBoundingClientRect();
    const below = rect.top - ar.top < 64;
    setToolbar({
      mode: "create",
      x: Math.min(Math.max(60, rect.left + rect.width / 2 - ar.left), ar.width - 60),
      y: below ? rect.bottom - ar.top + 10 : rect.top - ar.top - 10,
      below,
    });
    return true;
  }, []);

  const onContentPointerUp = useCallback(
    (e) => {
      const markEl = e.target?.closest?.("mark.reader-hl");
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        showSelectionToolbar();
        return;
      }
      if (markEl && areaRef.current) {
        const rect = markEl.getBoundingClientRect();
        const ar = areaRef.current.getBoundingClientRect();
        const below = rect.top - ar.top < 64;
        setToolbar({
          mode: "remove",
          id: markEl.dataset.hlId,
          x: Math.min(Math.max(60, rect.left + rect.width / 2 - ar.left), ar.width - 60),
          y: below ? rect.bottom - ar.top + 10 : rect.top - ar.top - 10,
          below,
        });
        return;
      }
      setToolbar(null);
    },
    [showSelectionToolbar],
  );

  const createHighlight = useCallback(
    (color) => {
      const sel = window.getSelection();
      const ct = contentRef.current;
      if (!sel || sel.isCollapsed || !ct) return;
      const anchor = serializeSelection(ct, sel.getRangeAt(0));
      if (!anchor) return;
      add({ id: newId(), ...anchor, color, createdAt: Date.now() });
      sel.removeAllRanges();
      setToolbar(null);
    },
    [add],
  );

  const deleteHighlight = useCallback(
    (id) => {
      remove(id);
      setToolbar(null);
    },
    [remove],
  );

  // Tap left / right thirds to turn the page (ignored while selecting).
  const onViewportClick = useCallback(
    (e) => {
      if (e.target?.closest?.("mark.reader-hl")) return;
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) return;
      if (toolbar) {
        setToolbar(null);
        return;
      }
      const vp = viewportRef.current;
      if (!vp) return;
      const r = vp.getBoundingClientRect();
      const x = e.clientX - r.left;
      if (x < r.width * 0.33) go(-1);
      else if (x > r.width * 0.66) go(1);
    },
    [go, toolbar],
  );

  // Swipe to turn on touch devices.
  const touch = useRef(null);
  const onTouchStart = useCallback((e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  }, []);
  const onTouchEnd = useCallback(
    (e) => {
      const start = touch.current;
      touch.current = null;
      if (!start) return;
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        go(dx < 0 ? 1 : -1);
      }
    },
    [go],
  );

  const goToHighlight = useCallback(
    (id) => {
      const ct = contentRef.current;
      const mark = findMark(ct, id);
      if (!mark || !ct || !colW) return;
      const left = mark.offsetLeft;
      goTo(Math.round(left / (colW + GAP)));
      setPanelOpen(false);
    },
    [colW, goTo],
  );

  const progress = pageCount > 1 ? Math.round((page / (pageCount - 1)) * 100) : 100;
  const step = colW + GAP;

  const body = (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[70] flex flex-col"
      style={{ backgroundColor: "rgb(var(--bg-elev))" }}
      role="dialog"
      aria-modal="true"
      aria-label={`Reader: ${title}`}
    >
      {/* Top bar */}
      <header
        className="flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-4"
        style={{ borderColor: "rgb(var(--border))" }}
      >
        <button
          onClick={onClose}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-colors hover:surface-sunken"
          style={{ borderColor: "rgb(var(--border-strong))" }}
          aria-label="Close reader"
          title="Close reader (Esc)"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 items-center gap-2">
          <BookOpen className="hidden h-4 w-4 shrink-0 sm:block" style={{ color: accent }} />
          <div className="min-w-0">
            <div className="truncate text-sm font-bold leading-tight">{title}</div>
            {subtitle && (
              <div className="truncate text-[11px] leading-tight text-faint">{subtitle}</div>
            )}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Text size */}
          <div
            className="flex items-center rounded-xl border"
            style={{ borderColor: "rgb(var(--border-strong))" }}
          >
            <button
              onClick={() => setSizeIdx((i) => Math.max(0, i - 1))}
              disabled={sizeIdx === 0}
              className="grid h-9 w-9 place-items-center rounded-l-xl transition-colors hover:surface-sunken disabled:opacity-40"
              aria-label="Decrease text size"
              title="Smaller text"
            >
              <Minus className="h-4 w-4" />
            </button>
            <Type className="h-4 w-4 text-muted" />
            <button
              onClick={() => setSizeIdx((i) => Math.min(SIZES.length - 1, i + 1))}
              disabled={sizeIdx === SIZES.length - 1}
              className="grid h-9 w-9 place-items-center rounded-r-xl transition-colors hover:surface-sunken disabled:opacity-40"
              aria-label="Increase text size"
              title="Larger text"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Highlights panel */}
          <button
            onClick={() => setPanelOpen((v) => !v)}
            className="relative grid h-9 w-9 place-items-center rounded-xl border transition-colors hover:surface-sunken"
            style={
              panelOpen
                ? { borderColor: accent, color: accent, backgroundColor: `${accent}14` }
                : { borderColor: "rgb(var(--border-strong))" }
            }
            aria-label="Saved highlights"
            title="Saved highlights"
          >
            <Highlighter className="h-[18px] w-[18px]" />
            {highlights.length > 0 && (
              <span
                className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold text-white"
                style={{ backgroundColor: accent }}
              >
                {highlights.length}
              </span>
            )}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFs}
            className="hidden h-9 w-9 place-items-center rounded-xl border transition-colors hover:surface-sunken sm:grid"
            style={{ borderColor: "rgb(var(--border-strong))" }}
            aria-label="Toggle fullscreen"
            title="Fullscreen"
          >
            {isFs ? <Minimize2 className="h-[18px] w-[18px]" /> : <Maximize2 className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </header>

      {/* Reading area */}
      <div ref={areaRef} className="relative flex-1 overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-[760px] flex-col px-5 sm:px-10 lg:px-12">
          <div
            ref={viewportRef}
            className="relative flex-1 select-text overflow-hidden py-6 sm:py-8"
            onClick={onViewportClick}
            onMouseUp={onContentPointerUp}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div
              ref={contentRef}
              className="reader-content h-full"
              style={{
                columnWidth: colW ? `${colW}px` : undefined,
                columnGap: `${GAP}px`,
                columnFill: "auto",
                transform: `translateX(-${page * step}px)`,
                transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
                "--reader-scale": scale,
              }}
            >
              {children}
            </div>
          </div>
        </div>

        {/* Selection / highlight toolbar */}
        <AnimatePresence>
          {toolbar && (
            <motion.div
              initial={{ opacity: 0, y: toolbar.below ? -6 : 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.14 }}
              className="glass absolute z-20 flex items-center gap-1.5 rounded-xl p-1.5 shadow-lg"
              style={{
                left: toolbar.x,
                top: toolbar.y,
                transform: `translate(-50%, ${toolbar.below ? "0" : "-100%"})`,
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
            >
              {toolbar.mode === "create" ? (
                <>
                  <span className="pl-1 pr-0.5 text-[11px] font-medium text-muted">Save</span>
                  {COLORS.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => createHighlight(c.value)}
                      className="grid h-7 w-7 place-items-center rounded-lg transition-transform hover:scale-110"
                      style={{ backgroundColor: c.value }}
                      aria-label={`Highlight ${c.key}`}
                      title={`Highlight (${c.key})`}
                    >
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.dot }} />
                    </button>
                  ))}
                </>
              ) : (
                <button
                  onClick={() => deleteHighlight(toolbar.id)}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove highlight
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Saved-highlights panel */}
        <AnimatePresence>
          {panelOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 bg-black/30"
                onClick={() => setPanelOpen(false)}
              />
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
                className="absolute right-0 top-0 z-40 flex h-full w-full max-w-sm flex-col border-l"
                style={{ backgroundColor: "rgb(var(--bg-elev))", borderColor: "rgb(var(--border))" }}
              >
                <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "rgb(var(--border))" }}>
                  <div className="flex items-center gap-2 font-semibold">
                    <Highlighter className="h-4 w-4" style={{ color: accent }} /> Saved highlights
                  </div>
                  <div className="flex items-center gap-1">
                    {highlights.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm("Remove all highlights on this lesson?")) clearAll();
                        }}
                        className="rounded-lg px-2 py-1 text-xs text-faint transition-colors hover:text-red-400"
                      >
                        Clear all
                      </button>
                    )}
                    <button
                      onClick={() => setPanelOpen(false)}
                      className="grid h-8 w-8 place-items-center rounded-lg transition-colors hover:surface-sunken"
                      aria-label="Close panel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-3">
                  {highlights.length === 0 ? (
                    <div className="mt-12 px-6 text-center text-sm text-muted">
                      <Highlighter className="mx-auto mb-3 h-8 w-8 text-faint" />
                      Select any text while reading, then pick a colour to save a highlight here.
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {highlights.map((h) => (
                        <li key={h.id}>
                          <div
                            className="group rounded-xl border p-3 transition-colors hover:surface-sunken"
                            style={{ borderColor: "rgb(var(--border))" }}
                          >
                            <div className="flex items-start gap-2">
                              <span
                                className="mt-1 h-3 w-3 shrink-0 rounded-full"
                                style={{ backgroundColor: h.color }}
                              />
                              <button
                                onClick={() => goToHighlight(h.id)}
                                className="flex-1 text-left text-sm leading-relaxed"
                              >
                                <span className="line-clamp-4">{h.quote}</span>
                              </button>
                              <button
                                onClick={() => deleteHighlight(h.id)}
                                className="shrink-0 rounded-md p-1 text-faint opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                                aria-label="Delete highlight"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <footer
        className="flex h-14 shrink-0 items-center gap-3 border-t px-3 sm:px-6"
        style={{ borderColor: "rgb(var(--border))" }}
      >
        <button
          onClick={() => go(-1)}
          disabled={page === 0}
          className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors hover:surface-sunken disabled:opacity-40"
          style={{ borderColor: "rgb(var(--border-strong))" }}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: "rgb(var(--border))" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: accent }}
            />
          </div>
          <span className="shrink-0 font-mono text-xs text-muted">
            {page + 1} / {pageCount}
          </span>
        </div>

        <button
          onClick={() => go(1)}
          disabled={page >= pageCount - 1}
          className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors hover:surface-sunken disabled:opacity-40"
          style={{ borderColor: "rgb(var(--border-strong))" }}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </footer>
    </div>
  );

  return createPortal(body, document.body);
}
