export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = Cell[]; // length 9, index 0-8

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player | 'draw' | null; // null = game in progress
  moveHistory: number[];
}

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],             // diagonals
];

export class TicTacToe {
  board: Board;
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  moveHistory: number[];

  constructor() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.winner = null;
    this.moveHistory = [];
  }

  getValidMoves(): number[] {
    if (this.winner !== null) return [];
    return this.board.reduce<number[]>((moves, cell, i) => {
      if (cell === null) moves.push(i);
      return moves;
    }, []);
  }

  makeMove(position: number): boolean {
    if (position < 0 || position > 8) return false;
    if (this.board[position] !== null) return false;
    if (this.winner !== null) return false;

    this.board[position] = this.currentPlayer;
    this.moveHistory.push(position);
    this.winner = this.checkWinner();

    if (this.winner === null) {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }

    return true;
  }

  checkWinner(): Player | 'draw' | null {
    for (const [a, b, c] of WINNING_LINES) {
      const v = this.board[a];
      if (v !== null && v === this.board[b] && v === this.board[c]) {
        return v;
      }
    }
    if (this.board.every(cell => cell !== null)) return 'draw';
    return null;
  }

  getStateKey(): string {
    return this.board.map(c => c ?? '_').join('');
  }

  clone(): TicTacToe {
    const copy = new TicTacToe();
    copy.board = [...this.board];
    copy.currentPlayer = this.currentPlayer;
    copy.winner = this.winner;
    copy.moveHistory = [...this.moveHistory];
    return copy;
  }

  display(): string {
    const sym = (c: Cell) => c ?? '_';
    const rows = [
      ` ${sym(this.board[0])} | ${sym(this.board[1])} | ${sym(this.board[2])}`,
      ' ---------',
      ` ${sym(this.board[3])} | ${sym(this.board[4])} | ${sym(this.board[5])}`,
      ' ---------',
      ` ${sym(this.board[6])} | ${sym(this.board[7])} | ${sym(this.board[8])}`,
    ];
    return rows.join('\n');
  }

  reset(): void {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.winner = null;
    this.moveHistory = [];
  }
}
