# Unit Testing Best Practices
## AI Board Game Agent System

**Version:** 1.0
**Date:** February 13, 2026

---

## Overview

This document outlines unit testing best practices for the AI Board Game Agent system using Jest.

---

## General Principles

### Test Philosophy
- Write tests first (TDD) or alongside code
- Test behavior, not implementation
- Keep tests simple and readable
- One assertion concept per test
- Tests should be independent
- Tests should be fast

### Test Structure (AAA Pattern)
- **Arrange**: Set up test data and conditions
- **Act**: Execute the code being tested
- **Assert**: Verify the results

---

## Jest Configuration

### jest.config.js

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.spec.ts', '**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.interface.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

### Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=spec",
    "test:integration": "jest --testPathPattern=integration"
  }
}
```

---

## Test Organization

### File Structure

```
tests/
├── unit/
│   ├── core/
│   │   ├── game-engine.spec.ts
│   │   └── rules-engine.spec.ts
│   ├── providers/
│   │   ├── claude-provider.spec.ts
│   │   └── mock-provider.spec.ts
│   └── services/
│       └── session-manager.spec.ts
├── integration/
│   ├── game-flow.integration.ts
│   └── database.integration.ts
├── fixtures/
│   ├── games.ts
│   └── moves.ts
└── setup.ts
```

### Naming Conventions

```typescript
// File naming
game-engine.spec.ts         // Unit test
game-flow.integration.ts    // Integration test

// Test suite naming
describe('GameEngine', () => { });
describe('GameEngine.processMove', () => { });

// Test case naming - Use descriptive names
it('should process valid move and update state', () => { });
it('should reject invalid move with error message', () => { });
it('should throw when game state is corrupted', () => { });
```

---

## Writing Tests

### Basic Test Structure

```typescript
import { GameEngine } from '@/core/game-engine';
import { RulesEngine } from '@/core/rules-engine';

describe('GameEngine', () => {
  let gameEngine: GameEngine;
  let rulesEngine: RulesEngine;

  beforeEach(() => {
    // Arrange - Set up test dependencies
    rulesEngine = new RulesEngine();
    gameEngine = new GameEngine(rulesEngine);
  });

  afterEach(() => {
    // Cleanup if needed
    jest.clearAllMocks();
  });

  it('should process valid move', async () => {
    // Arrange
    const move = {
      playerId: 'player1',
      action: 'place',
      position: { x: 0, y: 0 }
    };
    const state = createTestGameState();

    // Act
    const result = await gameEngine.processMove(move, state);

    // Assert
    expect(result.success).toBe(true);
    expect(result.newState.board[0][0]).toBe('X');
  });

  it('should reject invalid move', async () => {
    // Arrange
    const invalidMove = {
      playerId: 'player1',
      action: 'place',
      position: { x: -1, y: 0 }
    };

    // Act & Assert
    await expect(gameEngine.processMove(invalidMove)).rejects.toThrow(
      'Invalid position'
    );
  });
});
```

---

## Mocking

### Mocking Dependencies

```typescript
import { GameEngine } from '@/core/game-engine';
import { RulesEngine } from '@/core/rules-engine';

jest.mock('@/core/rules-engine');

describe('GameEngine with mocked dependencies', () => {
  let gameEngine: GameEngine;
  let mockRulesEngine: jest.Mocked<RulesEngine>;

  beforeEach(() => {
    // Create mock
    mockRulesEngine = {
      validate: jest.fn(),
      getLegalMoves: jest.fn(),
      checkWinCondition: jest.fn()
    } as any;

    gameEngine = new GameEngine(mockRulesEngine);
  });

  it('should call rules engine for validation', async () => {
    // Arrange
    mockRulesEngine.validate.mockResolvedValue(true);
    const move = createTestMove();

    // Act
    await gameEngine.processMove(move);

    // Assert
    expect(mockRulesEngine.validate).toHaveBeenCalledWith(move);
    expect(mockRulesEngine.validate).toHaveBeenCalledTimes(1);
  });
});
```

### Mocking External Services

```typescript
import { ClaudeProvider } from '@/providers/claude';
import Anthropic from '@anthropic-ai/sdk';

jest.mock('@anthropic-ai/sdk');

