export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = Cell[]; // length 9, index 0-8

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player | 'draw' | null; // null = game in progress
  moveHistory: number[];
}

// Stub class — full implementation in Task 2
export class TicTacToe {
  state: GameState = {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null,
    moveHistory: [],
  };
}
