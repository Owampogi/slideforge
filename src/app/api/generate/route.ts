import { NextRequest, NextResponse } from "next/server";
import { OpenAICompatProvider } from "@/lib/ai/provider";
import { buildPresentationPrompt } from "@/lib/ai/prompts";
import type { AiProviderSetting } from "@/types/ai-provider";
import type { StyleName } from "@/types/slide";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, text, slideCount, style, audience, provider } = body as {
      title: string;
      text: string;
      slideCount: string;
      style: StyleName;
      audience?: string;
      provider: AiProviderSetting;
    };

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 });
    }

    if (!provider || !provider.endpointUrl) {
      return NextResponse.json({ error: "AI provider configuration is required" }, { status: 400 });
    }

    // Use env var as fallback for API key
    const providerWithKey = {
      ...provider,
      apiKey: provider.apiKey || process.env.MIMO_API_KEY || "",
    };
    const aiProvider = new OpenAICompatProvider(providerWithKey);
    const prompts = buildPresentationPrompt({ title, text, slideCount, style, audience });

    const startTime = Date.now();
    // Try with jsonMode first, fall back without it if unsupported
    let response;
    try {
      response = await aiProvider.complete({
        systemPrompt: prompts.systemPrompt,
        userPrompt: prompts.userPrompt,
        maxTokens: 8192,
        temperature: 0.7,
        jsonMode: true,
      });
    } catch (jsonErr) {
      const errMsg = jsonErr instanceof Error ? jsonErr.message : "";
      if (errMsg.includes("json") || errMsg.includes("format") || errMsg.includes("400")) {
        // Retry without json mode — rely on prompt engineering
        response = await aiProvider.complete({
          systemPrompt: prompts.systemPrompt,
          userPrompt: prompts.userPrompt,
          maxTokens: 8192,
          temperature: 0.7,
          jsonMode: false,
        });
      } else {
        throw jsonErr;
      }
    }
    const generationTime = Date.now() - startTime;

    // Parse the JSON response
    let presentationData;
    try {
      // Try direct parse first
      presentationData = JSON.parse(response.content);
    } catch {
      // Try to extract JSON from markdown code fences
      const jsonMatch = response.content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        presentationData = JSON.parse(jsonMatch[1].trim());
      } else {
        // Try to find JSON object in the response
        const braceMatch = response.content.match(/\{[\s\S]*\}/);
        if (braceMatch) {
          presentationData = JSON.parse(braceMatch[0]);
        } else {
          throw new Error("AI returned invalid JSON format");
        }
      }
    }

    if (!presentationData.slides || !Array.isArray(presentationData.slides)) {
      throw new Error("AI response missing slides array");
    }

    return NextResponse.json({
      ...presentationData,
      generationTime,
      model: response.model,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
    });
  } catch (error) {
    console.error("Generation error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("provider error") ? 502 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}