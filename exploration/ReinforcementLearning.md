# Reinforcement Learning Exploration Plan

**Goal:** Learn how to make an LLM better at playing simple games (tic-tac-toe, blackjack) beyond its base capabilities.

**Prerequisites Completed:**
- Ollama running locally with llama3.2
- Chat interface working (ollama-chat experiment)
- Basic understanding of LLM prompting

---

## Important Context: What "Training" Means Here

LLMs like llama3.2 are pretrained — you can't easily retrain their weights. Instead, there are several practical strategies to improve game-playing performance, ranging from simple to complex:

| Strategy | Difficulty | Description |
|----------|-----------|-------------|
| **Prompt Engineering** | Easy | Better instructions, examples, chain-of-thought |
| **Few-Shot Learning** | Easy | Include example games in the prompt |
| **Q-Learning (Classic RL)** | Medium | Train a separate agent that learns optimal play from scratch |
| **LLM + RL Hybrid** | Hard | Use RL to guide or score LLM-generated moves |
| **Fine-Tuning** | Advanced | Actually modify model weights with game data |

This plan progresses through each strategy so you learn the concepts incrementally.

---

## Phase 1: Baseline — How Good Is the LLM Already?

**Purpose:** Establish a measurable baseline before trying to improve anything.

### Experiment 1A: Tic-Tac-Toe Baseline

Build a simple tic-tac-toe game loop that plays the LLM against a random opponent.

**What to build:**
- A `TicTacToe` class that tracks board state, validates moves, and detects wins
- A game loop that asks the LLM for moves via the Ollama API
- A random-move opponent
- A results tracker (wins/losses/draws over N games)

**What to measure:**
- Win rate vs random player (over 100+ games)
- Invalid move rate (LLM suggests occupied square or bad format)
- Average response time per move

**Suggested folder:** `exploration/rl-games/`

### Experiment 1B: Blackjack Baseline

Same idea but for blackjack (hit/stand decisions).

**What to build:**
- A simple blackjack dealer (deck, deal, hit, stand, bust detection)
- LLM as the player — given hand total and dealer upcard, decide hit or stand
- Track results over 200+ hands

**What to measure:**
- Win rate vs dealer (compare to basic strategy ~42%)
- How often does the LLM make mathematically wrong decisions?
- Does it understand soft hands (ace counting)?

---

## Phase 2: Prompt Engineering — Improve Without Code Changes

**Purpose:** See how much better you can make the LLM just by changing the prompt.

### Experiment 2A: Structured Prompts

Try different prompt strategies and measure improvement:

1. **Naive prompt:** "You're playing tic-tac-toe. Board is: ... What's your move?"
2. **System prompt with rules:** Add a system message explaining the game rules clearly
3. **Chain-of-thought:** "Think step by step. Consider what your opponent might do next."
4. **Few-shot examples:** Include 2-3 example game positions with optimal moves
5. **Strategy injection:** "Prioritize: 1) Win if possible 2) Block opponent wins 3) Take center 4) Take corners"

### Experiment 2B: Blackjack Strategy Prompt

- Give the LLM a basic strategy chart in the system prompt
- Compare win rate with and without the chart
- Test if the LLM can follow a lookup table reliably

### Key Questions to Answer
- How much does prompt engineering alone improve win rate?
- Is there a ceiling where better prompts stop helping?
- Which technique gives the biggest improvement per effort?

---

## Phase 3: Classic Q-Learning — RL From Scratch

**Purpose:** Understand reinforcement learning fundamentals by building a Q-learning agent that has nothing to do with the LLM. This is pure RL.

### Concept Overview

Q-Learning trains an agent by having it play thousands of games and learning which moves lead to wins:

```
Q(state, action) = Q(state, action) + α * (reward + γ * max(Q(next_state, all_actions)) - Q(state, action))
```

- **Q-table:** Maps every (state, action) pair to a value (how good is this action in this state?)
- **α (learning rate):** How fast to update beliefs (start with 0.1)
- **γ (discount factor):** How much to value future rewards (start with 0.9)
- **ε (epsilon):** Exploration rate — how often to try random moves (start at 1.0, decay to 0.1)

### Experiment 3A: Q-Learning Tic-Tac-Toe

**What to build:**
1. State representation — encode the board as a string (e.g., "XO__X__O_")
2. Q-table — a Map<string, number[]> mapping states to action values
3. Training loop — agent plays against itself for thousands of episodes
4. Epsilon-greedy policy — explore randomly at first, exploit learned values later

**Training plan:**
- Train for 10,000 episodes with self-play
- Decay epsilon from 1.0 to 0.1 over training
- Save the Q-table to a JSON file after training

**What to measure:**
- Win rate vs random at checkpoints (1k, 5k, 10k, 50k episodes)
- Size of the Q-table (how many states were visited?)
- Does it discover known strategies? (take center, take corners, fork)
- Win rate vs your prompt-engineered LLM from Phase 2

### Experiment 3B: Q-Learning Blackjack

**What to build:**
- State: (player hand total, dealer upcard, has usable ace) — about 200 states
- Actions: hit or stand
- Train through 100,000+ hands

**What to measure:**
- Compare learned policy to published basic strategy chart
- Does it discover soft-hand rules on its own?
- Win rate compared to the LLM

### Key Questions to Answer
- How many episodes does it take to converge?
- How does the Q-learning agent compare to the prompt-engineered LLM?
- What are the limitations of Q-learning for larger games?

---

## Phase 4: LLM + RL Hybrid — Combining Strengths

**Purpose:** This is where things get interesting for the RAWley project. Explore how RL can make the LLM play better.

