import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import contentRoutes from './content.js';
import youtubeRoutes from './youtube.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// API Routes
app.use('/api/content', contentRoutes);
app.use('/api/youtube', youtubeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here' });
});

// Serve static frontend from public folder (local dev only)
app.use(express.static(path.join(__dirname, '../public')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'API route not found' });
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n🚀 Lawsons Content Engine running on http://localhost:${PORT}`);
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
      console.log('⚠️  GEMINI_API_KEY not set — AI features will return mock data.');
      console.log('   Get a key at https://aistudio.google.com/apikey\n');
    }
  });
}

// Global Export for Vercel
export default app;
