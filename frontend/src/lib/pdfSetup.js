/**
 * Side-effect-free pdf.js options shared by the reader.
 *
 * NOTE: `GlobalWorkerOptions.workerSrc` is intentionally NOT set here. Per the
 * react-pdf docs it must be configured in the same module that renders the
 * <Document>/<Page> components (see PdfReader.jsx) to avoid the default worker
 * overwriting our setting due to module execution order.
 */
import { pdfjs } from "react-pdf";

// Character maps + standard fonts let pdf.js render non-Latin scripts and
// documents that don't embed their fonts. Served from the CDN matching the
// pinned pdfjs-dist version so we don't have to copy them into the build.
export const PDF_OPTIONS = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
};
