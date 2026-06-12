"use client";

import { Moon, Sun, SunMoon } from "lucide-react";
import { useT } from "@/i18n/LanguageProvider";
import type { SpawnTime } from "@/lib/types";

export default function TimeIcon({ time }: { time: SpawnTime }) {
  const t = useT();
  const label = t(`time.${time}`);
  const cls = "h-4 w-4";

  return (
    <span title={label} aria-label={label} className="inline-flex items-center text-ink-dim">
      {time === "day" ? (
        <Sun className={`${cls} text-amber-400`} />
      ) : time === "night" ? (
        <Moon className={`${cls} text-indigo-300`} />
      ) : (
        <SunMoon className={cls} />
      )}
    </span>
  );
}
