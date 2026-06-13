import { NextRequest, NextResponse } from "next/server";
import { OpenAICompatProvider } from "@/lib/ai/provider";
import { buildPresentationPrompt } from "@/lib/ai/prompts";
import type { AiProviderSetting } from "@/types/ai-provider";
import type { StyleName } from "@/types/slide";

/**
 * Attempt to repair truncated or corrupted JSON from AI responses.
 * Common cases: response cut off mid-string, missing closing braces/brackets.
 */
function parseRepairJson(raw: string): Record<string, unknown> {
  // Step 1: Remove any trailing incomplete content after the last valid JSON structure
  let cleaned = raw.trim();

  // Step 2: Close any unclosed strings (add closing quote)
  let inString = false;
  let escapeNext = false;
  let lastStringStart = -1;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escapeNext) { escapeNext = false; continue; }
    if (ch === '\\') { escapeNext = true; continue; }
    if (ch === '"') {
      if (inString) {
        inString = false;
      } else {
        inString = true;
        lastStringStart = i;
      }
    }
  }

  // If we're in an unclosed string, truncate from last complete string end
  if (inString && lastStringStart >= 0) {
    // Find the last complete string value (look for last unescaped quote followed by , or })
    let lastCompletePos = cleaned.lastIndexOf('",');
    if (lastCompletePos < 0) lastCompletePos = cleaned.lastIndexOf('"}');
    if (lastCompletePos < 0) lastCompletePos = cleaned.lastIndexOf('"]');
    if (lastCompletePos >= 0) {
      cleaned = cleaned.substring(0, lastCompletePos + 1);
    }
  }

  // Step 3: Count and balance brackets/braces
  let openBraces = 0;
  let openBrackets = 0;
  inString = false;
  escapeNext = false;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escapeNext) { escapeNext = false; continue; }
    if (ch === '\\') { escapeNext = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') openBraces++;
    if (ch === '}') openBraces--;
    if (ch === '[') openBrackets++;
    if (ch === ']') openBrackets--;
  }

  // Remove trailing comma if present
  cleaned = cleaned.replace(/,\s*$/, '');

  // Close missing brackets and braces
  for (let i = 0; i < openBrackets; i++) cleaned += ']';
  for (let i = 0; i < openBraces; i++) cleaned += '}';

  return JSON.parse(cleaned);
}

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

    // Use env var as fallback for API key (provider-specific)
    const envKeyMap: Record<string, string> = {
      "Google Gemini (Free)": process.env.GEMINI_API_KEY || "",
      "Groq (Free Tier)": process.env.GROQ_API_KEY || "",
      "MIMO (Xiaomi Token Plan)": process.env.MIMO_API_KEY || "",
      "MIMO v2.5 Standard": process.env.MIMO_API_KEY || "",
      "MIMO v2 Pro": process.env.MIMO_API_KEY || "",
    };
    const fallbackKey = envKeyMap[provider.name] || "";
    const providerWithKey = {
      ...provider,
      apiKey: provider.apiKey || fallbackKey,
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
        maxTokens: 16384,
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
          maxTokens: 16384,
          temperature: 0.7,
          jsonMode: false,
        });
      } else {
        throw jsonErr;
      }
    }
    const generationTime = Date.now() - startTime;

    // Parse the JSON response with repair logic
    let presentationData;
    try {
      // Try direct parse first
      presentationData = JSON.parse(response.content);
    } catch {
      try {
        // Try to extract JSON from markdown code fences
        const jsonMatch = response.content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          presentationData = JSON.parse(jsonMatch[1].trim());
        } else {
          // Try to find JSON object in the response
          const braceMatch = response.content.match(/\{[\s\S]*\}/);
          if (braceMatch) {
            try {
              presentationData = JSON.parse(braceMatch[0]);
            } catch {
              // Try to repair truncated/corrupted JSON
              presentationData = parseRepairJson(braceMatch[0]);
            }
          } else {
            throw new Error("AI returned invalid JSON format");
          }
        }
      } catch (parseErr) {
        if (parseErr instanceof Error && parseErr.message.includes("AI returned")) throw parseErr;
        throw new Error("AI returned malformed JSON. Try reducing the number of slides or shortening your text.");
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