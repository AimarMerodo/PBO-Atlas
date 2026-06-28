import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  effect,
  inject,
  resource,
  signal,
  viewChild,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Meta, Title } from "@angular/platform-browser";
import {
  LucideBird,
  LucideBookmark,
  LucideCheck,
  LucideChevronLeft,
  LucideChevronRight,
  LucideCrown,
  LucideDownload,
  LucideFeather,
  LucideFootprints,
  LucideGlasses,
  LucideHand,
  LucideLayers,
  LucideMapPin,
  LucidePause,
  LucidePawPrint,
  LucidePencil,
  LucidePersonStanding,
  LucidePlay,
  LucideRabbit,
  LucideSave,
  LucideScissors,
  LucideSearch,
  LucideShare2,
  LucideShirt,
  LucideShuffle,
  LucideSmile,
  LucideStore,
  LucideTrash2,
  LucideUpload,
  LucideX,
} from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import type { DressupData, DressupItem, DressupMount } from "@core/models/types";
import { DismissOutside } from "@shared/directives/dismiss-outside";
import { decodeLook, downloadJson, encodeLook } from "./dressup-io";

const CELL = 64;
const COLS = 4;
const MOUNT = "MOUNT";
/** Catalog tab order — the game's real PaperDollType channels, then mounts. */
const UI_SLOTS = ["HAIR", "CAP", "GLASSES", "BEARD", "SHIRT", "JACKET", "GLOVES", "PANTS", "SHOE", "WINGS", "TAIL", "BEAK"];
/** Seated/gripping base pose used for Pokemon mounts (mounts/base/2 in the client; base/1 is the bike pose). */
const RIDE_POSE = "2";
/** Head accessories the client keeps from the walking sheet when a cosmetic has no seated variant; body
 *  garments without a seated variant are dropped instead (matching the decompiled mounted renderer). */
const RIDE_FALLBACK_SLOTS = new Set(["HAIR", "CAP", "BEARD", "GLASSES", "BEAK"]);
const PRESETS_KEY = "pbo-dressup-presets";
/** A saved look: name + everything needed to restore it. */
interface DressupPreset {
  name: string;
  gender: "M" | "F";
  skin: string;
  sel: Record<string, string>;
  mount: string;
}

/** Character dress-up tool: composite paper-doll sprite layers on a canvas, live and animated. */
@Component({
  selector: "app-dressup-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DismissOutside, LucideBird, LucideBookmark, LucideCheck, LucideChevronLeft, LucideChevronRight, LucideCrown, LucideDownload, LucideFeather, LucideFootprints, LucideGlasses, LucideHand, LucideLayers, LucideMapPin, LucidePause, LucidePawPrint, LucidePencil, LucidePersonStanding, LucidePlay, LucideRabbit, LucideSave, LucideScissors, LucideSearch, LucideShare2, LucideShirt, LucideShuffle, LucideSmile, LucideStore, LucideTrash2, LucideUpload, LucideX],
  templateUrl: "./dressup-page.html",
})
export class DressupPageComponent {
  protected readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>("cv");
  private readonly fileRef = viewChild<ElementRef<HTMLInputElement>>("file");
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly MOUNT = MOUNT;
  /** Facing cycle for the < / > rotate buttons: front -> right -> back -> left (clockwise to the viewer). */
  private readonly ROTATION = [0, 2, 3, 1];

  private readonly res = resource({ loader: () => this.data.dressup() });
  protected readonly model = computed<DressupData | null>(() => this.res.value() ?? null);

  protected readonly skin = signal("1");
  protected readonly gender = signal<"M" | "F">("M");
  protected readonly selections = signal<Record<string, string>>({});
  protected readonly mount = signal("");
  protected readonly activeTab = signal<string>("HAIR");
  protected readonly dir = signal(0);
  protected readonly playing = signal(true);
  protected readonly query = signal("");
  /** Brief "link copied" feedback on the Share button. */
  protected readonly shared = signal(false);
  protected readonly presets = signal<DressupPreset[]>([]);
  protected readonly presetName = signal("");
  protected readonly presetsOpen = signal(false);
  /** Whether the "where to find" sources guide modal is open. */
  protected readonly sourcesOpen = signal(false);
  /** Name of the preset whose title is being edited inline (null = none). */
  protected readonly editing = signal<string | null>(null);
  protected readonly editValue = signal("");
  private readonly frame = signal(0);

