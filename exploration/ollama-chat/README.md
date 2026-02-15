# Ollama Chat Interface

A simple web chat interface for interacting with locally hosted LLMs via Ollama.

## Prerequisites

- Node.js 24+
- Ollama running in Docker on port 11434

```bash
docker run -d --name ollama -p 11434:11434 -v ollama_data:/root/.ollama ollama/ollama
docker exec ollama ollama pull llama3.2
```

## Running

**Terminal 1 — Backend (port 3001):**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## API Endpoints

- `GET /api/models` — List available Ollama models
- `POST /api/chat` — Send messages and stream response (SSE)
- `GET /health` — Server health check

## Adding Models

```bash
docker exec ollama ollama pull mistral
docker exec ollama ollama pull phi3
```

New models will appear in the dropdown after refreshing the page.
