import { Router } from 'express';
import { getYoutubeTranscript } from '../_services/youtubeExt.js';
import { extractProTip } from '../_services/gemini.js';

const router = Router();

// ── Phase 3.1: YouTube Pro-Tip Extraction ───────────
router.post('/extract', async (req, res) => {
  try {
    const { url, transcript, keyword } = req.body;
    
    let text = transcript;
    if (!text && url) {
      try {
        text = await getYoutubeTranscript(url);
      } catch (err) {
        return res.status(400).json({ error: `Could not fetch transcript from URL: ${err.message}` });
      }
    }

    if (!text) return res.status(400).json({ error: 'transcript text or youtube url is required' });
    if (!keyword) return res.status(400).json({ error: 'keyword is required' });

    const proTip = await extractProTip(text, keyword);
    res.json(proTip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
