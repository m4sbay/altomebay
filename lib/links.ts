import { storeConfig } from "./content";
export function buildWhatsAppLink(message = storeConfig.whatsapp.defaultMessage): string | undefined {
 const number = storeConfig.whatsapp.number?.replace(/[\s+()-]/g, "");
 return number && /^62\d{8,13}$/.test(number) ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : undefined;
}
export function buildMapsSearchUrl(): string | undefined {
 const url = storeConfig.address.mapsUrl;
 if (!url) return undefined;
 try { const parsed = new URL(url); return parsed.protocol === "https:" ? url : undefined; } catch { return undefined; }
}

// The embed is copied from the official place's Share dialog, never a search.
export function buildMapsEmbedUrl(): string | undefined {
 const url = storeConfig.address.mapsEmbedUrl;
 if (!url) return undefined;
 try {
  const parsed = new URL(url);
  return parsed.origin === "https://www.google.com" && parsed.pathname === "/maps/embed" && parsed.searchParams.has("pb") ? url : undefined;
 } catch { return undefined; }
}
