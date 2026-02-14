# Node.js Best Practices
## AI Board Game Agent System

**Version:** 1.0
**Date:** February 13, 2026

---

## Overview

This document outlines Node.js best practices for the AI Board Game Agent system.

---

## General Principles

### Use Latest LTS Version
- Use Node.js 18 or later (LTS versions)
- Keep Node.js updated for security patches
- Test compatibility with new versions

### Environment Configuration
- Use environment variables for configuration
- Never commit secrets to version control
- Use `.env` files for local development
- Validate environment variables on startup

---

## Project Structure

### Recommended Structure

```
ai-board-game-agent/
├── src/
│   ├── core/              # Core business logic
│   ├── data/              # Data access layer
│   ├── providers/         # AI providers
│   ├── services/          # Application services
│   ├── cli/               # CLI interface
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── migrations/            # Database migrations
├── tests/                 # Test files
├── config/                # Configuration files
├── scripts/               # Build/deployment scripts
├── .env.example           # Example environment file
├── package.json
├── tsconfig.json
└── README.md
```

---

## Package Management

### Use npm or pnpm
- Lock dependencies with `package-lock.json` or `pnpm-lock.yaml`
- Commit lock files to version control
- Audit dependencies regularly: `npm audit` or `pnpm audit`

### Semantic Versioning

```json
{
  "dependencies": {
    "express": "^4.18.0",      // Compatible updates (4.x.x)
    "typeorm": "~0.3.20",       // Patch updates only (0.3.x)
    "lodash": "4.17.21"         // Exact version
  }
}
```

### Scripts

```json
{
  "scripts": {
    "start": "node dist/index.js",
    "dev": "ts-node-dev --respawn src/index.ts",
    "build": "tsc",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:generate": "npm run typeorm migration:generate",
    "migration:run": "npm run typeorm migration:run",
    "migration:revert": "npm run typeorm migration:revert"
  }
}
```

---

## Environment Variables

### Using dotenv

```typescript
// Load at application start
import 'dotenv/config';

// Access environment variables
const dbHost = process.env.DB_HOST;
const dbPort = parseInt(process.env.DB_PORT || '5432');
```

### Environment Validation

```typescript
// config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number),
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional()
});

export const env = envSchema.parse(process.env);
```

### .env.example

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=board_games

# AI Providers
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here

# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
```

---

## Error Handling

### Centralized Error Handler

```typescript
// errors/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// errors/handler.ts
export function handleError(error: Error): void {
  if (error instanceof AppError && error.isOperational) {
    logger.error(error.message, { error });
  } else {
    logger.fatal('Unexpected error occurred', { error });
    process.exit(1);
  }
}

// Catch unhandled rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection', { reason });
  handleError(reason);
});

// Catch uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.fatal('Uncaught Exception', { error });
  handleError(error);
});
```

### Try-Catch Best Practices

```typescript
// ✅ Handle specific errors
async function loadGame(id: string): Promise<Game> {
  try {
    return await gameRepository.findById(id);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw new AppError('Failed to load game', 500);
    }
    throw error;
  }
}

// ✅ Cleanup resources in finally
async function processFile(path: string): Promise<void> {
  const file = await fs.open(path);
  try {
    await processData(file);
  } finally {
    await file.close();
  }
}
```

---

## Logging

### Structured Logging with Pino

```typescript
// logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty' }
      : undefined
});

// Usage
logger.info('Game started', { gameId, players: players.length });
logger.error('Failed to process move', { error, gameId, move });
logger.debug('State updated', { state });
```

### Log Levels
- `fatal`: Application crash
- `error`: Error that needs attention
- `warn`: Warning that should be investigated
- `info`: General information
- `debug`: Detailed information for debugging
- `trace`: Very detailed information

### What to Log

```typescript
// ✅ Log important events
logger.info('Game session created', { sessionId, gameId });

// ✅ Log errors with context
logger.error('Move validation failed', {
  error: error.message,
  gameId,
  move,
  state
});

// ✅ Log performance metrics
logger.info('AI move generated', {
  duration: Date.now() - start,
  provider: 'claude',
  tokensUsed
});

