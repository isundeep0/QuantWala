// Parse a comma/space separated list of integers from user input, safely.
export function parseIntArray(str, { max = 24, clampMin = -99, clampMax = 999 } = {}) {
  if (typeof str !== "string") return [];
  const nums = str
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => parseInt(s, 10))
    .filter((n) => Number.isFinite(n))
    .map((n) => Math.max(clampMin, Math.min(clampMax, n)))
    .slice(0, max);
  return nums;
}

export function randomArray(n = 10, { min = 1, max = 99 } = {}) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}
