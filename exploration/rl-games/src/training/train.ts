import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { TicTacToe, type Player } from '../games/tic-tac-toe/TicTacToe.js';
import { QLearningAgent } from '../agents/QLearningAgent.js';
import { RandomAgent } from '../agents/RandomAgent.js';

// ── Configuration ──────────────────────────────────────────────────

interface TrainConfig {
  episodes: number;
  logInterval: number;
  evalGames: number;
  outputPath: string;
}

const config: TrainConfig = {
  episodes: 50_000,
  logInterval: 5_000,
  evalGames: 500,
  outputPath: 'q-tables/ttt-50k.json',
};

// Allow overrides from CLI args:  npm run train -- --episodes 100000 --output q-tables/custom.json
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i += 2) {
  const flag = args[i];
  const value = args[i + 1];
  if (!value) break;
  switch (flag) {
    case '--episodes': config.episodes = parseInt(value, 10); break;
    case '--log-interval': config.logInterval = parseInt(value, 10); break;
    case '--eval-games': config.evalGames = parseInt(value, 10); break;
    case '--output': config.outputPath = value; break;
  }
}

// ── Training helpers ───────────────────────────────────────────────

export interface MoveRecord {
  player: Player;
  state: string;
  action: number;
}

/** Play one game of self-play, returning the move history and outcome. */
export function playSelfPlayGame(agent: QLearningAgent, game: TicTacToe): MoveRecord[] {
  game.reset();
  const history: MoveRecord[] = [];

  while (game.winner === null) {
    const state = game.getStateKey();
    const validMoves = game.getValidMoves();

    // Epsilon-greedy inline (synchronous, avoid async overhead)
    let action: number;
    if (Math.random() < agent.config.epsilon) {
      action = validMoves[Math.floor(Math.random() * validMoves.length)];
    } else {
      action = agent.bestMove(game);
    }

    history.push({ player: game.currentPlayer, state, action });
    game.makeMove(action);
  }

  return history;
}

/** Apply Q-learning updates for both players after a game. */
export function updateFromGame(agent: QLearningAgent, game: TicTacToe, history: MoveRecord[]): void {
  for (const side of ['X', 'O'] as Player[]) {
    for (let i = history.length - 1; i >= 0; i--) {
      const { player, state, action } = history[i];
      if (player !== side) continue;

      // Find this player's next state (the board when they next moved)
      const nextEntry = history.slice(i + 1).find(h => h.player === side);
      const nextState = nextEntry ? nextEntry.state : null;

      // Terminal reward only on the last move for each player
      let reward = 0;
      if (i >= history.length - 2) {
        if (game.winner === 'draw') reward = agent.rewards.draw;
        else if (game.winner === player) reward = agent.rewards.win;
        else reward = agent.rewards.loss;
      }

      agent.update(state, action, reward, nextState);
    }
  }
}

/** Evaluate the agent against Random (greedy, no exploration). Returns win/draw/loss counts. */
export function evaluate(agent: QLearningAgent, numGames: number): { wins: number; draws: number; losses: number } {
  const random = new RandomAgent();
  const game = new TicTacToe();
  let wins = 0;
  let draws = 0;
  let losses = 0;

  for (let i = 0; i < numGames; i++) {
    game.reset();

    // Alternate which side the Q-agent plays each game
    const qSide: Player = i % 2 === 0 ? 'X' : 'O';

    while (game.winner === null) {
      const isQTurn = game.currentPlayer === qSide;
      let move: number;
      if (isQTurn) {
        move = agent.bestMove(game);
      } else {
        const valid = game.getValidMoves();
        move = valid[Math.floor(Math.random() * valid.length)];
      }
      game.makeMove(move);
    }

    if (game.winner === 'draw') draws++;
    else if (game.winner === qSide) wins++;
    else losses++;
  }

  return { wins, draws, losses };
}

// ── Main training loop ─────────────────────────────────────────────

function train(): void {
  const agent = new QLearningAgent();
  const game = new TicTacToe();
  const startTime = Date.now();

  console.log('  Q-Learning Training');
  console.log('  ===================');
  console.log(`  Episodes: ${config.episodes.toLocaleString()}`);
  console.log(`  Log every: ${config.logInterval.toLocaleString()} episodes`);
  console.log(`  Eval games: ${config.evalGames} (vs Random, alternating sides)`);
  console.log(`  Output: ${config.outputPath}`);
  console.log(`  Hyperparameters: α=${agent.config.learningRate} γ=${agent.config.discountFactor} ε=${agent.config.epsilon}→${agent.config.epsilonMin} (decay ${agent.config.epsilonDecay})`);
  console.log();

  for (let ep = 1; ep <= config.episodes; ep++) {
    const history = playSelfPlayGame(agent, game);
    updateFromGame(agent, game, history);
    agent.decayEpsilon();

    if (ep % config.logInterval === 0) {
      const { wins, draws, losses } = evaluate(agent, config.evalGames);
      const total = wins + draws + losses;
      const wPct = ((wins / total) * 100).toFixed(0).padStart(2);
      const lPct = ((losses / total) * 100).toFixed(0).padStart(2);
      const dPct = ((draws / total) * 100).toFixed(0).padStart(2);
      const epStr = String(ep).padStart(String(config.episodes).length);
      const ε = agent.config.epsilon.toFixed(4);
      console.log(
        `  Episode ${epStr} | vs Random: W:${wPct}% L:${lPct}% D:${dPct}% | Q-table: ${agent.tableSize} states | ε: ${ε}`
      );
    }
  }

  // Save
  mkdirSync(dirname(config.outputPath), { recursive: true });
  agent.save(config.outputPath);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log();
  console.log(`  Training complete in ${elapsed}s`);
  console.log(`  Q-table: ${agent.tableSize} states saved to ${config.outputPath}`);
}

// Run when executed directly (not imported by tests)
const isMain = process.argv[1]?.endsWith('train.ts');
if (isMain) train();
