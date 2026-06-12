import type { Metadata } from "next";
import { Shirt } from "lucide-react";
import cosmetics from "@/data/cosmetics.json";
import T from "@/components/layout/T";
import type { CosmeticBundle } from "@/lib/types";

export const metadata: Metadata = {
  title: "Cosmetics",
  description: "Cosmetic costume bundles available in Pokemon Blaze Online.",
};

export default function CosmeticsPage() {
  const bundles = cosmetics as CosmeticBundle[];

  return (
    <div className="space-y-6">
      <h1 className="text-center text-3xl font-extrabold tracking-tight">
        <T k="cosmetics.title" />
      </h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {bundles.map((b) => (
          <div key={b.slug} className="rounded-xl border border-line bg-surface p-4">
            <p className="flex items-center gap-2 font-semibold">
              <Shirt className="h-4 w-4 text-accent-soft" aria-hidden />
              {b.name.replace(/ Bundle| Costume/g, "")}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-ink-dim">
              <T k="cosmetics.includes" />
            </p>
            <ul className="mt-1 space-y-0.5 text-sm text-ink-dim">
              {b.items.map((item, i) => (
                <li key={`${item}-${i}`}>• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
