# Q-Learning Implementation Plan

**Goal:** Build a Q-learning agent that learns to play tic-tac-toe through self-play, then compare it against an LLM player (Ollama) and explore hybrid approaches.

**Tech stack:** TypeScript, ESM modules, tsx (matching the ollama-chat experiment)

---

## Project Setup

### Folder Structure

```
exploration/
  rl-games/
    package.json
    tsconfig.json
    src/
      games/
        TicTacToe.ts          # Game logic, rules, state management
      agents/
        types.ts              # Shared agent interface
        RandomAgent.ts        # Plays random legal moves
        QLearningAgent.ts     # Q-table based agent
        LLMAgent.ts           # Ollama-based agent
      training/
        train.ts              # Training loop: Q-agent plays itself
      experiments/
        baseline.ts           # Measure LLM and random agent win rates
        compare.ts            # Pit agents against each other
      utils/
        stats.ts              # Win/loss/draw tracking
    q-tables/                 # Saved Q-tables after training (gitignored)
```

### package.json

```json
{
  "name": "rl-games",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "train": "tsx src/training/train.ts",
    "baseline": "tsx src/experiments/baseline.ts",
    "compare": "tsx src/experiments/compare.ts"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "tsx": "^4.19.0"
  }
}
```

No external dependencies needed — Q-learning is pure math and the Ollama API is just `fetch`.

### tsconfig.json

Same as the ollama-chat server — `ES2022` target, `ESNext` modules, `strict: true`.

---

## Step 1: Game Engine — `TicTacToe.ts`

The game class is the foundation everything else depends on. It needs to be clean and reliable.

### Interface

```typescript
type Player = 'X' | 'O';
type Cell = Player | null;
type Board = Cell[];  // length 9, index 0-8

interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player | 'draw' | null;  // null = game in progress
  moveHistory: number[];
}
```

### Methods to implement

| Method | Purpose |
|--------|---------|
| `constructor()` | Initialize empty board, X goes first |
| `getValidMoves(): number[]` | Return indices of empty cells |
| `makeMove(position: number): boolean` | Place current player's mark, switch turns, check win |
| `checkWinner(): Player \| 'draw' \| null` | Check rows/cols/diagonals, check for full board |
| `getStateKey(): string` | Serialize board to string for Q-table lookup (e.g., `"XO__X__O_"`) |
| `clone(): TicTacToe` | Deep copy for simulations |
| `display(): string` | Pretty-print board for debugging |
| `reset(): void` | Clear the board for a new game |

### Key design decisions

- **Board as flat array (0-8):** Simpler than 2D. Position mapping:
  ```
  0 | 1 | 2
  ---------
  3 | 4 | 5
  ---------
  6 | 7 | 8
  ```
- **State key format:** `"XO__X__O_"` — 9 characters, `_` for empty. This becomes the Q-table key.
- **Immutable-ish:** `makeMove` mutates the instance. Use `clone()` when you need to explore hypotheticals.

### Win check logic

Eight winning lines to check:
```typescript
const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],  // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8],  // columns
  [0, 4, 8], [2, 4, 6],              // diagonals
];
```

---

## Step 2: Agent Interface — `types.ts`

All agents (random, Q-learning, LLM) share a common interface so they can be swapped in experiments.

```typescript
interface Agent {
  /** Choose a move given the current game state */
  chooseMove(game: TicTacToe): Promise<number>;

  /** Human-readable name for logging */
  name: string;
}
```

Using `Promise<number>` even for synchronous agents (random, Q-learning) so the interface works with the async LLM agent too.

---

## Step 3: Random Agent — `RandomAgent.ts`

The simplest possible agent. This is your baseline opponent.

```typescript
class RandomAgent implements Agent {
  name = 'Random';

  async chooseMove(game: TicTacToe): Promise<number> {
    const moves = game.getValidMoves();
    return moves[Math.floor(Math.random() * moves.length)];
  }
}
```

---

## Step 4: Q-Learning Agent — `QLearningAgent.ts`

This is the core of the experiment. The agent maintains a Q-table and updates it through experience.

### Data structure

```typescript
// Q-table: Map<stateKey, actionValues>
// actionValues is a number[] of length 9 (one value per board position)
// Invalid positions keep a value of -Infinity so they're never selected
type QTable = Map<string, number[]>;
```

### Hyperparameters

```typescript
interface QLearningConfig {
  learningRate: number;     // α — how fast to update (start: 0.1)
  discountFactor: number;   // γ — value of future rewards (start: 0.9)
  epsilon: number;          // ε — exploration rate (start: 1.0)
  epsilonDecay: number;     // multiply ε by this after each episode (start: 0.9995)
  epsilonMin: number;       // floor for ε (start: 0.01)
}
```

