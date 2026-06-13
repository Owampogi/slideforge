"use client";

import { create } from "zustand";
import type { Slide, ThemeName, StyleName } from "@/types/slide";
import type { AiProviderSetting } from "@/types/ai-provider";
import { PRECONFIGURED_PROVIDERS } from "@/types/ai-provider";

interface PresentationState {
  // Slides
  slides: Slide[];
  currentSlideIndex: number;
  title: string;
  executiveSummary: string;
  keyTakeaways: string[];

  // Config
  themeName: ThemeName;
  styleName: StyleName;
  slideCount: string;
  audience: string;
  language: string;

  // AI Provider
  providers: AiProviderSetting[];
  activeProviderName: string;

  // UI State
  isGenerating: boolean;
  progress: number;
  progressMessage: string;
  error: string | null;

  // Actions
  setSlides: (slides: Slide[]) => void;
  setTitle: (title: string) => void;
  setExecutiveSummary: (summary: string) => void;
  setKeyTakeaways: (takeaways: string[]) => void;
  setCurrentSlideIndex: (index: number) => void;
  navigateSlide: (direction: number) => void;
  setThemeName: (name: ThemeName) => void;
  setStyleName: (name: StyleName) => void;
  setSlideCount: (count: string) => void;
  setAudience: (audience: string) => void;
  setLanguage: (language: string) => void;
  setProviders: (providers: AiProviderSetting[]) => void;
  setActiveProvider: (name: string) => void;
  addProvider: (provider: AiProviderSetting) => void;
  removeProvider: (name: string) => void;
  setGenerating: (isGenerating: boolean) => void;
  setProgress: (progress: number, message?: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const STORAGE_KEY = "slideforge-settings";

function loadSettings() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  slides: [],
  currentSlideIndex: 0,
  title: "",
  executiveSummary: "",
  keyTakeaways: [],
  themeName: "blue",
  styleName: "modern",
  slideCount: "10",
  audience: "",
  language: "en",
  providers: [...PRECONFIGURED_PROVIDERS],
  activeProviderName: PRECONFIGURED_PROVIDERS[0]?.name || "", // MIMO default
  isGenerating: false,
  progress: 0,
  progressMessage: "",
  error: null,

  setSlides: (slides) => set({ slides, currentSlideIndex: 0, error: null }),
  setTitle: (title) => set({ title }),
  setExecutiveSummary: (executiveSummary) => set({ executiveSummary }),
  setKeyTakeaways: (keyTakeaways) => set({ keyTakeaways }),
  setCurrentSlideIndex: (index) => {
    const { slides } = get();
    set({ currentSlideIndex: Math.max(0, Math.min(slides.length - 1, index)) });
  },
  navigateSlide: (direction) => {
    const { currentSlideIndex, slides } = get();
    const newIndex = Math.max(0, Math.min(slides.length - 1, currentSlideIndex + direction));
    set({ currentSlideIndex: newIndex });
  },
  setThemeName: (name) => { set({ themeName: name }); get().saveToStorage(); },
  setStyleName: (name) => { set({ styleName: name }); get().saveToStorage(); },
  setSlideCount: (slideCount) => set({ slideCount }),
  setAudience: (audience) => set({ audience }),
  setLanguage: (language) => set({ language }),
  setProviders: (providers) => { set({ providers }); get().saveToStorage(); },
  setActiveProvider: (name) => { set({ activeProviderName: name }); get().saveToStorage(); },
  addProvider: (provider) => {
    const { providers } = get();
    set({ providers: [...providers, provider] });
    get().saveToStorage();
  },
  removeProvider: (name) => {
    const { providers } = get();
    set({ providers: providers.filter((p) => p.name !== name) });
    get().saveToStorage();
  },
  setGenerating: (isGenerating) => set({ isGenerating }),
  setProgress: (progress, message) => set({ progress, progressMessage: message || "" }),
  setError: (error) => set({ error }),
  reset: () => set({ slides: [], currentSlideIndex: 0, title: "", executiveSummary: "", keyTakeaways: [], error: null, isGenerating: false, progress: 0 }),

  loadFromStorage: () => {
    const saved = loadSettings();
    if (saved) {
      // Always use the latest provider list from code (so new providers appear)
      // but merge saved API keys into them
      const savedKeyMap = new Map<string, string>();
      if (saved.providers) {
        for (const p of saved.providers) {
          if (p.apiKey) savedKeyMap.set(p.name, p.apiKey);
        }
      }
      const mergedProviders = PRECONFIGURED_PROVIDERS.map(p => ({
        ...p,
        apiKey: savedKeyMap.get(p.name) || p.apiKey,
      }));
      set({
        themeName: saved.themeName || "blue",
        styleName: saved.styleName || "modern",
        providers: mergedProviders,
        activeProviderName: saved.activeProviderName || PRECONFIGURED_PROVIDERS[0]?.name || "",
      });
    }
  },

  saveToStorage: () => {
    if (typeof window === "undefined") return;
    const { themeName, styleName, providers, activeProviderName } = get();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ themeName, styleName, providers, activeProviderName }));
  },
}));