import { readFileSync, writeFileSync } from 'node:fs';
import type { TicTacToe } from '../games/tic-tac-toe/TicTacToe.js';
import type { Agent } from './types.js';

export interface QLearningConfig {
  learningRate: number;     // α — how fast to update (0.1)
  discountFactor: number;   // γ — value of future rewards (0.9)
  epsilon: number;          // ε — exploration rate (1.0)
  epsilonDecay: number;     // multiply ε by this after each episode (0.9995)
  epsilonMin: number;       // floor for ε (0.01)
}

export const DEFAULT_CONFIG: QLearningConfig = {
  learningRate: 0.1,
  discountFactor: 0.9,
  epsilon: 1.0,
  epsilonDecay: 0.9995,
  epsilonMin: 0.01,
};

export interface Rewards {
  win: number;
  loss: number;
  draw: number;
}

export const DEFAULT_REWARDS: Rewards = {
  win: 1.0,
  loss: -1.0,
  draw: 0.3,
};

export type QTable = Map<string, number[]>;

export class QLearningAgent implements Agent {
  name = 'Q-Learning';
  readonly config: QLearningConfig;
  readonly rewards: Rewards;
  readonly qTable: QTable = new Map();

  constructor(config: Partial<QLearningConfig> = {}, rewards: Partial<Rewards> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.rewards = { ...DEFAULT_REWARDS, ...rewards };
  }

  async chooseMove(game: TicTacToe): Promise<number> {
    const validMoves = game.getValidMoves();
    if (validMoves.length === 0) {
      throw new Error('No valid moves available');
    }

    // Epsilon-greedy: explore with probability ε, exploit otherwise
    if (Math.random() < this.config.epsilon) {
      return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    return this.bestMove(game);
  }

  /** Pick the valid move with the highest Q-value (greedy, no exploration).
   *  When multiple moves share the best value, picks randomly among them. */
  bestMove(game: TicTacToe): number {
    const validMoves = game.getValidMoves();
    const qValues = this.getQValues(game.getStateKey());

    let bestValue = qValues[validMoves[0]];
    for (let i = 1; i < validMoves.length; i++) {
      if (qValues[validMoves[i]] > bestValue) {
        bestValue = qValues[validMoves[i]];
      }
    }

    // Collect all moves tied at the best value
    const tied = validMoves.filter(m => qValues[m] === bestValue);
    return tied[Math.floor(Math.random() * tied.length)];
  }

  /** Look up or initialize Q-values for a state. Invalid positions get -Infinity. */
  getQValues(stateKey: string): number[] {
    let values = this.qTable.get(stateKey);
    if (values) return values;

    // Initialize: 0 for empty cells, -Infinity for occupied
    values = Array.from({ length: 9 }, (_, i) =>
      stateKey[i] === '_' ? 0 : -Infinity
    );
    this.qTable.set(stateKey, values);
    return values;
  }

  /** Apply the Q-learning update rule: Q(s,a) += α * [reward + γ * max Q(s',a') - Q(s,a)] */
  update(state: string, action: number, reward: number, nextState: string | null): void {
    const qValues = this.getQValues(state);
    const currentQ = qValues[action];

    let targetQ: number;
    if (nextState === null) {
      // Terminal state — no future reward
      targetQ = reward;
    } else {
      const nextQValues = this.getQValues(nextState);
      const validNextValues = nextQValues.filter(v => v > -Infinity);
      const maxNextQ = validNextValues.length > 0 ? Math.max(...validNextValues) : 0;
      targetQ = reward + this.config.discountFactor * maxNextQ;
    }

    qValues[action] = currentQ + this.config.learningRate * (targetQ - currentQ);
  }

  /** Reduce exploration rate after each episode. */
  decayEpsilon(): void {
    this.config.epsilon = Math.max(
      this.config.epsilonMin,
      this.config.epsilon * this.config.epsilonDecay
    );
  }

  /** Save Q-table to a JSON file. */
  save(filepath: string): void {
    const data = Object.fromEntries(this.qTable);
    writeFileSync(filepath, JSON.stringify(data));
  }

  /** Load Q-table from a JSON file. */
  load(filepath: string): void {
    const raw = readFileSync(filepath, 'utf-8');
    const data = JSON.parse(raw) as Record<string, (number | null)[]>;
    this.qTable.clear();
    for (const [key, values] of Object.entries(data)) {
      // JSON serializes -Infinity as null, restore it on load
      this.qTable.set(key, values.map(v => v === null ? -Infinity : v));
    }
  }

  /** Number of states in the Q-table. */
  get tableSize(): number {
    return this.qTable.size;
  }
}
