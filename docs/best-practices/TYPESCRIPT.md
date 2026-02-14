# TypeScript Best Practices
## AI Board Game Agent System

**Version:** 1.0
**Date:** February 13, 2026

---

## Overview

This document outlines TypeScript best practices for the AI Board Game Agent system.

---

## General Principles

### Strict Mode
- Always use strict mode in `tsconfig.json`
- Enable all strict type-checking options

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### Type Safety
- Avoid `any` type - use `unknown` if type is truly unknown
- Use type guards to narrow types
- Prefer interfaces for object shapes
- Use type aliases for unions and complex types

---

## Type Definitions

### Interfaces vs Types

**Use interfaces for:**
- Object shapes
- Contracts that can be implemented
- When you need declaration merging

```typescript
interface Player {
  id: string;
  name: string;
  type: PlayerType;
}

interface AIPlayer extends Player {
  provider: string;
  config: AIConfig;
}
```

**Use type aliases for:**
- Unions and intersections
- Primitive types
- Tuples
- Function signatures

```typescript
type PlayerType = 'human' | 'ai' | 'ai_rl';
type Result<T> = Success<T> | Failure;
type Coordinate = [number, number];
type MoveValidator = (move: Move, state: GameState) => boolean;
```

### Avoid `any`

```typescript
// ❌ Bad
function processData(data: any) {
  return data.value;
}

// ✅ Good: Use generics
function processData<T>(data: T): T {
  return data;
}

// ✅ Good: Use unknown with type guards
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: unknown }).value;
  }
  throw new Error('Invalid data');
}
```

### Null and Undefined

```typescript
// ✅ Use strict null checks
function findGame(id: string): Game | null {
  // ...
}

// ✅ Use optional chaining
const gameName = game?.name;

// ✅ Use nullish coalescing
const playerCount = config.playerCount ?? 2;

// ✅ Check for null/undefined explicitly
if (game === null) {
  throw new Error('Game not found');
}
```

---

## Functions

### Function Signatures

```typescript
// ✅ Explicit return types
function calculateScore(moves: Move[]): number {
  return moves.reduce((sum, move) => sum + move.points, 0);
}

// ✅ Async functions
async function loadGame(id: string): Promise<Game> {
  return await gameRepository.findOne({ where: { id } });
}

// ✅ Optional parameters
function createPlayer(name: string, type: PlayerType = 'human'): Player {
  return { name, type };
}

// ✅ Rest parameters
function combineScores(...scores: number[]): number {
  return scores.reduce((a, b) => a + b, 0);
}
```

### Arrow Functions

```typescript
// ✅ Use arrow functions for callbacks
const scores = moves.map(move => move.points);

// ✅ Use arrow functions for short functions
const isValid = (move: Move): boolean => move.points > 0;

// ✅ Multi-line arrow functions
const validateMove = (move: Move, state: GameState): boolean => {
  if (!move) return false;
  if (!state) return false;
  return rulesEngine.validate(move, state);
};
```

### Function Overloads

```typescript
// Function overloads for different parameter combinations
function getGame(id: string): Promise<Game | null>;
function getGame(name: string, version: number): Promise<Game | null>;
function getGame(idOrName: string, version?: number): Promise<Game | null> {
  if (version !== undefined) {
    return gameRepository.findByNameAndVersion(idOrName, version);
  }
  return gameRepository.findById(idOrName);
}
```

---

## Classes

### Class Design

```typescript
class GameEngine {
  // ✅ Readonly properties
  private readonly rulesEngine: RulesEngine;

  // ✅ Type annotations
  private currentState: GameState;

  // ✅ Constructor with dependency injection
  constructor(
    rulesEngine: RulesEngine,
    private readonly logger: Logger
  ) {
    this.rulesEngine = rulesEngine;
  }

  // ✅ Public interface
  public async processMove(move: Move): Promise<MoveResult> {
    // Implementation
  }

  // ✅ Private helpers
  private validateState(): boolean {
    // Implementation
  }
}
```

