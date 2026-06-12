import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import Header from "@/components/layout/Header";
import FeedbackBanner from "@/components/layout/FeedbackBanner";
import SiteFooter from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: {
    default: "PBO Atlas — Pokemon Blaze Online maps, spawns & pokedex",
    template: "%s | PBO Atlas",
  },
  description:
    "Pokemon Blaze Online maps, spawns and pokedex. Find where to catch any pokemon in Sinnoh, Jvaloh, Hoenn and Kanto.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        <LanguageProvider>
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
          <FeedbackBanner />
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
