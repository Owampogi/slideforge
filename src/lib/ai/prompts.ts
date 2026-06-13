import type { StyleName } from "@/types/slide";

export function buildPresentationPrompt(options: {
  title: string;
  text: string;
  slideCount: string;
  style: StyleName;
  audience?: string;
}): { systemPrompt: string; userPrompt: string } {
  const { title, text, slideCount, style, audience } = options;

  const slideCountInstruction =
    slideCount === "auto"
      ? "Determine the optimal number of slides based on content length and complexity (typically 6-15 slides)."
      : `Create exactly ${slideCount} slides.`;

  const audienceInstruction = audience
    ? `The target audience is: ${audience}. Tailor the language and depth accordingly.`
    : "Use a general audience level.";

  const systemPrompt = `You are an expert presentation designer and public speaking coach. You convert text into professional, visually structured presentations with presenter scripts.

Your response MUST be valid JSON only — no markdown, no code fences, no explanation text outside the JSON.

You MUST use a variety of slide layouts to keep the presentation visually engaging. Do not use the same layout type for more than 2 consecutive slides.`;

  const userPrompt = `Convert the following text into a structured presentation.

TITLE: ${title || "Untitled Presentation"}

CONTENT:
${text.slice(0, 15000)}

INSTRUCTIONS:
${slideCountInstruction}
${audienceInstruction}
Visual style: ${style}

Return a JSON object with this EXACT structure:
{
  "title": "Presentation title",
  "executiveSummary": "2-3 sentence summary of the entire presentation",
  "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3"],
  "slides": [
    {
      "type": "title",
      "title": "Main Title",
      "subtitle": "Subtitle or tagline",
      "layout": "title"
    },
    {
      "type": "content",
      "title": "Slide Title",
      "layout": "bullets",
      "bullets": ["Concise point 1", "Concise point 2", "Concise point 3"],
      "speaker_notes": "Natural presenter script for this slide. 2-4 conversational sentences. Include transitions.",
      "transition": "Brief transition phrase to next slide"
    },
    {
      "type": "content",
      "title": "Slide Title",
      "layout": "two_column",
      "left": { "bullets": ["Point 1", "Point 2"] },
      "right": { "visual": "🤖", "label": "Visual description" },
      "speaker_notes": "Presenter script",
      "transition": "Transition phrase"
    },
    {
      "type": "content",
      "title": "Slide Title",
      "layout": "stats",
      "stats": [
        { "number": "75%", "label": "Statistic description" },
        { "number": "2.5M", "label": "Another stat" },
        { "number": "50+", "label": "Third stat" }
      ],
      "speaker_notes": "Presenter script",
      "transition": "Transition phrase"
    },
    {
      "type": "content",
      "title": "Key Points",
      "layout": "key_points",
      "points": [
        { "title": "Point Title", "description": "Brief explanation" },
        { "title": "Point Title", "description": "Brief explanation" },
        { "title": "Point Title", "description": "Brief explanation" },
        { "title": "Point Title", "description": "Brief explanation" }
      ],
      "speaker_notes": "Presenter script",
      "transition": "Transition phrase"
    },
    {
      "type": "content",
      "title": "Process Overview",
      "layout": "flow",
      "steps": ["Step 1", "Step 2", "Step 3", "Step 4"],
      "speaker_notes": "Presenter script",
      "transition": "Transition phrase"
    },
    {
      "type": "content",
      "title": "Key Insight",
      "layout": "quote",
      "quote": "The most impactful statement from the content",
      "attribution": "Source or context",
      "speaker_notes": "Presenter script",
      "transition": "Transition phrase"
    },
    {
      "type": "section",
      "title": "Section Divider Title",
      "subtitle": "Brief description",
      "layout": "section"
    },
    {
      "type": "ending",
      "title": "Thank You",
      "subtitle": "Questions & Discussion",
      "layout": "title"
    }
  ]
}

RULES:
1. First slide MUST be type "title" with layout "title"
2. Last slide MUST be type "ending" with layout "title"
3. VARY layouts throughout — use ALL applicable layout types
4. Every content slide MUST have "speaker_notes" (2-4 natural sentences)
5. Every content slide SHOULD have a "transition" phrase
6. Keep bullet points concise (under 15 words each)
7. For "two_column" right.visual, use a single relevant emoji: 🤖📊🚀💡⚡🎯📈🔧🔬🌍🎓💻📱🎨🔑
8. For "stats" layout, create compelling numbers that support the content
9. For "flow" layout, show 3-5 clear process steps
10. For "quote" layout, pick the most impactful statement
11. Use "section" slides sparingly (0-2) for major topic transitions
12. speaker_notes should be conversational, include context and transitions
13. Return ONLY the JSON object`;

  return { systemPrompt, userPrompt };
}