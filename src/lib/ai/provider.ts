import type {
  AiProvider,
  AiProviderSetting,
  CompletionRequest,
  CompletionResponse,
  CostEstimate,
} from "@/types/ai-provider";

/**
 * OpenAI-compatible provider implementation.
 * Works with any endpoint implementing the OpenAI Chat Completions API:
 * Groq, Together.ai, Fireworks.ai, OpenRouter, Ollama, Gemini, etc.
 */
export class OpenAICompatProvider implements AiProvider {
  name: string;
  type = "openai-compat" as const;
  private setting: AiProviderSetting;

  constructor(setting: AiProviderSetting) {
    this.name = setting.name;
    this.setting = setting;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const modelsUrl = `${this.setting.endpointUrl}/models`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...this.setting.headers,
      };
      if (this.setting.apiKey) {
        headers["Authorization"] = `Bearer ${this.setting.apiKey}`;
      }
      const res = await fetch(modelsUrl, {
        headers,
        signal: AbortSignal.timeout(5000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const url = `${this.setting.endpointUrl}/chat/completions`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.setting.headers,
    };
    if (this.setting.apiKey) {
      headers["Authorization"] = `Bearer ${this.setting.apiKey}`;
    }

    const body: Record<string, unknown> = {
      model: this.setting.modelId,
      messages: [
        { role: "system", content: request.systemPrompt },
        { role: "user", content: request.userPrompt },
      ],
      max_tokens: request.maxTokens || 4096,
      temperature: request.temperature ?? 0.7,
    };

    if (request.jsonMode) {
      body.response_format = { type: "json_object" };
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120_000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `AI provider error (${response.status}): ${errorText || response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from AI provider");
    }

    return {
      content,
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0,
      model: data.model || this.setting.modelId,
      cached: false,
    };
  }

  async estimateCost(request: CompletionRequest): Promise<CostEstimate> {
    const inputTokens = Math.ceil(
      (request.systemPrompt.length + request.userPrompt.length) / 4
    );
    const estimatedOutputTokens = request.maxTokens || 2048;
    return {
      inputTokens,
      estimatedOutputTokens,
      estimatedCost: 0,
      costCurrency: "free",
      costDisplay: "Free tier",
    };
  }
}

/**
 * Provider Router — manages multiple providers with automatic fallback
 */
export class ProviderRouter {
  private providers: Map<string, AiProvider> = new Map();
  private activeProviderName: string | null = null;

  registerProvider(setting: AiProviderSetting): AiProvider {
    const provider = new OpenAICompatProvider(setting);
    this.providers.set(setting.name, provider);
    if (setting.isActive && !this.activeProviderName) {
      this.activeProviderName = setting.name;
    }
    return provider;
  }

  getProvider(name: string): AiProvider | undefined {
    return this.providers.get(name);
  }

  getActiveProvider(): AiProvider | null {
    if (this.activeProviderName) {
      return this.providers.get(this.activeProviderName) || null;
    }
    const first = this.providers.values().next().value;
    return first || null;
  }

  setActiveProvider(name: string): void {
    if (this.providers.has(name)) {
      this.activeProviderName = name;
    }
  }

  listProviders(): AiProvider[] {
    return Array.from(this.providers.values());
  }

  async generateWithFallback(
    request: CompletionRequest,
    primaryName?: string
  ): Promise<CompletionResponse> {
    const primary = primaryName
      ? this.providers.get(primaryName)
      : this.getActiveProvider();

    if (!primary) {
      throw new Error(
        "No AI provider configured. Please add a provider in Settings."
      );
    }

    try {
      return await primary.complete(request);
    } catch (primaryError) {
      console.warn(`Primary provider ${primary.name} failed:`, primaryError);
      for (const [name, provider] of this.providers) {
        if (provider === primary) continue;
        try {
          console.log(`Trying fallback provider: ${name}`);
          return await provider.complete(request);
        } catch {
          continue;
        }
      }
      throw primaryError;
    }
  }
}