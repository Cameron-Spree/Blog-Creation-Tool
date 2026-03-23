import { Router } from 'express';
import multer from 'multer';
import { generatePAA, generateAnswerBlock, generateTakeaways, rankInternalLinks, checkTone, generateAltText } from '../_services/gemini.js';
import { generateArticleSchema } from '../_services/schema.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ── Phase 1: PAA Generation ─────────────────────────
router.post('/paa', async (req, res) => {
  try {
    const { keyword, draft } = req.body;
    if (!keyword) return res.status(400).json({ error: 'keyword is required' });
    const questions = await generatePAA(keyword, draft || '');
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Phase 2: Answer Block ───────────────────────────
router.post('/answer-block', async (req, res) => {
  try {
    const { keyword, draft, paaQuestions } = req.body;
    if (!keyword) return res.status(400).json({ error: 'keyword is required' });
    const answer = await generateAnswerBlock(keyword, draft || '', paaQuestions || []);
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Phase 2: Key Takeaways ──────────────────────────
router.post('/takeaways', async (req, res) => {
  try {
    const { keyword, draft, answerBlock } = req.body;
    if (!keyword) return res.status(400).json({ error: 'keyword is required' });
    const takeaways = await generateTakeaways(keyword, draft || '', answerBlock || '');
    res.json({ takeaways });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Phase 3: Internal Link Ranking ──────────────────
router.post('/rank-links', async (req, res) => {
  try {
    const { blogPosts, keyword, draft } = req.body;
    if (!blogPosts?.length) return res.status(400).json({ error: 'blogPosts array is required' });
    const links = await rankInternalLinks(blogPosts, keyword, draft || '');
    res.json({ links });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Phase 3: CSV Upload for Blog Posts ──────────────
router.post('/upload-csv', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const content = req.file.buffer.toString('utf-8');
    const lines = content.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return res.status(400).json({ error: 'CSV must have a header row and at least one data row' });

    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const titleIdx = header.findIndex(h => h.includes('title'));
    const urlIdx = header.findIndex(h => h.includes('url'));
    const catIdx = header.findIndex(h => h.includes('category') || h.includes('cat'));

    if (titleIdx === -1 || urlIdx === -1) {
      return res.status(400).json({ error: 'CSV must have "title" and "url" columns' });
    }

    const blogPosts = lines.slice(1).map(line => {
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      return {
        title: cols[titleIdx] || '',
        url: cols[urlIdx] || '',
        category: catIdx >= 0 ? (cols[catIdx] || '') : ''
      };
    }).filter(p => p.title && p.url);

    res.json({ blogPosts, count: blogPosts.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Phase 4: Tone Check ─────────────────────────────
router.post('/tone-check', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required' });
    const result = await checkTone(content);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Phase 5: Schema Generation ──────────────────────
router.post('/schema', (req, res) => {
  try {
    const schemas = generateArticleSchema(req.body);
    res.json({ schemas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Phase 5: Alt-Text Generation ────────────────────
router.post('/alt-text', async (req, res) => {
  try {
    const { images, keyword } = req.body;
    if (!images?.length) return res.status(400).json({ error: 'images array is required' });
    const results = await Promise.all(
      images.map(img => generateAltText(img.description || img.filename, keyword))
    );
    res.json({ altTexts: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
