# Code Style Guide
## AI Board Game Agent System

**Version:** 1.0
**Date:** February 13, 2026

---

## Overview

This document defines the code style standards for the AI Board Game Agent system.

---

## General Principles

### Consistency
- Follow established patterns in the codebase
- Use automated formatters (Prettier)
- Use linters (ESLint)
- Code should look like one person wrote it

### Readability
- Write self-documenting code
- Use clear, descriptive names
- Keep functions small and focused
- Avoid clever tricks

### Maintainability
- Write code that's easy to change
- Minimize coupling
- Keep related code together
- Don't repeat yourself (DRY)

---

## Naming Conventions

### Variables

```typescript
// ✅ camelCase for variables
const playerCount = 2;
const currentGame = getGame();
const isGameActive = true;

// ✅ Descriptive names
const gameSessionId = 'uuid';
const maxRetryAttempts = 3;

// ❌ Avoid abbreviations
const usr = getUser(); // Bad
const user = getUser(); // Good

// ❌ Avoid single letters (except loops)
const p = getPlayer(); // Bad
const player = getPlayer(); // Good

// ✅ Single letters OK in loops
for (let i = 0; i < items.length; i++) {
  // OK
}
```

### Functions

```typescript
// ✅ camelCase, start with verb
function calculateScore(moves: Move[]): number { }
function validateMove(move: Move): boolean { }
function isGameComplete(state: GameState): boolean { }

// ✅ Boolean functions start with is/has/should/can
function isValid(move: Move): boolean { }
function hasWinner(state: GameState): boolean { }
function shouldRetry(error: Error): boolean { }
function canProcessMove(player: Player): boolean { }

// ✅ Async functions clearly named
async function loadGame(id: string): Promise<Game> { }
async function saveGameState(state: GameState): Promise<void> { }
```

### Classes

```typescript
// ✅ PascalCase for classes
class GameEngine { }
class RulesEngine { }
class ClaudeProvider { }

// ✅ Descriptive, singular nouns
class Player { }
class Session { }
class Move { }

// ✅ Use descriptive names for service classes
class GameSessionManager { }
class MoveValidator { }
class StateRepository { }
```

### Interfaces and Types

```typescript
// ✅ PascalCase, descriptive names
interface GameState {
  board: Board;
  currentPlayer: number;
  moveHistory: Move[];
}

interface Player {
  id: string;
  type: PlayerType;
}

// ✅ Type aliases for unions/primitives
type PlayerType = 'human' | 'ai' | 'ai_rl';
type Result<T> = Success<T> | Failure;

// ❌ Don't prefix with 'I'
interface IPlayer { } // Bad
interface Player { } // Good
```

### Constants

```typescript
// ✅ UPPER_SNAKE_CASE for true constants
const MAX_PLAYERS = 10;
const DEFAULT_TIMEOUT_MS = 5000;
const API_BASE_URL = 'https://api.example.com';

// ✅ camelCase for config objects
const config = {
  maxRetries: 3,
  timeoutMs: 5000,
  apiKey: process.env.API_KEY
};

// ✅ Enum values in PascalCase or UPPER_CASE
enum PlayerType {
  Human = 'human',
  AI = 'ai',
  AI_RL = 'ai_rl'
}
```

### Files and Directories

```typescript
// ✅ kebab-case for files
game-engine.ts
rules-engine.ts
claude-provider.ts

// ✅ PascalCase for class files (alternative)
GameEngine.ts
RulesEngine.ts
ClaudeProvider.ts

// ✅ Directories in kebab-case or lowercase
src/core/game-engine/
src/providers/
src/utils/
```

---

## Code Formatting

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### Indentation

```typescript
// ✅ 2 spaces for indentation
function processMove(move: Move): void {
  if (isValid(move)) {
    applyMove(move);
  }
}

// ✅ Consistent indentation in objects
const config = {
  database: {
    host: 'localhost',
    port: 5432,
  },
  server: {
    port: 3000,
  },
};
```

### Line Length

