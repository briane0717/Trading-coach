// Deterministic pseudo-random helpers for the simulated adapter. Keeping generation
// deterministic (seeded by symbol + time bucket) makes simulated data reproducible and
// testable instead of pure noise on every call.

/** djb2 string hash, folded into a 32-bit unsigned int for use as a PRNG seed. */
export function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return hash >>> 0;
}

/** mulberry32: small, fast, good-enough-for-simulation PRNG. Returns a function producing [0, 1). */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard-normal sample via Box-Muller, drawn from a seeded uniform PRNG. */
export function gaussian(rand: () => number): number {
  const u1 = Math.max(rand(), Number.EPSILON);
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
