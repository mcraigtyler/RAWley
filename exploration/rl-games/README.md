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

  Player X — 1) Human, 2) Random: 1
  Player O — 1) Human, 2) Random: 2
```

Options:
- **Human vs Human** — two players at the same keyboard
- **Human vs Random** — play against a random agent
- **Random vs Random** — watch two agents play (300ms delay between moves)

The board shows available positions as numbers and taken positions as X/O:

```
  Position map:       Current board:

    0 | 1 | 2           X | 1 | 2
    ---------           ---------
    3 | 4 | 5           3 | O | 5
    ---------           ---------
    6 | 7 | 8           6 | 7 | 8
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run play:ttt` | Play tic-tac-toe in the terminal |
| `npm run train` | Train the Q-learning agent via self-play |
| `npm run baseline` | Measure baseline win rates (Random vs Random, LLM vs Random) |
| `npm run compare` | Pit trained Q-agent against other agents |
| `npm test` | Run unit tests |
| `npm run typecheck` | TypeScript type checking |
