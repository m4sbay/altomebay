import { CategoryCard } from "@/components/ui/CategoryCard";
import { categories } from "@/lib/content";

export function CategoryGrid() {
  return (
    <section aria-labelledby="category-heading" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-16 lg:py-24">
        <h2 id="category-heading" className="text-h2 font-bold text-ink">
          Kategori Produk
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              label={category.label}
              example={category.example}
              icon={category.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
