"use client";

import { Button } from "@/components/ui/Button";
import { ClockIcon } from "@/components/icons/ClockIcon";
import { MapPinIcon } from "@/components/icons/MapPinIcon";
import { storeConfig } from "@/lib/content";
import { buildMapsEmbedUrl, buildMapsSearchUrl } from "@/lib/links";
import { trackEvent } from "@/lib/analytics";

export function LocationHours() {
  return (
    <section
      aria-labelledby="location-heading"
      className="border-b border-border bg-base-soft"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 md:py-16 lg:grid-cols-2 lg:items-center lg:py-24">
        <div>
          <h2 id="location-heading" className="text-h2 font-bold text-ink">
            Lokasi & Jam Buka
          </h2>
          <div className="mt-4 flex items-start gap-3">
            <MapPinIcon className="mt-1 h-5 w-5 shrink-0 text-brand" />
            <p className="text-ink-soft">{storeConfig.address.full}</p>
          </div>
          <div className="mt-3 flex items-start gap-3">
            <ClockIcon className="mt-1 h-5 w-5 shrink-0 text-brand" />
            <p className="text-ink-soft">{storeConfig.hours}</p>
          </div>
          <div className="mt-8">
            <Button
              href={buildMapsSearchUrl()}
              variant="secondary"
              icon="maps"
              onClick={() =>
                trackEvent("maps_click", { source: "location-section" })
              }
            >
              Lihat Lokasi
            </Button>
          </div>
        </div>
        <iframe
          src={buildMapsEmbedUrl()}
          loading="lazy"
          title={`Lokasi ${storeConfig.name} di Google Maps`}
          referrerPolicy="no-referrer-when-downgrade"
          className="h-80 w-full rounded-2xl border border-border"
        />
      </div>
    </section>
  );
}