### Access Modifiers
- Use `private` for internal implementation
- Use `protected` for inheritance
- Use `public` explicitly for public API (for clarity)
- Use `readonly` for immutable properties

### Abstract Classes

```typescript
abstract class AIProvider {
  abstract getMove(request: MoveRequest): Promise<MoveResponse>;
  abstract getName(): string;

  // Shared implementation
  protected buildPrompt(request: MoveRequest): string {
    // Common logic
  }
}

class ClaudeProvider extends AIProvider {
  async getMove(request: MoveRequest): Promise<MoveResponse> {
    // Implementation
  }

  getName(): string {
    return 'claude';
  }
}
```

---

## Generics

### Generic Functions

```typescript
// ✅ Generic repository methods
async function findById<T>(id: string, repository: Repository<T>): Promise<T | null> {
  return repository.findOne({ where: { id } });
}

// ✅ Generic with constraints
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// ✅ Multiple type parameters
function zipArrays<T, U>(arr1: T[], arr2: U[]): Array<[T, U]> {
  return arr1.map((item, i) => [item, arr2[i]]);
}
```

### Generic Classes

```typescript
class Cache<T> {
  private items = new Map<string, T>();

  set(key: string, value: T): void {
    this.items.set(key, value);
  }

  get(key: string): T | undefined {
    return this.items.get(key);
  }
}

const gameCache = new Cache<Game>();
```

### Generic Interfaces

```typescript
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

class GameRepository implements Repository<Game> {
  // Implementation
}
```

---

## Enums

### String Enums (Preferred)

```typescript
// ✅ String enums are safer and more debuggable
enum PlayerType {
  HUMAN = 'human',
  AI = 'ai',
  AI_RL = 'ai_rl'
}

enum SessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}
```

### Const Enums (For Performance)

```typescript
// Use const enums for better performance (inlined at compile time)
const enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}
```

### Union Types as Alternative

```typescript
// Alternative to enums using union types
type PlayerType = 'human' | 'ai' | 'ai_rl';

// With const assertion
const PLAYER_TYPES = {
  HUMAN: 'human',
  AI: 'ai',
  AI_RL: 'ai_rl'
} as const;

type PlayerType = typeof PLAYER_TYPES[keyof typeof PLAYER_TYPES];
```

---

## Type Guards

### Built-in Type Guards

```typescript
function processValue(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}

function processArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String);
  }
}
```

### Custom Type Guards

```typescript
interface Game {
  id: string;
  name: string;
}

interface Session {
  id: string;
  gameId: string;
}

function isGame(obj: unknown): obj is Game {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    typeof (obj as Game).name === 'string'
  );
}

function processEntity(entity: Game | Session) {
  if (isGame(entity)) {
    console.log(`Game: ${entity.name}`);
  } else {
    console.log(`Session: ${entity.gameId}`);
  }
}
```

---

## Utility Types

### Built-in Utility Types

```typescript
// Partial - makes all properties optional
type PartialGame = Partial<Game>;

// Required - makes all properties required
type RequiredConfig = Required<OptionalConfig>;

// Readonly - makes all properties readonly
type ReadonlyGame = Readonly<Game>;

// Pick - selects specific properties
type GameSummary = Pick<Game, 'id' | 'name'>;

// Omit - excludes specific properties
type GameWithoutDates = Omit<Game, 'createdAt' | 'updatedAt'>;

// Record - creates object type with specific keys and values
type GameMap = Record<string, Game>;

// ReturnType - extracts return type of function
type GameResult = ReturnType<typeof loadGame>;

// Parameters - extracts parameter types
type GameParams = Parameters<typeof createGame>;
```

### Custom Utility Types

```typescript
// Make specific properties optional
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type GameWithOptionalDates = Optional<Game, 'createdAt' | 'updatedAt'>;

// Make specific properties required
type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Deep Readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
```

---

## Error Handling

