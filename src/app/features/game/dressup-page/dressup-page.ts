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
import type { DressupData, DressupItem } from "@core/models/types";

const CELL = 64;
const COLS = 4;
const SCALE = 5;
/** Catalog accordion order. These are the game's real PaperDollType channels. */
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

  /** Facing controls: row index into the sprite sheet (0 down, 1 left, 2 right, 3 up). */
  protected readonly dirs = [
    { dir: 3, label: "up" },
    { dir: 1, label: "left" },
    { dir: 2, label: "right" },
    { dir: 0, label: "down" },
  ];

  private readonly res = resource({ loader: () => this.data.dressup() });
  protected readonly model = computed<DressupData | null>(() => this.res.value() ?? null);

  protected readonly bodyId = signal("1");
  protected readonly selections = signal<Record<string, string>>({});
  protected readonly dir = signal(0);
  protected readonly playing = signal(true);
  protected readonly query = signal("");
  protected readonly openSlots = signal<ReadonlySet<string>>(new Set());
  private readonly frame = signal(0);

  /** Slots that actually have items, in UI order. */
  protected readonly slots = computed(() => {
    const groups = this.itemsBySlot();
    return UI_SLOTS.filter((s) => groups.has(s));
  });
  private readonly itemsBySlot = computed(() => {
    const map = new Map<string, DressupItem[]>();
    for (const it of this.model()?.items ?? []) {
      (map.get(it.slot) ?? map.set(it.slot, []).get(it.slot)!).push(it);
    }
    return map;
  });
  protected readonly results = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return null;
    return (this.model()?.items ?? []).filter((it) => this.itemName(it).toLowerCase().includes(q)).slice(0, 240);
  });
  protected readonly wearing = computed(() => {
    const sel = this.selections();
    const byPid = new Map((this.model()?.items ?? []).map((it) => [it.slot + "|" + it.pid, it]));
    return Object.entries(sel).map(([slot, pid]) => ({ slot, pid, item: byPid.get(slot + "|" + pid) ?? null }));
  });

  private ctx: CanvasRenderingContext2D | null = null;
  private readonly imgs = new Map<string, HTMLImageElement>();
  private inited = false;

  constructor() {
    inject(Meta).updateTag({ name: "description", content: "Mix and match Pokemon Blaze Online costumes and preview your character live." });
    const title = inject(Title);
    effect(() => title.setTitle(`${this.i18n.t("dressup.title")} | PBO Atlas`));

    // Start on the bare base body (same as "Clear all") — no preset applied.
    effect(() => {
      const m = this.model();
      if (!m || this.inited) return;
      this.inited = true;
      this.bodyId.set(m.bodies[0] ?? "1");
    });

    // Repaint whenever the look, direction, body or animation frame changes.
    effect(() => {
      this.model();
      this.bodyId();
      this.selections();
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

  private img(pid: string): HTMLImageElement {
    let im = this.imgs.get(pid);
    if (!im) {
      im = new Image();
      im.onload = () => this.draw();
      im.src = this.spritePath(pid);
      this.imgs.set(pid, im);
    }
    return im;
  }

  private draw(): void {
    const ctx = this.ctx;
    const m = this.model();
    if (!ctx || !m) return;
    const cv = ctx.canvas;
    ctx.clearRect(0, 0, cv.width, cv.height);
    const dw = CELL * SCALE;
    const dx = (cv.width - dw) / 2;
    const dy = cv.height - dw - 12;
    const sx = this.frame() * CELL;
    const sy = this.dir() * CELL;
    const sel = this.selections();
    for (const slot of m.slotOrder) {
      const pid = slot === "BODY" ? this.bodyId() : sel[slot];
      if (!pid) continue;
      const im = this.img(pid);
      if (im.complete && im.naturalWidth) ctx.drawImage(im, sx, sy, CELL, CELL, dx, dy, dw, dw);
    }
  }

  protected spritePath = (pid: string) => `/sprites/pbo/paperdolls/${pid}.png`;
  protected thumb = (pid: string) => `url(${this.spritePath(pid)})`;
  protected itemName = (it: DressupItem) => this.i18n.pick({ en: it.name, es: it.es, pt: it.pt, zh: it.zh });
  protected slotLabel = (slot: string) => this.i18n.t(`dressup.slot.${slot}` as DictKey);
  protected itemsOf = (slot: string) => this.itemsBySlot().get(slot) ?? [];
  protected isOn = (slot: string, pid: string) => this.selections()[slot] === pid;

  protected toggleItem(slot: string, pid: string): void {
    this.selections.update((s) => {
      const next = { ...s };
      if (next[slot] === pid) delete next[slot];
      else next[slot] = pid;
      return next;
    });
  }
  protected removeSlot(slot: string): void {
    this.selections.update((s) => {
      const next = { ...s };
      delete next[slot];
      return next;
    });
  }
  protected applyPreset(slots: Record<string, string>): void {
    this.selections.set({ ...slots });
  }
  protected clearAll(): void {
    this.selections.set({});
  }
  protected randomLook(): void {
    const groups = this.itemsBySlot();
    const next: Record<string, string> = {};
    const pick = (slot: string, prob: number) => {
      const arr = groups.get(slot);
      if (arr?.length && Math.random() < prob) next[slot] = arr[Math.floor(Math.random() * arr.length)].pid;
    };
    pick("HAIR", 0.9);
    pick("SHIRT", 0.9);
    pick("PANTS", 0.9);
    pick("SHOE", 0.8);
    pick("JACKET", 0.4);
    pick("HAT", 0.5);
    pick("MASK", 0.3);
    pick("GLASSES", 0.25);
    pick("GLOVES", 0.3);
    pick("TAIL", 0.2);
    pick("WINGS", 0.15);
    pick("AURA", 0.15);
    this.selections.set(next);
  }
  protected toggleSection(slot: string): void {
    this.openSlots.update((s) => {
      const next = new Set(s);
      if (next.has(slot)) next.delete(slot);
      else next.add(slot);
      return next;
    });
  }
  protected setDir(d: number): void {
    this.dir.set(d);
  }
  protected togglePlay(): void {
    this.playing.update((p) => !p);
  }
  protected onSearch(e: Event): void {
    this.query.set((e.target as HTMLInputElement).value);
  }
}
