# rl-games

Q-learning agent that learns to play tic-tac-toe through self-play, then competes against an LLM player (Ollama).

See [QLearning.md](../QLearning.md) for the full implementation plan.

## Setup

```bash
cd exploration/rl-games
npm install
```

## Play Tic-Tac-Toe

```bash
npm run play:ttt
```

You'll be prompted to choose who controls each side:

```
  Choose who plays each side:

  Player X — 1) Human, 2) Random, 3) Q-Learning: 1
  Player O — 1) Human, 2) Random, 3) Q-Learning: 3
```

Options:
- **Human** — play manually via keyboard
- **Random** — random legal moves (baseline)
- **Q-Learning** — trained Q-table agent (you'll be prompted for a Q-table file)

When selecting Q-Learning, you'll be asked for a Q-table file path:

```
  Q-table file path (e.g. q-tables/ttt-50k.json):
```

If no file is given or the file doesn't exist, an untrained agent (all Q-values at 0) is used.

### Batch Mode

When no humans are playing, you can run multiple games at once:

```
  Number of games to play (default 1): 100
  Show each game result? (y/n, default y): n
```

A stats summary is shown when finished or when you quit.

## Q-Learning Agent

### How It Works

The agent uses a Q-table to map (state, action) pairs to expected future reward. During training it uses **epsilon-greedy** exploration: with probability ε it picks a random move, otherwise it picks the move with the highest Q-value.

After each game, the Q-learning update rule is applied backward through the move history:

```
Q(s, a) = Q(s, a) + α * [reward + γ * max Q(s', a') - Q(s, a)]
```

### Hyperparameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `learningRate` (α) | 0.1 | How fast Q-values update toward new information |
| `discountFactor` (γ) | 0.9 | How much future rewards are valued vs immediate |
| `epsilon` (ε) | 1.0 | Starting exploration rate (1.0 = fully random) |
| `epsilonDecay` | 0.9995 | Multiplied to ε after each training episode |
| `epsilonMin` | 0.01 | Floor for ε so agent never stops exploring entirely |

Pass overrides to the constructor:

```typescript
const agent = new QLearningAgent(
  { learningRate: 0.2, epsilon: 0.5 },  // config overrides
  { win: 2.0, draw: 0.5 }               // reward overrides
);
```

### Rewards

| Outcome | Default | Description |
|---------|---------|-------------|
| Win | +1.0 | Agent wins the game |
| Loss | -1.0 | Agent loses the game |
| Draw | +0.3 | Slightly positive to prefer draws over losses |

Rewards are configurable via the second constructor argument. The draw reward being positive encourages the agent to avoid losses even when it can't win.

### Save / Load Q-Tables

After training, save the learned Q-table:

```typescript
agent.save('q-tables/ttt-50k.json');
```

Load a previously trained table for play or evaluation:

```typescript
agent.load('q-tables/ttt-50k.json');
```

Q-table files are JSON objects mapping state keys (e.g. `"XO__X__O_"`) to arrays of 9 Q-values.

## Commands

| Command | Description |
|---------|-------------|
| `npm run play:ttt` | Play tic-tac-toe in the terminal |
| `npm run train` | Train the Q-learning agent via self-play |
| `npm run baseline` | Measure baseline win rates (Random vs Random, LLM vs Random) |
| `npm run compare` | Pit trained Q-agent against other agents |
| `npm test` | Run unit tests |
| `npm run typecheck` | TypeScript type checking |