```typescript
// ✅ Max 100 characters per line
const result = gameEngine.processMove(
  move,
  currentState,
  {
    validateRules: true,
    recordHistory: true,
  }
);

// ✅ Break long chains
const players = session
  .getPlayers()
  .filter(p => p.isActive)
  .map(p => p.id)
  .sort();
```

### Spacing

```typescript
// ✅ Space after keywords
if (condition) { }
for (let i = 0; i < 10; i++) { }
while (running) { }

// ✅ Space around operators
const sum = a + b;
const isEqual = x === y;

// ✅ No space before function parens
function myFunction() { }
const arrow = () => { };

// ✅ Space in destructuring
const { name, age } = user;
const [first, second] = array;
```

---

## Functions

### Function Length

```typescript
// ✅ Keep functions short (< 20 lines ideal)
function calculateScore(moves: Move[]): number {
  return moves.reduce((sum, move) => sum + move.points, 0);
}

// ❌ Too long, break into smaller functions
function processGameSession() {
  // 100 lines of code...
}

// ✅ Better - broken into smaller functions
function processGameSession() {
  validateSession();
  initializePlayers();
  runGameLoop();
  finalizeResults();
}
```

### Function Parameters

```typescript
// ✅ Max 3-4 parameters
function createGame(name: string, rules: string, strategy: string): Game { }

// ❌ Too many parameters
function createGame(name: string, rules: string, strategy: string,
  playerCount: number, aiProvider: string, difficulty: string) { }

// ✅ Use options object for many parameters
interface GameOptions {
  playerCount: number;
  aiProvider: string;
  difficulty: string;
}

function createGame(name: string, rules: string, options: GameOptions): Game { }
```

### Return Early

```typescript
// ✅ Return early for error conditions
function processMove(move: Move | null): MoveResult {
  if (!move) {
    return { success: false, error: 'Move is required' };
  }

  if (!isValid(move)) {
    return { success: false, error: 'Invalid move' };
  }

  // Main logic
  return { success: true, state: newState };
}

// ❌ Nested conditions
function processMove(move: Move | null): MoveResult {
  if (move) {
    if (isValid(move)) {
      // Main logic
      return { success: true, state: newState };
    } else {
      return { success: false, error: 'Invalid move' };
    }
  } else {
    return { success: false, error: 'Move is required' };
  }
}
```

---

## Comments

### When to Comment

```typescript
// ✅ Comment WHY, not WHAT
// Calculate score using exponential decay to favor recent moves
const score = moves.reduce((sum, move, index) => {
  return sum + move.points * Math.pow(0.95, moves.length - index);
}, 0);

// ❌ Don't comment obvious code
// Increment i by 1
i++;

// Add move to history
history.push(move);
```

### Documentation Comments

```typescript
/**
 * Processes a move and updates the game state.
 *
 * @param move - The move to process
 * @param state - The current game state
 * @returns The new game state after applying the move
 * @throws {ValidationError} If the move is invalid
 */
function processMove(move: Move, state: GameState): GameState {
  // Implementation
}

/**
 * Represents a player in the game.
 */
interface Player {
  /** Unique player identifier */
  id: string;

  /** Player type (human, AI, or AI with RL) */
  type: PlayerType;
}
```

### TODO Comments

```typescript
// TODO: Implement caching for expensive operations
// FIXME: Handle edge case when player disconnects mid-game
// NOTE: This is a temporary workaround until API v2 is released
// HACK: Quick fix for demo, needs proper implementation
```

---

## Error Handling

### Use Custom Errors

```typescript
// ✅ Custom error classes
class GameError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'GameError';
  }
}

class ValidationError extends GameError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

// Usage
throw new ValidationError('Invalid move position');
```

### Handle Errors Appropriately

```typescript
// ✅ Handle specific errors
try {
  await processMove(move);
} catch (error) {
  if (error instanceof ValidationError) {
    logger.warn('Invalid move', { error });
    return { success: false, error: error.message };
  }

  if (error instanceof DatabaseError) {
    logger.error('Database error', { error });
    throw new GameError('Failed to process move', 'DATABASE_ERROR');
  }

  throw error;
}

// ❌ Swallowing errors
try {
  await processMove(move);
} catch (error) {
  // Silent failure - BAD!
}

// ❌ Generic error handling
try {
  await processMove(move);
} catch (error) {
  console.log('Error'); // Not helpful!
}
```

