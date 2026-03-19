# Lawsons Agentic Content Engine

Transform rough BrightEdge SEO drafts into premium, LLM-friendly, E-E-A-T-optimised blog posts — ready for direct injection into Magento.

## Quick Start

### 1. Install Dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Gemini API Key
```bash
cp server/.env.example server/.env
# Edit server/.env and add your Gemini API key
# Get one at: https://aistudio.google.com/apikey
```

### 3. Start the Servers
```bash
# Terminal 1: Start the backend
cd server && node index.js

# Terminal 2: Start the frontend
cd client && npx vite
```

The app runs at **http://localhost:5173**

> **Note:** Without a Gemini API key, all AI features return realistic mock data so you can still test the full workflow.

## Architecture

```
Blog Creation Tool/
├── client/                 # Vite + Vanilla JS frontend
│   ├── src/
│   │   ├── main.js         # App entry — 5-phase wizard UI
│   │   └── style.css       # Lawsons design system (dark theme)
│   └── vite.config.js      # Dev proxy to backend
├── server/                 # Express backend API
│   ├── index.js            # Server entry
│   ├── routes/
│   │   ├── content.js      # Content pipeline endpoints
│   │   └── youtube.js      # YouTube transcript endpoint
│   └── services/
│       ├── gemini.js       # Gemini PRO wrapper (7 prompt templates)
│       └── schema.js       # JSON-LD schema generator
└── .gitignore
```

## Workflow Phases

| Phase | What it does |
|-------|-------------|
| **1. Ingestion** | Import keyword + draft, generate PAA questions, assess SERP format |
| **2. Content Engineering** | Zero-click answer block, key takeaways, evidence spine (H2/H3 builder) |
| **3. Component Builder** | YouTube pro-tip extraction, internal linker (CSV), data table builder |
| **4. E-E-A-T & QA** | SME fact-check toggles, trust signals (author/reviewer), tone check |
| **5. Audit & Export** | JSON-LD schema, alt-text generation, copy/download HTML for Magento |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check + API key status |
| POST | `/api/content/paa` | Generate PAA questions |
| POST | `/api/content/answer-block` | Generate zero-click answer |
| POST | `/api/content/takeaways` | Generate key takeaways |
| POST | `/api/content/rank-links` | Rank internal links |
| POST | `/api/content/upload-csv` | Upload blog database CSV |
| POST | `/api/content/tone-check` | Lawsons voice tone analysis |
| POST | `/api/content/schema` | Generate JSON-LD schemas |
| POST | `/api/content/alt-text` | Generate image alt-text |
| POST | `/api/youtube/extract` | Extract pro-tip from transcript |
