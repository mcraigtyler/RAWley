import type { TicTacToe } from '../games/tic-tac-toe/TicTacToe.js';
import type { Agent } from './types.js';

export class RandomAgent implements Agent {
  name = 'Random';

  async chooseMove(game: TicTacToe): Promise<number> {
    const moves = game.getValidMoves();
    return moves[Math.floor(Math.random() * moves.length)];
  }
}
