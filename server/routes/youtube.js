import { Router } from 'express';
import { YoutubeTranscript } from 'youtube-transcript';
import { extractProTip } from '../services/gemini.js';

const router = Router();

// ── Phase 3.1: YouTube Pro-Tip Extraction ───────────
router.post('/extract', async (req, res) => {
  try {
    let { transcript, url, keyword } = req.body;
    
    if (!transcript && url) {
      // Try to fetch transcript from URL
      try {
        const data = await YoutubeTranscript.fetchTranscript(url);
        transcript = data.map(t => t.text).join(' ');
      } catch (err) {
        return res.status(400).json({ error: `Could not fetch transcript from URL: ${err.message}` });
      }
    }

    if (!transcript) return res.status(400).json({ error: 'transcript text or youtube url is required' });
    if (!keyword) return res.status(400).json({ error: 'keyword is required' });

    const proTip = await extractProTip(transcript, keyword);
    res.json(proTip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
