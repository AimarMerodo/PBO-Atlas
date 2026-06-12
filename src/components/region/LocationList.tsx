"use client";

import { useState } from "react";
import Link from "next/link";
import { useT } from "@/i18n/LanguageProvider";

export interface LocationSummary {
  id: string;
  name: string;
  speciesCount: number;
}

export default function LocationList({ region, locations }: { region: string; locations: LocationSummary[] }) {
  const t = useT();
  const [query, setQuery] = useState("");

  const filtered = locations.filter((l) => l.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="space-y-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("region.filterPlaceholder")}
        className="w-full sm:w-72 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm outline-none placeholder:text-ink-dim focus:border-accent/60"
      />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((l) => (
          <Link
            key={l.id}
            href={`/region/${region}/${l.id}`}
            className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3 transition-colors hover:border-accent/60"
          >
            <span className="text-sm font-medium">{l.name}</span>
            <span className="text-xs text-ink-dim whitespace-nowrap">
              {l.speciesCount} {t("region.species")}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
