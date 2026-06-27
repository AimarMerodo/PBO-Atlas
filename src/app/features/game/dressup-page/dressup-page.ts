import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  resource,
  signal,
  viewChild,
} from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import {
  LucideChevronDown,
  LucideChevronLeft,
  LucideChevronRight,
  LucideChevronUp,
  LucidePause,
  LucidePlay,
  LucideShirt,
  LucideShuffle,
  LucideTrash2,
  LucideX,
} from "@lucide/angular";
import { DataService } from "@core/data/data.service";
import { LanguageService } from "@core/i18n/language.service";
import type { DictKey } from "@core/i18n/dictionaries";
import type { DressupData, DressupItem, DressupMount } from "@core/models/types";

const CELL = 64;
const COLS = 4;
const MOUNT = "MOUNT";
/** Catalog tab order — the game's real PaperDollType channels, then mounts. */
const UI_SLOTS = ["HAIR", "CAP", "GLASSES", "BEARD", "SHIRT", "JACKET", "GLOVES", "PANTS", "SHOE", "WINGS", "TAIL", "BEAK"];

/** Character dress-up tool: composite paper-doll sprite layers on a canvas, live and animated. */
@Component({
  selector: "app-dressup-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideChevronDown, LucideChevronLeft, LucideChevronRight, LucideChevronUp, LucidePause, LucidePlay, LucideShirt, LucideShuffle, LucideTrash2, LucideX],
  templateUrl: "./dressup-page.html",
})
export class DressupPageComponent {
  protected readonly i18n = inject(LanguageService);
  private readonly data = inject(DataService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>("cv");

  protected readonly MOUNT = MOUNT;
  protected readonly dirs = [
    { dir: 3, label: "up" },
    { dir: 1, label: "left" },
    { dir: 2, label: "right" },
    { dir: 0, label: "down" },
  ];

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

  /** Items shown in the active tab's grid (filtered by search). */
  protected readonly gridItems = computed<DressupItem[]>(() => {
    if (this.activeTab() === MOUNT) return [];
    const q = this.query().trim().toLowerCase();
    const arr = this.itemsBySlot().get(this.activeTab()) ?? [];
    return q ? arr.filter((it) => this.itemName(it).toLowerCase().includes(q)) : arr;
  });
  protected readonly gridMounts = computed<DressupMount[]>(() => {
    if (this.activeTab() !== MOUNT) return [];
    const q = this.query().trim().toLowerCase();
    const arr = this.model()?.mounts ?? [];
    return q ? arr.filter((m) => this.mountName(m).toLowerCase().includes(q)) : arr;
  });
  protected readonly wearing = computed(() => {
    const sel = this.selections();
    const byPid = new Map((this.model()?.items ?? []).map((it) => [it.slot + "|" + it.pid, it]));
    return Object.entries(sel).map(([slot, pid]) => ({ slot, pid, item: byPid.get(slot + "|" + pid) ?? null }));
  });
  protected readonly mountItem = computed(() => this.model()?.mounts?.find((m) => m.id === this.mount()) ?? null);

  private ctx: CanvasRenderingContext2D | null = null;
  private readonly imgs = new Map<string, HTMLImageElement>();
  private inited = false;

  constructor() {
    inject(Meta).updateTag({ name: "description", content: "Mix and match Pokemon Blaze Online costumes and mounts and preview your character live." });
    const title = inject(Title);
    effect(() => title.setTitle(`${this.i18n.t("dressup.title")} | PBO Atlas`));

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
      const cv = this.canvasRef()?.nativeElement;
      if (!cv) return;
      this.ctx = cv.getContext("2d");
      if (this.ctx) this.ctx.imageSmoothingEnabled = false;
      this.draw();
      const id = setInterval(() => {
        if (this.playing()) this.frame.update((f) => (f + 1) % COLS);
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

    const mt = this.mountItem(); // mount sheets vary in cell size; the rider sits `oy`px up
    const baseline = cv.height - 16; // ground line = character feet when unmounted
    const unitsTall = mt ? Math.max(mt.cell, CELL + mt.oy) + 4 : CELL + 6;
    const scale = (baseline - 12) / unitsTall;
    const cx = cv.width / 2;
    const fr = this.frame();
    const dr = this.dir();

    if (mt) {
      const mw = mt.cell * scale;
      const col = fr % mt.cols;
      this.blit(this.mountPath(mt.id, "back"), mt.cell, col * mt.cell, dr * mt.cell, cx - mw / 2, baseline - mw, mw);
    }

    const cw = CELL * scale;
    const charBottom = baseline - (mt ? mt.oy * scale : 0);
    const sx = fr * CELL;
    const sy = dr * CELL;
    const sel = this.selections();
    for (const slot of m.slotOrder) {
      const pid = slot === "BODY" ? this.skin() : sel[slot];
      if (pid) this.blit(this.spritePath(pid), CELL, sx, sy, cx - cw / 2, charBottom - cw, cw);
    }

    if (mt) {
      const mw = mt.cell * scale;
      const col = fr % mt.cols;
      this.blit(this.mountPath(mt.id, "front"), mt.cell, col * mt.cell, dr * mt.cell, cx - mw / 2, baseline - mw, mw);
    }
  }

  protected spritePath = (pid: string) => `/sprites/pbo/paperdolls/${pid}.png`;
  protected mountPath = (id: string, layer: "back" | "front") => `/sprites/pbo/mounts/${layer}/${id}.png`;
  protected itemName = (it: DressupItem) => this.i18n.pick({ en: it.name, es: it.es, pt: it.pt, zh: it.zh });
  protected mountName = (m: DressupMount) => this.i18n.pick({ en: m.name, es: m.es, pt: m.pt, zh: m.zh });
  protected tabLabel = (tab: string) => (tab === MOUNT ? this.i18n.t("dressup.mount") : this.i18n.t(`dressup.slot.${tab}` as DictKey));
  protected isOn = (slot: string, pid: string) => this.selections()[slot] === pid;

  protected pickItem(slot: string, pid: string): void {
    this.selections.update((s) => {
      const next = { ...s };
      if (next[slot] === pid) delete next[slot];
      else next[slot] = pid;
      return next;
    });
  }
  protected pickMount(id: string): void {
    this.mount.update((cur) => (cur === id ? "" : id));
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
  protected selectTab(tab: string): void {
    this.activeTab.set(tab);
    this.query.set("");
  }
  protected setDir(d: number): void {
    this.dir.set(d);
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