### Custom Error Classes

```typescript
class GameError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'GameError';
  }
}

class ValidationError extends GameError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}
```

### Result Type Pattern

```typescript
type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

function parseMove(input: string): Result<Move> {
  try {
    const move = JSON.parse(input);
    return { success: true, value: move };
  } catch (error) {
    return { success: false, error: new Error('Invalid move format') };
  }
}

// Usage
const result = parseMove(input);
if (result.success) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```

---

## Async/Await

### Async Best Practices

```typescript
// ✅ Always use async/await over raw promises
async function loadGameData(id: string): Promise<GameData> {
  const game = await gameRepository.findById(id);
  const sessions = await sessionRepository.findByGameId(id);
  return { game, sessions };
}

// ✅ Handle errors properly
async function safeLoadGame(id: string): Promise<Game | null> {
  try {
    return await gameRepository.findById(id);
  } catch (error) {
    logger.error('Failed to load game', { id, error });
    return null;
  }
}

// ✅ Parallel execution with Promise.all
async function loadMultipleGames(ids: string[]): Promise<Game[]> {
  const games = await Promise.all(
    ids.map(id => gameRepository.findById(id))
  );
  return games.filter((game): game is Game => game !== null);
}

// ✅ Use Promise.allSettled for independent operations
async function loadAllData(): Promise<void> {
  const results = await Promise.allSettled([
    loadGames(),
    loadSessions(),
    loadPlayers()
  ]);

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      logger.error(`Operation ${index} failed:`, result.reason);
    }
  });
}
```

---

## Modules and Imports

### Import/Export Best Practices

```typescript
// ✅ Named exports for multiple items
export class GameEngine { }
export interface GameState { }
export type MoveResult = { };

// ✅ Default export for main module export
export default class RulesEngine { }

// ✅ Re-export from index files
// index.ts
export { GameEngine } from './game-engine';
export { RulesEngine } from './rules-engine';
export * from './types';

// ✅ Import with explicit names
import { GameEngine, RulesEngine } from './core';

// ✅ Type-only imports
import type { GameState, Move } from './types';
```

---

## Decorators

### TypeORM Decorators

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;
}
```

### Custom Decorators

```typescript
// Method decorator for logging
function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    console.log(`Calling ${propertyKey} with:`, args);
    const result = await originalMethod.apply(this, args);
    console.log(`${propertyKey} returned:`, result);
    return result;
  };

  return descriptor;
}

class GameService {
  @Log
  async createGame(name: string): Promise<Game> {
    // Implementation
  }
}
```

---

## Common Pitfalls

### ❌ Don't use `any`
```typescript
// Bad
function process(data: any) { }

// Good
function process<T>(data: T) { }
```

### ❌ Don't ignore null/undefined
```typescript
// Bad
function getName(user: User): string {
  return user.name; // What if user is null?
}

// Good
function getName(user: User | null): string | null {
  return user?.name ?? null;
}
```

### ❌ Don't use non-null assertion carelessly
```typescript
// Bad
const game = findGame(id)!; // What if it's null?

// Good
const game = findGame(id);
if (!game) {
  throw new Error('Game not found');
}
```

### ❌ Don't mutate readonly properties
```typescript
// Bad
interface Config {
  readonly port: number;
}
const config: Config = { port: 3000 };
(config as any).port = 4000; // Don't do this!

// Good - create new object
const newConfig = { ...config, port: 4000 };
```

---

## Configuration

### Recommended tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

---

## Summary

- Enable **strict mode** for maximum type safety
- Avoid **`any`**, use **`unknown`** with type guards
- Use **interfaces** for object shapes, **types** for unions
- Always handle **null/undefined** explicitly
- Use **generics** for reusable, type-safe code
- Prefer **string enums** for better debugging
- Write **custom type guards** for complex types
- Use **async/await** for asynchronous code
- Leverage **utility types** to transform types
- Handle **errors** with proper typing

---

**Document End**
