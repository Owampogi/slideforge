# SlideForge — Technical Architecture

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Next.js Frontend)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Text     │ │ Slide    │ │ Script   │ │ Settings /    │  │
│  │ Input    │ │ Preview  │ │ Panel    │ │ Wallet Connect│  │
│  └────┬─────┘ └────▲─────┘ └────▲─────┘ └───────┬───────┘  │
│       │             │           │                │          │
│       ▼             │           │                ▼          │
│  ┌──────────────────┴───────────┴───────────────────────┐  │
│  │              State Management (Zustand)               │  │
│  └──────────────────────┬────────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────────┘
                          │ API Calls
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                SERVER (Next.js API Routes)                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ /api/generate│ │ /api/export  │ │ /api/auth            │ │
│  │              │ │              │ │ /api/wallet          │ │
│  └──────┬───────┘ └──────┬───────┘ └──────────┬───────────┘ │
│         │                │                     │             │
│         ▼                │                     ▼             │
│  ┌──────────────────────┐│              ┌──────────────┐    │
│  │  AI Inference Layer  ││              │  Auth Service │    │
│  │  ┌─────────────────┐ ││              │  (JWT/Session)│    │
│  │  │ Provider Router │ ││              └──────────────┘    │
│  │  ├─────────────────┤ ││                                  │
│  │  │ OpenAI-compat   │ ││                                  │
│  │  │ Ollama          │ ││                                  │
│  │  │ Token-gated     │ ││                                  │
│  │  └─────────────────┘ ││                                  │
│  └──────────────────────┘│                                  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │  Presentation Engine                                  │  │
│  │  ├─ Content Analyzer                                  │  │
│  │  ├─ Slide Generator                                   │  │
│  │  ├─ Script Generator                                  │  │
│  │  ├─ PPTX Builder (pptxgenjs)                          │  │
│  │  └─ PDF Builder                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │  PostgreSQL   │ │  Cache (DB   │ │  File Storage        │ │
│  │  (Prisma ORM)│ │  or Redis)   │ │  (uploads/)          │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 EXTERNAL SERVICES                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │  AI Providers│ │  Blockchain  │ │  Auth Providers      │ │
│  │  - Ollama    │ │  - Ethereum  │ │  - WalletConnect     │ │
│  │  - Groq      │ │  - Polygon   │ │  - MetaMask          │ │
│  │  - Together  │ │  - Base      │ │  - Email/Password    │ │
│  │  - Custom    │ │  - BSC       │ │                      │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 2. Folder Structure

