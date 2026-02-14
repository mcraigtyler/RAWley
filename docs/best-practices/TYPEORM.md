# TypeORM Best Practices
## AI Board Game Agent System

**Version:** 1.0
**Date:** February 13, 2026

---

## Overview

This document outlines best practices for using TypeORM in the AI Board Game Agent system.

---

## General Principles

### Use Data Mapper Pattern
- Separate domain entities from database persistence logic
- Keep entities focused on business logic
- Use repositories for all database operations

### Use Migrations
- Always use migrations for schema changes
- Never modify entities and sync in production
- Keep migrations in version control
- Name migrations descriptively (e.g., `CreateGameTable`, `AddPlayerTypeEnum`)

### Repository Pattern
- Use the Repository pattern for all data access
- Extend repositories with custom methods using `dataSource.getRepository(Entity).extend({})`
- Keep business logic out of repositories (repositories should only handle data access)

---

## Entity Design

### Primary Keys with UUIDv7

**Why UUIDv7?**
- Time-ordered: UUIDs are sortable by creation time
- Better database performance: Sequential IDs improve B-tree index performance
- K-sortable: Can use ID for ordering without separate timestamp column
- Distributed-friendly: Safe to generate across multiple nodes

### Entity Decorators

```typescript
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { uuidv7 } from 'uuidv7';

@Entity('games')
export class Game {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @Column({ unique: true })
  name: string;

  @Column('text')
  rulesText: string;

  @Column('text')
  strategyGuide: string;

  @Column('jsonb')
  stateSchema: object;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Column Naming
- Use camelCase in TypeScript entities
- Let TypeORM handle snake_case conversion for database columns
- Configure naming strategy if needed:

```typescript
// In data source configuration
namingStrategy: new SnakeNamingStrategy()
```

### Alternative: Base Entity Class

For consistency across all entities, create a base class:

```typescript
import { PrimaryColumn, BeforeInsert } from 'typeorm';
import { uuidv7 } from 'uuidv7';

export abstract class BaseEntity {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }
}

// Usage
@Entity('games')
export class Game extends BaseEntity {
  @Column({ unique: true })
  name: string;
  // ... other columns
}
```

### Installation

```bash
npm install uuidv7
```

### JSONB Columns
- Use `@Column('jsonb')` for PostgreSQL JSON columns
- Use `@Column('simple-json')` for SQLite compatibility
- Define TypeScript interfaces for JSON structure:

```typescript
interface StateSchema {
  players: PlayerState[];
  board: BoardState;
  currentPlayer: number;
}

@Entity()
export class Game extends BaseEntity {
  @Column('jsonb')
  stateSchema: StateSchema;
}
```

### Enums
- Use TypeScript enums with TypeORM enum columns:

```typescript
export enum PlayerType {
  HUMAN = 'human',
  AI = 'ai',
  AI_RL = 'ai_rl'
}

@Entity()
export class SessionPlayer {
  @Column({
    type: 'enum',
    enum: PlayerType
  })
  playerType: PlayerType;
}
```

---

## Relationships

### Foreign Keys

```typescript
@Entity()
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Game, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'game_id' })
  game: Game;

  @Column()
  gameId: string; // Explicit foreign key column
}
```

### One-to-Many Relationships

```typescript
@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Session, session => session.game)
  sessions: Session[];
}

@Entity()
export class Session {
  @ManyToOne(() => Game, game => game.sessions)
  game: Game;
}
```

### Eager vs Lazy Loading
- Default to lazy loading (more efficient)
- Use `eager: true` sparingly
- Load relations explicitly in queries:

```typescript
// Good: Explicit loading
const game = await gameRepository.findOne({
  where: { id },
  relations: ['sessions']
});

// Avoid: Eager loading everywhere
@OneToMany(() => Session, session => session.game, { eager: true })
sessions: Session[];
```

---

## Custom Repositories

### Extending Repositories

Use `dataSource.getRepository(Entity).extend({})` for custom repositories:

```typescript
// repositories/GameRepository.ts
import { dataSource } from '../data-source';
import { Game } from '../entities/Game';

export const GameRepository = dataSource.getRepository(Game).extend({
  // Custom method: Find game by name
  async findByName(name: string): Promise<Game | null> {
    return this.findOne({
      where: { name }
    });
  },

  // Custom method: Find games with session count
  async findWithSessionCount(): Promise<Array<Game & { sessionCount: number }>> {
    return this.createQueryBuilder('game')
      .leftJoin('game.sessions', 'session')
      .select('game.*')
      .addSelect('COUNT(session.id)', 'sessionCount')
      .groupBy('game.id')
      .getRawMany();
  },

  // Custom method: Find active games
  async findActiveGames(): Promise<Game[]> {
    return this.createQueryBuilder('game')
      .innerJoin('game.sessions', 'session')
      .where('session.status = :status', { status: 'active' })
      .distinct(true)
      .getMany();
  }
});
```

### Repository Best Practices
- Keep repositories focused on data access
- Don't put business logic in repositories
- Use query builders for complex queries
- Always handle errors appropriately
- Use transactions for multi-step operations

---

## Query Optimization

### Use Query Builder for Complex Queries

```typescript
const sessions = await sessionRepository
  .createQueryBuilder('session')
  .leftJoinAndSelect('session.game', 'game')
  .leftJoinAndSelect('session.players', 'players')
  .where('session.status = :status', { status: 'active' })
  .andWhere('game.name = :name', { name: 'Chess' })
  .orderBy('session.createdAt', 'DESC')
  .take(10)
  .getMany();
