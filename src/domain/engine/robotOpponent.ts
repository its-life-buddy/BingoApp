/**
 * Autonomous Robot / AI Opponent Engine
 * Simulates a realistic opponent in Me vs Robot mode with distinct difficulties:
 * - EASY: Slower reaction (4-5s delay), 80% mark accuracy.
 * - MEDIUM: Realistic reaction (1.5-2.5s delay), 95% mark accuracy.
 * - HARD: Competitive reaction (0.5-1.0s delay), 100% mark accuracy, priority on line completion.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Board5x5, RobotDifficulty, WinEvaluationResult } from '../types';
import { generate5x5Board, evaluate5x5Wins } from './gridGameEngine';

export class RobotOpponent {
  public board: Board5x5;
  public difficulty: RobotDifficulty;
  public score: number = 0;
  public linesCompleted: number = 0;
  public completedPatternIds: string[] = [];

  constructor(difficulty: RobotDifficulty = 'MEDIUM', seed: string = `robot-${Date.now()}`) {
    this.difficulty = difficulty;
    this.board = generate5x5Board('robot-board', seed, false);
  }

  /**
   * Process a newly called number with simulated human-like latency & accuracy.
   */
  public onNumberCalled(
    calledNumber: number,
    onRobotMarked?: (row: number, col: number, robotLines: number) => void
  ): Promise<{ marked: boolean; linesCompleted: number }> {
    return new Promise((resolve) => {
      // Find matching cell on robot board
      let matchCoords: { row: number; col: number } | null = null;
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (this.board.matrix[r][c].value === calledNumber) {
            matchCoords = { row: r, col: c };
            break;
          }
        }
        if (matchCoords) break;
      }

      if (!matchCoords) {
        resolve({ marked: false, linesCompleted: this.linesCompleted });
        return;
      }

      // Check difficulty accuracy
      const accuracyChance = this.difficulty === 'EASY' ? 0.8 : this.difficulty === 'MEDIUM' ? 0.95 : 1.0;
      if (Math.random() > accuracyChance) {
        // Missed daub on easy mode
        resolve({ marked: false, linesCompleted: this.linesCompleted });
        return;
      }

      // Delay based on difficulty
      const delay =
        this.difficulty === 'EASY'
          ? Math.random() * 2000 + 3000 // 3-5s
          : this.difficulty === 'MEDIUM'
          ? Math.random() * 1000 + 1500 // 1.5-2.5s
          : Math.random() * 600 + 400; // 0.4-1.0s

      setTimeout(() => {
        if (!matchCoords) return;
        const cell = this.board.matrix[matchCoords.row][matchCoords.col];
        cell.state = 'MARKED';
        cell.daubTimestamp = Date.now();

        // Evaluate robot lines
        const winEval = evaluate5x5Wins(this.board, this.completedPatternIds);
        if (winEval.newlyCompletedPatterns.length > 0) {
          this.completedPatternIds.push(...winEval.newlyCompletedPatterns.map((p) => p.id));
          this.linesCompleted = this.completedPatternIds.length;
          this.score += winEval.newlyCompletedPatterns.length * 500;

          // Update winning cells
          winEval.winningCoords.forEach(({ row, col }) => {
            this.board.matrix[row][col].isWinningCell = true;
          });
        }

        if (onRobotMarked) {
          onRobotMarked(matchCoords.row, matchCoords.col, this.linesCompleted);
        }

        resolve({ marked: true, linesCompleted: this.linesCompleted });
      }, delay);
    });
  }
}
