/**
 * Core 5x5 Number Game Engine
 * Strictly 5x5 board (25 cells) with numbers 1 to 25.
 * Unbiased Fisher-Yates shuffle, deterministic seeded PRNG,
 * and comprehensive winning pattern evaluation.
 */

import {
  Board5x5,
  GridCell5x5,
  WinningPattern,
  WinEvaluationResult,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  DrawnNumber,
} from '../types';

/**
 * High-quality linear congruential generator (LCG) for deterministic seeds.
 */
export function createRNG(seedStr: string): () => number {
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
 * Fisher-Yates unbiased in-place array shuffle.
 */
export function shuffleArray<T>(array: T[], rng: () => number = Math.random): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate full pool of numbers 1 to 25 in unbiased randomized order.
 */
export function generate5x5NumberPool(rng: () => number = Math.random): number[] {
  const pool: number[] = [];
  for (let n = 1; n <= 25; n++) {
    pool.push(n);
  }
  return shuffleArray(pool, rng);
}

/**
 * Generate a complete, unique 5x5 Board (numbers 1-25) for a player.
 */
export function generate5x5Board(
  boardId: string,
  seed: string,
  includeFreeCenter: boolean = false,
  customNumbers?: number[]
): Board5x5 {
  const rng = createRNG(`${seed}-${boardId}`);
  const numbers = customNumbers && customNumbers.length === 25 ? customNumbers : generate5x5NumberPool(rng);
  const matrix: GridCell5x5[][] = [];

  let numIdx = 0;
  for (let r = 0; r < 5; r++) {
    const row: GridCell5x5[] = [];
    for (let c = 0; c < 5; c++) {
      const isCenter = includeFreeCenter && r === 2 && c === 2;
      const val = isCenter ? 0 : numbers[numIdx++];
      row.push({
        id: `${boardId}-r${r}-c${c}`,
        row: r,
        col: c,
        value: val,
        isFreeSpace: isCenter,
        state: isCenter ? 'MARKED' : 'DEFAULT',
        daubTimestamp: isCenter ? Date.now() : undefined,
      });
    }
    matrix.push(row);
  }

  return {
    id: boardId,
    seed,
    matrix,
    completedLineIds: [],
  };
}

/**
 * Pre-defined 13 winning patterns for the 5x5 grid:
 * - 5 Rows
 * - 5 Columns
 * - 1 Main Diagonal
 * - 1 Anti Diagonal
 * - 1 Four Corners
 */
export const WINNING_PATTERNS_5X5: WinningPattern[] = [
  // 5 Rows
  ...Array.from({ length: 5 }, (_, r) => ({
    id: `ROW_${r}`,
    name: `Row ${r + 1}`,
    type: 'ROW' as const,
    coords: Array.from({ length: 5 }, (_, c) => ({ row: r, col: c })),
  })),
  // 5 Columns
  ...Array.from({ length: 5 }, (_, c) => ({
    id: `COL_${c}`,
    name: `Column ${c + 1}`,
    type: 'COLUMN' as const,
    coords: Array.from({ length: 5 }, (_, r) => ({ row: r, col: c })),
  })),
  // Main Diagonal
  {
    id: 'DIAG_MAIN',
    name: 'Main Diagonal',
    type: 'MAIN_DIAGONAL',
    coords: Array.from({ length: 5 }, (_, i) => ({ row: i, col: i })),
  },
  // Anti Diagonal
  {
    id: 'DIAG_ANTI',
    name: 'Anti Diagonal',
    type: 'ANTI_DIAGONAL',
    coords: Array.from({ length: 5 }, (_, i) => ({ row: i, col: 4 - i })),
  },
  // Four Corners
  {
    id: 'FOUR_CORNERS',
    name: 'Four Corners',
    type: 'FOUR_CORNERS',
    coords: [
      { row: 0, col: 0 },
      { row: 0, col: 4 },
      { row: 4, col: 0 },
      { row: 4, col: 4 },
    ],
  },
];

/**
 * Evaluates board against marked cells, detecting newly completed lines.
 */
export function evaluate5x5Wins(
  board: Board5x5,
  previouslyCompletedPatternIds: string[] = []
): WinEvaluationResult {
  const previouslyCompletedSet = new Set(previouslyCompletedPatternIds);
  const allCompleted: WinningPattern[] = [];
  const newlyCompleted: WinningPattern[] = [];
  const winningCoordKeys = new Set<string>();

  for (const pattern of WINNING_PATTERNS_5X5) {
    const isComplete = pattern.coords.every(({ row, col }) => {
      const cell = board.matrix[row]?.[col];
      return cell && (cell.state === 'MARKED' || cell.state === 'COMPLETED' || cell.isFreeSpace);
    });

    if (isComplete) {
      allCompleted.push(pattern);
      pattern.coords.forEach(({ row, col }) => {
        winningCoordKeys.add(`${row},${col}`);
      });

      if (!previouslyCompletedSet.has(pattern.id)) {
        newlyCompleted.push(pattern);
      }
    }
  }

  const winningCoords = Array.from(winningCoordKeys).map((k) => {
    const [row, col] = k.split(',').map(Number);
    return { row, col };
  });

  return {
    hasWon: allCompleted.length > 0,
    newlyCompletedPatterns: newlyCompleted,
    allCompletedPatterns: allCompleted,
    winningCoords,
  };
}
