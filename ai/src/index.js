import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { aiRouter } from './routes/ai.routes.js';
import { healthRouter } from './routes/health.routes.js';

const app = express();
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) || '*',
  credentials: true
}));
app.use(pinoHttp());

app.use('/health', healthRouter);
app.use('/ai', aiRouter);

const port = Number(process.env.PORT || 4080);
app.listen(port, () => console.log(`[sinabe-ai] listening on :${port}`));
