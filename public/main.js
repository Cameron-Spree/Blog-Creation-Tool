/* ═══════════════════════════════════════════════════════════
   LAWSONS AGENTIC CONTENT ENGINE
   Main Application Entry Point
   ═══════════════════════════════════════════════════════════ */

const API = '/api';

// ── Global State ────────────────────────────────────────────
const state = {
  currentPhase: 0,
  apiConnected: false,
  hasApiKey: false,

  // Phase 1
  keyword: '',
  draft: '',
  paaQuestions: [],
  serpFormat: 'none',

  // Phase 2
  answerBlock: '',
  takeaways: [],
  headings: [],

  // Phase 3
  youtubeUrl: '',
  youtubeTranscript: '',
  proTip: null,
  blogPosts: [],
  internalLinks: [],
  tableData: { headers: ['Feature', 'Option A', 'Option B'], rows: [['', '', ''], ['', '', ''], ['', '', '']] },

  // Phase 4
  claimApprovals: {},
  authorName: '',
  authorBio: '',
  reviewerName: '',
  reviewDate: new Date().toISOString().split('T')[0],
  toneResult: null,

  // Phase 5
  schemas: [],
  imageDescriptions: [],
  altTexts: [],
};

// ── API Helper ──────────────────────────────────────────────
async function api(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API request failed');
  }
  return res.json();
}

