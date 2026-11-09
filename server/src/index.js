import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || 'http://localhost:5173' }));
app.use(express.json({ limit: '20kb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'CodeBattle KG API' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false }), authRoutes);
app.use((req, res) => res.status(404).json({ message: 'API endpoint табылган жок.' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Күтүлбөгөн сервер катасы.' });
});

const port = Number(process.env.PORT) || 5000;
connectDB().then(() => app.listen(port, () => console.log(`API running on http://localhost:${port}`)))
  .catch(error => { console.error('Database connection failed:', error.message); process.exit(1); });
