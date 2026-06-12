import type { Metadata } from "next";
import natures from "@/data/natures.json";
import NaturesTable from "@/components/game/NaturesTable";
import T from "@/components/layout/T";
import type { Nature } from "@/lib/types";

export const metadata: Metadata = {
  title: "Natures",
  description: "All 25 natures in Pokemon Blaze Online and which stats they raise or lower.",
};

export default function NaturesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          <T k="natures.title" />
        </h1>
        <p className="mt-2 text-sm text-ink-dim">
          <T k="natures.subtitle" />
        </p>
      </div>
      <NaturesTable natures={natures as Nature[]} />
    </div>
  );
}