// ❌ Don't log sensitive data
logger.info('User authenticated', { apiKey }); // NO!

// ❌ Don't log in tight loops
for (const item of items) {
  logger.debug('Processing item', { item }); // NO!
}
```

---

## Async Operations

### Promises and Async/Await

```typescript
// ✅ Use async/await
async function processGame(): Promise<void> {
  const game = await loadGame();
  const result = await playMove(game);
  await saveResult(result);
}

// ✅ Handle errors
async function safeProcessGame(): Promise<void> {
  try {
    await processGame();
  } catch (error) {
    logger.error('Game processing failed', { error });
    throw error;
  }
}

// ✅ Parallel execution
async function loadGameData(id: string): Promise<GameData> {
  const [game, sessions, players] = await Promise.all([
    gameRepository.findById(id),
    sessionRepository.findByGameId(id),
    playerRepository.findByGameId(id)
  ]);
  return { game, sessions, players };
}

// ✅ Sequential with error recovery
async function processWithRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Event Loop Considerations

```typescript
// ❌ Don't block the event loop
function blockingOperation() {
  const result = someSyncHeavyOperation(); // Blocks!
  return result;
}

// ✅ Use async for I/O operations
async function nonBlockingOperation() {
  const result = await someAsyncOperation();
  return result;
}

// ✅ Offload CPU-intensive work to worker threads
import { Worker } from 'worker_threads';

function heavyComputation(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./compute-worker.js', { workerData: data });
    worker.on('message', resolve);
    worker.on('error', reject);
  });
}
```

---

## Memory Management

### Avoid Memory Leaks

```typescript
// ❌ Global event listeners without cleanup
emitter.on('event', handler); // Potential leak!

// ✅ Clean up event listeners
class GameSession {
  private handlers: Map<string, Function> = new Map();

  subscribe(event: string, handler: Function) {
    this.handlers.set(event, handler);
    emitter.on(event, handler);
  }

  cleanup() {
    this.handlers.forEach((handler, event) => {
      emitter.off(event, handler);
    });
    this.handlers.clear();
  }
}

// ✅ Use weak references for caches
const cache = new WeakMap<object, CachedData>();
```

### Stream Processing

```typescript
// ✅ Use streams for large data
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';

async function compressFile(input: string, output: string) {
  await pipeline(
    createReadStream(input),
    createGzip(),
    createWriteStream(output)
  );
}

// ✅ Backpressure handling
import { Readable } from 'stream';

const readable = new Readable({
  read() {
    // Only push when there's demand
    this.push(getNextChunk());
  }
});
```

---

## Security

### Input Validation

```typescript
// ✅ Validate all inputs
import { z } from 'zod';

const moveSchema = z.object({
  playerId: z.string().uuid(),
  action: z.string(),
  position: z.object({
    x: z.number().int().min(0).max(7),
    y: z.number().int().min(0).max(7)
  })
});

function validateMove(input: unknown): Move {
  return moveSchema.parse(input);
}
```

### SQL Injection Prevention

```typescript
// ✅ Use parameterized queries (TypeORM does this automatically)
const games = await gameRepository
  .createQueryBuilder('game')
  .where('game.name = :name', { name: userInput })
  .getMany();

// ❌ Never concatenate SQL
const query = `SELECT * FROM games WHERE name = '${userInput}'`; // NO!
```

### Environment Variables

```typescript
// ✅ Never expose secrets
app.get('/config', (req, res) => {
  res.json({
    version: process.env.VERSION,
    environment: process.env.NODE_ENV
    // ❌ Don't include: API_KEY, DB_PASSWORD, etc.
  });
});
```

---

## Performance

### Database Connections

```typescript
// ✅ Use connection pooling
const dataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  extra: {
    max: 20, // Max connections in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  }
});
```

### Caching

```typescript
// Simple in-memory cache
class Cache<T> {
  private cache = new Map<string, { value: T; expires: number }>();

  set(key: string, value: T, ttl: number = 60000) {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

const gameCache = new Cache<Game>();
```

### Batch Operations

