import { Router } from 'express';
import { OllamaTagsResponse } from '../types.js';

const router = Router();
const OLLAMA_BASE = 'http://localhost:11434';

router.get('/', async (_req, res) => {
  try {
    const response = await fetch(`${OLLAMA_BASE}/api/tags`);
    const data = (await response.json()) as OllamaTagsResponse;
    res.json(data.models);
  } catch {
    res.status(502).json({ error: 'Failed to reach Ollama' });
  }
});

export default router;
