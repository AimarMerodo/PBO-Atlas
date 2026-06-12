"use client";

// Interactive region map: a static image with percentage-positioned markers.
// In development, clicking an empty spot logs a ready-to-paste marker JSON line.

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useT } from "@/i18n/LanguageProvider";
import type { RegionMapData } from "@/lib/types";

export interface MarkerPreview {
  locationId: string;
  name: string;
  speciesCount: number;
  topSpawns: { slug: string; name: string; spriteUrl: string | null }[];
}

const KIND_STYLES: Record<string, string> = {
  route: "h-3.5 w-3.5 rounded-full",
  city: "h-4.5 w-4.5 rounded-md",
  dungeon: "h-4 w-4 rotate-45 rounded-sm",
};

export default function RegionMap({
  map,
  region,
  previews,
}: {
  map: RegionMapData;
  region: string;
  previews: Record<string, MarkerPreview>;
}) {
  const t = useT();
  const [active, setActive] = useState<string | null>(null);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setActive(null);
    if (process.env.NODE_ENV !== "development") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10;
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10;
    console.log(`{ "locationId": "", "x": ${x}, "y": ${y}, "kind": "route" },`);
  };

  const activePreview = active ? previews[active] : null;
  const activeMarker = active ? map.markers.find((m) => m.locationId === active) : null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-ink-dim">{t("region.mapHint")}</p>
      <div
        className="relative w-full overflow-hidden rounded-xl border border-line"
        style={{ aspectRatio: `${map.imageWidth} / ${map.imageHeight}` }}
        onClick={handleMapClick}
      >
        <Image src={map.image} alt={`${region} map`} fill className="object-cover" sizes="(max-width: 1152px) 100vw, 1152px" />
        {map.markers.map((m) => {
          const preview = previews[m.locationId];
          if (!preview) return null;
          return (
            <button
              key={m.locationId}
              onClick={(e) => {
                e.stopPropagation();
                setActive(active === m.locationId ? null : m.locationId);
              }}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
              aria-label={preview.name}
            >
              <span
                className={`block border-2 border-white bg-accent shadow-lg transition-transform group-hover:scale-125 ${
                  KIND_STYLES[m.kind] ?? KIND_STYLES.route
                } ${active === m.locationId ? "scale-125 ring-2 ring-accent-soft" : ""}`}
              />
              <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-black/85 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {preview.name}
              </span>
            </button>
          );
        })}

        {activePreview && activeMarker && (
          <div
            className="absolute z-20 w-56 -translate-x-1/2 rounded-xl border border-line bg-surface p-3 shadow-2xl"
            style={{
              left: `${Math.min(Math.max(activeMarker.x, 12), 88)}%`,
              top: `${activeMarker.y}%`,
              transform: `translate(-50%, ${activeMarker.y > 70 ? "calc(-100% - 16px)" : "16px"})`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-semibold">{activePreview.name}</p>
            <p className="text-xs text-ink-dim">
              {activePreview.speciesCount} {t("region.species")}
            </p>
            <div className="mt-2 flex gap-1">
              {activePreview.topSpawns.map(
                (s) =>
                  s.spriteUrl && (
                    <Image key={s.slug} src={s.spriteUrl} alt={s.name} title={s.name} width={36} height={36} unoptimized />
                  )
              )}
            </div>
            <Link
              href={`/region/${region}/${activePreview.locationId}`}
              className="mt-2 inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1 text-xs font-semibold text-white hover:bg-accent-soft transition-colors"
            >
              {t("region.viewAll")} <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
