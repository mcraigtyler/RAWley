import { createInterface } from 'node:readline';
import { setTimeout } from 'node:timers/promises';
import { TicTacToe, type Player } from './TicTacToe.js';
import { RandomAgent } from '../../agents/RandomAgent.js';
import { Stats } from '../../utils/stats.js';
import type { Agent } from '../../agents/types.js';

const game = new TicTacToe();
const rl = createInterface({ input: process.stdin, output: process.stdout });
const stats = new Stats();

function ask(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

class HumanAgent implements Agent {
  name = 'Human';

  async chooseMove(g: TicTacToe): Promise<number> {
    const valid = g.getValidMoves();
    while (true) {
      const answer = await ask(`  Player ${g.currentPlayer} (${this.name}), enter move (${valid.join(', ')}): `);
      const move = parseInt(answer.trim(), 10);
      if (valid.includes(move)) return move;
      console.log('  Invalid move. Try again.');
    }
  }
}

const agents: Record<string, () => Agent> = {
  '1': () => new HumanAgent(),
  '2': () => new RandomAgent(),
};

function printBoard(): void {
  console.log();
  console.log('  Position map:       Current board:');
  console.log();

  const pos = (i: number) => game.board[i] ?? String(i);

  console.log(`    0 | 1 | 2           ${pos(0)} | ${pos(1)} | ${pos(2)}`);
  console.log(`    ---------           ---------`);
  console.log(`    3 | 4 | 5           ${pos(3)} | ${pos(4)} | ${pos(5)}`);
  console.log(`    ---------           ---------`);
  console.log(`    6 | 7 | 8           ${pos(6)} | ${pos(7)} | ${pos(8)}`);
  console.log();
}

async function chooseAgent(player: Player): Promise<Agent> {
  const menu = Object.entries(agents)
    .map(([key, factory]) => `${key}) ${factory().name}`)
    .join(', ');

  while (true) {
    const answer = (await ask(`  Player ${player} — ${menu}: `)).trim();
    const factory = agents[answer];
    if (factory) return factory();
    console.log('  Invalid choice. Try again.');
  }
}

function hasHuman(agentX: Agent, agentO: Agent): boolean {
  return agentX instanceof HumanAgent || agentO instanceof HumanAgent;
}

async function playOneGame(agentX: Agent, agentO: Agent, silent: boolean): Promise<void> {
  const agentFor: Record<Player, Agent> = { X: agentX, O: agentO };
  game.reset();

  while (game.winner === null) {
    if (!silent) printBoard();
    const agent = agentFor[game.currentPlayer];
    const move = await agent.chooseMove(game);
    if (!silent) console.log(`  ${agent.name} (${game.currentPlayer}) plays ${move}`);
    game.makeMove(move);

    if (!silent && !(agent instanceof HumanAgent)) {
      await setTimeout(300);
    }
  }

  if (!silent) {
    printBoard();
    if (game.winner === 'draw') {
      console.log("  It's a draw!");
    } else {
      console.log(`  ${game.winner} (${agentFor[game.winner].name}) wins!`);
    }
  }

  stats.record({ winner: game.winner, moves: game.moveHistory.length });
}

async function main(): Promise<void> {
  console.log('  ========================');
  console.log('    Tic-Tac-Toe');
  console.log('  ========================');
  console.log();
  console.log('  Choose who plays each side:');
  console.log();

  const agentX = await chooseAgent('X');
  const agentO = await chooseAgent('O');
  const label = `${agentX.name} (X) vs ${agentO.name} (O)`;

  // If no humans are playing, offer batch mode
  if (!hasHuman(agentX, agentO)) {
    const countAnswer = (await ask('  Number of games to play (default 1): ')).trim();
    const count = parseInt(countAnswer, 10) || 1;

    let verbose = true;
    if (count > 1) {
      const verboseAnswer = (await ask('  Show each game result? (y/n, default y): ')).trim().toLowerCase();
      verbose = verboseAnswer !== 'n';
    }

    console.log();
    console.log(`  ${label} — ${count} game${count > 1 ? 's' : ''}`);
    console.log();

    for (let i = 0; i < count; i++) {
      await playOneGame(agentX, agentO, count > 1);

      if (verbose) {
        const b = game.board.map(c => c ?? '_');
        const board = `${b[0]}${b[1]}${b[2]}|${b[3]}${b[4]}${b[5]}|${b[6]}${b[7]}${b[8]}`;
        const result = game.winner === 'draw' ? 'Draw  ' : `${game.winner} wins`;
        const num = String(i + 1).padStart(String(count).length);
        console.log(`  #${num}  ${board}  ${result}  (${game.moveHistory.length} moves)`);
      }
    }
  } else {
    // Interactive mode with replay
    let playing = true;
    while (playing) {
      console.log();
      console.log(`  ${label}`);
      await playOneGame(agentX, agentO, false);

      console.log();
      const again = (await ask('  Play again? (y/n): ')).trim().toLowerCase();
      playing = again === 'y';
    }
  }

  console.log();
  console.log(stats.summary(label));
  console.log();
  console.log('  Thanks for playing!');
  rl.close();
}

main();
