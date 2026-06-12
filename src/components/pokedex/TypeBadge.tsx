import { TYPE_COLORS } from "@/lib/colors";

export default function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] ?? "#9099a1";
  return (
    <span
      className="inline-block rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white"
      style={{ backgroundColor: color }}
    >
      {type}
    </span>
  );
}
