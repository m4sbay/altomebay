import { ExternalLink, MapPin } from "lucide-react";
import { storeConfig } from "@/lib/content";
import { buildMapsEmbedUrl, buildMapsSearchUrl } from "@/lib/links";
import { ContactButton } from "@/components/ui/ContactButton";

export function StoreMap() {
  const embedUrl = buildMapsEmbedUrl();

  return (
    <figure className="store-map m-0 min-w-0">
      <div className="store-map-preview w-full relative overflow-hidden rounded-card border border-border bg-base">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title="Lokasi Ruko Altomebay di Serasah, Pemayung, Kabupaten Batang Hari, Jambi"
            width="600"
            height="450"
            loading="lazy"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 block h-full w-full border-0"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <MapPin size={30} className="text-brand" aria-hidden="true" />
            <strong>{storeConfig.name}</strong>
            <p className="text-ink-soft text-sm">{storeConfig.address.full}</p>
            <ContactButton kind="maps" />
          </div>
        )}
      </div>
      <figcaption className="mt-3 text-sm text-ink-soft">
        {embedUrl ? <>Peta tidak tampil?{" "}<a href={buildMapsSearchUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-touch items-center gap-1 text-brand hover:text-brand-hover">Buka di Google Maps<ExternalLink size={16} aria-hidden="true" /></a></> : "Buka lokasi resmi toko melalui tombol Google Maps."}
      </figcaption>
    </figure>
  );
}
