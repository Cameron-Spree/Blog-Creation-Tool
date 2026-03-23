import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import contentRoutes from './_routes/content.js';
import youtubeRoutes from './_routes/youtube.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// API Routes
app.use('/api/content', contentRoutes);
app.use('/api/youtube', youtubeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here' });
});

// Global Export for Vercel Serverless Function
export default function handler(req, res) {
  return app(req, res);
}