```
slideforge/
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Root layout (providers, fonts)
│   ├── page.tsx                    # Main presentation generator page
│   ├── globals.css                 # Global styles + Tailwind
│   ├── api/                        # API Routes
│   │   ├── generate/
│   │   │   └── route.ts            # AI generation endpoint
│   │   ├── export/
│   │   │   ├── pptx/route.ts       # PPTX export endpoint
│   │   │   ├── pdf/route.ts        # PDF export endpoint
│   │   │   └── json/route.ts       # JSON export endpoint
│   │   ├── auth/
│   │   │   ├── wallet/route.ts     # Wallet auth (SIWE)
│   │   │   └── session/route.ts    # Session management
│   │   ├── presentations/
│   │   │   ├── route.ts            # CRUD for presentations
│   │   │   └── [id]/route.ts       # Single presentation
│   │   └── health/
│   │       └── route.ts            # Health check
│   ├── dashboard/
│   │   └── page.tsx                # User dashboard (history)
│   └── settings/
│       └── page.tsx                # Provider & wallet settings
│
├── components/                     # React Components
│   ├── ui/                         # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── tabs.tsx
│   │   ├── slider.tsx
│   │   └── badge.tsx
│   ├── layout/                     # Layout components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── three-panel.tsx
│   ├── presentation/               # Presentation-specific
│   │   ├── input-panel.tsx         # Text input + options
│   │   ├── slide-preview.tsx       # Slide preview renderer
│   │   ├── slide-navigator.tsx     # Slide navigation + thumbnails
│   │   ├── script-panel.tsx        # Presenter script display
│   │   ├── export-bar.tsx          # Export buttons
│   │   ├── theme-picker.tsx        # Color theme selector
│   │   └── style-picker.tsx        # Visual style selector
│   ├── slides/                     # Slide layout renderers
│   │   ├── title-slide.tsx
│   │   ├── section-slide.tsx
│   │   ├── bullets-slide.tsx
│   │   ├── two-column-slide.tsx
│   │   ├── stats-slide.tsx
│   │   ├── key-points-slide.tsx
│   │   ├── flow-slide.tsx
│   │   └── quote-slide.tsx
│   ├── settings/                   # Settings components
│   │   ├── provider-settings.tsx   # AI provider config
│   │   ├── wallet-connect.tsx      # Wallet connection
│   │   └── token-balance.tsx       # Token balance display
│   └── shared/                     # Shared components
│       ├── loading-overlay.tsx
│       ├── error-boundary.tsx
│       └── empty-state.tsx
│
├── lib/                            # Shared libraries
│   ├── ai/                         # AI Inference Layer
│   │   ├── provider.ts             # Provider abstraction interface
│   │   ├── openai-compat.ts        # OpenAI-compatible provider
│   │   ├── ollama.ts               # Ollama local provider
│   │   ├── providers.ts            # Pre-configured providers list
│   │   ├── prompts.ts              # Prompt templates
│   │   └── cache.ts                # Response caching
│   ├── presentation/               # Presentation Engine
│   │   ├── analyzer.ts             # Content analysis
│   │   ├── generator.ts            # Slide generation orchestrator
│   │   ├── script-generator.ts     # Presenter script generator
│   │   ├── pptx-builder.ts         # PPTX export builder
│   │   ├── pdf-builder.ts          # PDF export builder
│   │   ├── themes.ts               # Theme definitions
│   │   └── layouts.ts              # Layout definitions
│   ├── wallet/                     # Blockchain/Wallet
│   │   ├── config.ts               # Chain config (ethers.js)
│   │   ├── balance.ts              # Token balance checking
│   │   └── verify.ts               # Transaction verification
│   ├── auth/                       # Authentication
│   │   ├── jwt.ts                  # JWT utilities
│   │   ├── session.ts              # Session management
│   │   └── siwe.ts                 # Sign-In With Ethereum
│   ├── db/                         # Database
│   │   ├── prisma.ts               # Prisma client singleton
│   │   └── migrations/             # Database migrations
│   └── utils/                      # Utilities
│       ├── crypto.ts               # Encryption helpers
│       ├── compression.ts          # Prompt compression
│       └── validation.ts           # Input validation
│
├── store/                          # Zustand stores
│   ├── presentation-store.ts       # Presentation state
│   ├── settings-store.ts           # Settings state
│   └── auth-store.ts               # Auth state
│
├── hooks/                          # Custom React hooks
│   ├── use-presentation.ts
│   ├── use-ai-provider.ts
│   ├── use-wallet.ts
│   └── use-keyboard-nav.ts
│
├── prisma/                         # Prisma schema
│   └── schema.prisma
│
├── types/                          # TypeScript types
│   ├── presentation.ts
│   ├── ai-provider.ts
│   ├── slide.ts
│   └── wallet.ts
│
├── public/                         # Static assets
│   ├── fonts/
│   └── icons/
│
├── docs/                           # Documentation
│   ├── RESEARCH.md
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   └── API.md
│
├── .env.example                    # Environment variables template
├── .env.local                      # Local environment (gitignored)
├── next.config.ts                  # Next.js configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies
└── README.md                       # Project README
```

## 3. Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==========================================
// AUTHENTICATION
// ==========================================

model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  walletAddress String?   @unique
  displayName   String?
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  presentations Presentation[]
  aiSettings    AiProviderSetting[]
  apiUsage      ApiUsageRecord[]
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  token        String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ==========================================
// AI PROVIDERS
// ==========================================

