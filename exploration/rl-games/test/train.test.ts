import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TicTacToe } from '../src/games/tic-tac-toe/TicTacToe.js';
import { QLearningAgent } from '../src/agents/QLearningAgent.js';
import { playSelfPlayGame, updateFromGame, evaluate } from '../src/training/train.js';

describe('train helpers', () => {
  describe('playSelfPlayGame', () => {
    it('returns a complete game history', () => {
      const agent = new QLearningAgent({ epsilon: 1.0 }); // fully random
      const game = new TicTacToe();
      const history = playSelfPlayGame(agent, game);

      // Game should be over
      assert.notEqual(game.winner, null);
      // History should have between 5 and 9 entries (min 5 moves for a win, max 9 for full board)
      assert.ok(history.length >= 5 && history.length <= 9,
        `Expected 5-9 moves, got ${history.length}`);
    });

    it('alternates players in history', () => {
      const agent = new QLearningAgent({ epsilon: 1.0 });
      const game = new TicTacToe();
      const history = playSelfPlayGame(agent, game);

      // First move is always X
      assert.equal(history[0].player, 'X');
      // Players should alternate
      for (let i = 1; i < history.length; i++) {
        assert.notEqual(history[i].player, history[i - 1].player);
      }
    });

    it('records valid states and actions', () => {
      const agent = new QLearningAgent({ epsilon: 1.0 });
      const game = new TicTacToe();
      const history = playSelfPlayGame(agent, game);

      for (const { state, action } of history) {
        assert.equal(state.length, 9);
        assert.ok(action >= 0 && action <= 8);
        // The action should be for an empty cell in that state
        assert.equal(state[action], '_');
      }
    });
  });

  describe('updateFromGame', () => {
    it('creates Q-table entries for visited states', () => {
      const agent = new QLearningAgent({ epsilon: 1.0 });
      const game = new TicTacToe();
      const history = playSelfPlayGame(agent, game);

      assert.equal(agent.tableSize, 0);
      updateFromGame(agent, game, history);

      // Should have entries for each unique state visited
      assert.ok(agent.tableSize > 0);
    });

    it('assigns positive Q-values for winning moves', () => {
      const agent = new QLearningAgent();
      const game = new TicTacToe();

      // Play a specific game: X wins with top row (0,1,2)
      // X:0, O:3, X:1, O:4, X:2 → X wins
      game.makeMove(0); game.makeMove(3); game.makeMove(1); game.makeMove(4); game.makeMove(2);

      const history = [
        { player: 'X' as const, state: '_________', action: 0 },
        { player: 'O' as const, state: 'X________', action: 3 },
        { player: 'X' as const, state: 'X__O_____', action: 1 },
        { player: 'O' as const, state: 'XX_O_____', action: 4 },
        { player: 'X' as const, state: 'XX_OO____', action: 2 },
      ];

      updateFromGame(agent, game, history);

      // X's winning move (position 2 in state "XX_OO____") should have positive Q-value
      const winningQ = agent.getQValues('XX_OO____')[2];
      assert.ok(winningQ > 0, `Expected positive Q for winning move, got ${winningQ}`);

      // O's last move should have negative Q-value (it lost)
      const losingQ = agent.getQValues('XX_O_____')[4];
      assert.ok(losingQ < 0, `Expected negative Q for losing move, got ${losingQ}`);
    });
  });

  describe('evaluate', () => {
    it('returns win/draw/loss counts that sum to numGames', () => {
      const agent = new QLearningAgent({ epsilon: 0 });
      const { wins, draws, losses } = evaluate(agent, 100);
      assert.equal(wins + draws + losses, 100);
    });

    it('trained agent beats random most of the time', () => {
      // Quick train: 2000 episodes
      const agent = new QLearningAgent({ epsilon: 1.0, epsilonDecay: 0.998 });
      const game = new TicTacToe();

      for (let ep = 0; ep < 2000; ep++) {
        const history = playSelfPlayGame(agent, game);
        updateFromGame(agent, game, history);
        agent.decayEpsilon();
      }

      agent.config.epsilon = 0;
      const { wins, losses } = evaluate(agent, 200);

      // Should win significantly more than it loses
      assert.ok(wins > losses * 2, `Expected wins (${wins}) >> losses (${losses})`);
      assert.ok(wins >= 100, `Expected >= 100 wins out of 200, got ${wins}`);
    });
  });
});
