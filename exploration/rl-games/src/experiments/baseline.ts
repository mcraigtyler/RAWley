import { TicTacToe, type Player } from '../games/tic-tac-toe/TicTacToe.js';
import { RandomAgent } from '../agents/RandomAgent.js';
import { Stats } from '../utils/stats.js';
import type { Agent } from '../agents/types.js';

// ── Configuration ──────────────────────────────────────────────────

interface BaselineConfig {
  games: number;
}

const config: BaselineConfig = {
  games: 200,
};

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i += 2) {
  if (args[i] === '--games' && args[i + 1]) {
    config.games = parseInt(args[i + 1], 10);
  }
}

// ── Matchup runner ─────────────────────────────────────────────────

export async function runMatchup(
  xAgent: Agent,
  oAgent: Agent,
  numGames: number,
): Promise<Stats> {
  const stats = new Stats();
  const game = new TicTacToe();
  const agentFor: Record<Player, Agent> = { X: xAgent, O: oAgent };

  for (let i = 0; i < numGames; i++) {
    game.reset();

    while (game.winner === null) {
      const agent = agentFor[game.currentPlayer];
      const move = await agent.chooseMove(game);
      game.makeMove(move);
    }

    stats.record({ winner: game.winner, moves: game.moveHistory.length });
  }

  return stats;
}

// ── Main ───────────────────────────────────────────────────────────

async function baseline(): Promise<void> {
  console.log('  Baseline Experiments');
  console.log('  ====================');
  console.log(`  Games per matchup: ${config.games}`);
  console.log();

  // Matchup 1: Random vs Random (sanity check)
  const randomX = new RandomAgent();
  const randomO = new RandomAgent();
  const rvr = await runMatchup(randomX, randomO, config.games);
  console.log(rvr.summary(`Random (X) vs Random (O)`));
  console.log();

  // Future: LLM matchups will be added after LLMAgent is implemented (Task 8)
  // Matchup 2: LLM (X) vs Random (O)
  // Matchup 3: Random (X) vs LLM (O)
}

const isMain = process.argv[1]?.endsWith('baseline.ts');
if (isMain) baseline();
