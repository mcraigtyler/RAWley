# Exploration Phase: Key Learnings

**Started:** [Date]
**Status:** In Progress
**Completed:** [Date]

---

## Executive Summary

[After completing exploration, write 2-3 paragraphs summarizing the most important findings and recommendations]

---

## 1. Local AI with Ollama

### Setup & Configuration

**What worked:**
- [e.g., Docker setup was straightforward, used X GB RAM]

**Challenges:**
- [e.g., Model download took Y minutes, GPU support required Z]

**Best models for board games:**
| Model | Size | Speed | Quality | Reasoning Ability | Recommendation |
|-------|------|-------|---------|-------------------|----------------|
| llama3.2 | 2GB | Fast | Good | ⭐⭐⭐ | Good for simple games |
| mistral | 4GB | Medium | Better | ⭐⭐⭐⭐ | Recommended |
| [add more] | | | | | |

### Prompt Engineering Findings

**Effective prompt patterns:**
```
[Document prompts that worked well]
```

**Failed approaches:**
```
[Document what didn't work and why]
```

**Key insights:**
- [e.g., "JSON output is unreliable without clear schema"]
- [e.g., "Adding 'think step by step' improved move quality by X%"]

---

## 2. Cloud AI Providers

### Claude API

**Performance:**
- Average response time: [X] ms
- Cost per game: $[Y]
- Invalid move rate: [Z]%

**Best practices:**
- [e.g., "Use temperature=0.7 for balance of creativity and consistency"]

### OpenAI GPT

**Performance:**
- [Compare with Claude]

**Comparison:**
| Metric | Claude | GPT-4 | Winner |
|--------|--------|-------|--------|
| Response Time | | | |
| Cost per 1000 moves | | | |
| Move Quality | | | |
| Invalid Move Rate | | | |
| Reasoning Clarity | | | |

### Recommendation
[Which provider(s) to use and why]

---

## 3. Reinforcement Learning

### Q-Learning for Tic-Tac-Toe

**Implementation:** See `rl-games/` for full code.

**How the Q-table works:**
- The Q-table maps **board states** (not game histories) to move values
- Key format: 9-character string like `"XO__X__O_"` — one char per cell
- Each entry stores an array of 9 Q-values (one per board position)
- Occupied positions get `-Infinity` so they're never selected
- Two games reaching the same board via different move orders share the same Q-table entry
- The agent does NOT store transitions between states — only per-state move valuations
- This is "model-free" RL: no game tree, just learned (state, action) values

**The Q-learning update rule:**
```
Q(s, a) = Q(s, a) + α * [reward + γ * max Q(s', a') - Q(s, a)]
```
- Applied backward through each player's move history after a game ends
- Terminal reward (win/loss/draw) is assigned to the last move; earlier moves get reward=0
- The discount factor (γ=0.9) propagates value backward through the `nextState` chain
- With learning rate α=0.1 and discount γ=0.9, reward signal reaching the opening move after one game is ~0.000006 (0.1^4 * 0.9^4) — essentially invisible from a single game

**Key insight — exploration vs exploitation:**
- With epsilon=0 (no exploration), the agent locks onto the first move that gets any non-zero Q-value
- After one game, the opening move gets a tiny positive value (~0.000006), making it strictly better than 0
- From that point, the agent always picks that same opening move and never tries alternatives
- **Epsilon must be > 0** for the agent to discover better strategies through exploration
- Epsilon-greedy: with probability ε pick a random move, otherwise pick the best Q-value move
- Epsilon decays over time so the agent gradually shifts from exploring to exploiting what it learned

**Key insight — tied Q-values:**
- When all Q-values are equal (untrained state), always picking the first valid move causes repetitive play
- Solution: randomize among moves that share the best Q-value
- This only helps until values diverge (after first game), then epsilon-greedy takes over

**Hyperparameters (defaults):**
| Parameter | Value | Notes |
|-----------|-------|-------|
| Learning rate (α) | 0.1 | How fast Q-values update |
| Discount factor (γ) | 0.9 | How much future rewards matter |
| Epsilon (ε) | 1.0 (training), 0.5 (untrained play), 0.05 (trained play) | Exploration rate |
| Epsilon decay | 0.9995 (training), 0.995 (play) | Multiplied per episode/game |
| Epsilon min | 0.01–0.05 | Never fully stop exploring |

**Rewards:**
| Outcome | Value | Reasoning |
|---------|-------|-----------|
| Win | +1.0 | Primary goal |
| Loss | -1.0 | Strong negative signal |
| Draw | +0.3 | Slightly positive — prefer draw over loss |

**Performance (from unit test — 1000 training episodes):**
- Win rate vs random after 1000 self-play episodes: >60%
- Q-table size after 1000 episodes: several hundred states
- Full training run (50k episodes, Task 6) expected to reach >90% vs random

**Challenges discovered:**
1. **JSON serialization of -Infinity:** `JSON.stringify(-Infinity)` produces `null`. Must restore `-Infinity` on load.
2. **Reward propagation is slow:** With α=0.1 and γ=0.9, opening moves barely feel the terminal reward after one game. Q-learning requires thousands of games to learn opening strategy — not suitable for "learn while you play" with a handful of games.
3. **Exploration is critical:** Without epsilon > 0, the agent gets stuck on whatever worked first and never discovers better moves. This was the single biggest issue during initial testing.
4. **State space is manageable for tic-tac-toe:** ~5,478 reachable states. This fits comfortably in memory and a 1-3 MB JSON file. Won't scale to complex games without approximation (neural networks, etc.).

