import { createInterface } from 'node:readline';
import { TicTacToe } from './TicTacToe.js';

const game = new TicTacToe();
const rl = createInterface({ input: process.stdin, output: process.stdout });

function printBoard(): void {
  console.log();
  console.log('  Position map:       Current board:');
  console.log();

  const pos = (i: number) => {
    const cell = game.board[i];
    return cell ?? String(i);
  };

  console.log(`    0 | 1 | 2           ${pos(0)} | ${pos(1)} | ${pos(2)}`);
  console.log(`    ---------           ---------`);
  console.log(`    3 | 4 | 5           ${pos(3)} | ${pos(4)} | ${pos(5)}`);
  console.log(`    ---------           ---------`);
  console.log(`    6 | 7 | 8           ${pos(6)} | ${pos(7)} | ${pos(8)}`);
  console.log();
}

function prompt(): void {
  printBoard();

  if (game.winner) {
    if (game.winner === 'draw') {
      console.log("  It's a draw!");
    } else {
      console.log(`  ${game.winner} wins!`);
    }
    console.log();
    rl.question('  Play again? (y/n): ', (answer) => {
      if (answer.trim().toLowerCase() === 'y') {
        game.reset();
        prompt();
      } else {
        console.log('  Thanks for playing!');
        rl.close();
      }
    });
    return;
  }

  const valid = game.getValidMoves();
  rl.question(`  Player ${game.currentPlayer}, enter move (${valid.join(', ')}): `, (answer) => {
    const move = parseInt(answer.trim(), 10);

    if (!game.makeMove(move)) {
      console.log('  Invalid move. Try again.');
    }

    prompt();
  });
}

console.log('  ========================');
console.log('    Tic-Tac-Toe');
console.log('  ========================');
console.log('  Enter a number 0-8 to place your mark.');
console.log('  X goes first.');

prompt();
