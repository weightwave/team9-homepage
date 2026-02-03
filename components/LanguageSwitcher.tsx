"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { routing } from "@/i18n/routing";

const localeLabels: Record<string, string> = {
  en: "English",
  zh: "简体中文",
  "zh-Hant": "繁體中文",
  es: "Español",
  pt: "Português",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  ko: "한국어",
  ru: "Русский",
  it: "Italiano",
  nl: "Nederlands",
};

const localeShortLabels: Record<string, string> = {
  en: "EN",
  zh: "中文",
  "zh-Hant": "繁體",
  es: "ES",
  pt: "PT",
  fr: "FR",
  de: "DE",
  ja: "日本",
  ko: "한국",
  ru: "RU",
  it: "IT",
  nl: "NL",
};

// Prompt messages in each language so the suggestion appears in the user's preferred language
const switchPrompts: Record<string, { message: string; switchText: string }> = {
  en: { message: "This page is available in English", switchText: "Switch" },
  zh: { message: "此页面支持简体中文", switchText: "切换" },
  "zh-Hant": { message: "此頁面支援繁體中文", switchText: "切換" },
  es: { message: "Esta página está disponible en español", switchText: "Cambiar" },
  pt: { message: "Esta página está disponível em português", switchText: "Mudar" },
  fr: { message: "Cette page est disponible en français", switchText: "Changer" },
  de: { message: "Diese Seite ist auf Deutsch verfügbar", switchText: "Wechseln" },
  ja: { message: "このページは日本語で利用可能です", switchText: "切替" },
  ko: { message: "이 페이지는 한국어로 제공됩니다", switchText: "전환" },
  ru: { message: "Эта страница доступна на русском", switchText: "Переключить" },
  it: { message: "Questa pagina è disponibile in italiano", switchText: "Cambia" },
  nl: { message: "Deze pagina is beschikbaar in het Nederlands", switchText: "Wijzig" },
};

const STORAGE_KEY = "lang-prompt-dismissed";

function matchBrowserLocale(browserLang: string): string | null {
  const lang = browserLang.toLowerCase();

  const exact = routing.locales.find((l) => l.toLowerCase() === lang);
  if (exact) return exact;

  if (lang.startsWith("zh")) {
    if (lang.includes("tw") || lang.includes("hk") || lang.includes("hant")) {
      return "zh-Hant";
    }
    return "zh";
  }

  if (lang.startsWith("pt")) return "pt";

  const base = lang.split("-")[0];
  return routing.locales.find((l) => l.toLowerCase() === base) ?? null;
}

function detectPreferredLocale(): string | null {
  if (typeof navigator === "undefined") return null;
  const langs = navigator.languages ?? [navigator.language];
  for (const lang of langs) {
    const matched = matchBrowserLocale(lang);
    if (matched) return matched;
  }
  return null;
}

function getPreferredSnapshot(): string | null {
  try {
    if (localStorage.getItem(STORAGE_KEY)) return null;
    return detectPreferredLocale();
  } catch {
    return null;
  }
}

function getPreferredServerSnapshot(): null {
  return null;
}

const noopSubscribe = () => () => {};

// Display order: zh and zh-Hant moved to the bottom
const displayLocales: string[] = [
  "en",
  "es",
  "pt",
  "fr",
  "de",
  "ja",
  "ko",
  "ru",
  "it",
  "nl",
  "zh",
  "zh-Hant",
];

export default function LanguageSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const preferredLocale = useSyncExternalStore(
    noopSubscribe,
    getPreferredSnapshot,
    getPreferredServerSnapshot,
  );
  const suggestedLocale =
    !dismissed && preferredLocale && preferredLocale !== locale
      ? preferredLocale
      : null;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function getLocalizedPath(targetLocale: string) {
    const segments = pathname.split("/").filter(Boolean);
    // Check if the first segment is a known locale
    const hasLocalePrefix =
      segments.length > 0 &&
      routing.locales.some((l) => l === segments[0]);
    const pagePath = hasLocalePrefix ? segments.slice(1) : segments;

    if (targetLocale === "en") {
      // English is served at root, no prefix
      return "/" + pagePath.join("/");
    }
    return "/" + targetLocale + (pagePath.length ? "/" + pagePath.join("/") : "");
  }

  function dismissPrompt() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setDismissed(true);
  }

  const prompt = suggestedLocale ? switchPrompts[suggestedLocale] : null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 hover:text-white hover:bg-white/15 transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
        {localeShortLabels[locale] || locale.toUpperCase()}
        <svg className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Language switch suggestion prompt */}
      {suggestedLocale && prompt && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[#1a1a2e]/95 backdrop-blur-md border border-amber-500/30 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/90 leading-snug">{prompt.message}</p>
              <div className="flex items-center gap-2 mt-2">
                <a
                  href={getLocalizedPath(suggestedLocale)}
                  onClick={dismissPrompt}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition-colors"
                >
                  {prompt.switchText}
                </a>
                <button
                  onClick={dismissPrompt}
                  className="px-2 py-1 text-xs text-white/50 hover:text-white/80 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-[#1a1a2e]/95 backdrop-blur-md border border-white/15 rounded-xl shadow-2xl py-1.5 z-50 max-h-80 overflow-y-auto">
          {displayLocales.map((l) => (
            <a
              key={l}
              href={getLocalizedPath(l)}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2 text-sm transition-colors duration-150 ${
                locale === l
                  ? "text-amber-400 bg-amber-500/10 font-semibold"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {localeLabels[l] || l}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
