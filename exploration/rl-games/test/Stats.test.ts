import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Stats } from '../src/utils/stats.js';

describe('Stats', () => {
  let stats: Stats;

  beforeEach(() => {
    stats = new Stats();
  });

  describe('record and winRate', () => {
    it('returns 0 for empty stats', () => {
      assert.equal(stats.winRate('X'), 0);
      assert.equal(stats.winRate('O'), 0);
      assert.equal(stats.drawRate(), 0);
    });

    it('computes correct win rates', () => {
      stats.record({ winner: 'X', moves: 5 });
      stats.record({ winner: 'X', moves: 7 });
      stats.record({ winner: 'O', moves: 6 });
      stats.record({ winner: 'draw', moves: 9 });

      assert.equal(stats.winRate('X'), 0.5);
      assert.equal(stats.winRate('O'), 0.25);
      assert.equal(stats.drawRate(), 0.25);
    });

    it('returns 1.0 when all games are won by one player', () => {
      stats.record({ winner: 'X', moves: 5 });
      stats.record({ winner: 'X', moves: 7 });

      assert.equal(stats.winRate('X'), 1.0);
      assert.equal(stats.winRate('O'), 0);
      assert.equal(stats.drawRate(), 0);
    });
  });

  describe('summary', () => {
    it('handles empty stats', () => {
      const output = stats.summary('Test');
      assert.ok(output.includes('0 games'));
      assert.ok(output.includes('No results recorded'));
    });

    it('displays correct counts and percentages', () => {
      stats.record({ winner: 'X', moves: 5 });
      stats.record({ winner: 'X', moves: 7 });
      stats.record({ winner: 'O', moves: 6 });
      stats.record({ winner: 'draw', moves: 9 });

      const output = stats.summary('Test Match');

      assert.ok(output.includes('Test Match'));
      assert.ok(output.includes('4 games'));
      assert.ok(output.includes('X wins:'));
      assert.ok(output.includes('50.0%'));
      assert.ok(output.includes('O wins:'));
      assert.ok(output.includes('25.0%'));
      assert.ok(output.includes('Draws:'));
      assert.ok(output.includes('6.8 moves'));
    });

    it('omits invalid move rate when no invalid moves', () => {
      stats.record({ winner: 'X', moves: 5 });
      const output = stats.summary('Clean');
      assert.ok(!output.includes('Invalid move rate'));
    });

    it('includes invalid move rate when present', () => {
      stats.record({ winner: 'X', moves: 10, invalidMoveCount: 2 });
      stats.record({ winner: 'O', moves: 10, invalidMoveCount: 0 });

      const output = stats.summary('With Invalids');
      assert.ok(output.includes('Invalid move rate'));
      assert.ok(output.includes('10.0%')); // 2 invalid out of 20 total moves
    });
  });
});
