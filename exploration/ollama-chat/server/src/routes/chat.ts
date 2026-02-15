import { Router, Request, Response } from 'express';
import { ChatRequest } from '../types.js';

const router = Router();
const OLLAMA_BASE = 'http://localhost:11434';

router.post('/', async (req: Request<{}, {}, ChatRequest>, res: Response) => {
  const { model, messages } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const ollamaRes = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: true }),
    });

    if (!ollamaRes.ok) {
      let errorMsg = `Ollama returned ${ollamaRes.status}`;
      try {
        const body = await ollamaRes.text();
        const parsed = JSON.parse(body);
        if (parsed.error) errorMsg = parsed.error;
      } catch {
        // Use default error message
      }
      res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
      res.end();
      return;
    }

    if (!ollamaRes.body) {
      res.write(`data: ${JSON.stringify({ error: 'No response body from Ollama' })}\n\n`);
      res.end();
      return;
    }

    const reader = ollamaRes.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      const lines = text.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const chunk = JSON.parse(line);
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);

          if (chunk.done) {
            res.write('data: [DONE]\n\n');
          }
        } catch {
          // Partial JSON line — skip
        }
      }
    }
  } catch {
    res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
  }

  res.end();
});

export default router;
