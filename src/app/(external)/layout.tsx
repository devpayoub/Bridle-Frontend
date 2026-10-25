import type { ReactNode } from "react";

import { Instrument_Sans, JetBrains_Mono } from "next/font/google";

/**
 * Marketing route group.
 *
 * The landing page has its own type scale (Instrument Sans + JetBrains Mono) and
 * its own palette, both scoped to `[data-landing-page]`. Fonts are loaded here
 * rather than in the global registry so the dashboard never pays for them.
 */
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export default function ExternalLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      data-landing-page
      className={`${instrumentSans.variable} ${jetbrainsMono.variable} min-h-svh bg-background text-foreground`}
    >
      {children}
    </div>
  );
}
