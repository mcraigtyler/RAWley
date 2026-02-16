import type { TicTacToe } from '../games/TicTacToe.js';

export interface Agent {
  /** Choose a move given the current game state */
  chooseMove(game: TicTacToe): Promise<number>;

  /** Human-readable name for logging */
  name: string;
}
