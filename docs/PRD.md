# SlideForge — Product Requirements Document (PRD)

## 1. Product Vision

SlideForge is an AI-powered presentation generator that converts any text input into professional slide decks with presenter scripts, using decentralized/token-based AI inference to minimize costs and avoid subscription dependencies.

## 2. Problem Statement

Creating professional presentations is time-consuming. Existing AI tools (Gamma, Beautiful.ai, Tome) require expensive subscriptions ($10-30/mo) and lock users into proprietary ecosystems. There is no tool that:
- Accepts plain text and generates complete presentations
- Uses token-based/decentralized AI inference (pay-per-use)
- Provides both slides AND presenter scripts
- Exports to standard PPTX format
- Works with local models for zero-cost generation

## 3. Target Users

### Primary
- Students creating academic presentations
- Professionals preparing meeting presentations
- Content creators repurposing articles into slides
- Startup founders creating pitch decks

### Secondary
- Teachers creating lesson materials
- Researchers presenting findings
- Marketers creating client presentations

## 4. User Stories

### Epic 1: Content Input
- **US-1.1**: As a user, I want to paste plain text so that it becomes a presentation
- **US-1.2**: As a user, I want to upload a document (PDF/DOCX/TXT/MD) so I don't have to copy-paste
- **US-1.3**: As a user, I want to enter a topic and let AI generate content from scratch
- **US-1.4**: As a user, I want to paste a URL to an article and have it converted
- **US-1.5**: As a user, I want to specify slide count, audience, and tone

### Epic 2: AI Generation
- **US-2.1**: As a user, I want AI to analyze my content and create structured slides
- **US-2.2**: As a user, I want varied slide layouts (title, bullets, two-column, stats, flow, quote)
- **US-2.3**: As a user, I want visual recommendations for each slide
- **US-2.4**: As a user, I want AI to generate a presenter script for each slide
- **US-2.5**: As a user, I want transition suggestions between slides
- **US-2.6**: As a user, I want an executive summary and key takeaways

### Epic 3: Presentation Editing
- **US-3.1**: As a user, I want to preview slides before exporting
- **US-3.2**: As a user, I want to reorder slides via drag-and-drop
- **US-3.3**: As a user, I want to edit slide content inline
- **US-3.4**: As a user, I want to change the color theme
- **US-3.5**: As a user, I want to regenerate individual slides

### Epic 4: Export
- **US-4.1**: As a user, I want to download my presentation as PPTX
- **US-4.2**: As a user, I want speaker notes embedded in the PPTX
- **US-4.3**: As a user, I want to download the presenter script as a text/PDF file
- **US-4.4**: As a user, I want to export the presentation data as JSON

### Epic 5: Authentication & Wallet
- **US-5.1**: As a user, I want to connect my crypto wallet to authenticate
- **US-5.2**: As a user, I want to see my token balance for AI inference credits
- **US-5.3**: As a user, I want to pay for AI inference with tokens
- **US-5.4**: As a user, I want to optionally sign up with email

### Epic 6: AI Provider Configuration
- **US-6.1**: As a user, I want to configure my own AI endpoint (any OpenAI-compatible API)
- **US-6.2**: As a user, I want to use local models via Ollama for free generation
- **US-6.3**: As a user, I want to see inference cost before generating
- **US-6.4**: As a user, I want to choose between quality tiers (fast/standard/high-quality)

## 5. Functional Requirements

### FR-1: Content Processing
- Accept text input up to 50,000 characters
- Support file upload: PDF, DOCX, TXT, MD (up to 10MB)
- Support URL scraping for public articles
- Auto-detect content language
- Extract key themes, entities, and structure from input

### FR-2: AI Generation Pipeline
- **Stage 1 — Analysis**: Extract topics, subtopics, audience, goals, recommended slide count
- **Stage 2 — Outline**: Generate slide-by-slide outline with types and key points
- **Stage 3 — Content**: Generate full slide content with varied layouts
- **Stage 4 — Script**: Generate presenter notes and scripts per slide
- **Stage 5 — Polish**: Generate transitions, executive summary, key takeaways

