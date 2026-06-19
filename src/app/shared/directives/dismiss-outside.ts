import { Directive, HostListener, output } from "@angular/core";

/**
 * Put on a modal backdrop / overlay container: emits `dismissOutside` when the
 * user clicks *outside* the dialog content, but NOT when a click merely ends
 * outside after a text selection that began inside it (the classic "select text,
 * drag out, release → modal closes" bug). Mark the dialog/popover content with
 * `data-modal-content`.
 */
@Directive({ selector: "[dismissOutside]" })
export class DismissOutside {
  readonly dismissOutside = output<void>();

  /** Whether the pointer went down inside the protected content. */
  private downInside = false;

  @HostListener("pointerdown", ["$event"])
  protected onPointerDown(event: PointerEvent): void {
    this.downInside = this.insideContent(event.target);
  }

  @HostListener("click", ["$event"])
  protected onClick(event: MouseEvent): void {
    if (!this.downInside && !this.insideContent(event.target)) this.dismissOutside.emit();
    this.downInside = false;
  }

  private insideContent(target: EventTarget | null): boolean {
    return target instanceof Element && !!target.closest("[data-modal-content]");
  }
}
