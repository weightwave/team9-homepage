import type { ReactNode } from "react";

// This root layout is required by Next.js but the actual layout
// with metadata and styling is in app/[locale]/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