describe('ClaudeProvider', () => {
  let provider: ClaudeProvider;
  let mockAnthropic: jest.Mocked<Anthropic>;

  beforeEach(() => {
    mockAnthropic = {
      messages: {
        create: jest.fn()
      }
    } as any;

    (Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(
      () => mockAnthropic
    );

    provider = new ClaudeProvider({ apiKey: 'test-key' });
  });

  it('should call Anthropic API with correct parameters', async () => {
    // Arrange
    const mockResponse = {
      content: [{ type: 'text', text: '{"move": "e4"}' }]
    };
    mockAnthropic.messages.create.mockResolvedValue(mockResponse as any);

    // Act
    const result = await provider.getMove({
      gameState: createTestState(),
      rules: 'test rules'
    });

    // Assert
    expect(mockAnthropic.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.any(String),
        messages: expect.any(Array)
      })
    );
    expect(result.move).toBe('e4');
  });
});
```

### Spy on Methods

```typescript
describe('GameEngine with spies', () => {
  it('should call internal method', async () => {
    const gameEngine = new GameEngine();

    // Create spy
    const validateSpy = jest.spyOn(gameEngine as any, 'validateState');

    await gameEngine.processMove(move);

    expect(validateSpy).toHaveBeenCalled();

    // Cleanup
    validateSpy.mockRestore();
  });
});
```

---

## Testing Async Code

### Testing Promises

```typescript
describe('Async operations', () => {
  it('should resolve with game data', async () => {
    const game = await gameRepository.findById('id');
    expect(game).toBeDefined();
  });

  it('should reject with error', async () => {
    await expect(gameRepository.findById('invalid')).rejects.toThrow(
      'Game not found'
    );
  });

  it('should handle promise', () => {
    return gameRepository.findById('id').then(game => {
      expect(game).toBeDefined();
    });
  });
});
```

### Testing Callbacks

```typescript
describe('Callback functions', () => {
  it('should call callback with result', (done) => {
    processData((error, result) => {
      expect(error).toBeNull();
      expect(result).toBe('success');
      done();
    });
  });

  it('should call callback with error', (done) => {
    processInvalidData((error, result) => {
      expect(error).toBeDefined();
      expect(result).toBeUndefined();
      done();
    });
  });
});
```

---

## Testing with TypeORM

### In-Memory Database

```typescript
import { DataSource } from 'typeorm';
import { Game } from '@/entities/Game';

describe('GameRepository', () => {
  let dataSource: DataSource;
  let gameRepository: Repository<Game>;

  beforeAll(async () => {
    // Create in-memory database
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [Game],
      synchronize: true,
      logging: false
    });

    await dataSource.initialize();
    gameRepository = dataSource.getRepository(Game);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    // Clear database between tests
    await gameRepository.clear();
  });

  it('should save and retrieve game', async () => {
    // Arrange
    const game = gameRepository.create({
      name: 'Chess',
      rulesText: 'Chess rules',
      strategyGuide: 'Chess strategy',
      stateSchema: {}
    });

    // Act
    await gameRepository.save(game);
    const found = await gameRepository.findOne({ where: { name: 'Chess' } });

    // Assert
    expect(found).toBeDefined();
    expect(found?.name).toBe('Chess');
  });
});
```

### Mocking Repository

```typescript
describe('GameService with mocked repository', () => {
  let gameService: GameService;
  let mockRepository: MockRepository<Game>;

  beforeEach(() => {
    mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    } as any;

    gameService = new GameService(mockRepository);
  });

  it('should find game by name', async () => {
    // Arrange
    const mockGame = { id: 'uuid', name: 'Chess' } as Game;
    mockRepository.findOne.mockResolvedValue(mockGame);

    // Act
    const game = await gameService.findByName('Chess');

    // Assert
    expect(game).toEqual(mockGame);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { name: 'Chess' }
    });
  });
});
```

---

## Test Data and Fixtures

### Test Data Builders

```typescript
// tests/fixtures/builders/game.builder.ts
export class GameBuilder {
  private game: Partial<Game> = {
    name: 'Test Game',
    rulesText: 'Test rules',
    strategyGuide: 'Test strategy',
    stateSchema: {}
  };

  withName(name: string): this {
    this.game.name = name;
    return this;
  }

  withRules(rulesText: string): this {
    this.game.rulesText = rulesText;
    return this;
  }

  build(): Game {
    return this.game as Game;
  }
}

// Usage
const game = new GameBuilder()
  .withName('Chess')
  .withRules('Chess rules')
  .build();
