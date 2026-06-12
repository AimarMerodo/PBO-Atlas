"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useT } from "@/i18n/LanguageProvider";
import type { DictKey } from "@/i18n/dictionaries";

const LINKS: { href: string; label: DictKey }[] = [
  { href: "/items", label: "nav.items" },
  { href: "/natures", label: "nav.natures" },
  { href: "/mounts", label: "nav.mounts" },
  { href: "/cosmetics", label: "nav.cosmetics" },
  { href: "/feedback", label: "nav.feedback" },
];

export default function NavMore() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-ink-dim hover:bg-surface hover:text-ink transition-colors"
      >
        {t("nav.more")}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-ink-dim hover:bg-surface-2 hover:text-ink transition-colors"
            >
              {t(l.label)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
