"use client";

// Slim site-wide notice inviting users to report wrong data or suggestions.

import Link from "next/link";
import { Gamepad2, MessageCircle } from "lucide-react";
import { useT } from "@/i18n/LanguageProvider";
import { CONTACT } from "@/lib/contact";

export default function FeedbackBanner() {
  const t = useT();

  return (
    <div className="border-t border-line bg-surface/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-4 py-2.5 text-xs text-ink-dim">
        <span>{t("banner.text")}</span>
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="h-3.5 w-3.5 text-accent-soft" aria-hidden />
          Discord <code className="rounded bg-surface-2 px-1.5 py-0.5 text-ink">{CONTACT.discord}</code>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Gamepad2 className="h-3.5 w-3.5 text-accent-soft" aria-hidden />
          {t("banner.ingame")} <code className="rounded bg-surface-2 px-1.5 py-0.5 text-ink">{CONTACT.ingame}</code>
        </span>
        <Link href="/feedback" className="font-medium text-accent-soft hover:underline">
          {t("banner.link")}
        </Link>
      </div>
    </div>
  );
}
