import Link from "next/link";
import LanguageToggle from "./LanguageToggle";
import SearchDialog from "./SearchDialog";
import T from "./T";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span
            aria-hidden
            className="inline-block h-5 w-5 rounded-full border-2 border-ink"
            style={{ background: "linear-gradient(to bottom, var(--accent) 45%, #fff 45%, #fff 55%, #f4f4f5 55%)" }}
          />
          <span>
            PBO <span className="text-accent-soft">Atlas</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm text-ink-dim">
          <Link href="/" className="rounded-lg px-3 py-1.5 hover:bg-surface hover:text-ink transition-colors">
            <T k="nav.regions" />
          </Link>
          <Link href="/pokedex" className="rounded-lg px-3 py-1.5 hover:bg-surface hover:text-ink transition-colors">
            <T k="nav.pokedex" />
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <SearchDialog />
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