async function apiUpload(path, formData) {
  const res = await fetch(`${API}${path}`, { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Upload failed');
  }
  return res.json();
}

// ── Check API Connection ────────────────────────────────────
async function checkApi() {
  try {
    const res = await fetch(`${API}/health`);
    const data = await res.json();
    state.apiConnected = true;
    state.hasApiKey = !!data.hasApiKey;
    return data;
  } catch {
    state.apiConnected = false;
    state.hasApiKey = false;
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
// PHASES CONFIG
// ═══════════════════════════════════════════════════════════
const PHASES = [
  { num: 1, title: 'Ingestion & Expansion', subtitle: 'Keywords, PAA, SERP Check', icon: '🔍' },
  { num: 2, title: 'Content Engineering', subtitle: 'Answer Block, Takeaways, Spine', icon: '🏗️' },
  { num: 3, title: 'Component Builder', subtitle: 'YouTube, Links, Tables', icon: '🧩' },
  { num: 4, title: 'E-E-A-T & QA', subtitle: 'Fact-check, Trust, Tone', icon: '✅' },
  { num: 5, title: 'Audit & Export', subtitle: 'Schema, Alt-text, HTML', icon: '🚀' },
];

// ═══════════════════════════════════════════════════════════
// RENDER ENGINE
// ═══════════════════════════════════════════════════════════
function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    ${renderSidebar()}
    <div class="main-content">
      ${renderHeader()}
      <div class="phase-content slide-in" id="phase-content">
        ${renderPhase(state.currentPhase)}
      </div>
    </div>
  `;
  attachEvents();
}

function renderSidebar() {
  return `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <div class="sidebar-logo-icon">⚡</div>
          <div>
            <div class="sidebar-logo-text">Lawsons Engine</div>
            <div class="sidebar-logo-sub">Content Creation Tool</div>
          </div>
        </div>
      </div>
      <nav class="step-nav">
        <div class="step-nav-label">Workflow Phases</div>
        ${PHASES.map((p, i) => `
          <div class="step-item ${i === state.currentPhase ? 'active' : ''} ${i < state.currentPhase ? 'completed' : ''}" data-phase="${i}">
            <div class="step-number">${i < state.currentPhase ? '✓' : p.num}</div>
            <div class="step-info">
              <div class="step-title">${p.title}</div>
              <div class="step-subtitle">${p.subtitle}</div>
            </div>
          </div>
        `).join('')}
      </nav>
      <div class="sidebar-footer">
        <div class="api-status">
          <div class="api-dot ${state.apiConnected ? (state.hasApiKey ? 'connected' : 'warning') : ''}"></div>
          <span>
            ${!state.apiConnected ? 'API Offline — start server' : 
              (state.hasApiKey ? 'AI Active (Gemini Pro)' : 'Mock Mode (No API Key)')}
          </span>
        </div>
      </div>
    </aside>
  `;
}

function renderHeader() {
  const phase = PHASES[state.currentPhase];
  return `
    <header class="main-header">
      <div style="display:flex;align-items:center;gap:var(--space-4);">
        <img src="./assets/hero.png" alt="Lawsons Logo" style="height:40px;border-radius:var(--radius-sm);box-shadow:var(--shadow-sm);" />
        <h1>${phase.icon} Phase ${phase.num}: <span>${phase.title}</span></h1>
      </div>
      <div class="header-actions">
        ${state.keyword ? `<span class="chip" style="border-color: var(--lawsons-green);">🔑 ${state.keyword}</span>` : ''}
        <button class="btn btn-ghost" onclick="window.__previewAll()">👁️ Preview</button>
      </div>
    </header>
  `;
}

// ═══════════════════════════════════════════════════════════
// PHASE RENDERERS
// ═══════════════════════════════════════════════════════════
function renderPhase(idx) {
  switch (idx) {
    case 0: return renderPhase1();
    case 1: return renderPhase2();
    case 2: return renderPhase3();
    case 3: return renderPhase4();
    case 4: return renderPhase5();
    default: return '';
  }
}

// ── Phase 1: Ingestion & Semantic Expansion ─────────────────
function renderPhase1() {
  return `
    <p class="phase-description">Import your primary keyword and BrightEdge draft, generate PAA questions, and assess the current SERP landscape.</p>

    <div class="card fade-in">
      <div class="card-header">
        <div>
          <div class="card-title">1.1 — Data Ingestion</div>
          <div class="card-subtitle">Establish the baseline intent and identify gaps</div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Primary Keyword</label>
        <input class="form-input" id="inp-keyword" type="text" placeholder="e.g. composite decking" value="${esc(state.keyword)}" />
      </div>
      <div class="form-group">
        <label class="form-label">BrightEdge Draft</label>
        <div class="form-hint">Paste your raw draft content below</div>
        <textarea class="form-textarea" id="inp-draft" placeholder="Paste the BrightEdge draft here…" style="min-height:200px;">${esc(state.draft)}</textarea>
      </div>
    </div>

    <hr class="section-divider" />

    <div class="card fade-in" style="animation-delay:0.1s">
      <div class="card-header">
        <div>
          <div class="card-title">1.2 — Query Fan-Out (PAA)</div>
          <div class="card-subtitle">Generate adjacent intent questions to cover sub-topics</div>
        </div>
        <button class="btn btn-primary" id="btn-paa" ${!state.keyword ? 'disabled' : ''}>
          ✨ Generate PAA
        </button>
      </div>
      <div id="paa-output">
        ${state.paaQuestions.length ? `
          <div class="chip-list">
            ${state.paaQuestions.map((q, i) => `
              <div class="chip">
                ${esc(q)}
                <button class="chip-remove" data-paa-remove="${i}">×</button>
              </div>
            `).join('')}
          </div>
        ` : '<p style="color:var(--text-muted);font-size:var(--text-sm);">Click "Generate PAA" to create adjacent intent questions.</p>'}
      </div>
    </div>

    <hr class="section-divider" />

    <div class="card fade-in" style="animation-delay:0.2s">
      <div class="card-header">
        <div>
          <div class="card-title">1.3 — SERP Reality Check</div>
          <div class="card-subtitle">What format does Google currently show for this query?</div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Current AIO Format</label>
        <select class="form-select" id="sel-serp" value="${state.serpFormat}">
          <option value="none" ${state.serpFormat === 'none' ? 'selected' : ''}>No AI Overview triggered</option>
          <option value="paragraph" ${state.serpFormat === 'paragraph' ? 'selected' : ''}>Paragraph</option>
          <option value="list" ${state.serpFormat === 'list' ? 'selected' : ''}>List</option>
          <option value="table" ${state.serpFormat === 'table' ? 'selected' : ''}>Table</option>
          <option value="product-grid" ${state.serpFormat === 'product-grid' ? 'selected' : ''}>Product Grid</option>
        </select>
      </div>
    </div>

    ${renderPhaseNav(null, 1)}
  `;
}

// ── Phase 2: Content Engineering ────────────────────────────
function renderPhase2() {
  return `
    <p class="phase-description">Structure data that looks like an article. Generate your zero-click answer, key takeaways, and content spine.</p>

    <div class="card fade-in">
      <div class="card-header">
        <div>
          <div class="card-title">2.1 — Zero-Click Answer Block</div>
          <div class="card-subtitle">40-80 word direct answer positioned under the H1</div>
        </div>
        <button class="btn btn-primary" id="btn-answer" ${!state.keyword ? 'disabled' : ''}>
          ✨ Generate
        </button>
      </div>
      ${state.answerBlock ? `
        <div class="result-block">
          <span class="result-label">Answer Block</span>
          <textarea id="txt-answer" rows="4">${esc(state.answerBlock)}</textarea>
        </div>
      ` : '<p style="color:var(--text-muted);font-size:var(--text-sm);">Generate a concise direct answer for the AI Overview snippet.</p>'}
    </div>

    <hr class="section-divider" />

    <div class="card fade-in" style="animation-delay:0.1s">
      <div class="card-header">
        <div>
          <div class="card-title">2.2 — Key Takeaways</div>
          <div class="card-subtitle">5-8 bullet points summarising article value</div>
        </div>
        <button class="btn btn-primary" id="btn-takeaways" ${!state.keyword ? 'disabled' : ''}>
          ✨ Generate
        </button>
      </div>
      <div id="takeaways-output">
        ${state.takeaways.length ? `
          <ul style="list-style:none;padding:0;">
            ${state.takeaways.map((t, i) => `
              <li style="display:flex;align-items:flex-start;gap:0.5rem;margin-bottom:0.5rem;">
                <span style="color:var(--text-success);font-weight:700;margin-top:2px;">✓</span>
                <input class="form-input" value="${esc(t)}" data-takeaway="${i}" style="font-size:var(--text-sm);" />
              </li>
            `).join('')}
          </ul>
        ` : '<p style="color:var(--text-muted);font-size:var(--text-sm);">Generate key takeaway bullet points.</p>'}
      </div>
    </div>

    <hr class="section-divider" />

    <div class="card fade-in" style="animation-delay:0.2s">
      <div class="card-header">
        <div>
          <div class="card-title">2.3 — Evidence Spine</div>
          <div class="card-subtitle">Map your H2/H3 headings with claims and evidence</div>
        </div>
        <button class="btn btn-secondary" id="btn-add-h2">+ Add H2</button>
        <button class="btn btn-secondary" id="btn-add-h3" style="margin-left:4px;">+ Add H3</button>
      </div>
      <div id="headings-list">
        ${state.headings.length ? state.headings.map((h, i) => `
          <div class="heading-item">
            <div class="heading-level">${h.level}</div>
            <div class="heading-fields">
              <input placeholder="Heading text…" value="${esc(h.text)}" data-heading-text="${i}" />
              <input placeholder="Claim / key point…" value="${esc(h.claim)}" data-heading-claim="${i}" />
              <input placeholder="Evidence source URL…" value="${esc(h.evidence)}" data-heading-evidence="${i}" />
            </div>
            <button class="heading-delete" data-heading-delete="${i}">🗑️</button>
          </div>
        `).join('') : '<p style="color:var(--text-muted);font-size:var(--text-sm);">Add H2 and H3 headings to build your content structure.</p>'}
      </div>
    </div>

    ${renderPhaseNav(0, 2)}
  `;
}

// ── Phase 3: Custom Component Builder ───────────────────────
function renderPhase3() {
  return `
    <p class="phase-description">Build the premium Lawsons signature components — expert tips from YouTube, internal links, and data tables.</p>

    <div class="card fade-in">
      <div class="card-header">
        <div>
          <div class="card-title">3.1 — YouTube "Human Insight" Module</div>
          <div class="card-subtitle">Paste a YouTube URL or transcript to extract a Pro-Tip</div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">YouTube Video URL</label>
        <div class="form-hint">Paste a link to a relevant tutorial or guide</div>
        <input class="form-input" id="inp-youtube-url" type="text" placeholder="https://www.youtube.com/watch?v=..." value="${esc(state.youtubeUrl)}" />
      </div>
      <div class="form-group">
        <label class="form-label">OR: Paste Transcript Manually</label>
        <div class="form-hint">Use this if the auto-extractor fails</div>
        <textarea class="form-textarea" id="inp-transcript" placeholder="Paste YouTube transcript here…" style="min-height:80px;">${esc(state.youtubeTranscript)}</textarea>
      </div>
      <button class="btn btn-primary" id="btn-protip" ${!state.youtubeUrl && !state.youtubeTranscript && !state.keyword ? 'disabled' : ''}>
        🎬 Extract Pro-Tip
      </button>
      ${state.proTip ? `
        <div class="result-block" style="margin-top:var(--space-4);">
          <span class="result-label">Expert Pro-Tip</span>
          <div>
            <p style="font-weight:600;color:var(--text-accent);margin-bottom:var(--space-2);">💡 ${esc(state.proTip.tip)}</p>
            <p style="font-size:var(--text-sm);color:var(--text-secondary);font-style:italic;">— ${esc(state.proTip.attribution)}</p>
            ${state.proTip.context ? `<p style="font-size:var(--text-xs);color:var(--text-muted);margin-top:var(--space-2);">${esc(state.proTip.context)}</p>` : ''}
          </div>
        </div>
      ` : ''}
    </div>

    <hr class="section-divider" />

    <div class="card fade-in" style="animation-delay:0.1s">
      <div class="card-header">
        <div>
          <div class="card-title">3.2 — Internal Linker</div>
          <div class="card-subtitle">Upload a CSV of existing blog posts or add manually</div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Blog Database (CSV)</label>
        <div class="form-hint">CSV with columns: title, url, category (optional)</div>
        <input class="form-input" type="file" id="inp-csv" accept=".csv" />
      </div>
      ${state.blogPosts.length ? `
        <p style="font-size:var(--text-sm);color:var(--text-success);margin-bottom:var(--space-3);">✓ ${state.blogPosts.length} blog posts loaded</p>
        <button class="btn btn-primary" id="btn-rank-links">🔗 Find Related Articles</button>
      ` : ''}
      ${state.internalLinks.length ? `
        <div style="margin-top:var(--space-4);">
          ${state.internalLinks.map(link => `
            <div class="result-block" style="margin-bottom:var(--space-3);">
              <strong>${esc(link.title)}</strong>
              <br/><span style="font-size:var(--text-xs);color:var(--text-muted);">${esc(link.url)}</span>
              ${link.reason ? `<br/><span style="font-size:var(--text-sm);color:var(--text-secondary);">${esc(link.reason)}</span>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>

    <hr class="section-divider" />

    <div class="card fade-in" style="animation-delay:0.2s">
      <div class="card-header">
        <div>
          <div class="card-title">3.3 — Data Table Builder</div>
          <div class="card-subtitle">Build a comparison table for snippets</div>
        </div>
        <div>
          <button class="btn btn-ghost" id="btn-add-col">+ Col</button>
          <button class="btn btn-ghost" id="btn-add-row">+ Row</button>
        </div>
      </div>
      <div class="table-builder">
        <table>
          <thead>
            <tr>
              ${state.tableData.headers.map((h, i) => `
                <th><input value="${esc(h)}" data-table-header="${i}" placeholder="Header…" /></th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${state.tableData.rows.map((row, ri) => `
              <tr>
                ${row.map((cell, ci) => `
                  <td><input value="${esc(cell)}" data-table-cell="${ri}-${ci}" placeholder="…" /></td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    ${renderPhaseNav(1, 3)}
  `;
}

// ── Phase 4: E-E-A-T & Quality Assurance ────────────────────
function renderPhase4() {
  const claims = state.headings.filter(h => h.claim).map(h => h.claim);
  return `
    <p class="phase-description">Verify claims, inject trust signals, and check the Lawsons voice consistency.</p>

    <div class="card fade-in">
      <div class="card-header">
        <div>
          <div class="card-title">4.1 — SME Fact-Check</div>
          <div class="card-subtitle">Approve or flag each technical claim</div>
        </div>
      </div>
      ${claims.length ? claims.map((claim, i) => {
        const approved = state.claimApprovals[i] === true;
        const flagged = state.claimApprovals[i] === false;
        return `
          <div class="toggle-container ${approved ? 'approved' : ''} ${flagged ? 'flagged' : ''}">
            <div class="toggle-label">${esc(claim)}</div>
            <div style="display:flex;gap:var(--space-2);">
              <button class="btn ${approved ? 'btn-primary' : 'btn-ghost'}" data-approve="${i}" style="padding:var(--space-1) var(--space-3);font-size:var(--text-xs);">✓ Approve</button>
              <button class="btn ${flagged ? 'btn-accent' : 'btn-ghost'}" data-flag="${i}" style="padding:var(--space-1) var(--space-3);font-size:var(--text-xs);">⚠ Flag</button>
            </div>
          </div>
        `;
      }).join('') : '<p style="color:var(--text-muted);font-size:var(--text-sm);">Add claims to your headings in Phase 2 to enable fact-checking.</p>'}
    </div>

    <hr class="section-divider" />

    <div class="card fade-in" style="animation-delay:0.1s">
      <div class="card-header">
        <div>
          <div class="card-title">4.2 — Trust Signal Injection</div>
          <div class="card-subtitle">Author bio and reviewer details</div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Author Name</label>
        <input class="form-input" id="inp-author" type="text" placeholder="e.g. John Smith" value="${esc(state.authorName)}" />
      </div>
      <div class="form-group">
        <label class="form-label">Author Bio</label>
        <textarea class="form-textarea" id="inp-bio" placeholder="Brief professional bio…" style="min-height:80px;">${esc(state.authorBio)}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Reviewed By</label>
        <input class="form-input" id="inp-reviewer" type="text" placeholder="e.g. Jane Doe, Technical Director" value="${esc(state.reviewerName)}" />
      </div>
      <div class="form-group">
        <label class="form-label">Review Date</label>
        <input class="form-input" id="inp-review-date" type="date" value="${state.reviewDate}" />
      </div>
    </div>

    <hr class="section-divider" />

    <div class="card fade-in" style="animation-delay:0.2s">
      <div class="card-header">
        <div>
          <div class="card-title">4.3 — Tone Check</div>
          <div class="card-subtitle">Evaluate against the Lawsons Voice: Direct, Professional, Authoritative</div>
        </div>
        <button class="btn btn-primary" id="btn-tone">🎯 Run Tone Check</button>
      </div>
      ${state.toneResult ? `
        <div class="score-display">
          <div class="score-circle ${state.toneResult.score >= 7 ? 'high' : state.toneResult.score >= 5 ? 'medium' : 'low'}">
            ${state.toneResult.score}
          </div>
          <div>
            <div style="font-weight:600;">${esc(state.toneResult.summary)}</div>
            ${state.toneResult.suggestions?.length ? `
              <ul style="margin-top:var(--space-2);padding-left:1.2rem;">
                ${state.toneResult.suggestions.map(s => `<li style="font-size:var(--text-sm);color:var(--text-secondary);">${esc(s)}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        </div>
      ` : ''}
    </div>

    ${renderPhaseNav(2, 4)}
  `;
}

// ── Phase 5: Technical Audit & Export ────────────────────────
function renderPhase5() {
  return `
    <p class="phase-description">Generate structured data, alt-text, and export the final HTML for Magento.</p>

    <div class="card fade-in">
      <div class="card-header">
        <div>
          <div class="card-title">5.1 — JSON-LD Schema</div>
          <div class="card-subtitle">Article + FAQ structured data</div>
        </div>
        <button class="btn btn-primary" id="btn-schema">📊 Generate Schema</button>
      </div>
      ${state.schemas.length ? `
        <div class="code-block" id="schema-output">${esc(JSON.stringify(state.schemas, null, 2))}</div>
        <button class="btn btn-ghost" style="margin-top:var(--space-3);" onclick="navigator.clipboard.writeText(document.getElementById('schema-output').textContent)">📋 Copy Schema</button>
      ` : ''}
    </div>

    <hr class="section-divider" />

    <div class="card fade-in" style="animation-delay:0.1s">
      <div class="card-header">
        <div>
          <div class="card-title">5.2 — Image Alt-Text Generator</div>
          <div class="card-subtitle">Keyword-rich, descriptive alt attributes</div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Image Descriptions</label>
        <div class="form-hint">One per line — describe each product image briefly</div>
        <textarea class="form-textarea" id="inp-images" placeholder="Close-up of grey composite decking board&#10;Stack of treated timber fence posts&#10;Person installing fence panel">${state.imageDescriptions.join('\n')}</textarea>
      </div>
      <button class="btn btn-primary" id="btn-alttext">✨ Generate Alt-Text</button>
      ${state.altTexts.length ? `
        <div style="margin-top:var(--space-4);">
          ${state.altTexts.map((alt, i) => `
            <div class="result-block" style="margin-bottom:var(--space-3);">
              <span class="result-label">Image ${i + 1}</span>
              <input class="form-input" value="${esc(alt)}" data-alttext="${i}" style="margin-top:var(--space-2);" />
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>

    <hr class="section-divider" />

    <div class="card fade-in" style="animation-delay:0.2s">
      <div class="card-header">
        <div>
          <div class="card-title">5.3 — Export</div>
          <div class="card-subtitle">Copy or download the final assembled HTML</div>
        </div>
      </div>
      <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;">
        <button class="btn btn-primary" id="btn-copy-html">📋 Copy HTML to Clipboard</button>
        <button class="btn btn-secondary" id="btn-download-html">💾 Download HTML File</button>
        <button class="btn btn-ghost" id="btn-preview-final">👁️ Full Preview</button>
      </div>
    </div>

    ${renderPhaseNav(3, null)}
  `;
}

// ── Phase Navigation ────────────────────────────────────────
function renderPhaseNav(prev, next) {
  return `
    <div class="phase-nav">
      ${prev !== null ? `<button class="btn btn-secondary" data-goto="${prev}">← Back</button>` : '<div></div>'}
      ${next !== null ? `<button class="btn btn-primary" data-goto="${next}">Continue →</button>` : '<div></div>'}
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════
// EVENT HANDLERS
// ═══════════════════════════════════════════════════════════
function attachEvents() {
  // ── Phase Navigation ──
  document.querySelectorAll('[data-phase]').forEach(el => {
    el.addEventListener('click', () => {
      state.currentPhase = parseInt(el.dataset.phase);
      render();
    });
  });

  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => {
      saveCurrentPhaseInputs();
      state.currentPhase = parseInt(el.dataset.goto);
      render();
    });
  });

  // ── Phase 1 Events ──
  bindInput('inp-keyword', v => state.keyword = v);
  bindInput('inp-draft', v => state.draft = v);
  bindSelect('sel-serp', v => state.serpFormat = v);

  bindClick('btn-paa', async (btn) => {
    saveCurrentPhaseInputs();
    setLoading(btn, true);
    try {
      const data = await api('/content/paa', { keyword: state.keyword, draft: state.draft });
      state.paaQuestions = data.questions || [];
      render();
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setLoading(btn, false);
  });

  document.querySelectorAll('[data-paa-remove]').forEach(el => {
    el.addEventListener('click', () => {
      state.paaQuestions.splice(parseInt(el.dataset.paaRemove), 1);
      render();
    });
  });

  // ── Phase 2 Events ──
  bindClick('btn-answer', async (btn) => {
    saveCurrentPhaseInputs();
    setLoading(btn, true);
    try {
      const data = await api('/content/answer-block', { keyword: state.keyword, draft: state.draft, paaQuestions: state.paaQuestions });
      state.answerBlock = data.answer || '';
      render();
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setLoading(btn, false);
  });

  bindClick('btn-takeaways', async (btn) => {
    saveCurrentPhaseInputs();
    setLoading(btn, true);
    try {
      const data = await api('/content/takeaways', { keyword: state.keyword, draft: state.draft, answerBlock: state.answerBlock });
      state.takeaways = data.takeaways || [];
      render();
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setLoading(btn, false);
  });

  bindInput('txt-answer', v => state.answerBlock = v);

  document.querySelectorAll('[data-takeaway]').forEach(el => {
    el.addEventListener('input', () => {
      state.takeaways[parseInt(el.dataset.takeaway)] = el.value;
    });
  });

  bindClick('btn-add-h2', () => {
    state.headings.push({ level: 'H2', text: '', claim: '', evidence: '' });
    render();
  });

  bindClick('btn-add-h3', () => {
    state.headings.push({ level: 'H3', text: '', claim: '', evidence: '' });
    render();
  });

  document.querySelectorAll('[data-heading-text]').forEach(el => {
    el.addEventListener('input', () => { state.headings[parseInt(el.dataset.headingText)].text = el.value; });
  });
  document.querySelectorAll('[data-heading-claim]').forEach(el => {
    el.addEventListener('input', () => { state.headings[parseInt(el.dataset.headingClaim)].claim = el.value; });
  });
  document.querySelectorAll('[data-heading-evidence]').forEach(el => {
    el.addEventListener('input', () => { state.headings[parseInt(el.dataset.headingEvidence)].evidence = el.value; });
  });
  document.querySelectorAll('[data-heading-delete]').forEach(el => {
    el.addEventListener('click', () => {
      state.headings.splice(parseInt(el.dataset.headingDelete), 1);
      render();
    });
  });

  // ── Phase 3 Events ──
  bindInput('inp-youtube-url', v => state.youtubeUrl = v);
  bindInput('inp-transcript', v => state.youtubeTranscript = v);

  bindClick('btn-protip', async (btn) => {
    saveCurrentPhaseInputs();
    setLoading(btn, true);
    try {
      const data = await api('/youtube/extract', { 
        url: state.youtubeUrl,
        transcript: state.youtubeTranscript, 
        keyword: state.keyword 
      });
      state.proTip = data;
      render();
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setLoading(btn, false);
  });

  const csvInput = document.getElementById('inp-csv');
  if (csvInput) {
    csvInput.addEventListener('change', async () => {
      const file = csvInput.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      try {
        const data = await apiUpload('/content/upload-csv', formData);
        state.blogPosts = data.blogPosts || [];
        render();
      } catch (e) {
        alert('Error: ' + e.message);
      }
    });
  }

  bindClick('btn-rank-links', async (btn) => {
    setLoading(btn, true);
    try {
      const data = await api('/content/rank-links', { blogPosts: state.blogPosts, keyword: state.keyword, draft: state.draft });
      state.internalLinks = data.links || [];
      render();
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setLoading(btn, false);
  });

  // Table events
  document.querySelectorAll('[data-table-header]').forEach(el => {
    el.addEventListener('input', () => {
      state.tableData.headers[parseInt(el.dataset.tableHeader)] = el.value;
    });
  });
  document.querySelectorAll('[data-table-cell]').forEach(el => {
    el.addEventListener('input', () => {
      const [ri, ci] = el.dataset.tableCell.split('-').map(Number);
      state.tableData.rows[ri][ci] = el.value;
    });
  });
  bindClick('btn-add-col', () => {
    state.tableData.headers.push('');
    state.tableData.rows.forEach(r => r.push(''));
    render();
  });
  bindClick('btn-add-row', () => {
    state.tableData.rows.push(state.tableData.headers.map(() => ''));
    render();
  });

  // ── Phase 4 Events ──
  bindInput('inp-author', v => state.authorName = v);
  bindInput('inp-bio', v => state.authorBio = v);
  bindInput('inp-reviewer', v => state.reviewerName = v);
  bindInput('inp-review-date', v => state.reviewDate = v);

  document.querySelectorAll('[data-approve]').forEach(el => {
    el.addEventListener('click', () => {
      const i = parseInt(el.dataset.approve);
      state.claimApprovals[i] = state.claimApprovals[i] === true ? undefined : true;
      render();
    });
  });
  document.querySelectorAll('[data-flag]').forEach(el => {
    el.addEventListener('click', () => {
      const i = parseInt(el.dataset.flag);
      state.claimApprovals[i] = state.claimApprovals[i] === false ? undefined : false;
      render();
    });
  });

  bindClick('btn-tone', async (btn) => {
    saveCurrentPhaseInputs();
    setLoading(btn, true);
    try {
      const fullContent = buildFullContent();
      const data = await api('/content/tone-check', { content: fullContent });
      state.toneResult = data;
      render();
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setLoading(btn, false);
  });

  // ── Phase 5 Events ──
  bindClick('btn-schema', async (btn) => {
    setLoading(btn, true);
    try {
      const faqItems = state.paaQuestions.map(q => ({ question: q, answer: '' }));
      const data = await api('/content/schema', {
        title: state.headings[0]?.text || state.keyword,
        description: state.answerBlock,
        keyword: state.keyword,
        author: state.authorName,
        reviewer: state.reviewerName,
        datePublished: state.reviewDate,
        faqItems
      });
      state.schemas = data.schemas || [];
      render();
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setLoading(btn, false);
  });

  bindClick('btn-alttext', async (btn) => {
    saveCurrentPhaseInputs();
    const textarea = document.getElementById('inp-images');
    if (textarea) {
      state.imageDescriptions = textarea.value.split('\n').filter(l => l.trim());
    }
    if (!state.imageDescriptions.length) { alert('Enter at least one image description.'); return; }
    setLoading(btn, true);
    try {
      const data = await api('/content/alt-text', {
        images: state.imageDescriptions.map(d => ({ description: d })),
        keyword: state.keyword
      });
      state.altTexts = data.altTexts || [];
      render();
    } catch (e) {
      alert('Error: ' + e.message);
    }
    setLoading(btn, false);
  });

  bindClick('btn-copy-html', () => {
    const html = buildExportHTML();
    navigator.clipboard.writeText(html).then(() => {
      const btn = document.getElementById('btn-copy-html');
      if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => { btn.textContent = '📋 Copy HTML to Clipboard'; }, 2000); }
    });
  });

  bindClick('btn-download-html', () => {
    const html = buildExportHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lawsons-${state.keyword.replace(/\s+/g, '-').toLowerCase() || 'article'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  });

  bindClick('btn-preview-final', () => openPreviewWindow());

  // Global preview
  window.__previewAll = openPreviewWindow;
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function bindInput(id, setter) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => setter(el.value));
}

function bindSelect(id, setter) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', () => setter(el.value));
}

function bindClick(id, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', () => handler(el));
}

function setLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.dataset.originalText = btn.textContent;
    btn.innerHTML = '<span class="spinner"></span> Working…';
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.originalText || 'Done';
    btn.disabled = false;
  }
}

function saveCurrentPhaseInputs() {
  // Auto-save any current input values
  const keyword = document.getElementById('inp-keyword');
  if (keyword) state.keyword = keyword.value;
  const draft = document.getElementById('inp-draft');
  if (draft) state.draft = draft.value;
  const answer = document.getElementById('txt-answer');
  if (answer) state.answerBlock = answer.value;
  const transcript = document.getElementById('inp-transcript');
  if (transcript) state.youtubeTranscript = transcript.value;
}

function buildFullContent() {
  let content = state.answerBlock + '\n\n';
  content += state.takeaways.join('\n') + '\n\n';
  state.headings.forEach(h => {
    content += `${h.level}: ${h.text}\n${h.claim}\n\n`;
  });
  if (state.proTip) content += `Pro Tip: ${state.proTip.tip}\n\n`;
  return content;
}

// ═══════════════════════════════════════════════════════════
// HTML EXPORT BUILDER
// ═══════════════════════════════════════════════════════════
function buildExportHTML() {
  const title = state.headings.find(h => h.level === 'H2')?.text || state.keyword || 'Lawsons Article';

  let html = `<!-- Lawsons Content Engine — Generated ${new Date().toISOString().split('T')[0]} -->\n\n`;

  // QA Metadata
  const flagged = Object.values(state.claimApprovals).some(v => v === false);
  const totalClaims = state.headings.filter(h => h.claim).length;
  const approvedCount = Object.values(state.claimApprovals).filter(v => v === true).length;
  
  html += `<!-- QA STATUS: ${flagged ? '⚠️ FLAG FOR REVIEW' : '✅ APPROVED'} -->\n`;
  html += `<!-- CLAIMS: ${approvedCount}/${totalClaims} APPROVED -->\n\n`;

  // Answer Block
  if (state.answerBlock) {
    html += `<div class="answer-block" style="background:#F0F9F0;border-left:4px solid #2D6A2E;padding:1.25rem 1.5rem;margin:1.5rem 0;border-radius:0 8px 8px 0;">\n`;
    html += `  <p style="font-size:1rem;line-height:1.7;color:#2D2D2D;margin:0;">${state.answerBlock}</p>\n`;
    html += `</div>\n\n`;
  }

  // Key Takeaways
  if (state.takeaways.length) {
    html += `<div class="key-takeaways" style="background:#FFF9E6;border:1px solid rgba(249,168,37,0.3);border-radius:12px;padding:1.5rem;margin:1.5rem 0;">\n`;
    html += `  <h3 style="color:#92400E;margin-bottom:0.75rem;">Key Takeaways</h3>\n`;
    html += `  <ul style="list-style:none;padding:0;margin:0;">\n`;
    state.takeaways.forEach(t => {
      html += `    <li style="padding:0.4rem 0 0.4rem 1.5rem;position:relative;color:#4A3500;"><span style="position:absolute;left:0;color:#2D6A2E;font-weight:700;">✓</span>${t}</li>\n`;
    });
    html += `  </ul>\n</div>\n\n`;
  }

  // Evidence Spine (Headings)
  state.headings.forEach(h => {
    const tag = h.level.toLowerCase();
    html += `<${tag}>${h.text}</${tag}>\n`;
    if (h.claim) {
      html += `<p>${h.claim}</p>\n`;
    }
    if (h.evidence) {
      html += `<p><small>Source: <a href="${h.evidence}" target="_blank" rel="noopener">${h.evidence}</a></small></p>\n`;
    }
    html += `\n`;
  });

  // Expert Pro-Tip
  if (state.proTip) {
    html += `<div class="expert-tip" style="background:#F0F9F0;border-left:4px solid #2D6A2E;border-radius:0 8px 8px 0;padding:1.25rem 1.5rem;margin:1.5rem 0;">\n`;
    html += `  <p style="font-weight:700;color:#1E4A1F;margin-bottom:0.5rem;">💡 Expert Tip</p>\n`;
    html += `  <p style="font-size:0.9375rem;color:#2D2D2D;line-height:1.7;">${state.proTip.tip}</p>\n`;
    html += `  <p style="font-size:0.8125rem;color:#666;margin-top:0.5rem;font-style:italic;">— ${state.proTip.attribution}</p>\n`;
    html += `</div>\n\n`;
  }

  // Data Table
  if (state.tableData.headers.some(h => h) && state.tableData.rows.some(r => r.some(c => c))) {
    html += `<table style="width:100%;border-collapse:collapse;margin:1.5rem 0;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">\n`;
    html += `  <thead>\n    <tr>\n`;
    state.tableData.headers.forEach(h => {
      html += `      <th style="background:#2D6A2E;color:white;padding:0.75rem 1rem;text-align:left;font-weight:600;font-size:0.8125rem;text-transform:uppercase;">${h}</th>\n`;
    });
    html += `    </tr>\n  </thead>\n  <tbody>\n`;
    state.tableData.rows.forEach((row, i) => {
      const bg = i % 2 ? ' style="background:#F9FAFB;"' : '';
      html += `    <tr${bg}>\n`;
      row.forEach(cell => {
        html += `      <td style="padding:0.75rem 1rem;border-bottom:1px solid #F0F0F0;color:#333;">${cell}</td>\n`;
      });
      html += `    </tr>\n`;
    });
    html += `  </tbody>\n</table>\n\n`;
  }

  // Internal Links
  if (state.internalLinks.length) {
    html += `<div class="want-to-know-more" style="background:#F7F8FA;border-radius:12px;padding:1.5rem;margin:2rem 0;">\n`;
    html += `  <h3 style="color:#1E4A1F;margin-bottom:1rem;">Want to Know More?</h3>\n`;
    state.internalLinks.forEach(link => {
      html += `  <div style="display:flex;align-items:center;gap:1rem;padding:0.75rem;background:white;border-radius:8px;margin-bottom:0.5rem;border:1px solid #E5E7EB;">\n`;
      html += `    <div style="width:40px;height:40px;background:#E8F5E8;border-radius:8px;display:flex;align-items:center;justify-content:center;">📄</div>\n`;
      html += `    <div>\n`;
      html += `      <a href="${link.url}" style="font-weight:600;color:#1a1a1a;text-decoration:none;">${link.title}</a>\n`;
      html += `    </div>\n  </div>\n`;
    });
    html += `</div>\n\n`;
  }

  // Author Bio
  if (state.authorName) {
    html += `<div class="author-bio" style="border-top:2px solid #E5E7EB;padding-top:1.5rem;margin-top:2rem;">\n`;
    html += `  <p style="font-weight:700;font-size:0.9375rem;color:#1a1a1a;">Written by ${state.authorName}</p>\n`;
    if (state.authorBio) html += `  <p style="font-size:0.875rem;color:#666;margin-top:0.25rem;">${state.authorBio}</p>\n`;
    if (state.reviewerName) html += `  <p style="font-size:0.8125rem;color:#888;margin-top:0.5rem;">Reviewed by ${state.reviewerName} — ${state.reviewDate}</p>\n`;
    html += `</div>\n\n`;
  }

  // Schema
  if (state.schemas.length) {
    html += `<script type="application/ld+json">\n${JSON.stringify(state.schemas, null, 2)}\n</script>\n`;
  }

  return html;
}

// ═══════════════════════════════════════════════════════════
// PREVIEW WINDOW
// ═══════════════════════════════════════════════════════════
function openPreviewWindow() {
  const html = buildExportHTML();
  const previewHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview — ${state.keyword || 'Article'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 2rem; line-height: 1.8; color: #1a1a1a; }
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    h2 { font-size: 1.4rem; color: #2D6A2E; margin: 2rem 0 0.75rem; padding-bottom: 0.5rem; border-bottom: 2px solid #E8F5E8; }
    h3 { font-size: 1.15rem; color: #333; margin: 1.5rem 0 0.5rem; }
    p { margin: 0.75rem 0; }
    a { color: #2D6A2E; }
    table { font-size: 0.9375rem; }
    .preview-badge { position: fixed; top: 1rem; right: 1rem; background: #2D6A2E; color: white; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
  </style>
</head>
<body>
  <div class="preview-badge">Preview</div>
  <h1>${state.keyword || 'Article Preview'}</h1>
  ${html}
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(previewHTML);
    win.document.close();
  }
}

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════
async function init() {
  await checkApi();
  render();

  // Re-check API status periodically
  setInterval(async () => {
    const prev = state.apiConnected;
    await checkApi();
    if (prev !== state.apiConnected) {
      const dot = document.querySelector('.api-dot');
      const label = document.querySelector('.api-status span');
      if (dot) dot.classList.toggle('connected', state.apiConnected);
      if (label) label.textContent = state.apiConnected ? 'API Connected' : 'API Offline — start server';
    }
  }, 5000);
}

init();
