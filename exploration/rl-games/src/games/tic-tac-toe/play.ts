import { createInterface } from 'node:readline';
import { setTimeout } from 'node:timers/promises';
import { TicTacToe, type Player } from './TicTacToe.js';
import { RandomAgent } from '../../agents/RandomAgent.js';
import type { Agent } from '../../agents/types.js';

const game = new TicTacToe();
const rl = createInterface({ input: process.stdin, output: process.stdout });

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

async function gameLoop(agentX: Agent, agentO: Agent): Promise<void> {
  const agentFor: Record<Player, Agent> = { X: agentX, O: agentO };

  while (game.winner === null) {
    printBoard();
    const agent = agentFor[game.currentPlayer];
    const move = await agent.chooseMove(game);
    console.log(`  ${agent.name} (${game.currentPlayer}) plays ${move}`);
    game.makeMove(move);

    // Brief pause when agents play so you can follow along
    if (!(agent instanceof HumanAgent)) {
      await setTimeout(300);
    }
  }

  printBoard();

  if (game.winner === 'draw') {
    console.log("  It's a draw!");
  } else {
    const winner = agentFor[game.winner];
    console.log(`  ${game.winner} (${winner.name}) wins!`);
  }
}

async function main(): Promise<void> {
  console.log('  ========================');
  console.log('    Tic-Tac-Toe');
  console.log('  ========================');
  console.log();
  console.log('  Choose who plays each side:');
  console.log();

  let playing = true;
  while (playing) {
    const agentX = await chooseAgent('X');
    const agentO = await chooseAgent('O');

    console.log();
    console.log(`  ${agentX.name} (X) vs ${agentO.name} (O)`);

    game.reset();
    await gameLoop(agentX, agentO);

    console.log();
    const again = (await ask('  Play again? (y/n): ')).trim().toLowerCase();
    playing = again === 'y';
    console.log();
  }

  console.log('  Thanks for playing!');
  rl.close();
}

main();
