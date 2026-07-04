import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { PhotoIcon } from "@/components/icons/PhotoIcon";
import { aboutStory } from "@/lib/content";

export function About() {
  return (
    <section aria-labelledby="about-heading" className="border-b border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 md:py-16 lg:grid-cols-2 lg:items-center lg:py-24">
        <PlaceholderImage
          label="Foto keluarga & rak produk altomebay, segera hadir"
          className="aspect-[4/3] w-full lg:order-2"
          icon={<PhotoIcon className="h-full w-full" />}
        />
        <div>
          <h2 id="about-heading" className="text-h2 font-bold text-ink">
            {aboutStory.heading}
          </h2>
          {aboutStory.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-ink-soft">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
