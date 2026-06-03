/**
 * highlighter.js — a small, dependency-free text highlighting engine for the
 * Reader. It anchors a highlight by its text ("quote") plus a little surrounding
 * context (prefix/suffix), the same technique used by robust web annotators.
 * This survives React re-renders and pagination relayout because we re-find the
 * text in the DOM and wrap it in <mark> elements at apply-time, rather than
 * relying on fragile node paths.
 */

const HL_SELECTOR = "mark.reader-hl";
const CONTEXT = 40;

/** Global character offset of a (container, offset) boundary within `root`. */
function globalOffset(root, container, offset) {
  try {
    const r = document.createRange();
    r.setStart(root, 0);
    r.setEnd(container, offset);
    return r.toString().length;
  } catch {
    return null;
  }
}

/** Build a DOM Range spanning [start, end) global character offsets in `root`. */
function rangeFromOffsets(root, start, end) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const range = document.createRange();
  let pos = 0;
  let started = false;
  let node;
  while ((node = walker.nextNode())) {
    const len = node.nodeValue.length;
    if (!started && start <= pos + len) {
      range.setStart(node, Math.max(0, start - pos));
      started = true;
    }
    if (started && end <= pos + len) {
      range.setEnd(node, Math.max(0, end - pos));
      return range;
    }
    pos += len;
  }
  if (started) {
    // End fell past the last text node — clamp to the end.
    range.setEnd(node || root, node ? node.nodeValue.length : 0);
    return range;
  }
  return null;
}

/**
 * Turn the current user selection into a serializable anchor.
 * Returns null if the selection is empty / collapsed.
 */
export function serializeSelection(root, range) {
  if (!root || !range || range.collapsed) return null;
  const full = root.textContent || "";
  const start = globalOffset(root, range.startContainer, range.startOffset);
  const end = globalOffset(root, range.endContainer, range.endOffset);
  if (start == null || end == null || end <= start) return null;
  const quote = full.slice(start, end).trim();
  if (!quote) return null;
  // Recompute start/end against the trimmed quote so prefix/suffix line up.
  const trimStart = start + full.slice(start, end).indexOf(quote);
  const trimEnd = trimStart + quote.length;
  return {
    quote,
    prefix: full.slice(Math.max(0, trimStart - CONTEXT), trimStart),
    suffix: full.slice(trimEnd, trimEnd + CONTEXT),
  };
}

/** Locate the [start, end) offsets of a stored anchor inside `root`. */
function locate(root, hl) {
  const full = root.textContent || "";
  if (!hl?.quote) return null;

  // Best match: prefix + quote + suffix in one shot.
  if (hl.prefix || hl.suffix) {
    const needle = (hl.prefix || "") + hl.quote + (hl.suffix || "");
    const at = full.indexOf(needle);
    if (at !== -1) {
      const start = at + (hl.prefix ? hl.prefix.length : 0);
      return { start, end: start + hl.quote.length };
    }
  }
  // Fallback: first occurrence of the quote.
  const at = full.indexOf(hl.quote);
  if (at !== -1) return { start: at, end: at + hl.quote.length };
  return null;
}

/** Wrap every text node intersecting `range` in a <mark>. */
function wrapRange(root, range, meta) {
  const nodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walker.nextNode())) {
    if (range.intersectsNode(node)) nodes.push(node);
  }
  let wrapped = false;
  nodes.forEach((textNode) => {
    let from = 0;
    let to = textNode.nodeValue.length;
    if (textNode === range.startContainer) from = range.startOffset;
    if (textNode === range.endContainer) to = range.endOffset;
    if (from >= to) return;
    // Don't highlight pure whitespace fragments.
    if (!textNode.nodeValue.slice(from, to).trim()) return;
    const r = document.createRange();
    r.setStart(textNode, from);
    r.setEnd(textNode, to);
    const mark = document.createElement("mark");
    mark.className = "reader-hl";
    mark.dataset.hlId = meta.id;
    if (meta.color) mark.style.setProperty("--hl", meta.color);
    try {
      r.surroundContents(mark);
      wrapped = true;
    } catch {
      /* range straddled element boundaries — skip this fragment */
    }
  });
  return wrapped;
}

/** Remove existing highlight marks (used before a fresh re-apply). */
export function clearMarks(root) {
  if (!root) return;
  root.querySelectorAll(HL_SELECTOR).forEach((m) => {
    const parent = m.parentNode;
    if (!parent) return;
    while (m.firstChild) parent.insertBefore(m.firstChild, m);
    parent.removeChild(m);
    parent.normalize();
  });
}

/** Re-apply a list of stored highlights onto the DOM. */
export function applyHighlights(root, highlights = []) {
  if (!root) return;
  // textContent is invariant under wrapping, so sequential application is safe.
  highlights.forEach((hl) => {
    const loc = locate(root, hl);
    if (!loc) return;
    const range = rangeFromOffsets(root, loc.start, loc.end);
    if (range) wrapRange(root, range, hl);
  });
}

/** Find the first mark element for a highlight id. */
export function findMark(root, id) {
  if (!root) return null;
  return root.querySelector(`${HL_SELECTOR}[data-hl-id="${id}"]`);
}
