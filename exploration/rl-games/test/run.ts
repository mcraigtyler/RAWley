import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { run } from 'node:test';
import { spec } from 'node:test/reporters';

const testDir = new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const files = readdirSync(testDir)
  .filter(f => f.endsWith('.test.ts'))
  .map(f => join(testDir, f));

run({ files })
  .on('test:fail', () => { process.exitCode = 1; })
  .compose(spec)
  .pipe(process.stdout);