### Applicability to Complex Games

**Pros:**
- Pure math, no external dependencies
- Deterministic once trained (with epsilon=0)
- Fast inference — just a hash table lookup
- Learns optimal play through self-play, no human expertise needed

**Cons:**
- State space explodes for complex games (chess: ~10^44 states)
- Tabular Q-learning only works for small state spaces
- Requires many thousands of training episodes
- No generalization — each board state is independent, doesn't "understand" patterns
- For games beyond tic-tac-toe complexity, would need Deep Q-Networks (DQN) or policy gradient methods

**Recommendation:**
Tabular Q-learning is excellent for learning about RL fundamentals and works well for simple games (tic-tac-toe, Connect Four). For the RAWley project's goal of supporting arbitrary board games, a hybrid approach (RL + LLM) or function approximation (neural networks) will be needed for anything beyond trivial state spaces.

---

## 4. Hybrid Approaches

### Approach 1: LLM Generates, RL Scores

**Implementation notes:**
[How you built it]

**Results:**
- Win rate: [X]%
- Agreement rate (RL agrees with LLM): [Y]%

**Pros:**
- [What worked well]

**Cons:**
- [What didn't work]

### Approach 2: RL Suggests Strategy, LLM Executes

**Results:**
[Performance data]

**Insights:**
[What you learned]

### Approach 3: Weighted Combination

**Optimal α value:** [X]

**Results:**
[Performance compared to pure LLM or pure RL]

### Recommendation

**Which approach to use:**
[Your recommendation with reasoning]

**When to use what:**
- Simple games (tic-tac-toe): [approach]
- Medium games (card games): [approach]
- Complex games (chess): [approach]

---

## 5. Game Implementation Learnings

### Tic-Tac-Toe Prototype

**Code:** `rl-games/src/games/tic-tac-toe/`

**Key design decisions that worked well:**
1. **Board as flat array (0-8)** — simpler than 2D, easy to serialize, natural for Q-table keys
2. **State key as string** (`"XO__X__O_"`) — compact, hashable, order-independent (two paths to same board = same key)
3. **Agent interface with `async chooseMove(game): Promise<number>`** — works for sync agents (Random, Q-Learning) and async agents (LLM) with a single interface
4. **Game-per-folder structure** (`src/games/tic-tac-toe/`) — keeps game engine and play script together, scales to multiple games

**Key challenges:**
1. **Windows + ESM + test runner:** Node's built-in test runner doesn't auto-discover `.ts` files. Had to build a custom `test/run.ts` that uses `readdirSync` + `node:test`'s `run()` API.
2. **Agent-agnostic game loop:** The play script needed to handle Human, Random, and Q-Learning agents transparently. The `Agent` interface made this clean, but Q-Learning needed extra lifecycle hooks (learning updates after each game, save on exit) that don't fit the basic interface.

### State Serialization

**What worked:**
- 9-character string keys for Q-table (`"XO__X__O_"`) — fast, deterministic, order-independent
- Q-table as JSON (`Map` → `Object.fromEntries` → `JSON.stringify`) — simple, portable

**Gotcha:**
- `JSON.stringify(-Infinity)` produces `null`. Must handle on deserialization. Any special numeric values (Infinity, NaN) will have this problem with JSON.

---

## 6. Overall Recommendations

### Technology Stack

**AI Provider:**
- **Primary:** [Claude/GPT/Ollama] because [reason]
- **Fallback:** [Alternative] for [use case]
- **Local Development:** [Ollama/Mock] for [reason]

**RL Integration:**
- **Use RL:** [Yes/No/Maybe]
- **If yes:** For [which types of games]
- **Approach:** [Which hybrid approach]

**Infrastructure:**
- [Any changes to Docker setup?]
- [Any additional services needed?]

### Architecture Implications

**Changes needed to Architecture doc:**
1. [e.g., "RL Engine may not be needed for v1"]
2. [e.g., "Provider interface should support streaming"]
3. [e.g., "Add retry mechanism with exponential backoff"]

**New requirements:**
1. [e.g., "Need prompt template system"]
2. [e.g., "Add API cost tracking"]

### Risks & Mitigations

**New risks discovered:**
| Risk | Impact | Mitigation |
|------|--------|------------|
| [e.g., "API rate limits"] | High | [Use local fallback] |
| [e.g., "JSON parsing unreliable"] | Medium | [Strict schema + validation] |

---

## 7. Next Steps

### Ready for Phase 0?

- [ ] Comfortable with chosen AI provider
- [ ] Understand RL trade-offs
- [ ] Know which hybrid approach to use (if any)
- [ ] Identified key implementation challenges
- [ ] Have working prototypes to reference

### Recommended Phase 0 Adjustments

Based on exploration, Phase 0 should:
1. [e.g., "Include prompt template system from the start"]
2. [e.g., "Skip RL initially, add in Phase 4"]
3. [e.g., "Add API retry middleware"]

### Open Questions

Questions still unanswered:
1. [Question that needs more research]
2. [Question to decide during Phase 0]

---

## Appendix: Code Samples

### Best Prompt Template
```typescript
[Include your best-performing prompt template]
```

### Effective Move Parser
```typescript
[Include code that reliably parses AI moves]
```

### Simple RL Implementation
```typescript
[Include minimal Q-learning code as reference]
```

---

## Time Tracking

- Ollama setup & testing: [X] hours
- Cloud API testing: [Y] hours
- RL implementation: [Z] hours
- Hybrid approaches: [A] hours
- Game prototypes: [B] hours
- Documentation: [C] hours

**Total exploration time:** [Total] hours