```

### Indexes
- Add indexes to frequently queried columns
- Add composite indexes for multi-column queries:

```typescript
@Entity()
@Index(['gameId', 'status'])
export class Session {
  @Column()
  gameId: string;

  @Column()
  status: string;
}
```

### Pagination
- Use `take()` and `skip()` for pagination:

```typescript
const [sessions, total] = await sessionRepository.findAndCount({
  skip: (page - 1) * pageSize,
  take: pageSize,
  order: { createdAt: 'DESC' }
});
```

### Select Specific Columns
- Only select columns you need:

```typescript
const games = await gameRepository
  .createQueryBuilder('game')
  .select(['game.id', 'game.name'])
  .getMany();
```

---

## Transactions

### Using Transactions

```typescript
import { dataSource } from '../data-source';

await dataSource.transaction(async (transactionalEntityManager) => {
  const session = await transactionalEntityManager.save(Session, newSession);

  await transactionalEntityManager.save(SessionPlayer, players);

  await transactionalEntityManager.save(Move, firstMove);
});
```

### Transaction Best Practices
- Keep transactions short
- Don't make external API calls inside transactions
- Handle rollbacks gracefully
- Use transactions for multi-entity operations

---

## Migrations

### Creating Migrations

```bash
# Generate migration from entity changes
npm run typeorm migration:generate -- -n MigrationName

# Create empty migration
npm run typeorm migration:create -- -n MigrationName

# Run migrations
npm run typeorm migration:run

# Revert last migration
npm run typeorm migration:revert
```

### Migration Structure

```typescript
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateGameTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'games',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            // Note: UUIDv7 is generated in application code via @BeforeInsert hook
            // No database-level default needed
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true
          },
          {
            name: 'rules_text',
            type: 'text'
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()'
          }
        ]
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('games');
  }
}
```

### Migration Best Practices
- Always provide both `up` and `down` methods
- Test migrations on a copy of production data
- Keep migrations idempotent when possible
- Document complex migrations
- Never modify existing migrations that have been deployed

---

## Testing

### Unit Testing Repositories

```typescript
import { DataSource } from 'typeorm';
import { GameRepository } from './GameRepository';

describe('GameRepository', () => {
  let dataSource: DataSource;
  let gameRepository: typeof GameRepository;

  beforeAll(async () => {
    dataSource = await new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [Game],
      synchronize: true
    }).initialize();

    gameRepository = dataSource.getRepository(Game).extend(GameRepository);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should find game by name', async () => {
    await gameRepository.save({ name: 'Chess', /* ... */ });

    const game = await gameRepository.findByName('Chess');

    expect(game).toBeDefined();
    expect(game?.name).toBe('Chess');
  });
});
```

---

## Error Handling

### Handle Unique Constraint Violations

```typescript
try {
  await gameRepository.save(game);
} catch (error) {
  if (error.code === '23505') { // PostgreSQL unique violation
    throw new Error(`Game with name "${game.name}" already exists`);
  }
  throw error;
}
```

### Handle Foreign Key Violations

```typescript
try {
  await sessionRepository.delete(sessionId);
} catch (error) {
  if (error.code === '23503') { // PostgreSQL foreign key violation
    throw new Error('Cannot delete session with existing moves');
  }
  throw error;
}
```

---

## Performance Tips

1. **Use `select` to limit columns**: Only fetch what you need
2. **Batch operations**: Use `save([array])` instead of multiple `save()` calls
3. **Use streaming for large datasets**: Use `stream()` for large result sets
4. **Cache compiled queries**: TypeORM caches query builder queries automatically
5. **Use raw queries for complex operations**: Sometimes raw SQL is more efficient

```typescript
// Batch insert
await repository.save([entity1, entity2, entity3]);

// Streaming
const stream = await repository.createQueryBuilder('entity').stream();
stream.on('data', (entity) => { /* process */ });
```

---

## Connection Management

### Data Source Configuration

```typescript
// data-source.ts
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/entities/**/*.ts'],
  migrations: ['migrations/**/*.ts'],
  synchronize: false, // Never use in production
  logging: process.env.NODE_ENV === 'development',
  namingStrategy: new SnakeNamingStrategy(),
  extra: {
    max: 20, // Connection pool size
    idleTimeoutMillis: 30000
  }
});
```

### Initialize Data Source

```typescript
// app.ts
import { dataSource } from './data-source';

async function bootstrap() {
  await dataSource.initialize();
  console.log('Database connected');

  // Start application
}

bootstrap();
```

---

## Common Pitfalls

### ❌ Don't use synchronize in production

```typescript
// NEVER do this in production
new DataSource({
  synchronize: true // This drops and recreates tables!
});
```

### ❌ Don't modify entities directly from find results without saving

```typescript
// Wrong
const game = await repository.findOne({ where: { id } });
game.name = 'New Name'; // Not persisted

// Correct
const game = await repository.findOne({ where: { id } });
game.name = 'New Name';
await repository.save(game);
```

### ❌ Don't forget to await async operations

```typescript
// Wrong
const game = repository.save(newGame); // Returns Promise, not Game

// Correct
const game = await repository.save(newGame);
```

### ❌ Don't use cascading operations carelessly

```typescript
// Be careful with cascade: true
@OneToMany(() => Session, session => session.game, { cascade: true })
sessions: Session[]; // Will cascade all operations!
```

---

## Summary

- Use **Data Mapper pattern** for clean separation
- Always use **migrations** for schema changes
- Extend repositories with **`dataSource.getRepository(Entity).extend({})`**
- Use **indexes** for frequently queried columns
- Keep **transactions short** and focused
- **Test repositories** with in-memory SQLite
- Handle **database errors** gracefully
- Never use **`synchronize: true`** in production

---

**Document End**