  /** Cosmetics for the current gender (gendered variants + unisex). */
  private readonly genderedItems = computed(() => {
    const g = this.gender();
    return (this.model()?.items ?? []).filter((it) => it.gender === "U" || it.gender === g);
  });
  private readonly itemsBySlot = computed(() => {
    const map = new Map<string, DressupItem[]>();
    for (const it of this.genderedItems()) (map.get(it.slot) ?? map.set(it.slot, []).get(it.slot)!).push(it);
    return map;
  });
  /** Tabs that have content, plus the mounts tab. */
  protected readonly tabs = computed(() => {
    const groups = this.itemsBySlot();
    const slots = UI_SLOTS.filter((s) => groups.has(s));
    return this.model()?.mounts?.length ? [...slots, MOUNT] : slots;
  });
  protected readonly tabCount = (tab: string) => (tab === MOUNT ? this.model()?.mounts?.length ?? 0 : this.itemsBySlot().get(tab)?.length ?? 0);

  /** Whether the search box is driving a global search (cosmetics + mounts across every tab). */
  protected readonly searching = computed(() => !!this.query().trim());
  /** Cosmetics shown: the active tab's items, or — while searching — matches across every slot. */
  protected readonly gridItems = computed<DressupItem[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (q) return this.genderedItems().filter((it) => (it.name + " " + (it.es ?? "") + " " + (it.pt ?? "")).toLowerCase().includes(q));
    if (this.activeTab() === MOUNT) return [];
    return this.itemsBySlot().get(this.activeTab()) ?? [];
  });
  /** Mounts shown: all mounts on the Mounts tab, or — while searching — mounts matching the query. */
  protected readonly gridMounts = computed<DressupMount[]>(() => {
    const q = this.query().trim().toLowerCase();
    const arr = this.model()?.mounts ?? [];
    if (q) return arr.filter((m) => (m.name + " " + (m.es ?? "") + " " + (m.pt ?? "")).toLowerCase().includes(q));
    return this.activeTab() === MOUNT ? arr : [];
  });
  /** Total filtered results (cosmetics + mounts), shown as a count. */
  protected readonly totalCount = computed(() => this.gridItems().length + this.gridMounts().length);

  protected readonly wearing = computed(() => {
    const sel = this.selections();
    const byPid = new Map((this.model()?.items ?? []).map((it) => [it.slot + "|" + it.pid, it]));
    return Object.entries(sel).map(([slot, pid]) => ({ slot, pid, item: byPid.get(slot + "|" + pid) ?? null }));
  });
  protected readonly mountItem = computed(() => this.model()?.mounts?.find((m) => m.id === this.mount()) ?? null);
  /** pid -> item, so draw() can read each cosmetic's `ride` flag (has a seated riding variant). */
  private readonly byPid = computed(() => new Map((this.model()?.items ?? []).map((it) => [it.pid, it])));

  /** Cosmetics with a known in-game source, grouped by slot for the "where to find" guide modal. */
  protected readonly sourceGroups = computed(() => {
    const groups = new Map<string, DressupItem[]>();
    const seen = new Set<string>();
    for (const it of this.model()?.items ?? []) {
      if (!it.where) continue;
      const key = it.slot + "|" + it.name + "|" + it.where; // drop M/F duplicates of the same garment
      if (seen.has(key)) continue;
      seen.add(key);
      (groups.get(it.slot) ?? groups.set(it.slot, []).get(it.slot)!).push(it);
    }
    return UI_SLOTS.filter((s) => groups.has(s)).map((slot) => ({
      slot,
      items: groups.get(slot)!.sort((a, b) => this.itemName(a).localeCompare(this.itemName(b))),
    }));
  });
  protected readonly sourceCount = computed(() => this.sourceGroups().reduce((n, g) => n + g.items.length, 0));

  private ctx: CanvasRenderingContext2D | null = null;
  private readonly imgs = new Map<string, HTMLImageElement>();
  private inited = false;

  constructor() {
    inject(Meta).updateTag({ name: "description", content: "Mix and match Pokemon Blaze Online costumes and mounts and preview your character live." });
    const title = inject(Title);
    effect(() => title.setTitle(`${this.i18n.t("dressup.title")} | PBO Atlas`));

    // Apply a shared look from ?look= (and skip the default-skin init effect so it isn't overwritten).
    if (isPlatformBrowser(this.platformId)) {
      const param = new URLSearchParams(location.search).get("look");
      const look = param && decodeLook(param);
      if (look) {
        this.applyLook(look);
        this.inited = true;
      }
    }

    effect(() => {
      const m = this.model();
      if (!m || this.inited) return;
      this.inited = true;
      this.skin.set(m.bodies[0] ?? "1");
    });

    effect(() => {
      this.model();
      this.skin();
      this.selections();
      this.mount();
      this.dir();
      this.frame();
      this.draw();
    });

    afterNextRender(() => {
      this.loadPresets();
      const cv = this.canvasRef()?.nativeElement;
      if (!cv) return;
      this.ctx = cv.getContext("2d");
      if (this.ctx) this.ctx.imageSmoothingEnabled = false;
      this.draw();
      const id = setInterval(() => {
        // Pause the walk cycle while a modal is open (no point repainting under a solid backdrop).
        if (this.playing() && !this.presetsOpen() && !this.sourcesOpen()) this.frame.update((f) => (f + 1) % COLS);
      }, 160);
      this.destroyRef.onDestroy(() => clearInterval(id));
    });
  }

  private img(src: string): HTMLImageElement {
    let im = this.imgs.get(src);
    if (!im) {
      im = new Image();
      im.onload = () => this.draw();
      im.src = src;
      this.imgs.set(src, im);
    }
    return im;
  }
  /** Draw one square cell (`cell`px) of a sprite sheet, scaled to `dSize`px. */
  private blit(src: string, cell: number, sx: number, sy: number, dx: number, dy: number, dSize: number): void {
    const im = this.img(src);
    if (im.complete && im.naturalWidth) this.ctx!.drawImage(im, sx, sy, cell, cell, dx, dy, dSize, dSize);
  }

  private draw(): void {
    const ctx = this.ctx;
    const m = this.model();
    if (!ctx || !m) return;
    const cv = ctx.canvas;
    ctx.clearRect(0, 0, cv.width, cv.height);

    const mt = this.mountItem(); // mount sheets vary in cell size (64 or 96px)
    const baseline = cv.height - 16; // ground line = character feet when unmounted
    // The client re-centers a large mount sprite (sheet width >= 384) over the 64px tile by shifting it
    // down 16px, so the rider effectively sits oy + 16 above the mount's feet. Without this the rider
    // sinks into the mount (worst on low-oy mounts like Milotic). Native px; scaled with everything else.
    const riderLift = mt ? (mt.cell * mt.cols >= 384 ? 16 : 0) : 0;
    const unitsTall = mt ? Math.max(mt.cell, CELL + mt.oy + riderLift) + 6 : CELL + 6;
    const scale = (baseline - 12) / unitsTall;
    const cx = cv.width / 2;
    const fr = this.frame();
    const dr = this.dir();
    const cw = CELL * scale;
    const sx = fr * CELL;
    const sy = dr * CELL;
    const sel = this.selections();
    const ride = !!mt;

    // mount_back, then the seated riding character (its own pose + cosmetics), then mount_front.
    // Mounting also turns to a side view (see pickMount): head-on a big mount hides the rider,
    // but in profile it only overlaps a leg, so the rider and outfit show.
    const mw = mt ? mt.cell * scale : 0;
    const col = mt ? fr % mt.cols : 0;
    if (mt) this.blit(this.mountPath(mt.id, "back"), mt.cell, col * mt.cell, dr * mt.cell, cx - mw / 2, baseline - mw, mw);

    // Reproduce the client's mounted compositing (decompiled MountedNetworkPlayerAnimation): the rider
    // is the seated/gripping base pose — mounts/base/2 for a Pokemon mount (base/1 is the bike pose) —
    // and the equipped cosmetics' SEATED variants, which are authored to register with that pose. A
    // cosmetic with no seated variant keeps its walking sprite for head accessories and is dropped for
    // body garments, so the base's baked-in green only shows where the real game shows it too.
    const rideBase = mt ? (mt.type === "BIKE" ? "1" : RIDE_POSE) : "";
    const byPid = this.byPid();
    const charBottom = mt ? baseline - (mt.oy + riderLift) * scale : baseline;
    for (const slot of m.slotOrder) {
      let src: string | null;
      if (slot === "BODY") {
        src = ride ? this.rideBasePath(rideBase) : this.spritePath(this.skin());
      } else {
        const pid = sel[slot];
        if (!pid) continue;
        if (!ride) src = this.spritePath(pid);
        else if (byPid.get(pid)?.ride) src = this.ridePath(pid);
        else if (RIDE_FALLBACK_SLOTS.has(slot)) src = this.spritePath(pid);
        else continue; // body garment with no seated variant: not drawn while mounted (green base shows)
      }
      this.blit(src, CELL, sx, sy, cx - cw / 2, charBottom - cw, cw);
    }
    if (mt) this.blit(this.mountPath(mt.id, "front"), mt.cell, col * mt.cell, dr * mt.cell, cx - mw / 2, baseline - mw, mw);
  }

  protected spritePath = (pid: string) => `/sprites/pbo/paperdolls/${pid}.png`;
  protected mountPath = (id: string, layer: "back" | "front") => `/sprites/pbo/mounts/${layer}/${id}.png`;
  /** Seated riding-pose sprites, used while mounted. */
  protected ridePath = (pid: string) => `/sprites/pbo/mounts/ride/${pid}.png`;
  protected rideBasePath = (id: string) => `/sprites/pbo/mounts/ride-base/${id}.png`;
  protected itemName = (it: DressupItem) => this.i18n.pick({ en: it.name, es: it.es, pt: it.pt, zh: it.zh });
  protected mountName = (m: DressupMount) => this.i18n.pick({ en: m.name, es: m.es, pt: m.pt, zh: m.zh });
  protected tabLabel = (tab: string) => (tab === MOUNT ? this.i18n.t("dressup.mount") : this.i18n.t(`dressup.slot.${tab}` as DictKey));
  protected isOn = (slot: string, pid: string) => this.selections()[slot] === pid;
  /** Equipped sprite pid for a slot's summary chip ("" when empty / for the mount slot). */
  protected equippedPid = (tab: string) => (tab === MOUNT ? "" : this.selections()[tab] ?? "");
  /** Equipped item name for a slot's summary row ("—" when empty). */
  protected equippedName = (tab: string): string => {
    if (tab === MOUNT) return this.mountItem() ? this.mountName(this.mountItem()!) : "—";
    const pid = this.selections()[tab];
    if (!pid) return "—";
    const it = this.byPid().get(pid);
    return it ? this.itemName(it) : pid;
  };

  protected pickItem(slot: string, pid: string): void {
    this.selections.update((s) => {
      const next = { ...s };
      if (next[slot] === pid) delete next[slot];
      else next[slot] = pid;
      return next;
    });
  }
  protected pickMount(id: string): void {
    // Keep whatever direction the user is facing — don't snap to a fixed side on mount.
    if (this.mount() === id) this.clearMount();
    else this.mount.set(id);
  }
  protected clearMount(): void {
    this.mount.set("");
  }
  protected removeSlot(slot: string): void {
    this.selections.update((s) => {
      const next = { ...s };
      delete next[slot];
      return next;
    });
  }
  protected clearAll(): void {
    this.selections.set({});
    this.mount.set("");
  }
  protected randomLook(): void {
    const groups = this.itemsBySlot();
    const next: Record<string, string> = {};
    const pick = (slot: string, prob: number) => {
      const arr = groups.get(slot);
      if (arr?.length && Math.random() < prob) next[slot] = arr[Math.floor(Math.random() * arr.length)].pid;
    };
    pick("HAIR", 0.85);
    pick("SHIRT", 0.9);
    pick("PANTS", 0.9);
    pick("SHOE", 0.8);
    pick("JACKET", 0.4);
    pick("CAP", 0.4);
    pick("GLASSES", 0.3);
    pick("GLOVES", 0.3);
    pick("BEARD", 0.15);
    pick("WINGS", 0.15);
    pick("TAIL", 0.15);
    pick("BEAK", 0.15);
    this.selections.set(next);
  }
  private loadPresets(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const raw = localStorage.getItem(PRESETS_KEY);
      const data = raw ? JSON.parse(raw) : [];
      if (Array.isArray(data)) this.presets.set(data.filter((p) => p && typeof p.name === "string"));
    } catch {
      /* ignore corrupt storage */
    }
  }
  private persistPresets(list: DressupPreset[]): void {
    const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name));
    this.presets.set(sorted);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(PRESETS_KEY, JSON.stringify(sorted));
      } catch {
        /* storage full / unavailable */
      }
    }
  }
  protected onPresetName(e: Event): void {
    this.presetName.set((e.target as HTMLInputElement).value);
  }
  /** Write the current look into a preset by name (creates or overwrites). */
  private storePreset(name: string): void {
    const preset: DressupPreset = { name, gender: this.gender(), skin: this.skin(), sel: { ...this.selections() }, mount: this.mount() };
    this.persistPresets([...this.presets().filter((p) => p.name !== name), preset]);
  }
  /** Save the current look under the typed name (overwrites a same-named preset). */
  protected savePreset(): void {
    const name = this.presetName().trim();
    if (!name) return;
    this.storePreset(name);
    this.presetName.set("");
  }
  /** Overwrite an existing preset with the current look (edit-and-save in place). */
  protected updatePreset(p: DressupPreset): void {
    this.storePreset(p.name);
  }
  protected startRename(p: DressupPreset): void {
    this.editing.set(p.name);
    this.editValue.set(p.name);
  }
  protected onEditName(e: Event): void {
    this.editValue.set((e.target as HTMLInputElement).value);
  }
  protected cancelRename(): void {
    this.editing.set(null);
  }
  /** Commit the inline name edit (no-op if blank/unchanged; same new name overwrites). */
  protected commitRename(oldName: string): void {
    const newName = this.editValue().trim();
    this.editing.set(null);
    if (!newName || newName === oldName) return;
    const renamed = this.presets()
      .filter((p) => p.name !== newName)
      .map((p) => (p.name === oldName ? { ...p, name: newName } : p));
    this.persistPresets(renamed);
  }
  protected applyPreset(p: DressupPreset): void {
    this.applyLook(p);
  }
  /** Apply any look-shaped object (preset or shared URL) to the character. */
  private applyLook(l: { gender?: string; skin?: string; sel?: Record<string, string>; mount?: string }): void {
    this.gender.set(l.gender === "F" ? "F" : "M");
    this.skin.set(l.skin || "1");
    this.selections.set({ ...(l.sel ?? {}) });
    this.mount.set(l.mount ?? "");
  }
  protected deletePreset(name: string): void {
    this.persistPresets(this.presets().filter((p) => p.name !== name));
  }
  protected openPresets(): void {
    this.presetsOpen.set(true);
  }
  protected closePresets(): void {
    this.presetsOpen.set(false);
  }
  protected openSources(): void {
    this.sourcesOpen.set(true);
  }
  protected closeSources(): void {
    this.sourcesOpen.set(false);
  }
  /** Download a single saved look as its own JSON file. */
  protected exportPreset(p: DressupPreset): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const slug = p.name.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "look";
    downloadJson(`pbo-look-${slug}.json`, p);
  }
  /** Download all saved looks as one JSON file. */
  protected exportAll(): void {
    if (!isPlatformBrowser(this.platformId) || !this.presets().length) return;
    downloadJson("pbo-dressup-presets.json", this.presets());
  }
  /** Copy a ?look= link for the current outfit to the clipboard. */
  protected shareLook(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const look = { gender: this.gender(), skin: this.skin(), sel: this.selections(), mount: this.mount() };
    const url = `${location.origin}/dressup?look=${encodeLook(look)}`;
    history.replaceState(null, "", url);
    const ok = () => {
      this.shared.set(true);
      setTimeout(() => this.shared.set(false), 1800);
    };
    navigator.clipboard?.writeText(url).then(ok, ok);
  }
  protected triggerImport(): void {
    this.fileRef()?.nativeElement.click();
  }
  /** Merge look(s) from a JSON file into the saved list — never clears existing (same name overwrites). */
  protected importPresets(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const incoming: DressupPreset[] = Array.isArray(data) ? data : [data];
        const byName = new Map(this.presets().map((p) => [p.name, p]));
        for (const p of incoming) {
          if (!p || typeof p.name !== "string" || typeof p.sel !== "object") continue;
          byName.set(p.name, { name: p.name, gender: p.gender === "F" ? "F" : "M", skin: String(p.skin ?? "1"), sel: p.sel ?? {}, mount: String(p.mount ?? "") });
        }
        this.persistPresets([...byName.values()]);
      } catch {
        /* invalid file */
      }
      input.value = "";
    };
    reader.readAsText(file);
  }
  protected selectTab(tab: string): void {
    this.activeTab.set(tab);
    this.query.set("");
  }
  /** Rotate the character one step around the facing cycle (+1 = clockwise, -1 = counter-clockwise). */
  protected rotate(step: number): void {
    const cur = this.ROTATION.indexOf(this.dir());
    const i = (cur < 0 ? 0 : cur) + step;
    this.dir.set(this.ROTATION[((i % this.ROTATION.length) + this.ROTATION.length) % this.ROTATION.length]);
  }
  protected togglePlay(): void {
    this.playing.update((p) => !p);
  }
  protected setGender(g: "M" | "F"): void {
    this.gender.set(g);
  }
  protected onSearch(e: Event): void {
    this.query.set((e.target as HTMLInputElement).value);
  }
}
