# Ollama Quick Start Guide

Get up and running with local AI in minutes.

---

## Step 1: Start Ollama in Docker

```bash
# From the project root
cd exploration/ollama

# Start Ollama container
docker run -d \
  --name ollama \
  -p 11434:11434 \
  -v ollama_data:/root/.ollama \
  ollama/ollama

# Verify it's running
docker ps | grep ollama
```

---

## Step 2: Pull a Model

```bash
# Start with a small, fast model
docker exec -it ollama ollama pull llama3.2

# Or try others:
# docker exec -it ollama ollama pull mistral
# docker exec -it ollama ollama pull phi3
```

**Model sizes:**
- `llama3.2` (~2GB) - Fast, good quality
- `mistral` (~4GB) - Better reasoning
- `llama3.2:70b` (~40GB) - Best quality, slow

---

## Step 3: Test Basic Interaction

```bash
# Simple curl test
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "What is 2+2?",
  "stream": false
}'
```

**Expected response:**
```json
{
  "model": "llama3.2",
  "created_at": "2024-02-14T...",
  "response": "2+2 equals 4.",
  "done": true
}
```

---

## Step 4: Test Board Game Reasoning

Create `test-tictactoe.sh`:

```bash
#!/bin/bash

curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "You are playing tic-tac-toe as X.\n\nCurrent board:\nX | O | X\nO | _ | _\n_ | _ | _\n\nWhat is your best move? Respond ONLY with a number 1-9 (row-major order, starting from top-left).",
  "stream": false,
  "options": {
    "temperature": 0.3
  }
}' | jq -r '.response'
```

**Run it:**
```bash
chmod +x test-tictactoe.sh
./test-tictactoe.sh
```

**Good response:** "5" or "6" (blocking moves)
**Bad response:** Long explanation instead of just a number

---

## Step 5: Test Structured Output

Create `test-json-output.sh`:

```bash
#!/bin/bash

curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "You are playing tic-tac-toe as X.\n\nBoard state:\nX | O | X\nO | _ | _\n_ | _ | _\n\nRespond in JSON format:\n{\n  \"position\": <number 1-9>,\n  \"reasoning\": \"<why this move>\"\n}\n\nRespond ONLY with valid JSON, no other text.",
  "stream": false,
  "format": "json",
  "options": {
    "temperature": 0.1
  }
}' | jq -r '.response' | jq .
```

**Expected:**
```json
{
  "position": 5,
  "reasoning": "Blocking the opponent from winning via the middle column"
}
```

---

## Step 6: Create Node.js Test Script

Create `test.ts`:

```typescript
import axios from 'axios';

const OLLAMA_URL = 'http://localhost:11434/api/generate';

interface OllamaRequest {
  model: string;
  prompt: string;
  stream: boolean;
  format?: 'json';
  options?: {
    temperature?: number;
    num_predict?: number;
  };
}

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
  total_duration?: number;
}

async function testOllama() {
  const request: OllamaRequest = {
    model: 'llama3.2',
    prompt: `You are playing tic-tac-toe as X.

Board state:
X | O | X
O | _ | _
_ | _ | _

Respond in JSON:
{
  "position": <number 1-9>,
  "reasoning": "<why>"
}`,
    stream: false,
    format: 'json',
    options: {
      temperature: 0.1,
    },
  };

  console.log('Sending request to Ollama...\n');

  const startTime = Date.now();
  const response = await axios.post<OllamaResponse>(OLLAMA_URL, request);
  const duration = Date.now() - startTime;

  console.log('Response:', response.data.response);
  console.log(`\nDuration: ${duration}ms`);

  try {
    const parsed = JSON.parse(response.data.response);
    console.log('\nParsed move:', parsed);

    // Validate
    if (parsed.position >= 1 && parsed.position <= 9) {
      console.log('✅ Valid move!');
    } else {
      console.log('❌ Invalid position');
    }
  } catch (error) {
    console.log('❌ Failed to parse JSON');
  }
}

testOllama().catch(console.error);
```

**Run it:**
```bash
npm install axios  # Or use your package manager
npx ts-node test.ts
```

---

## Step 7: Compare Models

Test the same prompt with different models:

```bash
# Test all models
for model in llama3.2 mistral phi3; do
  echo "Testing $model..."
  docker exec -it ollama ollama pull $model 2>/dev/null

  time curl -s http://localhost:11434/api/generate -d "{
    \"model\": \"$model\",
    \"prompt\": \"You are X in tic-tac-toe. Board: X|O|X / O|_|_ / _|_|_. Best move (1-9)?\",
    \"stream\": false
  }" | jq -r '.response'

  echo "---"
done
```

**Document findings:**
- Which model gave the best answer?
- Which was fastest?
- Which used the least memory?

---

## Troubleshooting

**Ollama not responding:**
```bash
docker logs ollama
docker restart ollama
```

**Out of memory:**
```bash
# Use smaller model
docker exec -it ollama ollama pull llama3.2:1b
```

**Slow responses:**
- Use smaller model
- Reduce `num_predict` (max tokens)
- Try different prompts

**Invalid JSON responses:**
- Add `"format": "json"` to request
- Lower temperature (0.1-0.3)
- Make prompt more explicit about JSON format
- Add examples in the prompt

---

## Next Steps

1. ✅ Ollama running
2. ✅ Model pulled
3. ✅ Basic test works
4. ✅ Board game test works
5. ✅ JSON output works

**Now experiment with:**
- Different prompt structures
- Various temperature settings
- Multiple models
- More complex game states
- Error handling

**Document everything in:** `../LEARNINGS.md`
