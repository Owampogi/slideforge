import type { ThemeName, StyleName } from "@/types/slide";

export interface ThemeColors {
  name: ThemeName;
  primary: string;
  secondary: string;
  accent: string;
  gradient: [string, string];
  bg: string;
  bgLight: string;
  text: string;
  textMuted: string;
  surface: string;
  border: string;
  slideBg: string;
  slideBgAlt: string;
}

export const THEMES: Record<ThemeName, ThemeColors> = {
  blue: {
    name: "blue", primary: "#2563eb", secondary: "#7c3aed", accent: "#3b82f6",
    gradient: ["#2563eb", "#7c3aed"], bg: "#0f172a", bgLight: "#1e293b",
    text: "#f8fafc", textMuted: "#94a3b8", surface: "rgba(37,99,235,0.08)",
    border: "rgba(37,99,235,0.2)", slideBg: "#0f172a", slideBgAlt: "#1e1b4b",
  },
  green: {
    name: "green", primary: "#059669", secondary: "#0d9488", accent: "#10b981",
    gradient: ["#059669", "#0d9488"], bg: "#0f1f1a", bgLight: "#1a2f28",
    text: "#f0fdf4", textMuted: "#86efac", surface: "rgba(5,150,105,0.08)",
    border: "rgba(5,150,105,0.2)", slideBg: "#0f1f1a", slideBgAlt: "#052e16",
  },
  warm: {
    name: "warm", primary: "#dc2626", secondary: "#ea580c", accent: "#ef4444",
    gradient: ["#dc2626", "#ea580c"], bg: "#1c1010", bgLight: "#2d1a1a",
    text: "#fef2f2", textMuted: "#fca5a5", surface: "rgba(220,38,38,0.08)",
    border: "rgba(220,38,38,0.2)", slideBg: "#1c1010", slideBgAlt: "#450a0a",
  },
  sunset: {
    name: "sunset", primary: "#db2777", secondary: "#f59e0b", accent: "#ec4899",
    gradient: ["#db2777", "#f59e0b"], bg: "#1a0f17", bgLight: "#2d1a28",
    text: "#fdf2f8", textMuted: "#f9a8d4", surface: "rgba(219,39,119,0.08)",
    border: "rgba(219,39,119,0.2)", slideBg: "#1a0f17", slideBgAlt: "#4a044e",
  },
  dark: {
    name: "dark", primary: "#64748b", secondary: "#475569", accent: "#94a3b8",
    gradient: ["#334155", "#475569"], bg: "#0f0f11", bgLight: "#1e1e24",
    text: "#f1f5f9", textMuted: "#94a3b8", surface: "rgba(100,116,139,0.08)",
    border: "rgba(100,116,139,0.2)", slideBg: "#0f0f11", slideBgAlt: "#1e1e24",
  },
  ocean: {
    name: "ocean", primary: "#0369a1", secondary: "#06b6d4", accent: "#0ea5e9",
    gradient: ["#0369a1", "#06b6d4"], bg: "#0c1929", bgLight: "#162d4a",
    text: "#f0f9ff", textMuted: "#7dd3fc", surface: "rgba(3,105,161,0.08)",
    border: "rgba(3,105,161,0.2)", slideBg: "#0c1929", slideBgAlt: "#0c4a6e",
  },
};

export interface VisualStyle {
  borderRadius: string;
  padding: string;
  titleSize: string;
  headingSize: string;
  bodySize: string;
  useGradientBg: boolean;
  useDecorations: boolean;
}

export const VISUAL_STYLES: Record<StyleName, VisualStyle> = {
  modern: {
    borderRadius: "12px", padding: "48px 56px", titleSize: "36px",
    headingSize: "28px", bodySize: "16px", useGradientBg: true, useDecorations: true,
  },
  minimal: {
    borderRadius: "4px", padding: "56px 64px", titleSize: "32px",
    headingSize: "24px", bodySize: "15px", useGradientBg: false, useDecorations: false,
  },
  bold: {
    borderRadius: "16px", padding: "44px 52px", titleSize: "40px",
    headingSize: "32px", bodySize: "17px", useGradientBg: true, useDecorations: true,
  },
  corporate: {
    borderRadius: "8px", padding: "48px 56px", titleSize: "34px",
    headingSize: "26px", bodySize: "15px", useGradientBg: false, useDecorations: false,
  },
  creative: {
    borderRadius: "20px", padding: "44px 50px", titleSize: "38px",
    headingSize: "30px", bodySize: "16px", useGradientBg: true, useDecorations: true,
  },
};

export function gradientCSS(theme: ThemeColors): string {
  return `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`;
}

export function slideBackground(theme: ThemeColors, styleName: StyleName, variant: number): string {
  const style = VISUAL_STYLES[styleName];
  if (!style.useGradientBg) return variant % 2 === 0 ? theme.slideBg : theme.slideBgAlt;
  if (variant === 0) return `linear-gradient(135deg, ${theme.bg} 0%, ${theme.bgLight} 100%)`;
  return variant % 2 === 0 ? theme.slideBg : theme.slideBgAlt;
}