# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**RAWley** is an AI Board Game Agent System that enables AI agents to learn and play board games defined as data-driven modules. Games are described in natural language (rules + strategy) rather than coded explicitly, allowing new games to be added without code changes.

**Current Status:** Pre-Development Phase (Exploration)
- Exploration experiments in `/exploration` folder
- Core application not yet scaffolded (no `/src`, no `package.json`)
- Comprehensive documentation completed in `/docs`

## Project Phases

1. **Pre-Dev Phase (CURRENT):** AI & RL technology exploration
2. **Phase 0:** Environment setup (Docker, TypeScript, TypeORM, tooling)
3. **Phase 1:** Core foundation (database, rules engine, basic provider)
4. **Phase 2:** Game engine (sessions, human vs AI gameplay)
5. **Phase 3:** Advanced rules (complex DSL, multi-player)
6. **Phase 4:** Reinforcement learning
7. **Phase 5:** Polish & optimization

## Documentation Structure

All major decisions and patterns are documented in `/docs`:

- **`PRD.md`**: Product requirements (WHAT and WHY)
  - Functional and non-functional requirements
  - User stories and success metrics
  - High-level data entities
  - Milestones and phases

- **`ARCHITECTURE.md`**: System design (HOW)
  - Detailed database schema with field types
  - Component architecture and interactions
  - Technology stack implementation
  - Sequence diagrams and data flows
  - Rules engine DSL design
  - RL integration patterns

- **`best-practices/`**: Coding standards and conventions
  - `TYPESCRIPT.md`: TypeScript patterns
  - `TYPEORM.md`: Database and ORM conventions
  - `CODE-STYLE.md`: General coding standards
  - `NODE.md`: Node.js best practices
  - `UNIT-TESTS.md`: Testing guidelines
  - `REST-API.md`: API design (future phases)
  - `UI.md`, `UI-STYLE.md`: Frontend (future phases)

**IMPORTANT:** Read relevant docs in `/docs/best-practices/` BEFORE implementing features in their respective domains.

## Key Architecture Concepts

### Core Design Principles
- **Data-Driven Games**: Games defined in database, not code
- **Provider Pattern**: Swappable AI providers (Claude, GPT, Ollama, custom)
- **Generic Rules Engine**: DSL-based validation, game-agnostic
- **Separation of Concerns**: Game logic, AI, and rules are independent
- **Repository Pattern**: TypeORM with Data Mapper (NOT Active Record)

### Critical Conventions
- **IDs**: All primary keys use UUIDv7 (time-ordered, sortable)
- **ORM**: TypeORM with Data Mapper pattern and repository classes
- **Transactions**: All state changes must be atomic and transactional
- **Immutability**: Move history is append-only, never modified
- **Foreign Keys**: Enforced at database level with cascading rules

### Technology Stack (Phase 0+)
- **Runtime**: Node.js 18+ with TypeScript 5+
- **Database**: PostgreSQL 15+ (primary) or SQLite 3.40+ (alternative)
- **ORM**: TypeORM with migrations
- **AI SDKs**: Anthropic SDK, OpenAI SDK, Ollama client
- **Infrastructure**: Docker Compose for services (PostgreSQL, optional Ollama)
  - **IMPORTANT**: Node.js app runs locally (NOT containerized) for fast iteration
- **Testing**: Jest with mock providers
- **Tooling**: ESLint, Prettier, ts-node

### Project Structure (When Implemented)
```
/src
  /cli              - CLI interface (v1 priority)
  /api              - REST API (future, tsoa-based)
  /core             - Domain logic (game-engine, rules-engine, rl-engine, player-manager)
  /providers        - AI provider implementations
  /data             - Data access (repositories, entities, data-source)
  /services         - Application services (orchestrator, session-manager, analytics)
  /types            - Shared TypeScript types
  /utils            - Utility functions
/migrations         - Database migrations
/tests              - Unit and integration tests
/config             - Configuration files
/docs               - Documentation (PRD, ARCHITECTURE, best-practices)
/examples           - Example game definitions (JSON)
/exploration        - Pre-dev experiments (isolated, not production code)
/modules            - Game module definitions
```

