import { whyUsPoints } from "@/lib/content";

export function WhyUs() {
  return (
    <section
      aria-labelledby="whyus-heading"
      className="border-b border-border bg-base-soft"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-16 lg:py-24">
        <h2 id="whyus-heading" className="text-h2 font-bold text-ink">
          Kenapa Belanja di altomebay
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyUsPoints.map((point) => (
            <div
              key={point.title}
              className="rounded-2xl border border-border bg-base p-6 shadow-soft"
            >
              <h3 className="text-h3 font-bold text-ink">{point.title}</h3>
              <p className="mt-2 text-caption text-ink-soft">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
