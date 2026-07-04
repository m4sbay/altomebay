import { storeConfig } from "./content";

export function buildWhatsAppLink(
  message: string = storeConfig.whatsapp.defaultMessage
) {
  const digits = storeConfig.whatsapp.number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildMapsSearchUrl() {
  return (
    storeConfig.address.mapsUrl ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      storeConfig.address.mapsQuery
    )}`
  );
}

export function buildMapsEmbedUrl() {
  return `https://www.google.com/maps?q=${encodeURIComponent(
    storeConfig.address.mapsQuery
  )}&output=embed`;
}