### FR-3: Slide Layouts
Support at minimum 8 layout types:
1. Title slide (title + subtitle)
2. Section divider (accent bar + title)
3. Bullet points (heading + bullet list)
4. Two-column (text + visual/icon)
5. Statistics (3-4 stat cards)
6. Key points (2x2 card grid)
7. Process/flow (numbered steps with arrows)
8. Quote/takeaway (centered italic quote)

### FR-4: Presentation Engine
- Render live HTML preview of slides
- Support 6 color themes
- Support 5 visual styles (Modern, Minimal, Bold, Corporate, Creative)
- 16:9 aspect ratio (widescreen)
- Keyboard navigation (arrow keys)

### FR-5: Export Engine
- PPTX generation via pptxgenjs with:
  - Proper slide backgrounds
  - Embedded fonts
  - Speaker notes in notes section
  - Slide numbers
  - Color theme applied consistently
- PDF export (via html2canvas + jsPDF or server-side)
- JSON export (raw presentation data)
- Script download as TXT

### FR-6: Authentication
- Wallet connection via ethers.js / wagmi (MetaMask, WalletConnect, Coinbase Wallet)
- JWT-based session management
- Optional email/password authentication
- User profile with generation history

### FR-7: AI Provider Abstraction
- OpenAI-compatible endpoint support (user provides URL + API key)
- Ollama local model support (localhost:11434)
- Pre-configured providers: Groq, Together.ai, Fireworks.ai, OpenRouter
- Custom headers support for token-gated providers
- Response caching layer

## 6. Non-Functional Requirements

### Performance
- Slide preview render: < 100ms per slide
- PPTX export: < 3 seconds for 15-slide deck
- AI generation: < 30 seconds for full presentation (provider-dependent)
- Page load: < 2 seconds (Next.js SSG/ISR)

### Security
- API keys stored encrypted in database
- Never expose provider API keys to client
- Rate limiting: 10 generations/hour for free tier
- Input sanitization on all text inputs
- CORS restrictions on API routes

### Scalability
- Stateless API routes (horizontal scaling)
- Database connection pooling via Prisma
- Presentation caching (Redis when available, DB fallback)
- CDN for static assets

### Cost Optimization
- Prompt compression: strip unnecessary context before inference
- Response caching: identical inputs return cached results
- Batch processing: combine analysis + outline in single call
- Local fallback: Ollama for outline generation, paid API for final polish
- Token-aware: check balance before inference, warn if insufficient

## 7. MVP Scope

### In Scope (MVP)
- [x] Text input → AI-generated slides
- [x] 8 slide layout types
- [x] Live preview with navigation
- [x] Presenter script generation
- [x] PPTX export with speaker notes
- [x] Script TXT download
- [x] 6 color themes
- [x] Configurable AI endpoint (OpenAI-compatible)
- [x] Ollama local model support
- [x] Basic caching
- [x] Responsive dark-themed UI

### Phase 2
- [ ] File upload (PDF, DOCX, MD)
- [ ] URL scraping
- [ ] Wallet authentication
- [ ] Token balance checking
- [ ] User accounts and history
- [ ] PDF export
- [ ] Drag-and-drop slide reordering
- [ ] Inline slide editing
- [ ] Slide regeneration

### Phase 3
- [ ] On-chain token payment verification
- [ ] MIMO ecosystem integration (when available)
- [ ] Collaborative editing
- [ ] Template marketplace
- [ ] Team workspaces
- [ ] Presentation analytics

## 8. Success Metrics

| Metric | Target (MVP) | Target (6 months) |
|--------|-------------|-------------------|
| Monthly active users | 100 | 5,000 |
| Presentations generated | 500 | 25,000 |
| Avg slides per presentation | 10 | 12 |
| PPTX export rate | 60% | 70% |
| User retention (7-day) | 20% | 35% |
| Avg generation time | < 30s | < 15s |