```

### Fixture Functions

```typescript
// tests/fixtures/games.ts
export function createTestGame(overrides?: Partial<Game>): Game {
  return {
    id: 'test-id',
    name: 'Test Game',
    rulesText: 'Test rules',
    strategyGuide: 'Test strategy',
    stateSchema: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

export function createTestMove(overrides?: Partial<Move>): Move {
  return {
    id: 'move-id',
    sessionId: 'session-id',
    playerIndex: 0,
    action: { type: 'place', position: { x: 0, y: 0 } },
    ...overrides
  };
}

// Usage
const game = createTestGame({ name: 'Custom Name' });
```

---

## Matchers and Assertions

### Common Matchers

```typescript
// Equality
expect(value).toBe(expected);                // Strict equality (===)
expect(value).toEqual(expected);             // Deep equality
expect(value).toStrictEqual(expected);       // Strict deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeDefined();
expect(value).toBeUndefined();
expect(value).toBeNull();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3);
expect(value).toBeLessThan(5);
expect(value).toBeLessThanOrEqual(5);
expect(value).toBeCloseTo(0.3, 1);          // Floating point

// Strings
expect(string).toMatch(/pattern/);
expect(string).toContain('substring');

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(3);
expect(array).toEqual(expect.arrayContaining([item1, item2]));

// Objects
expect(object).toHaveProperty('key');
expect(object).toHaveProperty('key', value);
expect(object).toMatchObject({ key: value });

// Exceptions
expect(() => fn()).toThrow();
expect(() => fn()).toThrow(Error);
expect(() => fn()).toThrow('error message');
```

### Custom Matchers

```typescript
// tests/setup.ts
expect.extend({
  toBeValidMove(received: Move) {
    const pass = received.action && received.playerIndex >= 0;
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid move`
          : `Expected ${received} to be a valid move`
    };
  }
});

// Usage
expect(move).toBeValidMove();
```

---

## Code Coverage

### Measuring Coverage

```bash
npm run test:coverage
```

### Coverage Report

```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   85.32 |    78.45 |   89.12 |   84.98 |
 core/                |   92.45 |    88.23 |   95.67 |   91.89 |
  game-engine.ts      |   94.23 |    90.12 |   96.45 |   93.78 |
  rules-engine.ts     |   90.67 |    86.34 |   94.89 |   89.99 |
 providers/           |   78.19 |    68.67 |   82.45 |   77.56 |
  claude-provider.ts  |   80.45 |    70.23 |   84.67 |   79.89 |
----------------------|---------|----------|---------|---------|
```

### Coverage Thresholds

```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  },
  './src/core/**/*.ts': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  }
}
```

---

## Test Performance

### Fast Tests

```typescript
// ✅ Good - Fast unit test
it('should validate move', () => {
  const result = validator.validate(move);
  expect(result).toBe(true);
});

// ❌ Slow - Unnecessary database call
it('should validate move', async () => {
  await db.connect();
  const result = await validator.validateWithDb(move);
  expect(result).toBe(true);
});
```

### Test Timeouts

```typescript
// Default timeout (5 seconds)
it('should complete quickly', async () => {
  await quickOperation();
});

// Custom timeout
it('should handle slow operation', async () => {
  await slowOperation();
}, 10000); // 10 seconds

// Per-suite timeout
describe('Slow tests', () => {
  jest.setTimeout(30000);

  it('slow test 1', async () => { });
  it('slow test 2', async () => { });
});
```

---

## Best Practices

### ✅ Do's

```typescript
// ✅ Test behavior, not implementation
it('should update game state after move', () => {
  const newState = gameEngine.processMove(move, state);
  expect(newState.currentPlayer).toBe(2);
});

// ✅ Use descriptive test names
it('should throw ValidationError when move position is out of bounds', () => {
  // ...
});

// ✅ Keep tests independent
beforeEach(() => {
  // Fresh setup for each test
  gameEngine = new GameEngine();
});

// ✅ Test edge cases
it('should handle empty input', () => { });
it('should handle null values', () => { });
it('should handle maximum values', () => { });

// ✅ Use AAA pattern
it('should calculate correct score', () => {
  // Arrange
  const moves = [move1, move2, move3];

  // Act
  const score = calculateScore(moves);

  // Assert
  expect(score).toBe(150);
});
```

### ❌ Don'ts

```typescript
// ❌ Testing implementation details
it('should call internal method', () => {
  const spy = jest.spyOn(engine as any, '_internalMethod');
  engine.processMove(move);
  expect(spy).toHaveBeenCalled(); // Fragile!
});

// ❌ Multiple assertions per test (different concepts)
it('should process move', () => {
  const result = engine.processMove(move);
  expect(result.success).toBe(true);
  expect(result.score).toBe(10);
  expect(result.winner).toBe('player1');
  expect(result.gameOver).toBe(true); // Too much!
});

// ❌ Tests depending on each other
it('should create game', () => {
  game = createGame();
});

it('should start session', () => {
  session = startSession(game); // Depends on previous test!
});

// ❌ Testing too much at once
it('should handle entire game flow', () => {
  // 100 lines of test code... // Too complex!
});
```

---

## Debugging Tests

### Running Specific Tests

```bash
# Run single test file
npm test game-engine.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="should validate"

# Run in watch mode
npm test -- --watch

# Run with debugging
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Debug Output

```typescript
it('should process move', () => {
  const result = gameEngine.processMove(move);

  // Debug output
  console.log('Result:', JSON.stringify(result, null, 2));

  expect(result.success).toBe(true);
});
```

---

## Summary

- Use **AAA pattern** (Arrange, Act, Assert)
- Write **descriptive test names**
- Keep tests **independent** and **fast**
- Test **behavior**, not implementation
- Use **mocks** for external dependencies
- Aim for **80%+ code coverage**
- Test **edge cases** and **error conditions**
- Use **test builders** for complex data
- Keep tests **simple** and **readable**
- Run tests **frequently** during development

---

**Document End**