model AiProviderSetting {
  id           String   @id @default(cuid())
  userId       String
  providerType String   // 'openai-compat', 'ollama', 'custom'
  name         String
  endpointUrl  String
  apiKeyEnc    String?  // Encrypted API key
  modelId      String
  isActive     Boolean  @default(true)
  headers      Json?    // Custom headers for token-gated providers
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ==========================================
// PRESENTATIONS
// ==========================================

model Presentation {
  id              String   @id @default(cuid())
  userId          String
  title           String
  sourceText      String   @db.Text
  slideCount      Int
  themeName       String   @default("blue")
  styleName       String   @default("modern")
  audience        String?
  aiProvider      String   // Which provider was used
  aiModel         String   // Which model was used
  generationTime  Int?     // Milliseconds
  tokenCost       Float?   // Tokens/cost used

  // Stored as JSON
  slidesData      Json     // Full slides array
  scriptData      Json?    // Script metadata
  analysisData    Json?    // Content analysis result

  status          String   @default("draft") // draft, generating, complete, failed
  errorMessage    String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([status])
}

// ==========================================
// CACHING
// ==========================================

model GenerationCache {
  id           String   @id @default(cuid())
  inputHash    String   @unique  // SHA-256 of normalized input
  providerId   String
  modelId      String
  slideCount   Int
  styleName    String
  resultData   Json     // Cached presentation data
  hitCount     Int      @default(0)
  createdAt    DateTime @default(now())
  expiresAt    DateTime

  @@index([inputHash])
  @@index([expiresAt])
}

// ==========================================
// USAGE TRACKING
// ==========================================

model ApiUsageRecord {
  id            String   @id @default(cuid())
  userId        String
  providerType  String
  modelId       String
  inputTokens   Int
  outputTokens  Int
  costTokens    Float?   // Token/crypto cost
  generationMs  Int
  cached        Boolean  @default(false)
  createdAt     DateTime @default(now())

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}
```

## 4. AI Inference Abstraction Layer

### Provider Interface

```typescript
// lib/ai/provider.ts
export interface AiProvider {
  name: string;
  type: 'openai-compat' | 'ollama' | 'custom';
  
  // Check if provider is available
  isAvailable(): Promise<boolean>;
  
  // Generate completion
  complete(request: CompletionRequest): Promise<CompletionResponse>;
  
  // Estimate cost (tokens/crypto)
  estimateCost(request: CompletionRequest): Promise<CostEstimate>;
}

export interface CompletionRequest {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
}

export interface CompletionResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
  cached: boolean;
}

export interface CostEstimate {
  inputTokens: number;
  estimatedOutputTokens: number;
  estimatedCost: number;     // In provider's native unit
  costCurrency: string;      // 'USD', 'ETH', 'MIMO', 'TAO', etc.
  costDisplay: string;       // Human-readable: "~$0.002" or "~0.001 MIMO"
}
```

### Provider Router

```typescript
// lib/ai/provider.ts
export class ProviderRouter {
  private providers: Map<string, AiProvider> = new Map();
  
  registerProvider(setting: AiProviderSetting): void { ... }
  
  getActiveProvider(): AiProvider { ... }
  
  async generateWithFallback(
    request: CompletionRequest,
    primaryProvider: AiProvider,
    fallbackProvider?: AiProvider
  ): Promise<CompletionResponse> {
    try {
      return await primaryProvider.complete(request);
    } catch (error) {
      if (fallbackProvider) {
        return await fallbackProvider.complete(request);
      }
      throw error;
    }
  }
}
```

## 5. AI Generation Pipeline

```
Input Text
    │
    ▼
┌─────────────────────────────────────────┐
│ Stage 1: ANALYSIS (single AI call)      │
│ Input: raw text                         │
│ Output: {                               │
│   mainTopic, subtopics[], audience,     │
│   goals, recommendedSlideCount,         │
│   keyEntities[], contentType            │
│ }                                       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Stage 2: OUTLINE (single AI call)       │
│ Input: analysis + original text         │
│ Output: {                               │
│   slides: [                             │
│     { type, title, keyPoints[], layout }│
│   ],                                    │
│   executiveSummary                      │
│ }                                       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Stage 3: FULL CONTENT (single AI call)  │
│ Input: outline + original text          │
│ Output: {                               │
│   slides: [                             │
│     { type, title, layout, content,     │
│       bullets?, stats?, points?,        │
│       steps?, quote?, visual?,          │
│       speaker_notes, transition? }      │
│   ],                                    │
│   keyTakeaways[]                        │
│ }                                       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
           Generated Presentation
