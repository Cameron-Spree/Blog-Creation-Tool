import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function callGemini(prompt, options = {}) {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    return { mock: true, text: `[Mock Response] Gemini API key not configured. Prompt was: "${prompt.substring(0, 100)}..."` };
  }

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 2048,
    }
  };

  const res = await fetch(`${BASE_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${error}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return { mock: false, text };
}

// ── Prompt Templates ──────────────────────────────────────

export async function generatePAA(keyword, draft) {
  const prompt = `You are an SEO expert specializing in the UK building materials and construction industry. 

Given the primary keyword "${keyword}" and the following draft content, generate 8 "People Also Ask" style questions that represent adjacent search intents. These should be questions that someone researching this topic would also want answers to.

Draft content (for context):
${draft.substring(0, 2000)}

Return ONLY a JSON array of strings. Example format:
["Question 1?", "Question 2?", "Question 3?"]

Focus on practical, intent-driven questions that a tradesperson, DIY enthusiast, or homeowner would actually search for.`;

  const result = await callGemini(prompt, { temperature: 0.6 });
  if (result.mock) {
    return [
      `What is the best ${keyword} for residential use?`,
      `How much does ${keyword} cost in the UK?`,
      `${keyword} vs alternatives: which is better?`,
      `How long does ${keyword} last?`,
      `Can I install ${keyword} myself?`,
      `What are the building regulations for ${keyword}?`,
      `Where can I buy ${keyword} near me?`,
      `What tools do I need for ${keyword}?`,
    ];
  }
  try {
    const match = result.text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [result.text];
  } catch {
    return result.text.split('\n').filter(l => l.trim().endsWith('?'));
  }
}

export async function generateAnswerBlock(keyword, draft, paaQuestions) {
  const prompt = `You are writing for Lawsons, a trusted UK building materials merchant. Write a direct, authoritative 40-80 word answer to the question implied by this keyword: "${keyword}".

Context from the existing draft:
${draft.substring(0, 1500)}

Related questions people ask:
${paaQuestions.join('\n')}

Rules:
- Write in a direct, professional, authoritative tone (the "Lawsons Voice")
- Assume the reader is a tradesperson or serious DIYer in the UK
- Include ONE specific technical detail or spec if possible
- Do NOT use marketing fluff
- Return ONLY the answer text, no titles or labels`;

  const result = await callGemini(prompt, { temperature: 0.5, maxTokens: 300 });
  if (result.mock) {
    return `${keyword} is a critical choice for any construction or renovation project. When selecting the right option, consider factors like load-bearing requirements, moisture resistance, and compliance with UK Building Regulations. At Lawsons, we recommend specifying materials that meet British Standards and are sourced from certified suppliers for maximum durability and code compliance.`;
  }
  return result.text.trim();
}

export async function generateTakeaways(keyword, draft, answerBlock) {
  const prompt = `You are writing for Lawsons, a UK building materials merchant. Generate 6 key takeaways for an article about "${keyword}".

Article draft:
${draft.substring(0, 2000)}

Summary answer:
${answerBlock}

Rules:
- Each takeaway should be a single, punchy sentence (15-25 words)
- Include specific facts, numbers, or specs where possible
- Write in Direct, Professional, Authoritative tone
- Return a JSON array of strings

Example format:
["Takeaway 1.", "Takeaway 2.", "Takeaway 3."]`;

  const result = await callGemini(prompt, { temperature: 0.5, maxTokens: 500 });
  if (result.mock) {
    return [
      `Always check ${keyword} meets current UK Building Regulations before purchasing.`,
      `Professional installation typically costs 30-50% less than DIY when factoring in tool hire and waste.`,
      `Lawsons stocks FSC-certified options for environmentally responsible builds.`,
      `Moisture content should be below 20% for structural applications to prevent warping.`,
      `Budget an additional 10% material overage for cuts, waste, and future repairs.`,
      `All Lawsons products come with full technical data sheets and specification support.`,
    ];
  }
  try {
    const match = result.text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [result.text];
  } catch {
    return result.text.split('\n').filter(l => l.trim());
  }
}

export async function extractProTip(transcript, keyword) {
  const prompt = `You are an expert content curator for Lawsons, a UK building materials merchant. You've been given a YouTube video transcript about "${keyword}".

Extract ONE valuable "Pro Tip" or expert nuance from this transcript that would NOT typically appear in a generic SEO article. This should be practical, experience-based advice.

Transcript:
${transcript.substring(0, 4000)}

Return a JSON object with this exact structure:
{
  "tip": "The actual pro tip text (2-3 sentences max)",
  "attribution": "Brief description of who gave this advice",
  "context": "One sentence of context about why this matters"
}`;

  const result = await callGemini(prompt, { temperature: 0.4, maxTokens: 500 });
  if (result.mock) {
    return {
      tip: `When working with ${keyword}, always acclimatise materials on-site for at least 48 hours before installation. This prevents expansion and contraction issues that lead to callbacks.`,
      attribution: 'Experienced contractor with 20+ years in the trade',
      context: 'This is a common mistake that even some professionals overlook, leading to warranty claims.'
    };
  }
  try {
    const match = result.text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : { tip: result.text, attribution: 'YouTube Expert', context: '' };
  } catch {
    return { tip: result.text, attribution: 'YouTube Expert', context: '' };
  }
}

export async function rankInternalLinks(blogPosts, keyword, draft) {
  const prompt = `You are an SEO internal linking specialist for Lawsons. Given the current article about "${keyword}", select the 3 MOST contextually relevant blog posts from this list to link to.

Current article draft:
${draft.substring(0, 1000)}

Available blog posts (Title | URL | Category):
${blogPosts.map(p => `${p.title} | ${p.url} | ${p.category || 'Uncategorized'}`).join('\n')}

Return a JSON array of the 3 best matches with this structure:
[{"title": "...", "url": "...", "reason": "One sentence why this is relevant"}]

Prioritise:
1. Topical relevance (same product category or use case)
2. Complementary info (answers a question the current article raises)
3. Cluster strength (reinforces the site's authority on this topic)`;

  const result = await callGemini(prompt, { temperature: 0.3, maxTokens: 500 });
  if (result.mock) {
    return blogPosts.slice(0, 3).map(p => ({ ...p, reason: 'Topically relevant' }));
  }
  try {
    const match = result.text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : blogPosts.slice(0, 3);
  } catch {
    return blogPosts.slice(0, 3);
  }
}

export async function checkTone(fullContent) {
  const prompt = `You are a brand voice auditor for Lawsons, a leading UK building materials merchant. The Lawsons brand voice is: Direct, Professional, Authoritative — like a knowledgeable trade counter colleague.

Review the following content and give:
1. A score from 1-10 for how well it matches the Lawsons voice
2. Up to 3 specific suggestions for improvement
3. Any sentences that sound too casual, too salesy, or too generic

Content:
${fullContent.substring(0, 3000)}

Return a JSON object:
{
  "score": 8,
  "summary": "Overall assessment in one sentence",
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "flaggedSentences": [{"sentence": "...", "issue": "Too casual / Too salesy / etc."}]
}`;

  const result = await callGemini(prompt, { temperature: 0.3, maxTokens: 800 });
  if (result.mock) {
    return {
      score: 7,
      summary: 'Generally good tone but could be more authoritative in places.',
      suggestions: ['Replace "you should probably" with direct imperatives', 'Add more specific BS/EN standard references'],
      flaggedSentences: []
    };
  }
  try {
    const match = result.text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : { score: 0, summary: result.text, suggestions: [], flaggedSentences: [] };
  } catch {
    return { score: 0, summary: result.text, suggestions: [], flaggedSentences: [] };
  }
}

export async function generateAltText(imageDescription, keyword) {
  const prompt = `Generate a descriptive, keyword-rich alt text for a product image used in a blog post about "${keyword}".

Image description or filename: "${imageDescription}"

Rules:
- 10-20 words
- Include the primary keyword naturally if relevant
- Be genuinely descriptive of the image
- Don't start with "Image of" or "Photo of"
- Return ONLY the alt text, nothing else`;

  const result = await callGemini(prompt, { temperature: 0.4, maxTokens: 100 });
  if (result.mock) {
    return `Professional-grade ${keyword} materials displayed at a Lawsons branch, ready for trade collection`;
  }
  return result.text.trim().replace(/^["']|["']$/g, '');
}
