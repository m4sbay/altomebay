"use client";

import { Button } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { PhotoIcon } from "@/components/icons/PhotoIcon";
import { storeConfig } from "@/lib/content";
import { buildWhatsAppLink, buildMapsSearchUrl } from "@/lib/links";
import { trackEvent } from "@/lib/analytics";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="border-b border-border bg-base-soft"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 md:py-16 lg:grid-cols-2 lg:items-center lg:py-24">
        <div>
          <h1
            id="hero-heading"
            className="text-display font-bold text-ink md:text-[3rem]"
          >
            {storeConfig.name}
          </h1>
          <p className="mt-4 max-w-md text-lg text-ink-soft">
            {storeConfig.tagline}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              href={buildWhatsAppLink()}
              variant="whatsapp"
              icon="whatsapp"
              onClick={() => trackEvent("whatsapp_click", { source: "hero" })}
            >
              Chat WhatsApp
            </Button>
            <Button
              href={buildMapsSearchUrl()}
              variant="secondary"
              icon="maps"
              onClick={() => trackEvent("maps_click", { source: "hero" })}
            >
              Lihat Lokasi
            </Button>
          </div>
        </div>
        <PlaceholderImage
          label="Foto toko altomebay, segera hadir"
          className="aspect-[4/3] w-full"
          icon={<PhotoIcon className="h-full w-full" />}
        />
      </div>
    </section>
  );
}
