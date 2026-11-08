/**
 * Return the hint tier for a valid elapsed time.
 * @param {number} elapsedMs
 * @returns {0|1|2|3}
 */
export function getHintLevel(elapsedMs) {
  if (typeof elapsedMs !== 'number' || !Number.isFinite(elapsedMs)) {
    throw new TypeError('elapsedMs must be a finite number');
  }
  if (elapsedMs < 0) {
    throw new RangeError('elapsedMs must not be negative');
  }
  if (elapsedMs < 20000) return 0;
  if (elapsedMs < 45000) return 1;
  if (elapsedMs < 75000) return 2;
  return 3;
}