### Why Hybrid?

- **LLM strengths:** Can handle any game from natural language rules, provides reasoning, works on new games immediately
- **LLM weaknesses:** Makes mistakes on calculation-heavy decisions, no learning from experience
- **RL strengths:** Learns optimal play, improves with experience
- **RL weaknesses:** Needs thousands of games to train, can't generalize to new games

### Experiment 4A: RL as Move Validator

The simplest hybrid — use the trained Q-table to check the LLM's moves:

```
1. LLM suggests a move
2. Look up Q-value for that move in the current state
3. If Q-value is below threshold, ask LLM to reconsider
4. Track: how often does RL override improve the outcome?
```

**What to measure:**
- How often does RL disagree with the LLM?
- When RL disagrees, who is right more often?
- Does the override improve overall win rate?

### Experiment 4B: RL as Strategy Advisor

Use the Q-table to generate high-level guidance for the LLM:

```
1. Look at Q-values for all possible moves
2. Categorize the situation: "offensive" (winning available), "defensive" (must block), "neutral"
3. Include this as context in the LLM prompt
4. Let the LLM pick the specific move with this guidance
```

### Experiment 4C: Weighted Scoring

Both systems independently score each possible move, then combine:

```
final_score(move) = α * rl_score(move) + (1 - α) * llm_score(move)
```

- Try different α values (0.3, 0.5, 0.7)
- Compare combined performance vs each system alone

### Key Questions to Answer
- Which hybrid approach gives the best win rate?
- Which is simplest to implement and maintain?
- Does the hybrid approach generalize — could it work for games the RL hasn't trained on?

---

## Phase 5: Fine-Tuning (Optional / Advanced)

**Purpose:** Actually modify the model's weights to make it inherently better at games. This is genuinely "training" the model.

### Option A: Ollama Modelfile Customization

Not true fine-tuning, but you can bake a system prompt and parameters into a custom model:

```
FROM llama3.2
SYSTEM "You are an expert game player. When playing tic-tac-toe, always think step by step: 1) Check if you can win 2) Check if you must block 3) Take center if available 4) Take a corner..."
PARAMETER temperature 0.3
```

This creates a game-optimized model variant without retraining.

### Option B: LoRA Fine-Tuning

Use game transcripts to fine-tune the model:

1. Generate training data: optimal game transcripts with reasoning
2. Format as instruction-response pairs
3. Fine-tune with LoRA (Low-Rank Adaptation) using tools like `unsloth` or `axolotl`
4. Load the fine-tuned adapter into Ollama

**This is significantly more complex** and requires:
- GPU with sufficient VRAM (or cloud GPU time)
- Understanding of training data formatting
- Hours of training time

**Recommendation:** Only attempt this after completing Phases 1-4.

---

## Suggested Implementation Order

```
Week 1:  Phase 1 — Build games, establish baselines
Week 2:  Phase 2 — Prompt engineering experiments
Week 3:  Phase 3A — Q-learning tic-tac-toe
Week 4:  Phase 3B — Q-learning blackjack
Week 5:  Phase 4 — Hybrid experiments
Week 6:  Document findings, update LEARNINGS.md
```

Phases 1-2 can probably be done faster. Phase 3 is where the real learning happens — take your time with it.

---

## Folder Structure

```
exploration/
  rl-games/
    README.md               # Setup instructions
    package.json             # Shared dependencies
    src/
      games/
        tic-tac-toe.ts       # Game logic
        blackjack.ts         # Game logic
      agents/
        random-agent.ts      # Random move baseline
        llm-agent.ts         # Ollama-based agent
        q-learning-agent.ts  # Pure RL agent
        hybrid-agent.ts      # LLM + RL combined
      training/
        train-ttt.ts         # Train Q-learning on tic-tac-toe
        train-blackjack.ts   # Train Q-learning on blackjack
      experiments/
        baseline.ts          # Phase 1 experiments
        prompt-tests.ts      # Phase 2 experiments
        hybrid-tests.ts      # Phase 4 experiments
      utils/
        stats.ts             # Win rate tracking, reporting
    q-tables/                # Saved Q-tables (JSON)
    results/                 # Experiment results and charts
```

---

## Success Criteria

You're ready to move on when you can answer these:

- [ ] What is the LLM's baseline win rate for each game?
- [ ] How much does prompt engineering improve it?
- [ ] Can you implement Q-learning from scratch and explain how it works?
- [ ] Which hybrid approach works best and why?
- [ ] What are the trade-offs between pure RL, pure LLM, and hybrid?
- [ ] Which approach should RAWley use for its game engine?

---

## Resources

**Q-Learning:**
- [Q-Learning Tutorial (with code)](https://www.learndatasci.com/tutorials/reinforcement-q-learning-scratch-python-openai-gym/) — Python but concepts transfer directly
- [Sutton & Barto Ch. 6](http://incompleteideas.net/book/the-book-2nd.html) — The definitive RL textbook (free online)

**Game AI:**
- [Tic-Tac-Toe Minimax](https://en.wikipedia.org/wiki/Minimax) — Optimal algorithm for comparison
- [Blackjack Basic Strategy](https://en.wikipedia.org/wiki/Blackjack#Basic_strategy) — Ground truth for blackjack decisions

**Fine-Tuning (Phase 5):**
- [Unsloth](https://github.com/unslothai/unsloth) — Fast LoRA fine-tuning
- [Ollama Modelfile Docs](https://github.com/ollama/ollama/blob/main/docs/modelfile.md) — Custom model creation

**TypeScript RL:**
- No major TS RL library needed — Q-learning is simple enough to implement from scratch with just a Map and some math
