"use client";

// Generic detail dialog for game entities (items, mounts, cosmetics):
// large atlas icon, title, badge and arbitrary extra content.

import type { ReactNode } from "react";
import { X } from "lucide-react";
import type { AtlasIcon } from "@/lib/types";
import ItemIcon from "./ItemIcon";

export default function GameModal({
  title,
  subtitle,
  badge,
  icon,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  icon: AtlasIcon | null;
  onClose: () => void;
  children?: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold leading-tight">{title}</h2>
            {subtitle && <p className="text-sm text-ink-dim">{subtitle}</p>}
            {badge && (
              <span className="mt-1 inline-block rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-dim">
                {badge}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg border border-line bg-surface-2 p-1.5 text-ink-dim transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex justify-center rounded-xl border border-line bg-zinc-300/90 p-6">
          <div className="[image-rendering:pixelated]">
            <ItemIcon icon={icon} size={160} />
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
