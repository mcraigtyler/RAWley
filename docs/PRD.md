# Product Requirements Document (PRD)
## AI Board Game Agent System

**Version:** 1.0  
**Date:** February 13, 2026  
**Status:** Draft

---

## 1. Executive Summary

### 1.1 Overview
A modular system for hosting AI agents locally that can learn and play various board games. The system uses a data-driven approach where games are defined as modules containing rules and strategy in natural language, eliminating the need for game-specific code.

### 1.2 Goals
- Enable AI agents to play any board game by loading rule definitions
- Support multiple AI providers (Claude, OpenAI, Ollama, custom)
- Implement reinforcement learning to improve gameplay over time
- Support human(s) vs AI and AI vs AI
- Provide a generic rules engine that validates moves independent of specific games

### 1.3 Non-Goals
- Real-time multiplayer matchmaking service
- Networked play
- 3D visualization or advanced graphics
- Mobile applications (CLI/API only in v1)
- Integration with existing board game platforms

---

## 2. User Stories

### 2.1 Core User Stories

**US-1: Define New Game**
> As a game designer, I want to add a new board game by defining rules and strategy, so that the AI can immediately play it without code changes.

**US-2: Play Against AI**
> As a player, I want to play a board game against an AI opponent, so that I can practice and improve my skills.

**US-3: Watch AI vs AI**
> As a researcher, I want to watch two AI agents play against each other, so they can learn from their own play and develop new strategies.

**US-4: Switch AI Providers**
> As a developer, I want to easily swap between different AI providers (Claude, GPT-4, local Llama), so that I can compare performance and cost.

**US-5: AI Learning**
> As a user, I want the AI to learn from its games and improve over time, so that it becomes a more challenging opponent.

**US-6: Multi-Player Games**
> As a player, I want to play games with multiple participants (humans and/or AI), so that I can enjoy social games.

### 2.2 Advanced User Stories

**US-7: Custom Strategies**
> As a coach, I want to define custom strategy tips for the AI, so that it plays in a particular style.

**US-8: Performance Analytics**
> As an analyst, I want to view win rates and decision quality metrics, so that I can evaluate AI performance.

**US-9: Rule Validation**
> As a game designer, I want the system to validate moves using a generic rules engine, so that games maintain integrity without custom validation code.

**US-10: Model Comparison**
> As a researcher, I want to run tournaments between different AI configurations, so that I can determine optimal setups.

---

## 3. Functional Requirements

### 3.1 Game Module System

**FR-1.1** The system SHALL store game definitions in a relational database (PostgreSQL or SQLite)

**FR-1.2** Each game module SHALL include:
- Natural language rules
- Strategy guide
- State schema (JSON structure)
- Compiled ruleset for validation

**FR-1.3** Games SHALL be loadable at runtime without application restart

**FR-1.4** The system SHALL support adding new games with no code changes to the core system

**FR-1.5** The system SHALL support adding custom extensions to support new game mechanics not provided by the core system

### 3.2 Rules Engine

**FR-2.1** The system SHALL provide a generic rules engine capable of evaluating any game rules

**FR-2.2** Rules SHALL be defined in a domain-specific language (DSL) or structured format

**FR-2.3** The rules engine SHALL validate moves independent of specific game logic

**FR-2.4** The rules engine SHALL support:
- Setup rules (initial state)
- Turn structure rules
- Action validation rules
- Win/loss condition evaluation
- State transition rules

**FR-2.5** The rules engine SHALL return clear error messages for invalid moves

**FR-2.6** The rules engine SHALL provide list of legal moves from any game state

### 3.3 AI Provider System

**FR-3.1** The system SHALL support multiple AI providers through a common interface

**FR-3.2** Supported providers SHALL include:
- Anthropic Claude (API)
- OpenAI GPT (API)
- Ollama (local)
- Custom/Mock providers

**FR-3.3** Providers SHALL be swappable via configuration

### 3.4 Player Management

**FR-4.1** The system SHALL support multiple player types:
- Human players (CLI input)
- AI players (using AI providers)
- AI players with RL (using learned policies)

**FR-4.2** Games SHALL support any combination of player types

**FR-4.3** The system SHALL enforce turn order per game rules

**FR-4.4** Player actions SHALL be validated by rules engine before application

### 3.5 Reinforcement Learning

**FR-5.1** The system SHALL record game experiences for training

**FR-5.2** Experiences SHALL include:
- State at time T
- Action taken
- Reward received
- Next state at time T+1

**FR-5.3** The system SHALL calculate rewards based on:
- Immediate feedback (valid/invalid moves)
- Game outcome (win/loss/draw)
- Custom reward functions per game

**FR-5.4** The system SHALL update AI policies after games complete

**FR-5.5** Policies SHALL be versioned and stored

**FR-5.6** The system SHALL support epsilon-greedy exploration strategy

**FR-5.7** AI SHALL load best-performing policy when starting new games

### 3.6 Game Session Management

**FR-6.1** The system SHALL create a session for each game

**FR-6.2** Sessions SHALL persist:
- Current game state
- Move history
- Player information
- Session metadata (start time, status)

**FR-6.3** Sessions SHALL be resumable

