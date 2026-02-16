# Exploration Phase: AI & Reinforcement Learning

**Purpose:** Hands-on learning and experimentation with AI technologies before architectural commitment.

**Status:** Active - Pre-Development Phase

---

## Overview

This folder contains isolated experiments and prototypes for exploring:
- Local AI with Ollama
- Cloud AI providers (Claude, OpenAI)
- Reinforcement Learning fundamentals
- Hybrid LLM+RL approaches
- Simple board game implementations

**Important:** This code is intentionally NOT part of the main project. It's a sandbox for learning and discovery.

---

## Getting Started

### 1. Local AI with Ollama

**Setup Ollama:**
```bash
# Using Docker (recommended)
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

# Pull a model
docker exec -it ollama ollama pull llama3.2

# Test it
curl http://localhost:11434/api/generate -d '{ "model": "llama3.2", "prompt": "You are playing tic-tac-toe. The board is X|O|X in row 1, O|_|_ in row 2, _|_|_ in row 3. What is your best move? Respond with just the position (1-9)."}'

curl "http://localhost:11434/api/generate" -H "Content-Type: application/json" -d "{\"model\":\"llama3.2\",\"prompt\":\"You are playing tic-tac-toe. The board is X|O|X in row 1, O|_|_ in row 2, _|_|_ in row 3. What is your best move? Respond with just the position (1-9).\"}"
```

**Experiments to try:**
- [ ] Compare response quality: Llama 3.2 vs Mistral vs others
- [ ] Test prompt patterns for board game moves
- [ ] Measure response time for different model sizes
- [ ] Test structured output (JSON) reliability
- [ ] Document temperature/parameters impact on quality

### 2. Cloud AI Providers

**Setup Claude API:**
```bash
# Add to .env (in exploration folder, NOT root)
echo "ANTHROPIC_API_KEY=your_key_here" > .env
```

**Quick test script:**
```typescript
// claude-test.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const message = await client.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: 'You are playing tic-tac-toe. Board state: X|O|X / O|_|_ / _|_|_. What move should X make? Respond in JSON: {"position": number, "reasoning": "why"}'
  }],
});

console.log(message.content);
```

**Experiments to try:**
- [ ] Test different prompt structures
- [ ] Compare Claude vs GPT-4 for game reasoning
- [ ] Test error handling (rate limits, invalid responses)
- [ ] Measure cost per game move
- [ ] Test with complex game states

### 3. Reinforcement Learning Basics

**Start with Q-Learning Grid World:**

A simple grid world where an agent learns to reach a goal:
```
[S][·][·][·]
[·][X][·][·]
[·][·][·][G]
```

**Key concepts to implement:**
- State representation
- Action space (up, down, left, right)
- Reward function (+10 for goal, -1 for obstacle, -0.1 per step)
- Q-table updates
- Epsilon-greedy exploration

**Then try Tic-Tac-Toe:**
- State space: all possible board configurations
- Action space: place mark in empty square
- Reward: +1 for win, -1 for loss, 0 for draw
- Learn optimal policy through self-play

**Questions to answer:**
- How many episodes to learn tic-tac-toe?
- Does it discover known strategies (corners, center)?
- How does learning rate affect convergence?
- Can it beat a random player? An always-center player?

### 4. Hybrid Approaches

**Test these integration strategies:**

**Approach 1: LLM Generates, RL Scores**
```
1. LLM suggests move with reasoning
2. RL policy scores the suggestion
3. If score is low, ask LLM for alternative
4. Track which moves RL agrees/disagrees with
```

**Approach 2: RL Suggests Type, LLM Executes**
```
1. RL policy says "play defensively" or "play aggressively"
2. LLM generates move matching that strategy
3. Compare win rates with vs without RL guidance
```

**Approach 3: Independent Scoring**
```
1. Get move from LLM with confidence score
2. Get move from RL policy with Q-value
3. Weighted combination: α*RL + (1-α)*LLM
4. Tune α based on performance
```

**Document:**
- Which approach is easiest to implement?
- Which gives best results?
- What are the failure modes?

### 5. Simple Game Prototype

**Build Tic-Tac-Toe with AI:**

```typescript
// Minimal structure
type Board = ('X' | 'O' | null)[];
type GameState = {
  board: Board;
  currentPlayer: 'X' | 'O';
  winner: 'X' | 'O' | 'draw' | null;
};

// Test these concepts:
- Making API calls to AI for moves
- Parsing AI responses (handle malformed JSON)
- Validating moves against rules
- Serializing/deserializing game state
- Tracking move history
```

**Learn from failures:**
- How often does AI suggest invalid moves?
- What retry strategies work?
- How do you handle timeouts?
- What's the right prompt format?

---

## Success Criteria

You're ready to move to Phase 0 when you can answer:

- ✅ How do we set up and use Ollama reliably?
- ✅ What's the cost/performance trade-off of cloud vs local AI?
- ✅ Which AI models work best for game reasoning?
- ✅ Do we understand RL basics well enough to implement them?
- ✅ Which hybrid approach (if any) should we use?
- ✅ What are the real challenges in building game AI?

---

## Resources

**Ollama:**
- [Official Docs](https://ollama.ai/docs)
- [Model Library](https://ollama.ai/library)
- [REST API Reference](https://github.com/ollama/ollama/blob/main/docs/api.md)

**Reinforcement Learning:**
- [Sutton & Barto: RL Book](http://incompleteideas.net/book/the-book-2nd.html)
- [Simple RL Tutorial](https://gymnasium.farama.org/tutorials/training_agents/rl_introduction/)
- [Q-Learning Explanation](https://www.youtube.com/watch?v=qhRNvCVVJaA)

**AI for Games:**
- [Claude API Docs](https://docs.anthropic.com/)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [Structured Outputs with LLMs](https://platform.openai.com/docs/guides/structured-outputs)

---

## Next Steps

1. Start with Ollama setup and simple prompts
2. Build tic-tac-toe with AI moves
3. Implement basic Q-learning
4. Test hybrid approaches
5. Document findings in LEARNINGS.md
6. Make technology recommendations for Phase 0

**Remember:** The goal is to LEARN, not to build production code. Break things, try weird ideas, and document what you discover!
