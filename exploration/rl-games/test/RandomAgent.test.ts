import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TicTacToe } from '../src/games/tic-tac-toe/TicTacToe.js';
import { RandomAgent } from '../src/agents/RandomAgent.js';

describe('RandomAgent', () => {
  it('returns a valid move', async () => {
    const agent = new RandomAgent();
    const game = new TicTacToe();
    game.makeMove(0);
    game.makeMove(4);

    const move = await agent.chooseMove(game);
    assert.ok(game.getValidMoves().includes(move), `Move ${move} should be valid`);
  });

  it('has the name "Random"', () => {
    const agent = new RandomAgent();
    assert.equal(agent.name, 'Random');
  });

  it('picks different moves over many calls (not stuck on one)', async () => {
    const agent = new RandomAgent();
    const game = new TicTacToe(); // 9 valid moves
    const seen = new Set<number>();

    for (let i = 0; i < 50; i++) {
      seen.add(await agent.chooseMove(game));
    }

    assert.ok(seen.size > 1, 'Agent should pick more than one distinct move');
  });

  describe('Random vs Random statistics', () => {
    async function playGame(agentX: RandomAgent, agentO: RandomAgent): Promise<'X' | 'O' | 'draw'> {
      const game = new TicTacToe();
      while (game.winner === null) {
        const agent = game.currentPlayer === 'X' ? agentX : agentO;
        const move = await agent.chooseMove(game);
        game.makeMove(move);
      }
      return game.winner;
    }

    it('produces approximate 58/29/13 win distribution over 5000 games', async () => {
      const agentX = new RandomAgent();
      const agentO = new RandomAgent();
      const counts = { X: 0, O: 0, draw: 0 };
      const GAMES = 5000;

      for (let i = 0; i < GAMES; i++) {
        counts[await playGame(agentX, agentO)]++;
      }

      const xRate = counts.X / GAMES;
      const oRate = counts.O / GAMES;
      const drawRate = counts.draw / GAMES;

      // Expected: X ~58%, O ~29%, Draw ~13%
      // Allow +/-5% margin for randomness
      assert.ok(xRate > 0.50 && xRate < 0.66,
        `X win rate ${(xRate * 100).toFixed(1)}% should be ~58% (50-66%)`);
      assert.ok(oRate > 0.22 && oRate < 0.36,
        `O win rate ${(oRate * 100).toFixed(1)}% should be ~29% (22-36%)`);
      assert.ok(drawRate > 0.07 && drawRate < 0.20,
        `Draw rate ${(drawRate * 100).toFixed(1)}% should be ~13% (7-20%)`);
    });
  });
});