**FR-6.4** The system SHALL support concurrent sessions

### 3.7 Memory and Learning

**FR-7.1** The system SHALL store insights from completed games

**FR-7.2** Memory entries SHALL include:
- Game situation description
- Move taken
- Outcome
- Strategic notes

**FR-7.3** The system SHALL retrieve relevant memories when requesting AI moves

**FR-7.4** Memory retrieval MAY use semantic search (future enhancement)

---

## 4. Non-Functional Requirements

### 4.1 Performance

**NFR-1.1** Move generation SHALL complete within 10 seconds for standard complexity games

**NFR-1.2** Rules validation SHALL complete within 100ms

**NFR-1.3** The system SHALL support games with up to 10 players

**NFR-1.4** Database queries SHALL use indexes for optimal performance

### 4.2 Scalability

**NFR-2.1** The system SHALL support 100+ different game definitions

**NFR-2.2** The system SHALL handle 10,000+ stored game sessions

**NFR-2.3** Experience replay buffer SHALL efficiently handle 100,000+ experiences

### 4.3 Reliability

**NFR-3.1** Invalid AI responses SHALL be handled gracefully with retry logic

**NFR-3.2** System SHALL continue operating if AI provider is temporarily unavailable

**NFR-3.3** Database transactions SHALL ensure state consistency

**NFR-3.4** All state changes SHALL be atomic

### 4.4 Maintainability

**NFR-4.1** Code SHALL follow TypeScript best practices

**NFR-4.2** All public interfaces SHALL be documented

**NFR-4.3** System SHALL use dependency injection for testability

**NFR-4.4** Provider implementations SHALL be independently testable

### 4.5 Security

**NFR-5.1** API keys SHALL be stored in environment variables

**NFR-5.2** Database credentials SHALL not be committed to version control

**NFR-5.3** User input SHALL be sanitized before database insertion

**NFR-5.4** AI-generated moves SHALL be validated before application

### 4.6 Technology Stack

**NFR-6.1** Backend: Node.js with TypeScript

**NFR-6.2** Database: PostgreSQL or SQLite with TypeORM

**NFR-6.3** ORM: TypeORM with migrations, Repository pattern using Data Mapper pattern

**NFR-6.4** AI Providers: Anthropic SDK, OpenAI SDK, Ollama client

**NFR-6.5** Interface: CLI (v1 - current priority), REST API with tsoa (future)

**NFR-6.6** REST API (future): tsoa for OpenAPI, Express, resource-based architecture

**NFR-6.7** Web UI (future): React with Vite, React Query, PrimeReact, CSS Variables

---

## 5. Data Model

### 5.1 Core Entities

**Note:** All IDs use UUIDv7 format for time-ordered, sortable identifiers.

#### Games
- `id`: UUIDv7 (Primary Key)
- `name`: String (unique)
- `rules_text`: Text (natural language)
- `strategy_guide`: Text
- `state_schema`: JSONB
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### Rules
- `id`: UUIDv7 (Primary Key)
- `game_id`: UUIDv7 (Foreign Key)
- `type`: Enum (setup, turn, action, validation, win_condition)
- `condition`: Text (DSL expression)
- `action`: Text (DSL expression)
- `priority`: Integer

#### RuleSets
- `id`: UUIDv7 (Primary Key)
- `game_id`: UUIDv7 (Foreign Key)
- `compiled_rules`: JSONB
- `version`: Integer
- `created_at`: Timestamp

#### Sessions
- `id`: UUIDv7 (Primary Key)
- `game_id`: UUIDv7 (Foreign Key)
- `current_state`: JSONB
- `move_history`: JSONB[]
- `status`: Enum (active, completed, abandoned)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `completed_at`: Timestamp

#### SessionPlayers
- `id`: UUIDv7 (Primary Key)
- `session_id`: UUIDv7 (Foreign Key)
- `player_index`: Integer
- `player_type`: Enum (human, ai, ai_rl)
- `ai_provider`: String (nullable)
- `ai_config`: JSONB (nullable)

#### Moves
- `id`: UUIDv7 (Primary Key)
- `session_id`: UUIDv7 (Foreign Key)
- `player_index`: Integer
- `move_number`: Integer
- `action`: JSONB
- `state_before`: JSONB
- `state_after`: JSONB
- `timestamp`: Timestamp

### 5.2 RL Entities

#### RLExperiences
- `id`: UUIDv7 (Primary Key)
- `session_id`: UUIDv7 (Foreign Key)
- `game_id`: UUIDv7 (Foreign Key)
- `state`: JSONB
- `action`: JSONB
- `reward`: Float
- `next_state`: JSONB
- `is_terminal`: Boolean
- `timestamp`: Timestamp

#### RLPolicies
- `id`: UUIDv7 (Primary Key)
- `game_id`: UUIDv7 (Foreign Key)
- `version`: Integer
- `model_weights`: BYTEA or JSON
- `performance_metrics`: JSONB
- `games_played`: Integer
- `win_rate`: Float
- `created_at`: Timestamp

#### RewardFunctions
- `id`: UUIDv7 (Primary Key)
- `game_id`: UUIDv7 (Foreign Key)
- `function_definition`: Text
- `parameters`: JSONB

