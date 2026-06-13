export type ProviderType = "openai-compat" | "ollama" | "custom";

export interface AiProviderSetting {
  id?: string;
  providerType: ProviderType;
  name: string;
  endpointUrl: string;
  apiKey?: string;
  modelId: string;
  isActive: boolean;
  headers?: Record<string, string>;
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
  estimatedCost: number;
  costCurrency: string;
  costDisplay: string;
}

export interface AiProvider {
  name: string;
  type: ProviderType;
  isAvailable(): Promise<boolean>;
  complete(request: CompletionRequest): Promise<CompletionResponse>;
  estimateCost(request: CompletionRequest): Promise<CostEstimate>;
}

export const PRECONFIGURED_PROVIDERS: AiProviderSetting[] = [
  {
    providerType: "openai-compat",
    name: "MIMO (Xiaomi Token Plan)",
    endpointUrl: "https://token-plan-sgp.xiaomimimo.com/v1",
    modelId: "mimo-v2.5-pro",
    isActive: true,
  },
  {
    providerType: "openai-compat",
    name: "MIMO v2.5 Standard",
    endpointUrl: "https://token-plan-sgp.xiaomimimo.com/v1",
    modelId: "mimo-v2.5",
    isActive: true,
  },
  {
    providerType: "openai-compat",
    name: "MIMO v2 Pro",
    endpointUrl: "https://token-plan-sgp.xiaomimimo.com/v1",
    modelId: "mimo-v2-pro",
    isActive: true,
  },
  {
    providerType: "ollama",
    name: "Ollama (Local)",
    endpointUrl: "http://localhost:11434/v1",
    modelId: "llama3.1:8b",
    isActive: true,
  },
  {
    providerType: "openai-compat",
    name: "Groq (Free Tier)",
    endpointUrl: "https://api.groq.com/openai/v1",
    modelId: "llama-3.3-70b-versatile",
    isActive: true,
  },
  {
    providerType: "openai-compat",
    name: "Together.ai (Free Tier)",
    endpointUrl: "https://api.together.xyz/v1",
    modelId: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    isActive: true,
  },
  {
    providerType: "openai-compat",
    name: "Fireworks.ai (Free Tier)",
    endpointUrl: "https://api.fireworks.ai/inference/v1",
    modelId: "accounts/fireworks/models/llama-v3p3-70b-instruct",
    isActive: true,
  },
  {
    providerType: "openai-compat",
    name: "OpenRouter",
    endpointUrl: "https://openrouter.ai/api/v1",
    modelId: "meta-llama/llama-3.3-70b-instruct:free",
    isActive: true,
  },
  {
    providerType: "openai-compat",
    name: "Google Gemini",
    endpointUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    modelId: "gemini-2.0-flash",
    isActive: true,
  },
];