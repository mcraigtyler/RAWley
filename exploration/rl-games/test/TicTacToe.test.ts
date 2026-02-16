import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { TicTacToe } from '../src/games/tic-tac-toe/TicTacToe.js';

describe('TicTacToe', () => {
  let game: TicTacToe;

  beforeEach(() => {
    game = new TicTacToe();
  });

  describe('constructor', () => {
    it('initializes an empty board', () => {
      assert.equal(game.board.length, 9);
      assert.ok(game.board.every(cell => cell === null));
    });

    it('sets X as the first player', () => {
      assert.equal(game.currentPlayer, 'X');
    });

    it('starts with no winner', () => {
      assert.equal(game.winner, null);
    });

    it('starts with empty move history', () => {
      assert.deepEqual(game.moveHistory, []);
    });
  });

  describe('getValidMoves', () => {
    it('returns all 9 positions on an empty board', () => {
      assert.deepEqual(game.getValidMoves(), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('excludes occupied positions', () => {
      game.makeMove(0);
      game.makeMove(4);
      assert.deepEqual(game.getValidMoves(), [1, 2, 3, 5, 6, 7, 8]);
    });

    it('returns empty array when game is won', () => {
      game.makeMove(0); game.makeMove(3);
      game.makeMove(1); game.makeMove(4);
      game.makeMove(2); // X wins top row
      assert.deepEqual(game.getValidMoves(), []);
    });

    it('returns empty array on a draw', () => {
      // X O X | O X X | O X O
      [0, 1, 2, 4, 3, 6, 5, 8, 7].forEach(m => game.makeMove(m));
      assert.equal(game.winner, 'draw');
      assert.deepEqual(game.getValidMoves(), []);
    });
  });

  describe('makeMove', () => {
    it('places the current player mark on the board', () => {
      game.makeMove(4);
      assert.equal(game.board[4], 'X');
    });

    it('switches the current player after a valid move', () => {
      game.makeMove(0);
      assert.equal(game.currentPlayer, 'O');
      game.makeMove(1);
      assert.equal(game.currentPlayer, 'X');
    });

    it('records move in history', () => {
      game.makeMove(4);
      game.makeMove(0);
      assert.deepEqual(game.moveHistory, [4, 0]);
    });

    it('returns true for a valid move', () => {
      assert.equal(game.makeMove(0), true);
    });

    it('returns false for an occupied position', () => {
      game.makeMove(0);
      assert.equal(game.makeMove(0), false);
    });

    it('returns false for out-of-range positions', () => {
      assert.equal(game.makeMove(-1), false);
      assert.equal(game.makeMove(9), false);
    });

    it('returns false when the game is already over', () => {
      game.makeMove(0); game.makeMove(3);
      game.makeMove(1); game.makeMove(4);
      game.makeMove(2); // X wins
      assert.equal(game.makeMove(5), false);
    });

    it('does not switch player on a winning move', () => {
      game.makeMove(0); game.makeMove(3);
      game.makeMove(1); game.makeMove(4);
      game.makeMove(2); // X wins
      assert.equal(game.currentPlayer, 'X');
    });

    it('does not mutate state on an invalid move', () => {
      game.makeMove(0);
      const boardBefore = [...game.board];
      const playerBefore = game.currentPlayer;
      const historyBefore = [...game.moveHistory];
      game.makeMove(0); // invalid — occupied
      assert.deepEqual(game.board, boardBefore);
      assert.equal(game.currentPlayer, playerBefore);
      assert.deepEqual(game.moveHistory, historyBefore);
    });
  });

  describe('checkWinner', () => {
    it('detects X winning on each row', () => {
      // Row 0
      const g1 = new TicTacToe();
      g1.makeMove(0); g1.makeMove(3); g1.makeMove(1); g1.makeMove(4); g1.makeMove(2);
      assert.equal(g1.winner, 'X');

      // Row 1
      const g2 = new TicTacToe();
      g2.makeMove(3); g2.makeMove(0); g2.makeMove(4); g2.makeMove(1); g2.makeMove(5);
      assert.equal(g2.winner, 'X');

      // Row 2
      const g3 = new TicTacToe();
      g3.makeMove(6); g3.makeMove(0); g3.makeMove(7); g3.makeMove(1); g3.makeMove(8);
      assert.equal(g3.winner, 'X');
    });

    it('detects X winning on each column', () => {
      // Col 0
      const g1 = new TicTacToe();
      g1.makeMove(0); g1.makeMove(1); g1.makeMove(3); g1.makeMove(4); g1.makeMove(6);
      assert.equal(g1.winner, 'X');

      // Col 1
      const g2 = new TicTacToe();
      g2.makeMove(1); g2.makeMove(0); g2.makeMove(4); g2.makeMove(3); g2.makeMove(7);
      assert.equal(g2.winner, 'X');

      // Col 2
      const g3 = new TicTacToe();
      g3.makeMove(2); g3.makeMove(0); g3.makeMove(5); g3.makeMove(3); g3.makeMove(8);
      assert.equal(g3.winner, 'X');
    });

    it('detects X winning on each diagonal', () => {
      // Main diagonal
      const g1 = new TicTacToe();
      g1.makeMove(0); g1.makeMove(1); g1.makeMove(4); g1.makeMove(2); g1.makeMove(8);
      assert.equal(g1.winner, 'X');

      // Anti-diagonal
      const g2 = new TicTacToe();
      g2.makeMove(2); g2.makeMove(0); g2.makeMove(4); g2.makeMove(1); g2.makeMove(6);
      assert.equal(g2.winner, 'X');
    });

    it('detects O winning', () => {
      const g = new TicTacToe();
      g.makeMove(0); g.makeMove(2);
      g.makeMove(1); g.makeMove(4);
      g.makeMove(3); g.makeMove(6); // O wins anti-diagonal
      assert.equal(g.winner, 'O');
    });

    it('detects a draw', () => {
      // X O X | X O X | O X O
      [0, 1, 2, 4, 3, 6, 5, 8, 7].forEach(m => game.makeMove(m));
      assert.equal(game.winner, 'draw');
    });

    it('returns null when the game is in progress', () => {
      game.makeMove(0);
      game.makeMove(4);
      assert.equal(game.winner, null);
    });
  });

  describe('getStateKey', () => {
    it('returns all underscores for an empty board', () => {
      assert.equal(game.getStateKey(), '_________');
    });

    it('represents moves with player marks and blanks with underscores', () => {
      game.makeMove(0); // X at 0
      game.makeMove(4); // O at 4
      assert.equal(game.getStateKey(), 'X___O____');
    });

    it('produces a 9-character string', () => {
      game.makeMove(0);
      game.makeMove(1);
      game.makeMove(2);
      assert.equal(game.getStateKey().length, 9);
    });
  });

  describe('clone', () => {
    it('produces an equal but independent copy', () => {
      game.makeMove(4);
      game.makeMove(0);
      const clone = game.clone();

      assert.deepEqual(clone.board, game.board);
      assert.equal(clone.currentPlayer, game.currentPlayer);
      assert.equal(clone.winner, game.winner);
      assert.deepEqual(clone.moveHistory, game.moveHistory);
    });

    it('does not share board array reference', () => {
      game.makeMove(4);
      const clone = game.clone();
      clone.makeMove(0);
      assert.equal(game.board[0], null);
      assert.equal(clone.board[0], 'O');
    });

    it('does not share moveHistory array reference', () => {
      game.makeMove(4);
      const clone = game.clone();
      clone.makeMove(0);
      assert.equal(game.moveHistory.length, 1);
      assert.equal(clone.moveHistory.length, 2);
    });

    it('preserves winner state', () => {
      game.makeMove(0); game.makeMove(3);
      game.makeMove(1); game.makeMove(4);
      game.makeMove(2); // X wins
      const clone = game.clone();
      assert.equal(clone.winner, 'X');
    });
  });

  describe('display', () => {
    it('shows an empty board with underscores', () => {
      const output = game.display();
      assert.ok(output.includes('_ | _ | _'));
    });

    it('shows placed marks', () => {
      game.makeMove(0); // X
      game.makeMove(4); // O
      const output = game.display();
      assert.ok(output.includes('X | _ | _'));
      assert.ok(output.includes('_ | O | _'));
    });

    it('contains separator lines', () => {
      const lines = game.display().split('\n');
      assert.equal(lines.length, 5);
      assert.ok(lines[1].includes('---------'));
      assert.ok(lines[3].includes('---------'));
    });
  });

  describe('reset', () => {
    it('clears the board to initial state', () => {
      game.makeMove(0);
      game.makeMove(4);
      game.makeMove(8);
      game.reset();

      assert.ok(game.board.every(cell => cell === null));
      assert.equal(game.currentPlayer, 'X');
      assert.equal(game.winner, null);
      assert.deepEqual(game.moveHistory, []);
    });

    it('allows playing a new game after reset', () => {
      game.makeMove(0); game.makeMove(3);
      game.makeMove(1); game.makeMove(4);
      game.makeMove(2); // X wins
      game.reset();

      assert.equal(game.makeMove(4), true);
      assert.equal(game.board[4], 'X');
    });
  });

  describe('full game scenarios', () => {
    it('plays a complete game ending in X win', () => {
      // X takes center, corners — wins on diagonal
      game.makeMove(0); game.makeMove(1);
      game.makeMove(4); game.makeMove(2);
      game.makeMove(8); // X wins 0-4-8
      assert.equal(game.winner, 'X');
      assert.equal(game.moveHistory.length, 5);
    });

    it('plays a complete 9-move draw', () => {
      //  X | O | X
      //  X | O | X
      //  O | X | O
      [0, 1, 2, 4, 3, 6, 5, 8, 7].forEach(m => game.makeMove(m));
      assert.equal(game.winner, 'draw');
      assert.equal(game.moveHistory.length, 9);
      assert.deepEqual(game.getValidMoves(), []);
    });

    it('detects win before all cells are filled', () => {
      game.makeMove(0); game.makeMove(3);
      game.makeMove(1); game.makeMove(4);
      game.makeMove(2); // X wins at move 5
      assert.equal(game.winner, 'X');
      assert.equal(game.moveHistory.length, 5);
      assert.ok(game.board.some(cell => cell === null)); // empty cells remain
    });
  });
});
