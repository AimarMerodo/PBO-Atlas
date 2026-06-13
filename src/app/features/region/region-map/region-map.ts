import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideArrowRight } from "@lucide/angular";
import { LanguageService } from "@core/i18n/language.service";
import type { MapMarker, MarkerPreview, RegionMapData } from "@core/models/types";

// Interactive region map: a static image with percentage-positioned markers.
const KIND_STYLES: Record<string, string> = {
  route: "h-3.5 w-3.5 rounded-full",
  city: "h-4.5 w-4.5 rounded-md",
  dungeon: "h-4 w-4 rotate-45 rounded-sm",
};

@Component({
  selector: "app-region-map",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideArrowRight],
  templateUrl: "./region-map.html",
})
export class RegionMapComponent {
  readonly map = input.required<RegionMapData>();
  readonly region = input.required<string>();
  readonly previews = input.required<Record<string, MarkerPreview>>();

  protected readonly i18n = inject(LanguageService);
  protected readonly active = signal<string | null>(null);

  protected readonly activePreview = computed(() => {
    const id = this.active();
    return id ? (this.previews()[id] ?? null) : null;
  });

  protected readonly activeMarker = computed(() => {
    const id = this.active();
    return id ? (this.map().markers.find((m) => m.locationId === id) ?? null) : null;
  });

  protected toggle(event: Event, locationId: string): void {
    event.stopPropagation();
    this.active.update((current) => (current === locationId ? null : locationId));
  }

  protected markerClass(m: MapMarker): string {
    const kind = KIND_STYLES[m.kind] ?? KIND_STYLES["route"];
    const activeRing = this.active() === m.locationId ? "scale-125 ring-2 ring-accent-soft" : "";
    return `block border-2 border-white bg-accent shadow-lg transition-transform group-hover:scale-125 ${kind} ${activeRing}`;
  }

  /** Clamp the popover horizontally so it never overflows the map edges. */
  protected popoverLeft(x: number): string {
    return `${Math.min(Math.max(x, 12), 88)}%`;
  }

  /** Flip the popover above the marker when it sits near the bottom of the map. */
  protected popoverTransform(y: number): string {
    return `translate(-50%, ${y > 70 ? "calc(-100% - 16px)" : "16px"})`;
  }
}