### Methods to implement

| Method | Purpose |
|--------|---------|
| `chooseMove(game)` | Epsilon-greedy: random with probability ε, best Q-value otherwise |
| `getQValues(stateKey)` | Look up or initialize Q-values for a state |
| `update(state, action, reward, nextState)` | Apply the Q-learning update rule |
| `decayEpsilon()` | Reduce exploration rate after each episode |
| `save(filepath)` | Write Q-table to JSON file |
| `load(filepath)` | Read Q-table from JSON file |

### The Q-learning update rule

After each move, update the Q-value for the (state, action) pair:

```
Q(s, a) = Q(s, a) + α * [reward + γ * max(Q(s', a')) - Q(s, a)]
```

In code:
```typescript
update(state: string, action: number, reward: number, nextState: string | null): void {
  const qValues = this.getQValues(state);
  const currentQ = qValues[action];

  let targetQ: number;
  if (nextState === null) {
    // Terminal state — no future reward
    targetQ = reward;
  } else {
    const nextQValues = this.getQValues(nextState);
    const maxNextQ = Math.max(...nextQValues.filter(v => v > -Infinity));
    targetQ = reward + this.config.discountFactor * maxNextQ;
  }

  qValues[action] = currentQ + this.config.learningRate * (targetQ - currentQ);
}
```

### Reward scheme

| Outcome | Reward |
|---------|--------|
| Win | +1.0 |
| Loss | -1.0 |
| Draw | +0.3 |
| Each non-terminal move | 0.0 |

The draw reward is slightly positive to encourage the agent to prefer draws over losses, but not to pursue draws over wins.

### Important detail: learning from both sides

During self-play, the agent plays both X and O. After a game ends, you need to assign rewards to both players' move histories:

```
Winner's moves → reward +1.0 for the final state
Loser's moves  → reward -1.0 for the final state
Draw           → reward +0.3 for both
```

Track each player's `(state, action)` history separately during the game, then apply updates backward.

---

## Step 5: Training Loop — `train.ts`

### Flow

```
for each episode (1 to N):
  1. Create new game
  2. While game not over:
     a. Current player's agent chooses a move (epsilon-greedy)
     b. Record (state, action) in that player's history
     c. Apply the move
  3. Game ended — determine reward for each player
  4. For each player's history, apply Q-learning updates (backwards)
  5. Decay epsilon
  6. Every 1000 episodes, log progress
Save Q-table
```

### Training configuration

```typescript
const TRAINING_EPISODES = 50_000;
const LOG_INTERVAL = 5_000;
const EVAL_GAMES = 500;  // games to play against random for progress check
```

### Progress logging

Every `LOG_INTERVAL` episodes, pause training and evaluate:
- Play 500 games vs random agent (with epsilon = 0, pure exploitation)
- Log: episode number, win/loss/draw rates, Q-table size, current epsilon

Expected output:
```
Episode  5000 | vs Random: W:72% L:8%  D:20% | Q-table: 4200 states | ε: 0.082
Episode 10000 | vs Random: W:85% L:3%  D:12% | Q-table: 5100 states | ε: 0.007
Episode 50000 | vs Random: W:93% L:1%  D:6%  | Q-table: 5478 states | ε: 0.010
```

### Saving the Q-table

Write to `q-tables/ttt-50k.json`:
```typescript
// Convert Map to object for JSON serialization
const data = Object.fromEntries(qTable);
writeFileSync('q-tables/ttt-50k.json', JSON.stringify(data, null, 2));
```

File will be roughly 1-3 MB depending on states visited.

---

## Step 6: LLM Agent — `LLMAgent.ts`

Uses the same Ollama API you're already familiar with from the chatbot experiment.

### Ollama call (non-streaming)

Unlike the chatbot, we don't need streaming here. Use the non-streaming `/api/generate` or `/api/chat` endpoint:

```typescript
const response = await fetch('http://localhost:11434/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'llama3.2',
    stream: false,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: formatBoardPrompt(game) },
    ],
  }),
});
const data = await response.json();
const moveText = data.message.content;
```

### Prompt design

System prompt:
```
You are playing tic-tac-toe. You will be given the current board state.
Respond with ONLY a single number 0-8 representing your move.
Board positions are:
0 | 1 | 2
---------
3 | 4 | 5
---------
6 | 7 | 8
```

