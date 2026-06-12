import type { Metadata } from "next";
import ItemsExplorer from "@/components/game/ItemsExplorer";
import T from "@/components/layout/T";

export const metadata: Metadata = {
  title: "Items",
  description: "Every item in Pokemon Blaze Online with icons and descriptions.",
};

export default function ItemsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-center text-3xl font-extrabold tracking-tight">
        <T k="items.title" />
      </h1>
      <ItemsExplorer />
    </div>
  );
}