---

## Imports and Exports

### Import Order

```typescript
// 1. Node built-ins
import { readFile } from 'fs/promises';

// 2. External dependencies
import express from 'express';
import { DataSource } from 'typeorm';

// 3. Internal modules (absolute imports)
import { GameEngine } from '@/core/game-engine';
import { RulesEngine } from '@/core/rules-engine';

// 4. Relative imports
import { validateMove } from './validators';
import { GameState } from './types';

// 5. Type imports (separate)
import type { Player, Move } from '@/types';
```

### Export Conventions

```typescript
// ✅ Named exports (preferred)
export class GameEngine { }
export function validateMove() { }
export const MAX_PLAYERS = 10;

// ✅ Default export for main class
export default class RulesEngine { }

// ✅ Barrel exports (index.ts)
export { GameEngine } from './game-engine';
export { RulesEngine } from './rules-engine';
export * from './types';
```

---

## TypeScript Specific

### Type Annotations

```typescript
// ✅ Explicit return types for public functions
export function calculateScore(moves: Move[]): number {
  return moves.reduce((sum, m) => sum + m.points, 0);
}

// ✅ Type inference for simple cases
const count = 5; // Inferred as number
const name = 'Chess'; // Inferred as string

// ✅ Explicit types for complex cases
const config: GameConfig = {
  maxPlayers: 10,
  timeoutMs: 5000,
};
```

### Avoid Any

```typescript
// ❌ Using any
function process(data: any) {
  return data.value;
}

// ✅ Use specific types
function process(data: GameData) {
  return data.value;
}

// ✅ Use generics
function process<T>(data: T): T {
  return data;
}

// ✅ Use unknown with type guards
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value;
  }
  throw new Error('Invalid data');
}
```

---

## Class Design

### Single Responsibility

```typescript
// ✅ Class with single responsibility
class MoveValidator {
  validate(move: Move, state: GameState): boolean {
    return this.validatePosition(move) && this.validateTurn(move, state);
  }

  private validatePosition(move: Move): boolean { }
  private validateTurn(move: Move, state: GameState): boolean { }
}

// ❌ Class doing too much
class GameManager {
  validateMove() { }
  processMove() { }
  saveToDatabase() { }
  sendNotification() { }
  generateReport() { }
  // Too many responsibilities!
}
```

### Dependency Injection

```typescript
// ✅ Constructor injection
class GameEngine {
  constructor(
    private readonly rulesEngine: RulesEngine,
    private readonly repository: GameRepository,
    private readonly logger: Logger
  ) {}

  async processMove(move: Move): Promise<MoveResult> {
    this.logger.info('Processing move');
    // Use injected dependencies
  }
}

// ❌ Creating dependencies internally
class GameEngine {
  private rulesEngine = new RulesEngine();
  private repository = new GameRepository();
  // Hard to test!
}
```

---

## Best Practices Summary

### Do's ✅

- Use **descriptive names** for variables, functions, classes
- Keep functions **short and focused** (< 20 lines)
- Write **self-documenting code**
- Use **early returns** to reduce nesting
- Handle **errors explicitly**
- Use **TypeScript types** properly
- Follow **consistent formatting** (Prettier)
- Write **comments for WHY, not WHAT**
- Use **dependency injection**
- Follow **single responsibility principle**

### Don'ts ❌

- Don't use **abbreviations** unnecessarily
- Don't write **long functions** (> 50 lines)
- Don't **swallow errors** silently
- Don't use **any** type
- Don't create **god classes** (too many responsibilities)
- Don't **repeat code** (DRY principle)
- Don't commit **commented-out code**
- Don't use **magic numbers** (use constants)
- Don't write **clever code** (write clear code)
- Don't skip **error handling**

---

## ESLint Configuration

```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "max-lines": ["warn", 300],
    "max-lines-per-function": ["warn", 50],
    "complexity": ["warn", 10]
  }
}
```

---

**Document End**
