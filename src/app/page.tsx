import Link from "next/link";
import { getRegions, getRegionSpawns } from "@/lib/data";
import T from "@/components/layout/T";
import RegionDescription from "@/components/region/RegionDescription";

export default function HomePage() {
  const regions = getRegions().map((meta) => {
    const spawns = getRegionSpawns(meta.id);
    const species = new Set<string>();
    spawns?.locations.forEach((l) => l.spawns.forEach((s) => species.add(s.pokemon)));
    return { meta, locations: spawns?.locations.length ?? 0, species: species.size };
  });

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-line bg-gradient-to-br from-surface to-surface-2 px-6 py-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          <T k="home.heroTitle" />
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-dim">
          <T k="home.heroSubtitle" />
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/pokedex"
            className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-white hover:bg-accent-soft transition-colors"
          >
            <T k="home.openPokedex" />
          </Link>
        </div>
        <p className="mt-4 text-xs text-ink-dim">
          <T k="search.hint" />
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">
          <T k="home.regions" />
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {regions.map(({ meta, locations, species }) => (
            <Link
              key={meta.id}
              href={`/region/${meta.id}`}
              className="group rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent/60"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-bold group-hover:text-accent-soft transition-colors">{meta.name}</h3>
                <span className="text-xs text-ink-dim">
                  {locations} <T k="home.locations" /> · {species} <T k="region.species" />
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-dim">
                <RegionDescription description={meta.description} />
              </p>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-dim">
          <T k="home.dataFrom" />
        </p>
      </section>
    </div>
  );
}
