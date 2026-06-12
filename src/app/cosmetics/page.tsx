import type { Metadata } from "next";
import cosmetics from "@/data/cosmetics.json";
import CosmeticsExplorer from "@/components/game/CosmeticsExplorer";
import T from "@/components/layout/T";
import type { CosmeticBundle } from "@/lib/types";

export const metadata: Metadata = {
  title: "Cosmetics",
  description: "Cosmetic costume bundles available in Pokemon Blaze Online.",
};

export default function CosmeticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-center text-3xl font-extrabold tracking-tight">
        <T k="cosmetics.title" />
      </h1>
      <CosmeticsExplorer bundles={cosmetics as CosmeticBundle[]} />
    </div>
  );
}
