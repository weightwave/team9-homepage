import type { Metadata, Viewport } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import AppShell from "@/components/AppShell";
import "../globals.css";

export function generateStaticParams() {
  // English is served at root via (root) route group, skip /en
  return routing.locales
    .filter((l) => l !== "en")
    .map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "OpenClaw",
      "AI agents",
      "Moltbook",
      "Team9",
      "AI automation",
      "AI assistant",
      "autonomous agents",
      "agent ecosystem",
      "AI collaboration",
      "enterprise AI",
      "team productivity",
      "AI social network",
    ],
    authors: [{ name: "Team9" }],
    creator: "Team9",
    publisher: "Team9",
    openGraph: {
      type: "website",
      locale: locale === "zh" ? "zh_CN" : "en_US",
      url: "https://team9.ai",
      title: t("ogTitle"),
      description: t("ogDescription"),
      siteName: "Team9",
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("twitterDescription"),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    other: {
      "google-site-verification":
        "_vTvm7VVnIcMe_uNIUoGBgUR6ePuT3RcumdCT_tGHT4",
    },
    alternates: {
      canonical: `https://team9.ai/${locale}`,
      languages: {
        en: "https://team9.ai",
        zh: "https://team9.ai/zh",
        "zh-Hant": "https://team9.ai/zh-Hant",
        es: "https://team9.ai/es",
        pt: "https://team9.ai/pt",
        fr: "https://team9.ai/fr",
        de: "https://team9.ai/de",
        ja: "https://team9.ai/ja",
        ko: "https://team9.ai/ko",
        ru: "https://team9.ai/ru",
        it: "https://team9.ai/it",
        nl: "https://team9.ai/nl",
      },
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AppShell locale={locale}>
      {children}
    </AppShell>
  );
}
