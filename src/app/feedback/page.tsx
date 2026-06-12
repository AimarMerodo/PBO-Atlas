import type { Metadata } from "next";
import { Gamepad2, Info, MessageCircle } from "lucide-react";
import { CONTACT, GAME_URL } from "@/lib/contact";
import CopyButton from "@/components/layout/CopyButton";
import T from "@/components/layout/T";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Reporta datos erróneos o envía sugerencias para PBO Atlas.",
};

export default function FeedbackPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          <T k="feedback.title" />
        </h1>
        <p className="mt-3 text-ink-dim">
          <T k="feedback.subtitle" />
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-6 text-center">
          <MessageCircle className="h-10 w-10 text-accent-soft" aria-hidden />
          <h2 className="text-lg font-bold">
            <T k="feedback.discordTitle" />
          </h2>
          <p className="text-sm text-ink-dim">
            <T k="feedback.discordHint" />
          </p>
          <code className="rounded-lg bg-surface-2 px-4 py-2 text-lg font-semibold">{CONTACT.discord}</code>
          <CopyButton value={CONTACT.discord} />
        </div>

        <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-6 text-center">
          <Gamepad2 className="h-10 w-10 text-accent-soft" aria-hidden />
          <h2 className="text-lg font-bold">
            <T k="feedback.ingameTitle" />
          </h2>
          <p className="text-sm text-ink-dim">
            <T k="feedback.ingameHint" />
          </p>
          <code className="rounded-lg bg-surface-2 px-4 py-2 text-lg font-semibold">{CONTACT.ingame}</code>
          <CopyButton value={CONTACT.ingame} />
          <a
            href={GAME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent-soft hover:underline"
          >
            pokemonblazeonline.com
          </a>
        </div>
      </div>

      <div className="flex gap-3 rounded-xl border border-line bg-surface p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent-soft" aria-hidden />
        <div className="text-sm">
          <p className="font-semibold">
            <T k="feedback.reportTitle" />
          </p>
          <p className="mt-1 text-ink-dim">
            <T k="feedback.reportBody" />
          </p>
        </div>
      </div>
    </div>
  );
}
