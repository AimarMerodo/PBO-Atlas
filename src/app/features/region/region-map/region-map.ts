import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideArrowRight, LucideSearch, LucideX } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";
import type { MapMarker, MarkerPreview, RegionMapData } from "@core/models/types";
import { DismissOutside } from "@shared/directives/dismiss-outside";

// Interactive region map: a static image with percentage-positioned markers.
const KIND_STYLES: Record<string, string> = {
  route: "h-3.5 w-3.5 rounded-full",
  city: "h-4.5 w-4.5 rounded-md",
  dungeon: "h-4 w-4 rotate-45 rounded-sm",
};

@Component({
  selector: "app-region-map",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideArrowRight, LucideSearch, LucideX, DismissOutside],
  templateUrl: "./region-map.html",
})
export class RegionMapComponent {
  readonly map = input.required<RegionMapData>();
  readonly region = input.required<string>();
  readonly previews = input.required<Record<string, MarkerPreview>>();

  protected readonly i18n = inject(LanguageService);
  protected readonly active = signal<string | null>(null);
  protected readonly query = signal("");

  private readonly normalizedQuery = computed(() => this.query().trim().toLowerCase());
  protected readonly isSearching = computed(() => this.normalizedQuery().length > 0);

  /** Markers paired with their preview, filtered by the search query. When a
   *  query is active only matching markers are kept (flagged `match`). */
  protected readonly visibleMarkers = computed(() => {
    const items = this.map()
      .markers.map((marker) => ({ marker, preview: this.previews()[marker.locationId] }))
      .filter((x): x is { marker: MapMarker; preview: MarkerPreview } => !!x.preview);
    const q = this.normalizedQuery();
    if (!q) return items.map((x) => ({ ...x, match: false }));
    return items.filter((x) => x.preview.name.toLowerCase().includes(q)).map((x) => ({ ...x, match: true }));
  });

  protected readonly noResults = computed(() => this.isSearching() && this.visibleMarkers().length === 0);

  protected readonly activePreview = computed(() => {
    const id = this.active();
    return id ? (this.previews()[id] ?? null) : null;
  });

  protected readonly activeMarker = computed(() => {
    const id = this.active();
    return id ? (this.map().markers.find((m) => m.locationId === id) ?? null) : null;
  });

  /** Update the query; when it narrows to a single location, open its popover. */
  protected onSearch(value: string): void {
    this.query.set(value);
    const matches = this.visibleMarkers();
    this.active.set(this.normalizedQuery() && matches.length === 1 ? matches[0].marker.locationId : null);
  }

  protected toggle(event: Event, locationId: string): void {
    event.stopPropagation();
    this.active.update((current) => (current === locationId ? null : locationId));
  }

  protected markerClass(m: MapMarker, match: boolean): string {
    const kind = KIND_STYLES[m.kind] ?? KIND_STYLES["route"];
    const active = this.active() === m.locationId;
    const emphasis = match
      ? "scale-[1.6] ring-2 ring-accent-soft"
      : active
        ? "scale-125 ring-2 ring-accent-soft"
        : "group-hover:scale-125";
    return `relative block border-2 border-white bg-accent shadow-lg transition-transform ${kind} ${emphasis}`;
  }

  protected labelClass(match: boolean): string {
    const base =
      "pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-0.5 text-xs transition-opacity";
    return match
      ? `${base} bg-accent font-semibold text-white opacity-100 shadow-lg`
      : `${base} bg-black/85 text-white opacity-0 group-hover:opacity-100`;
  }

  /** Position the popover's centre at the marker, but clamp by its real half-width
   *  (w-56 → 7rem) so a centred popover never spills past the map/viewport edge —
   *  a percentage clamp isn't enough on narrow mobile maps. */
  protected popoverLeft(x: number): string {
    return `clamp(7rem, ${x}%, calc(100% - 7rem))`;
  }

  /** Flip the popover above the marker when it sits near the bottom of the map. */
  protected popoverTransform(y: number): string {
    return `translate(-50%, ${y > 70 ? "calc(-100% - 16px)" : "16px"})`;
  }
}
