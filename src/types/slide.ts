export type SlideLayout =
  | "title"
  | "section"
  | "bullets"
  | "two_column"
  | "stats"
  | "key_points"
  | "flow"
  | "quote";

export type SlideType = "title" | "content" | "section" | "ending";

export interface StatItem {
  number: string;
  label: string;
}

export interface KeyPoint {
  title: string;
  description: string;
}

export interface TwoColumnRight {
  visual: string; // emoji or icon identifier
  label?: string;
}

export interface TwoColumnLeft {
  bullets: string[];
}

export interface Slide {
  type: SlideType;
  title: string;
  subtitle?: string;
  layout: SlideLayout;
  // Layout-specific fields
  bullets?: string[];
  left?: TwoColumnLeft;
  right?: TwoColumnRight;
  stats?: StatItem[];
  points?: KeyPoint[];
  steps?: string[];
  quote?: string;
  attribution?: string;
  // Metadata
  speaker_notes?: string;
  transition?: string;
  visual_recommendation?: string;
}

export interface Presentation {
  id?: string;
  title: string;
  sourceText: string;
  slideCount: number;
  themeName: string;
  styleName: string;
  audience?: string;
  slides: Slide[];
  executiveSummary?: string;
  keyTakeaways?: string[];
  status: "draft" | "generating" | "complete" | "failed";
  errorMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ThemeName = "blue" | "green" | "warm" | "sunset" | "dark" | "ocean";
export type StyleName = "modern" | "minimal" | "bold" | "corporate" | "creative";