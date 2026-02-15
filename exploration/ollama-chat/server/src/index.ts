import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';
import modelsRouter from './routes/models.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/chat', chatRouter);
app.use('/api/models', modelsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
