import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <SearchX className="h-16 w-16 text-ink-dim" aria-hidden />
      <h1 className="text-2xl font-extrabold">404</h1>
      <p className="text-ink-dim">Page not found / Página no encontrada</p>
      <Link href="/" className="rounded-lg bg-accent px-5 py-2 font-semibold text-white hover:bg-accent-soft transition-colors">
        PBO Atlas
      </Link>
    </div>
  );
}