User prompt (per turn):
```
Board:
X | _ | O
---------
_ | X | _
---------
_ | _ | _

You are playing as O. Available positions: 1, 3, 5, 6, 7, 8
Your move (single number):
```

### Handling invalid responses

The LLM will sometimes return text instead of a number, or pick an occupied square. Handle this:

```typescript
async chooseMove(game: TicTacToe): Promise<number> {
  const validMoves = game.getValidMoves();

  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await this.askOllama(game);
    const parsed = parseInt(response.trim(), 10);

    if (!isNaN(parsed) && validMoves.includes(parsed)) {
      return parsed;
    }
    // Retry with a more explicit prompt on failure
  }

  // Fallback: pick a random valid move
  return validMoves[Math.floor(Math.random() * validMoves.length)];
}
```

Track the fallback rate — this is a useful metric for prompt quality.

---

## Step 7: Experiments

### Experiment 1: Baseline (`baseline.ts`)

Play 200 games of each matchup and record results:

| Matchup | Purpose |
|---------|---------|
| Random vs Random | Sanity check — X should win ~58%, O ~29%, draw ~13% |
| LLM (X) vs Random (O) | How good is the LLM out of the box? |
| Random (X) vs LLM (O) | Does playing second change LLM performance? |

### Experiment 2: Compare (`compare.ts`)

After training, run these matchups (200 games each):

| Matchup | Purpose |
|---------|---------|
| Q-Agent vs Random | How good is the trained agent? |
| Q-Agent (X) vs LLM (O) | Direct comparison |
| LLM (X) vs Q-Agent (O) | Does first-move advantage matter? |
| Q-Agent vs Q-Agent | Should mostly draw if well-trained |

### Output format

Print a results table after each experiment:
```
=== Q-Agent (X) vs LLM (O) — 200 games ===
  X wins:  156 (78.0%)
  O wins:   22 (11.0%)
  Draws:    22 (11.0%)
  Avg game length: 6.8 moves
  LLM invalid move rate: 4.2%
  Avg LLM response time: 320ms
```

---

## Step 8: Stats Utility — `stats.ts`

A simple helper to accumulate and display results across games:

```typescript
interface GameResult {
  winner: 'X' | 'O' | 'draw';
  moves: number;
  invalidMoveCount?: number;
}

class Stats {
  private results: GameResult[] = [];

  record(result: GameResult): void { ... }
  summary(label: string): string { ... }  // formatted table
  winRate(player: Player): number { ... }
}
```

---

## Implementation Order

Build in this order, testing each piece before moving on:

| # | Task | Depends On | How to Verify |
|---|------|-----------|---------------|
| 1 | Project scaffolding | — | `npm install` succeeds |
| 2 | `TicTacToe.ts` | — | Manual test: play a game in console via a quick script |
| 3 | `types.ts` + `RandomAgent.ts` | TicTacToe | Random vs Random produces expected ~58/29/13 split |
| 4 | `stats.ts` | — | Results display correctly |
| 5 | `QLearningAgent.ts` | TicTacToe | Unit test: Q-values update after a single episode |
| 6 | `train.ts` | QLearningAgent | Train 50k episodes, watch win rate climb in logs |
| 7 | `baseline.ts` | RandomAgent, Stats | Get baseline numbers for Random vs Random |
| 8 | `LLMAgent.ts` | TicTacToe | Play one game manually, verify it gets valid moves from Ollama |
| 9 | `compare.ts` | All agents | Run all matchups, produce the comparison table |

### Start with steps 1-6

Steps 1-6 are purely local with no external dependencies (no Ollama needed). This is where you'll learn the most about Q-learning. Get the agent training and beating random before adding the LLM comparison.

Steps 7-9 bring in Ollama and require it to be running. These are slower (each LLM call takes ~300ms) so keep game counts manageable.

---

## What to Watch For

**During training:**
- If win rate plateaus below 80% vs random, try lowering the learning rate
- If Q-table grows beyond 6000 states, something may be wrong with state key generation (tic-tac-toe has ~5,478 reachable states)
- Epsilon should reach its minimum by around episode 10-15k

**During LLM experiments:**
- LLM response time will dominate — a 200-game experiment will take ~2-5 minutes
- If invalid move rate is above 20%, the prompt needs work
- The LLM will likely be worse than the Q-agent — that's expected and is the whole point

**Common bugs:**
- Forgetting to switch perspective when updating Q-values for the losing player
- Not handling the terminal state correctly (no `max(Q(s'))` when the game is over)
- State key not accounting for whose turn it is (the same board means different things for X vs O)
