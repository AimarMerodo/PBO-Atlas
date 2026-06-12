// Renders a game item icon by cropping its atlas page with CSS.

import type { AtlasIcon } from "@/lib/types";

export default function ItemIcon({ icon, size = 40 }: { icon: AtlasIcon | null; size?: number }) {
  if (!icon || !icon.w) {
    return <div style={{ width: size, height: size }} className="rounded bg-surface-2" aria-hidden />;
  }
  const s = size / Math.max(icon.w, icon.h);
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        backgroundImage: `url(/items/${icon.page})`,
        backgroundPosition: `${-icon.x * s}px ${-icon.y * s}px`,
        backgroundSize: `${icon.pageW * s}px ${icon.pageH * s}px`,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
