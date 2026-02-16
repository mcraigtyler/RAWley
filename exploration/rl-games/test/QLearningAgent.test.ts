import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { TicTacToe } from '../src/games/tic-tac-toe/TicTacToe.js';
import {
  QLearningAgent,
  DEFAULT_CONFIG,
  DEFAULT_REWARDS,
} from '../src/agents/QLearningAgent.js';
import { writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('QLearningAgent', () => {
  let agent: QLearningAgent;

  beforeEach(() => {
    agent = new QLearningAgent();
  });

  describe('constructor', () => {
    it('uses default config when no args given', () => {
      assert.deepStrictEqual(agent.config, DEFAULT_CONFIG);
    });

    it('uses default rewards when no args given', () => {
      assert.deepStrictEqual(agent.rewards, DEFAULT_REWARDS);
    });

    it('merges partial config with defaults', () => {
      const custom = new QLearningAgent({ learningRate: 0.5, epsilon: 0.2 });
      assert.equal(custom.config.learningRate, 0.5);
      assert.equal(custom.config.epsilon, 0.2);
      assert.equal(custom.config.discountFactor, DEFAULT_CONFIG.discountFactor);
    });

    it('merges partial rewards with defaults', () => {
      const custom = new QLearningAgent({}, { win: 2.0 });
      assert.equal(custom.rewards.win, 2.0);
      assert.equal(custom.rewards.loss, DEFAULT_REWARDS.loss);
      assert.equal(custom.rewards.draw, DEFAULT_REWARDS.draw);
    });

    it('starts with empty Q-table', () => {
      assert.equal(agent.tableSize, 0);
    });

    it('has correct name', () => {
      assert.equal(agent.name, 'Q-Learning');
    });
  });

  describe('getQValues', () => {
    it('initializes new states with 0 for empty cells', () => {
      const values = agent.getQValues('_________');
      assert.equal(values.length, 9);
      assert.ok(values.every(v => v === 0));
    });

    it('initializes occupied cells with -Infinity', () => {
      const values = agent.getQValues('X___O____');
      assert.equal(values[0], -Infinity); // X
      assert.equal(values[4], -Infinity); // O
      assert.equal(values[1], 0);         // empty
    });

    it('returns same array on repeated lookup', () => {
      const first = agent.getQValues('_________');
      const second = agent.getQValues('_________');
      assert.equal(first, second);
    });
  });

  describe('chooseMove', () => {
    it('returns a valid move', async () => {
      const game = new TicTacToe();
      const move = await agent.chooseMove(game);
      assert.ok(game.getValidMoves().includes(move));
    });

    it('with epsilon=0, picks the best Q-value move', async () => {
      const agent = new QLearningAgent({ epsilon: 0 });
      const game = new TicTacToe();

      // Seed Q-values: make position 4 (center) the best
      const values = agent.getQValues(game.getStateKey());
      values[4] = 1.0;

      const move = await agent.chooseMove(game);
      assert.equal(move, 4);
    });

    it('with epsilon=1, still returns valid moves', async () => {
      const agent = new QLearningAgent({ epsilon: 1.0 });
      const game = new TicTacToe();
      for (let i = 0; i < 20; i++) {
        const move = await agent.chooseMove(game);
        assert.ok(game.getValidMoves().includes(move));
      }
    });

    it('throws when no valid moves', async () => {
      const game = new TicTacToe();
      // Fill board to force a draw
      [0, 1, 2, 5, 3, 6, 4, 8, 7].forEach(m => game.makeMove(m));
      await assert.rejects(() => agent.chooseMove(game), /No valid moves/);
    });
  });

  describe('bestMove', () => {
    it('picks the move with highest Q-value among valid moves', () => {
      const game = new TicTacToe();
      game.makeMove(0); // X at 0
      game.makeMove(4); // O at 4

      // Now X's turn, valid = [1,2,3,5,6,7,8]
      const values = agent.getQValues(game.getStateKey());
      values[2] = 0.8;
      values[5] = 0.3;

      assert.equal(agent.bestMove(game), 2);
    });

    it('randomizes among tied best Q-values', () => {
      const game = new TicTacToe();
      // All Q-values are 0 (untrained), so all 9 moves are tied
      const seen = new Set<number>();
      for (let i = 0; i < 100; i++) {
        seen.add(agent.bestMove(game));
      }
      // Should pick more than one distinct move
      assert.ok(seen.size > 1, `Expected variety but only saw moves: ${[...seen]}`);
    });
  });

  describe('update', () => {
    it('updates Q-value for terminal win state', () => {
      const state = 'XOX_O____';
      agent.getQValues(state); // init
      agent.update(state, 5, 1.0, null);

      const q = agent.getQValues(state)[5];
      // Q = 0 + 0.1 * (1.0 - 0) = 0.1
      assert.equal(q, 0.1);
    });

    it('updates Q-value considering future rewards', () => {
      const state1 = '_________';
      const state2 = 'X________';
      agent.getQValues(state1);
      agent.getQValues(state2);

      // Give state2 a known max value
      agent.getQValues(state2)[4] = 0.5;

      agent.update(state1, 0, 0, state2);

      // Q = 0 + 0.1 * (0 + 0.9 * 0.5 - 0) = 0.1 * 0.45 = 0.045
      const q = agent.getQValues(state1)[0];
      assert.ok(Math.abs(q - 0.045) < 1e-10);
    });

    it('converges with repeated updates', () => {
      const state = 'XO_______';
      agent.getQValues(state);

      // Repeatedly update with same reward
      for (let i = 0; i < 100; i++) {
        agent.update(state, 2, 1.0, null);
      }

      // Should converge toward 1.0
      const q = agent.getQValues(state)[2];
      assert.ok(q > 0.99);
    });
  });

  describe('decayEpsilon', () => {
    it('reduces epsilon by decay factor', () => {
      agent.config.epsilon = 0.5;
      agent.decayEpsilon();
      assert.ok(Math.abs(agent.config.epsilon - 0.5 * DEFAULT_CONFIG.epsilonDecay) < 1e-10);
    });

    it('does not go below epsilonMin', () => {
      agent.config.epsilon = 0.01;
      agent.decayEpsilon();
      assert.equal(agent.config.epsilon, DEFAULT_CONFIG.epsilonMin);
    });
  });

  describe('save and load', () => {
    const tmpFile = join(tmpdir(), `ql-test-${Date.now()}.json`);

    it('round-trips Q-table through JSON', () => {
      // Seed some data
      const values = agent.getQValues('XO_______');
      values[2] = 0.75;
      values[5] = -0.3;

      agent.save(tmpFile);

      const loaded = new QLearningAgent();
      loaded.load(tmpFile);

      assert.equal(loaded.tableSize, 1);
      const loadedValues = loaded.getQValues('XO_______');
      assert.equal(loadedValues[2], 0.75);
      assert.equal(loadedValues[5], -0.3);
      assert.equal(loadedValues[0], -Infinity);

      unlinkSync(tmpFile);
    });

    it('clears existing table on load', () => {
      agent.getQValues('_________');
      agent.getQValues('X________');
      assert.equal(agent.tableSize, 2);

      // Save a table with one entry
      const other = new QLearningAgent();
      other.getQValues('OX_______');
      other.save(tmpFile);

      agent.load(tmpFile);
      assert.equal(agent.tableSize, 1);
      assert.ok(agent.qTable.has('OX_______'));

      unlinkSync(tmpFile);
    });
  });

  describe('self-play training smoke test', () => {
    it('learns to beat random play after training episodes', async () => {
      const agent = new QLearningAgent({ epsilon: 1.0, epsilonDecay: 0.995 });

      // Run a small training loop (1000 episodes of self-play)
      for (let ep = 0; ep < 1000; ep++) {
        const game = new TicTacToe();
        const history: { player: 'X' | 'O'; state: string; action: number }[] = [];

        while (game.winner === null) {
          const state = game.getStateKey();
          const action = await agent.chooseMove(game);
          history.push({ player: game.currentPlayer, state, action });
          game.makeMove(action);
        }

        // Assign rewards and update
        for (let i = history.length - 1; i >= 0; i--) {
          const { player, state, action } = history[i];
          const nextEntry = history.slice(i + 1).find(h => h.player === player);
          const nextState = nextEntry ? nextEntry.state : null;

          let reward = 0;
          if (game.winner === 'draw') {
            reward = i === history.length - 1 || i === history.length - 2
              ? agent.rewards.draw : 0;
          } else if (game.winner === player) {
            reward = i === history.length - 1 || i === history.length - 2
              ? agent.rewards.win : 0;
          } else {
            reward = i === history.length - 1 || i === history.length - 2
              ? agent.rewards.loss : 0;
          }

          agent.update(state, action, reward, nextState);
        }

        agent.decayEpsilon();
      }

      // Now evaluate: play 200 games as X vs random (greedy, no exploration)
      agent.config.epsilon = 0;
      let wins = 0;
      const { RandomAgent } = await import('../src/agents/RandomAgent.js');
      const random = new RandomAgent();

      for (let i = 0; i < 200; i++) {
        const game = new TicTacToe();
        while (game.winner === null) {
          const move = game.currentPlayer === 'X'
            ? agent.bestMove(game)
            : await random.chooseMove(game);
          game.makeMove(move);
        }
        if (game.winner === 'X') wins++;
      }

      // After 1000 episodes, should win at least 60% vs random
      assert.ok(wins >= 120, `Expected >= 120 wins, got ${wins}`);
      assert.ok(agent.tableSize > 0);
    });
  });
});