## Exploration Phase (`/exploration` folder)

The `/exploration` folder contains pre-development experiments for learning AI and RL technologies:
- **Purpose**: Hands-on learning before architectural commitment
- **Status**: Isolated from main project, not production code
- **Contents**: Ollama tests, RL prototypes, game experiments
- **Deliverable**: `LEARNINGS.md` with technology recommendations

Experiments can inform architecture decisions but should NOT be directly imported into `/src`.

## Development Workflow (Phase 0+)

### Environment Setup
```bash
# Start services (PostgreSQL, optional Ollama)
docker-compose up -d

# Install dependencies
npm install

# Run migrations
npm run migration:run

# Start development
npm run dev
```

### Common Commands (Will be defined in package.json)
- `npm run dev` - Start development with hot reload
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests
- `npm run lint` - Run ESLint
- `npm run format` - Run Prettier
- `npm run typecheck` - TypeScript type checking
- `npm run migration:generate` - Generate new migration
- `npm run migration:run` - Apply migrations
- `npm run migration:revert` - Revert last migration

### Testing Strategy
- **Unit Tests**: Test components in isolation with mocked dependencies
- **Integration Tests**: Test component interactions with test database
- **Mock Providers**: Use mock AI providers for deterministic testing
- **Fixtures**: Shared test data in `/tests/fixtures`
- Follow patterns in `/docs/best-practices/UNIT-TESTS.md`

## Important Patterns

### Provider Interface
All AI providers implement a common interface:
```typescript
interface GameAIProvider {
  getMove(request: MoveRequest): Promise<MoveResponse>;
  getName(): string;
}
```

Providers are swappable via configuration without code changes.

### Rules Engine DSL
Rules are defined in structured JSON or custom DSL:
- **Types**: setup, turn, action, validation, win conditions
- **Components**: condition, action, priority
- **Primitives**: comparisons, logical operators, state references
- See ARCHITECTURE.md Section 6 for detailed DSL design

### RL Integration (Phase 4)
Three potential approaches (to be decided after exploration):
1. **Prompt Modification**: Include RL guidance in AI prompts
2. **Move Filtering**: RL ranks AI-generated candidates
3. **Independent Scoring**: Weighted combination of RL and LLM scores

### Database Migrations
- All schema changes via TypeORM migrations
- Never modify entities without generating migration
- Migrations are version-controlled and sequential
- Use `npm run migration:generate -- -n MigrationName`

### Error Handling
- **Invalid AI Moves**: Validate before applying, retry with clarification
- **API Failures**: Implement retry logic with exponential backoff
- **Transient Errors**: Graceful degradation, continue operation
- **State Consistency**: Use database transactions for atomicity

## Security Considerations

- **API Keys**: Store in environment variables (`.env`), never commit
- **Input Validation**: Sanitize all user input before database insertion
- **AI Validation**: Validate all AI-generated moves with rules engine
- **Database Security**: Use parameterized queries, enforce foreign keys

## Git Workflow

- **Main Branch**: `main` (for PRs)
- **Current Branch**: `master` (local development)
- Commit messages should be clear and concise
- Reference issue numbers where applicable

## Notes for Claude Code

1. **Read Documentation First**: Check `/docs` for requirements and patterns before implementing features
2. **Follow Best Practices**: Review relevant `/docs/best-practices/*.md` files for domain-specific guidance
3. **Respect Phases**: Don't implement features from later phases prematurely
4. **Exploration vs Production**: `/exploration` code is NOT production code - learn from it but don't copy it directly
5. **Database Schema**: All schema details are in ARCHITECTURE.md Section 4, NOT in PRD.md
6. **Documentation Separation**: PRD defines WHAT/WHY, ARCHITECTURE defines HOW
7. **TypeORM Pattern**: Use Data Mapper pattern with repositories, NOT Active Record pattern
8. **Docker Usage**: Services run in Docker, but Node.js app runs locally for fast iteration
