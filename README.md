# SlideForge 🎯

**AI-Powered Presentation Generator** — Transform any text into professional slide decks with presenter scripts.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

## ✨ Features

- **Text → Slides**: Paste any text, article, or topic and get a complete presentation
- **8 Slide Layouts**: Title, bullets, two-column, stats, key points, flow, quote, section
- **Presenter Scripts**: Auto-generated speaker notes with transitions for each slide
- **PPTX Export**: Download real `.pptx` files (openable in PowerPoint, Google Slides, Keynote)
- **Script Download**: Get a presenter script as `.txt`
- **6 Color Themes**: Blue, green, warm, sunset, dark, ocean
- **5 Visual Styles**: Modern, minimal, bold, corporate, creative
- **Multi-Provider**: Works with Google Gemini, Groq, MIMO, Ollama, and any OpenAI-compatible API
- **Local Models**: Use Ollama for 100% free, offline generation

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Owampogi/slideforge.git
cd slideforge
npm install
```

### 2. Set Up API Key (Free)

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your free Google Gemini API key:

```
GEMINI_API_KEY=your-gemini-api-key-here
```

**Get a FREE Gemini key (recommended):**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key into `.env.local`

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Generate!

1. Paste your text in the left panel
2. Click **Generate Presentation**
3. Preview slides → Download PPTX or Script

## 🤖 Supported AI Providers

| Provider | Model | Cost | Setup |
|----------|-------|------|-------|
| **Google Gemini** ⭐ | `gemini-2.0-flash` | Free tier | Get key at [AI Studio](https://aistudio.google.com) |
| **Groq** | `llama-3.3-70b-versatile` | Free tier | Get key at [groq.com](https://console.groq.com) |
| **OpenRouter** | Various | Free models | Get key at [openrouter.ai](https://openrouter.ai) |
| **MIMO (Xiaomi)** | `mimo-v2.5-pro` | Token-based | Get key at [MIMO](https://xiaomimimo.com) |
| **Together.ai** | `Llama-3.3-70B` | Free tier | Get key at [together.ai](https://together.ai) |
| **Ollama (Local)** | `llama3.1:8b` | Free | Install [Ollama](https://ollama.com) |

Switch providers in Settings (⚙) — no code changes needed. Enter your API key in the app's Settings modal.

## 📁 Project Structure

```
slideforge/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main 3-panel UI
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Tailwind + slide styles
│   │   └── api/
│   │       ├── generate/route.ts # AI generation endpoint
│   │       └── export/pptx/      # PPTX export endpoint
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── provider.ts       # AI provider abstraction
│   │   │   └── prompts.ts        # Generation prompts
│   │   └── presentation/
│   │       └── themes.ts         # Themes & visual styles
│   ├── store/
│   │   └── presentation-store.ts # Zustand state
│   └── types/
│       ├── slide.ts              # Slide types
│       └── ai-provider.ts        # Provider types
└── docs/
    ├── PRD.md                    # Product requirements
    ├── ARCHITECTURE.md           # Technical architecture
    └── RESEARCH.md               # AI ecosystem research
```

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State**: Zustand
- **AI**: OpenAI-compatible API (Gemini, Groq, etc.)
- **Export**: pptxgenjs
- **Icons**: Lucide React

## 📄 License

MIT