import { Router } from 'express';
import { extractProTip } from '../services/gemini.js';

const router = Router();

// ── Phase 3.1: YouTube Pro-Tip Extraction ───────────
// Since we can't install youtube-transcript on this machine,
// the frontend sends the transcript text directly (user pastes it).
router.post('/extract', async (req, res) => {
  try {
    const { transcript, keyword } = req.body;
    if (!transcript) return res.status(400).json({ error: 'transcript text is required' });
    if (!keyword) return res.status(400).json({ error: 'keyword is required' });

    const proTip = await extractProTip(transcript, keyword);
    res.json(proTip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
