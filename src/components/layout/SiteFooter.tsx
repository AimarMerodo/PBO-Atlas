"use client";

import { useT } from "@/i18n/LanguageProvider";
import { GAME_NAME, GAME_URL } from "@/lib/contact";

export default function SiteFooter() {
  const t = useT();

  return (
    <footer className="border-t border-line py-6">
      <p className="mx-auto max-w-6xl px-4 text-xs text-ink-dim">
        {t("footer.pre")}{" "}
        <a
          href={GAME_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-accent-soft hover:underline"
        >
          {GAME_NAME}
        </a>{" "}
        {t("footer.post")}
      </p>
    </footer>
  );
}
