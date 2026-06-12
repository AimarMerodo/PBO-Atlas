import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import Header from "@/components/layout/Header";
import T from "@/components/layout/T";

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
          <footer className="border-t border-line py-6">
            <p className="mx-auto max-w-6xl px-4 text-xs text-ink-dim">
              <T k="footer.disclaimer" />
            </p>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
