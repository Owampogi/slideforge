import { NextRequest, NextResponse } from "next/server";
import { OpenAICompatProvider } from "@/lib/ai/provider";
import { buildPresentationPrompt } from "@/lib/ai/prompts";
import type { AiProviderSetting } from "@/types/ai-provider";
import type { StyleName } from "@/types/slide";

/**
 * Attempt to repair truncated or corrupted JSON from AI responses.
 * Handles: truncated strings, missing closing braces/brackets,
 * literal newlines inside strings, unescaped control chars.
 */
function parseRepairJson(raw: string): Record<string, unknown> {
  let cleaned = raw.trim();

  // Step 1: Escape literal newlines and tabs INSIDE string values
  // Replace literal newlines within strings with \\n
  cleaned = cleaned.replace(/("(?:[^"\\]|\\.)*")/g, (match) => {
    return match.replace(/\n/g, '\\n').replace(/\r/g, '').replace(/\t/g, '\\t');
  });

  // Step 2: Remove any trailing incomplete content after the last valid JSON structure
  // Step 3: Close any unclosed strings (add closing quote)
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
    let lastCompletePos = cleaned.lastIndexOf('",');
    if (lastCompletePos < 0) lastCompletePos = cleaned.lastIndexOf('"}');
    if (lastCompletePos < 0) lastCompletePos = cleaned.lastIndexOf('"]');
    if (lastCompletePos >= 0) {
      cleaned = cleaned.substring(0, lastCompletePos + 1);
    }
  }

  // Step 4: Count and balance brackets/braces
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

/**
 * Extract and parse JSON from AI response with multiple fallback strategies.
 */
function extractJsonFromResponse(content: string): Record<string, unknown> {
  // Strategy 1: Direct parse
  try {
    return JSON.parse(content);
  } catch { /* continue */ }

  // Strategy 2: Extract from markdown code fences
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1].trim());
    } catch { /* continue */ }
  }

  // Strategy 3: Find JSON object in the response
  const braceMatch = content.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch { /* continue */ }

    // Strategy 4: Repair the JSON
    try {
      return parseRepairJson(braceMatch[0]);
    } catch { /* continue */ }

    // Strategy 5: Try removing trailing incomplete slide objects
    try {
      // Find the last complete slide object by looking for the last "},
      let partial = braceMatch[0];
      const lastCompleteSlide = partial.lastIndexOf('},');
      if (lastCompleteSlide > 0) {
        partial = partial.substring(0, lastCompleteSlide + 1) + ']}';
        return JSON.parse(partial);
      }
    } catch { /* continue */ }
  }

  throw new Error("AI returned invalid JSON format");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, text, slideCount, style, audience, language, provider } = body as {
      title: string;
      text: string;
      slideCount: string;
      style: StyleName;
      audience?: string;
      language?: string;
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
    const prompts = buildPresentationPrompt({ title, text, slideCount, style, audience, language });

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

    // Parse the JSON response with multiple repair strategies
    let presentationData;
    try {
      presentationData = extractJsonFromResponse(response.content);
    } catch (parseErr) {
      // If all parsing fails, retry once with lower temperature and explicit JSON-only instruction
      console.warn("First parse failed, retrying with lower temperature...");
      try {
        const retryResponse = await aiProvider.complete({
          systemPrompt: prompts.systemPrompt + "\n\nCRITICAL: Your entire response must be a single valid JSON object. No text before or after. No markdown fences. No explanation. Just the raw JSON.",
          userPrompt: prompts.userPrompt,
          maxTokens: 16384,
          temperature: 0.3,
          jsonMode: false,
        });
        presentationData = extractJsonFromResponse(retryResponse.content);
      } catch {
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