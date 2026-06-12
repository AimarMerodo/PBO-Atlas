import type { Metadata } from "next";
import MountsExplorer from "@/components/game/MountsExplorer";
import T from "@/components/layout/T";

export const metadata: Metadata = {
  title: "Mounts",
  description: "Every mount in Pokemon Blaze Online.",
};

export default function MountsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-center text-3xl font-extrabold tracking-tight">
        <T k="mounts.title" />
      </h1>
      <MountsExplorer />
    </div>
  );
}
