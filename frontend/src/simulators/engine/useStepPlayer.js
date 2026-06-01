import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Drives step-by-step playback over a precomputed array of frames.
// Frames are produced by an algorithm's step generator.
export function useStepPlayer(frames, { initialSpeed = 1 } = {}) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed); // multiplier: 0.5, 1, 2, 4
  const timer = useRef(null);

  const count = frames?.length ?? 0;
  const atEnd = index >= count - 1;
  const atStart = index <= 0;

  // Clamp index when frames change (e.g. new input).
  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, count - 1)));
  }, [count]);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => {
    if (!isPlaying) {
      clearTimer();
      return;
    }
    if (atEnd) {
      setIsPlaying(false);
      return;
    }
    const base = 950; // ms at 1x
    timer.current = setTimeout(() => {
      setIndex((i) => Math.min(i + 1, count - 1));
    }, base / speed);
    return clearTimer;
  }, [isPlaying, index, speed, atEnd, count]);

  const play = useCallback(() => {
    if (atEnd) setIndex(0);
    setIsPlaying(true);
  }, [atEnd]);
  const pause = useCallback(() => setIsPlaying(false), []);
  const toggle = useCallback(() => (isPlaying ? pause() : play()), [isPlaying, play, pause]);
  const next = useCallback(() => {
    setIsPlaying(false);
    setIndex((i) => Math.min(i + 1, count - 1));
  }, [count]);
  const prev = useCallback(() => {
    setIsPlaying(false);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);
  const reset = useCallback(() => {
    setIsPlaying(false);
    setIndex(0);
  }, []);
  const seek = useCallback(
    (i) => {
      setIsPlaying(false);
      setIndex(Math.max(0, Math.min(i, count - 1)));
    },
    [count],
  );

  const frame = useMemo(() => frames?.[index] ?? null, [frames, index]);
  const prevFrame = useMemo(() => (index > 0 ? frames?.[index - 1] : null), [frames, index]);

  return {
    index,
    count,
    frame,
    prevFrame,
    isPlaying,
    speed,
    atEnd,
    atStart,
    setSpeed,
    play,
    pause,
    toggle,
    next,
    prev,
    reset,
    seek,
  };
}
