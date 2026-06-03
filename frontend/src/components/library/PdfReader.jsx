import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Loader2, FileWarning } from "lucide-react";
import { PDF_OPTIONS } from "@/lib/pdfSetup.js";

// Must be configured in this module (where <Document>/<Page> render) so the
// react-pdf default doesn't clobber it. Single-line URL avoids a Vite 7.1+
// bundling regression. Vite rewrites this to a hashed asset honouring `base`.
pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

/**
 * A single page slot. Renders nothing but a correctly-sized skeleton until it
 * scrolls near the viewport, then mounts the real <Page> and keeps it mounted
 * so scrolling back is instant. This lets us open 800-page textbooks without
 * rasterising everything up front.
 */
function PageSlot({ pageNumber, width, ratio, shown, registerEl, onPageRatio }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    registerEl(pageNumber, el);
    return () => registerEl(pageNumber, null);
  }, [pageNumber, registerEl]);

  const estHeight = Math.round(width * ratio);

  return (
    <div
      ref={ref}
      data-page={pageNumber}
      className="mx-auto w-full"
      style={{ maxWidth: width }}
    >
      {shown ? (
        <div className="paper-page">
          <Page
            pageNumber={pageNumber}
            width={width}
            renderAnnotationLayer
            renderTextLayer
            onLoadSuccess={(page) => {
              if (page?.originalWidth && page?.originalHeight) {
                onPageRatio(page.originalHeight / page.originalWidth);
              }
            }}
            loading={
              <div className="page-skeleton" style={{ height: estHeight }} />
            }
          />
        </div>
      ) : (
        <div className="page-skeleton" style={{ height: estHeight }} />
      )}
      <div className="mt-2 mb-6 text-center font-mono text-xs text-faint">
        {pageNumber}
      </div>
    </div>
  );
}

const PdfReader = forwardRef(function PdfReader(
  { fileUrl, pageWidth = 760, onNumPages, onVisiblePage },
  ref,
) {
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState(null);
  const [shown, setShown] = useState(() => new Set([1, 2]));
  const [ratio, setRatio] = useState(1.4142); // A4 portrait until we learn better

  const elsRef = useRef(new Map()); // pageNumber -> DOM node
  const ratiosRef = useRef(new Map()); // pageNumber -> visible ratio
  const ioRef = useRef(null);
  const rafRef = useRef(0);

  const registerEl = useCallback((n, el) => {
    const map = elsRef.current;
    const io = ioRef.current;
    const prev = map.get(n);
    if (prev && io) io.unobserve(prev);
    if (el) {
      map.set(n, el);
      if (io) io.observe(el);
    } else {
      map.delete(n);
    }
  }, []);

  const onPageRatio = useCallback((r) => {
    if (r && Number.isFinite(r)) setRatio(r);
  }, []);

  // Single observer: lazily reveal pages + compute the most-visible page.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        let changed = false;
        const reveal = new Set();
        for (const entry of entries) {
          const n = Number(entry.target.getAttribute("data-page"));
          ratiosRef.current.set(n, entry.intersectionRatio);
          if (entry.isIntersecting) {
            reveal.add(n);
            reveal.add(n + 1); // pre-warm the next page
            changed = true;
          }
        }
        if (changed) {
          setShown((prev) => {
            const next = new Set(prev);
            reveal.forEach((n) => next.add(n));
            return next.size === prev.size ? prev : next;
          });
        }
        // Report the dominant page (rAF-throttled).
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          let best = 0;
          let bestRatio = 0;
          ratiosRef.current.forEach((rr, n) => {
            if (rr > bestRatio) {
              bestRatio = rr;
              best = n;
            }
          });
          if (best && onVisiblePage) onVisiblePage(best);
        });
      },
      { rootMargin: "400px 0px 600px 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    ioRef.current = io;
    // Observe whatever is already mounted.
    elsRef.current.forEach((el) => el && io.observe(el));
    return () => {
      io.disconnect();
      ioRef.current = null;
      cancelAnimationFrame(rafRef.current);
    };
  }, [onVisiblePage]);

  useImperativeHandle(
    ref,
    () => ({
      scrollToPage(n) {
        const target = Math.min(Math.max(1, n), numPages || n);
        setShown((prev) => {
          const next = new Set(prev);
          next.add(target);
          next.add(target + 1);
          return next;
        });
        // Wait a tick for the slot to exist, then scroll with sticky-bar offset.
        requestAnimationFrame(() => {
          const el = elsRef.current.get(target);
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 150;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        });
      },
    }),
    [numPages],
  );

  const docFile = useMemo(() => ({ url: fileUrl }), [fileUrl]);

  if (error) {
    return (
      <div className="mx-auto mt-10 max-w-md text-center">
        <div className="glass mx-auto grid h-14 w-14 place-items-center rounded-2xl">
          <FileWarning className="h-6 w-6 text-amber-400" />
        </div>
        <p className="mt-4 font-semibold lit-text">Couldn’t open this PDF</p>
        <p className="mt-1 text-sm text-muted">{error}</p>
      </div>
    );
  }

  return (
    <Document
      file={docFile}
      options={PDF_OPTIONS}
      onLoadSuccess={({ numPages: n }) => {
        setNumPages(n);
        onNumPages?.(n);
      }}
      onLoadError={(e) => setError(e?.message || "Failed to load document.")}
      loading={
        <div className="mt-16 flex flex-col items-center gap-3 text-muted">
          <Loader2 className="h-7 w-7 animate-spin" />
          <span className="text-sm">Rendering pages…</span>
        </div>
      }
      error={
        <div className="mt-16 text-center text-sm text-muted">
          Failed to load the document.
        </div>
      }
      className="flex flex-col items-center gap-0"
    >
      {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
        <PageSlot
          key={n}
          pageNumber={n}
          width={pageWidth}
          ratio={ratio}
          shown={shown.has(n)}
          registerEl={registerEl}
          onPageRatio={onPageRatio}
        />
      ))}
    </Document>
  );
});

export default PdfReader;
