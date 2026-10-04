/**
 * Number Source System & Pacing Service
 * Supports Manual 25-Number Input, AI Number Generation,
 * Unbiased Fisher-Yates Independent Sequences per Player, and Fair Presentation Pacing.
 */

export interface PlayerNumberSet {
  playerId: string;
  numbers: number[];
  source: 'manual' | 'ai';
  seed?: string;
}

export interface NumberValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a 25-number set:
 * - Exactly 25 numbers
 * - Numbers must be integers between 1 and 25 (or range limit)
 * - No duplicate values
 */
export function validate25NumberSet(
  numbers: number[],
  min: number = 1,
  max: number = 25
): NumberValidationResult {
  const errors: string[] = [];

  if (!numbers || !Array.isArray(numbers)) {
    return { valid: false, errors: ['Invalid number list provided.'] };
  }

  if (numbers.length !== 25) {
    errors.push(`Must contain exactly 25 numbers (currently ${numbers.length}).`);
  }

  const seen = new Set<number>();
  const duplicates = new Set<number>();

  for (const n of numbers) {
    if (typeof n !== 'number' || isNaN(n) || !Number.isInteger(n)) {
      errors.push(`Invalid non-integer value: ${n}`);
      continue;
    }
    if (n < min || n > max) {
      errors.push(`Number ${n} is outside valid range (${min}–${max}).`);
    }
    if (seen.has(n)) {
      duplicates.add(n);
    }
    seen.add(n);
  }

  if (duplicates.size > 0) {
    errors.push(`Duplicate numbers found: ${Array.from(duplicates).join(', ')}.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Deterministic pseudo-random generator from seed string.
 */
export function createSeedRNG(seedStr: string): () => number {
  let hash = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    hash = Math.imul(hash ^ seedStr.charCodeAt(i), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return function () {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    return ((hash ^= hash >>> 16) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates unbiased in-place shuffle that never mutates the original source array.
 */
export function createPlayerSequence(
  numbers: number[],
  seed?: string
): number[] {
  const copy = [...numbers];
  const rng = seed ? createSeedRNG(seed) : Math.random;

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }

  return copy;
}

/**
 * Generate 25 unique numbers (1 to 25) for AI or default board.
 */
export function generate25Numbers(seed?: string): number[] {
  const pool: number[] = [];
  for (let i = 1; i <= 25; i++) {
    pool.push(i);
  }
  return createPlayerSequence(pool, seed);
}

/**
 * Controlled presentation pacing service:
 * Pacing affects client animation & reveal timing, NOT authoritative game outcomes.
 */
export function getNextPresentationDelay(
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  baseMs: number = 2400,
  minMs: number = 1800,
  maxMs: number = 3200
): number {
  const variation = Math.floor(Math.random() * (maxMs - minMs + 1));
  const delay = minMs + variation;
  return Math.min(Math.max(delay, minMs), maxMs);
}
