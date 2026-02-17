import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RandomAgent } from '../src/agents/RandomAgent.js';
import { runMatchup } from '../src/experiments/baseline.js';

describe('baseline', () => {
  describe('runMatchup', () => {
    it('returns stats with correct game count', async () => {
      const stats = await runMatchup(new RandomAgent(), new RandomAgent(), 50);
      const xRate = stats.winRate('X');
      const oRate = stats.winRate('O');
      const dRate = stats.drawRate();
      // Rates should sum to 1.0
      assert.ok(Math.abs(xRate + oRate + dRate - 1.0) < 0.001);
    });

    it('Random vs Random produces expected distribution over many games', async () => {
      const stats = await runMatchup(new RandomAgent(), new RandomAgent(), 2000);
      const xRate = stats.winRate('X');
      const oRate = stats.winRate('O');
      const dRate = stats.drawRate();

      // Expected: X ~58%, O ~29%, Draw ~13% (with tolerance for 2000 games)
      assert.ok(xRate > 0.50 && xRate < 0.66, `X win rate ${(xRate * 100).toFixed(1)}% outside 50-66%`);
      assert.ok(oRate > 0.22 && oRate < 0.36, `O win rate ${(oRate * 100).toFixed(1)}% outside 22-36%`);
      assert.ok(dRate > 0.06 && dRate < 0.20, `Draw rate ${(dRate * 100).toFixed(1)}% outside 6-20%`);
    });

    it('summary output includes label and game count', async () => {
      const stats = await runMatchup(new RandomAgent(), new RandomAgent(), 10);
      const summary = stats.summary('Test Label');
      assert.ok(summary.includes('Test Label'));
      assert.ok(summary.includes('10 games'));
    });
  });
});
