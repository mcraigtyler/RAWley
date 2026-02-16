import type { Player } from '../games/tic-tac-toe/TicTacToe.js';

export interface GameResult {
  winner: Player | 'draw';
  moves: number;
  invalidMoveCount?: number;
}

export class Stats {
  private results: GameResult[] = [];

  record(result: GameResult): void {
    this.results.push(result);
  }

  winRate(player: Player): number {
    if (this.results.length === 0) return 0;
    return this.results.filter(r => r.winner === player).length / this.results.length;
  }

  drawRate(): number {
    if (this.results.length === 0) return 0;
    return this.results.filter(r => r.winner === 'draw').length / this.results.length;
  }

  summary(label: string): string {
    const total = this.results.length;
    if (total === 0) return `=== ${label} — 0 games ===\n  No results recorded.`;

    const xWins = this.results.filter(r => r.winner === 'X').length;
    const oWins = this.results.filter(r => r.winner === 'O').length;
    const draws = this.results.filter(r => r.winner === 'draw').length;

    const pct = (n: number) => ((n / total) * 100).toFixed(1);
    const pad = (n: number) => String(n).padStart(String(total).length);

    const avgMoves = this.results.reduce((sum, r) => sum + r.moves, 0) / total;

    const lines = [
      `=== ${label} — ${total} games ===`,
      `  X wins:  ${pad(xWins)} (${pct(xWins)}%)`,
      `  O wins:  ${pad(oWins)} (${pct(oWins)}%)`,
      `  Draws:   ${pad(draws)} (${pct(draws)}%)`,
      `  Avg game length: ${avgMoves.toFixed(1)} moves`,
    ];

    const invalidResults = this.results.filter(r => r.invalidMoveCount !== undefined && r.invalidMoveCount > 0);
    if (invalidResults.length > 0) {
      const totalInvalid = invalidResults.reduce((sum, r) => sum + r.invalidMoveCount!, 0);
      const totalMoves = this.results.reduce((sum, r) => sum + r.moves, 0);
      const rate = (totalInvalid / totalMoves) * 100;
      lines.push(`  Invalid move rate: ${rate.toFixed(1)}%`);
    }

    return lines.join('\n');
  }
}