```

### Optimization: Single-Pass Generation

For the MVP, we use a **single AI call** that combines all stages into one prompt. This reduces latency and token cost by 3x compared to multi-stage calls.

The prompt instructs the model to return a complete JSON structure with all slides, scripts, and metadata in one response.

### Prompt Compression Strategy

```typescript
// lib/utils/compression.ts
export function compressPrompt(text: string, maxTokens: number): string {
  // 1. Remove excessive whitespace
  // 2. Remove duplicate sentences
  // 3. Extract key paragraphs (first, last, and highest-density)
  // 4. Truncate to fit within token budget
  // 5. Add "..." indicator if truncated
}
```

## 6. Wallet Integration Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   MetaMask   │────▶│   wagmi /    │────▶│  Auth Endpoint   │
│   Wallet     │     │   ethers.js  │     │  /api/auth/wallet│
└──────────────┘     └──────────────┘     └────────┬─────────┘
                                                    │
                                          ┌─────────▼─────────┐
                                          │  Verify SIWE Msg   │
                                          │  (EIP-4361)        │
                                          └─────────┬─────────┘
                                                    │
                                          ┌─────────▼─────────┐
                                          │  Check Token       │
                                          │  Balance (ERC-20)  │
                                          └─────────┬─────────┘
                                                    │
                                          ┌─────────▼─────────┐
                                          │  Create JWT        │
                                          │  Session           │
                                          └───────────────────┘
```

### Token Balance Checking

```typescript
// lib/wallet/balance.ts
import { ethers } from 'ethers';

export async function checkTokenBalance(
  walletAddress: string,
  tokenContract: string,
  rpcUrl: string
): Promise<{ balance: string; decimals: number }> {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const contract = new ethers.Contract(tokenContract, ERC20_ABI, provider);
  const balance = await contract.balanceOf(walletAddress);
  const decimals = await contract.decimals();
  return {
    balance: ethers.formatUnits(balance, decimals),
    decimals,
  };
}
```

## 7. Security Considerations

1. **API Keys**: Encrypted at rest using AES-256-GCM, decrypted only server-side
2. **Rate Limiting**: Sliding window rate limiter per user/IP
3. **Input Validation**: Zod schemas for all API inputs
4. **CORS**: Strict origin policy on API routes
5. **CSP**: Content Security Policy headers
6. **JWT**: Short-lived access tokens (15min), httpOnly refresh cookies
7. **SQL Injection**: Prisma ORM parameterized queries
8. **XSS**: React auto-escaping + DOMPurify for any raw HTML
9. **Wallet Auth**: EIP-4361 SIWE message verification
10. **File Upload**: Size limits, type checking, virus scanning (future)

## 8. Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/slideforge"

# Auth
JWT_SECRET="your-jwt-secret-min-32-chars"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Encryption
ENCRYPTION_KEY="your-32-byte-encryption-key"

# Blockchain (for wallet auth + token balance)
ETHEREUM_RPC_URL="https://mainnet.infura.io/v3/YOUR_KEY"
POLYGON_RPC_URL="https://polygon-rpc.com"
MIMO_TOKEN_ADDRESS="0x..."  # MIMO token contract (if applicable)

# Default AI Provider (fallback)
DEFAULT_AI_ENDPOINT="http://localhost:11434/v1"
DEFAULT_AI_MODEL="llama3.1:8b"
DEFAULT_AI_PROVIDER="ollama"

# Optional: Pre-configured provider keys
GROQ_API_KEY=""
TOGETHER_API_KEY=""
FIREWORKS_API_KEY=""