### 5.3 Observability Entities

#### GameMetrics
- `id`: UUIDv7 (Primary Key)
- `session_id`: UUIDv7 (Foreign Key)
- `player_index`: Integer
- `metric_name`: String
- `metric_value`: Float
- `timestamp`: Timestamp

#### AIDecisions
- `id`: UUIDv7 (Primary Key)
- `move_id`: UUIDv7 (Foreign Key)
- `reasoning`: Text
- `alternatives_considered`: JSONB
- `confidence`: Float
- `processing_time_ms`: Integer

---

## 6. User Interface

### 6.1 CLI Interface (v1)

**Commands:**
```
game-ai list-games              # List available games
game-ai new-game <name>         # Start a new game session
game-ai resume <session-id>     # Resume a saved game
game-ai add-game <file>         # Add game definition from file
game-ai configure               # Configure AI providers
game-ai analyze <session-id>    # View game analytics
game-ai train <game-name>       # Run RL training session
```

**Example Session:**
```
$ game-ai new-game "Flip 7"
Starting new game: Flip 7
Players:
  1. Human (you)
  2. AI (Claude Sonnet 4.5)

Game initialized. You go first.

Your hand: [3, 5, 7, 9, J, K, A]
Top of discard pile: 2

Your move: play 3

AI is thinking...
AI plays: 5
AI reasoning: Playing 5 maintains pressure while conserving higher cards

Your hand: [5, 7, 9, J, K, A]
Top of discard pile: 5

Your move: 
```

---

## 7. Success Metrics

### 7.1 Technical Metrics
- Move validation latency < 100ms
- AI move generation < 10 seconds
- Zero invalid moves applied to game state
- 99% uptime for local system

### 7.2 AI Performance Metrics
- Win rate improvement over time (RL)
- Move quality (compared to expert play)
- Strategy adherence
- Exploration vs exploitation balance

### 7.3 User Metrics
- Number of games defined
- Number of games played
- Session completion rate
- User satisfaction (qualitative)

---

## 8. Milestones

### Phase 1: Core Foundation
- Database schema implementation
- Basic rules engine with simple DSL
- Provider interface and Claude implementation
- Simple game (Tic-Tac-Toe) as proof of concept

### Phase 2: Game Engine
- Session management
- Human vs AI gameplay
- Move validation and state management
- CLI interface for gameplay

### Phase 3: Advanced Rules
- Complex rule DSL implementation
- Multiple game support
- AI vs AI mode
- Multi-player support

### Phase 4: Reinforcement Learning
- Experience recording
- Basic reward calculation
- Policy training and storage
- Epsilon-greedy exploration

### Phase 5: Polish & Optimization
- Performance optimization
- Memory system refinement
- Analytics and observability
- Documentation

---

## 9. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI generates invalid moves frequently | High | Medium | Robust validation layer, retry logic |
| Rules engine too complex to implement generically | High | Medium | Start with simple DSL, iterate based on real games |
| RL not effective for board games | Medium | Low | Combine with LLM reasoning, use hybrid approach |
| Database performance issues with large experience buffers | Medium | Medium | Implement archiving, use indexing, consider partitioning |
| AI provider costs too high | Low | Medium | Support local models (Ollama), caching, rate limiting |

---

## 10. Open Questions

1. **Rules DSL Design**: What's the right balance between expressiveness and simplicity?
2. **RL Architecture**: Should RL modify prompts, rank suggestions, or work independently?
3. **Multi-player Sync**: How to handle turn order and state synchronization?
4. **Memory Retrieval**: Simple filtering or semantic search with embeddings?
5. **Observability Scope**: What level of decision logging is useful vs overwhelming?

---

## 11. Future Enhancements

- Web UI for game visualization
- REST API for remote gameplay
- Tournament mode with brackets
- Game replay and analysis tools
- Export games to standard formats (PGN, SGF, etc.)
- Community game repository
- Collaborative filtering for strategy recommendations
- Advanced RL algorithms (PPO, A3C)
- Semantic memory search with embeddings

---

## 12. Appendix

### 12.1 Example Game Definition

```json
{
  "name": "Flip 7",
  "rules_text": "Each player starts with 7 cards. Players take turns playing a card that is higher than the top card of the discard pile. If you play a 7, flip the discard pile over. First player to empty their hand wins.",
  "strategy_guide": "Save 7s for critical moments. Play high cards early to maintain control. Track opponent's remaining cards.",
  "state_schema": {
    "players": [
      {
        "hand": [],
        "cards_played": 0
      }
    ],
    "deck": [],
    "discard_pile": [],
    "current_player_index": 0,
    "flipped": false
  }
}
```

### 12.2 Glossary

- **DSL**: Domain-Specific Language
- **RL**: Reinforcement Learning
- **Provider**: An AI service that generates moves (Claude, GPT-4, etc.)
- **Session**: A single playthrough of a game
- **Experience**: A state-action-reward-next_state tuple for RL
- **Policy**: A learned strategy for choosing moves
- **Rules Engine**: Component that validates moves and evaluates game state

---

**Document End**
