import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import contentRoutes from './routes/content.js';
import youtubeRoutes from './routes/youtube.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Routes
app.use('/api/content', contentRoutes);
app.use('/api/youtube', youtubeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Lawsons Content Engine API running on http://localhost:${PORT}`);
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
    console.log('⚠️  GEMINI_API_KEY not set — AI features will return mock data.');
    console.log('   Get a key at https://aistudio.google.com/apikey\n');
  }
});
