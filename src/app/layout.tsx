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
    "Mapas, spawns y pokedex de Pokemon Blaze Online. Encuentra dónde capturar cualquier pokemon en Sinnoh, Jvaloh, Hoenn y Kanto.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
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
