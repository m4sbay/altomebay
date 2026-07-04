import { CategoryIconGlyph } from "@/components/icons/CategoryIcons";
import type { CategoryIcon } from "@/lib/content";

export function CategoryCard({
  label,
  example,
  icon,
}: {
  label: string;
  example: string;
  icon: CategoryIcon;
}) {
  return (
    <div className="rounded-2xl border border-border bg-base p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-soft-hover">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-base-soft text-brand">
        <CategoryIconGlyph icon={icon} className="h-7 w-7" />
      </div>
      <h3 className="text-h3 font-bold text-ink">{label}</h3>
      <p className="mt-1 text-caption text-ink-soft">{example}</p>
    </div>
  );
}
