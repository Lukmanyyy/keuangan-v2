// Ref-backed counter: rapid/batched clicks must not depend on a React render.
export function createTapCounter(requiredTaps = 10, maxGapMs = 5000) {
  let count = 0;
  let lastTap: number | null = null;
  return (timestamp = Date.now()) => {
    if (lastTap !== null && timestamp - lastTap > maxGapMs) count = 0;
    lastTap = timestamp;
    count += 1;
    if (count < requiredTaps) return false;
    count = 0;
    lastTap = null;
    return true;
  };
}
