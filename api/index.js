// Vercel Serverless Function — self-diagnosing wrapper
// If ANY import fails, the exact error is returned as JSON

let app;
let initError = null;

try {
  const express = (await import('express')).default;
  const cors = (await import('cors')).default;

  // Try loading routes — these are the most likely to fail
  let contentRoutes, youtubeRoutes;
  try {
    contentRoutes = (await import('./_routes/content.js')).default;
  } catch (e) {
    initError = `Failed to load content routes: ${e.message}\n${e.stack}`;
  }
  try {
    youtubeRoutes = (await import('./_routes/youtube.js')).default;
  } catch (e) {
    initError = `Failed to load youtube routes: ${e.message}\n${e.stack}`;
  }

  app = express();
  app.use(cors());
  app.use(express.json({ limit: '5mb' }));

  // Health check — always works, reports any init errors
  app.get('/api/health', (req, res) => {
    res.json({
      status: initError ? 'degraded' : 'ok',
      hasApiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here',
      initError: initError || null,
      nodeVersion: process.version,
      env: process.env.NODE_ENV || 'not set',
    });
  });

  // Only mount routes if they loaded successfully
  if (contentRoutes) app.use('/api/content', contentRoutes);
  if (youtubeRoutes) app.use('/api/youtube', youtubeRoutes);

} catch (e) {
  // Express itself failed to load — create a minimal http handler
  initError = `Fatal init error: ${e.message}\n${e.stack}`;
}

export default function handler(req, res) {
  if (!app) {
    // Express didn't even load — return raw http response
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify({
      status: 'fatal',
      initError: initError,
      nodeVersion: typeof process !== 'undefined' ? process.version : 'unknown',
    }));
    return;
  }
  return app(req, res);
}
