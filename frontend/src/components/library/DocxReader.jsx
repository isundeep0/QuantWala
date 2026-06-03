import { useEffect, useState } from "react";
import mammoth from "mammoth/mammoth.browser";
import { Loader2, FileWarning } from "lucide-react";

/**
 * Renders a .docx by converting it to clean HTML (images become inline data
 * URIs) and dropping it into a themed reading column. Because we own the HTML,
 * Night mode here is a true dark theme rather than a colour inversion.
 */
export default function DocxReader({ fileUrl, pageWidth = 820, zoom = 1 }) {
  const [html, setHtml] = useState("");
  const [state, setState] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    setError(null);

    (async () => {
      try {
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const arrayBuffer = await res.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        if (cancelled) return;
        setHtml(result.value || "<p><em>This document appears to be empty.</em></p>");
        setState("ready");
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || "Could not convert this document.");
        setState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  if (state === "loading") {
    return (
      <div className="mt-16 flex flex-col items-center gap-3 text-muted">
        <Loader2 className="h-7 w-7 animate-spin" />
        <span className="text-sm">Converting document…</span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="mx-auto mt-10 max-w-md text-center">
        <div className="glass mx-auto grid h-14 w-14 place-items-center rounded-2xl">
          <FileWarning className="h-6 w-6 text-amber-400" />
        </div>
        <p className="mt-4 font-semibold lit-text">Couldn’t open this document</p>
        <p className="mt-1 text-sm text-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full" style={{ maxWidth: pageWidth }}>
      <article className="docx-page">
        <div
          className="docx-content"
          style={{ fontSize: `${(1.075 * zoom).toFixed(3)}rem` }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </div>
  );
}
