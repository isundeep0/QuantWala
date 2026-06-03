import { useCallback, useEffect, useState } from "react";

const keyFor = (storageKey) => `qw:highlights:${storageKey}`;

/**
 * useHighlights — load/save reader highlights for a given content key in
 * localStorage. Each highlight is { id, quote, prefix, suffix, color, createdAt }.
 */
export function useHighlights(storageKey) {
  const [highlights, setHighlights] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    let next = [];
    try {
      const raw = localStorage.getItem(keyFor(storageKey));
      if (raw) next = JSON.parse(raw);
    } catch {
      next = [];
    }
    setHighlights(Array.isArray(next) ? next : []);
    setLoaded(true);
  }, [storageKey]);

  const save = useCallback(
    (next) => {
      try {
        localStorage.setItem(keyFor(storageKey), JSON.stringify(next));
      } catch {
        /* storage full / unavailable — keep in-memory */
      }
    },
    [storageKey],
  );

  const add = useCallback(
    (hl) => {
      setHighlights((prev) => {
        const next = [...prev, hl];
        save(next);
        return next;
      });
    },
    [save],
  );

  const remove = useCallback(
    (id) => {
      setHighlights((prev) => {
        const next = prev.filter((h) => h.id !== id);
        save(next);
        return next;
      });
    },
    [save],
  );

  const clearAll = useCallback(() => {
    setHighlights([]);
    save([]);
  }, [save]);

  return { highlights, loaded, add, remove, clearAll };
}
