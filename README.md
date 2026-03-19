# Lawsons Agentic Content Engine

Transform rough BrightEdge SEO drafts into premium, LLM-friendly, E-E-A-T-optimised blog posts — ready for direct injection into Magento.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Gemini API Key
```bash
cp .env.example .env
# Edit .env and add your Gemini API key
```

### 3. Start the Server
```bash
node server.js
```

The app runs at **http://localhost:3001** (serving both API and Frontend).

> **Deployment Note:** This project is "Zero Config" for Vercel. Just connect the repository to Vercel and it will auto-deploy the root directory as a combined static + API app.

## Architecture

```
Blog Creation Tool/
├── api/             # Express routes (Vercel compatible)
├── services/        # Gemini + Schema logic
├── assets/          # Icons and branding
├── index.html       # Main application shell
├── main.js          # 5-phase wizard logic
├── style.css        # Lawsons design system
├── server.js        # Node.js entry point
└── vercel.json      # Routing config
```

## Workflow Phases

1. **Ingestion**: Import keyword + draft, generate PAA questions.
2. **Engineering**: Zero-click answer block, key takeaways, evidence spine.
3. **Components**: YouTube pro-tip extraction, internal linker, data table builder.
4. **E-E-A-T & QA**: SME fact-check, trust signals, tone check.
5. **Export**: JSON-LD schema, alt-text, HTML export for Magento.