```typescript
// ✅ Batch database operations
async function saveMultipleMoves(moves: Move[]): Promise<void> {
  await moveRepository.save(moves); // Single query
}

// ❌ Don't do one-by-one
async function saveMovesSlowly(moves: Move[]): Promise<void> {
  for (const move of moves) {
    await moveRepository.save(move); // N queries!
  }
}
```

---

## Testing

### Unit Tests with Jest

```typescript
// game-engine.spec.ts
import { GameEngine } from './game-engine';
import { RulesEngine } from './rules-engine';

describe('GameEngine', () => {
  let gameEngine: GameEngine;
  let rulesEngine: RulesEngine;

  beforeEach(() => {
    rulesEngine = new RulesEngine();
    gameEngine = new GameEngine(rulesEngine);
  });

  it('should process valid move', async () => {
    const move = createTestMove();
    const result = await gameEngine.processMove(move);
    expect(result.success).toBe(true);
  });

  it('should reject invalid move', async () => {
    const invalidMove = createInvalidMove();
    await expect(gameEngine.processMove(invalidMove)).rejects.toThrow();
  });
});
```

### Integration Tests

```typescript
// game-flow.integration.spec.ts
describe('Game Flow Integration', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await createTestDatabase();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should complete full game flow', async () => {
    const game = await createGame('Chess');
    const session = await startSession(game.id);

    // Play moves
    await playMove(session.id, move1);
    await playMove(session.id, move2);

    const result = await getSessionStatus(session.id);
    expect(result.status).toBe('completed');
  });
});
```

---

## Process Management

### Graceful Shutdown

```typescript
// app.ts
async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received, starting graceful shutdown`);

  // Stop accepting new requests
  server.close(() => {
    logger.info('HTTP server closed');
  });

  // Close database connections
  await dataSource.destroy();
  logger.info('Database connections closed');

  // Cleanup resources
  await cleanupResources();

  logger.info('Graceful shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

### Health Checks

```typescript
// health.ts
export async function checkHealth(): Promise<HealthStatus> {
  const checks = await Promise.all([
    checkDatabase(),
    checkAIProviders(),
    checkMemoryUsage()
  ]);

  const isHealthy = checks.every(check => check.status === 'ok');

  return {
    status: isHealthy ? 'ok' : 'error',
    checks
  };
}

async function checkDatabase(): Promise<HealthCheck> {
  try {
    await dataSource.query('SELECT 1');
    return { name: 'database', status: 'ok' };
  } catch (error) {
    return { name: 'database', status: 'error', error: error.message };
  }
}
```

---

## Module System

### ES Modules vs CommonJS

```typescript
// Use CommonJS for Node.js
// package.json
{
  "type": "commonjs" // or omit this line
}

// Import/Export
const express = require('express');
module.exports = { GameEngine };

// Or use ES Modules
// package.json
{
  "type": "module"
}

// Import/Export
import express from 'express';
export { GameEngine };
```

---

## Common Pitfalls

### ❌ Blocking the Event Loop

```typescript
// Bad
const result = fs.readFileSync('file.txt'); // Blocks!

// Good
const result = await fs.promises.readFile('file.txt');
```

### ❌ Not Handling Promise Rejections

```typescript
// Bad
someAsyncFunction(); // Unhandled promise rejection!

// Good
someAsyncFunction().catch(error => logger.error('Error', { error }));
// Or
await someAsyncFunction();
```

### ❌ Callback Hell

```typescript
// Bad
getData((err, data) => {
  if (err) return handleError(err);
  processData(data, (err, result) => {
    if (err) return handleError(err);
    saveResult(result, (err) => {
      if (err) return handleError(err);
      done();
    });
  });
});

// Good
try {
  const data = await getData();
  const result = await processData(data);
  await saveResult(result);
  done();
} catch (error) {
  handleError(error);
}
```

---

## Summary

- Use **Node.js LTS** versions (18+)
- Manage configuration with **environment variables**
- Implement **centralized error handling**
- Use **structured logging** (Pino)
- Prefer **async/await** over callbacks
- Use **connection pooling** for databases
- Implement **graceful shutdown**
- Write **unit and integration tests**
- Avoid **blocking the event loop**
- Handle **unhandled promise rejections**
- Use **streams** for large data
- Implement **health checks**

---

**Document End**
