"use client";

import { Button } from "@/components/ui/Button";
import { buildWhatsAppLink, buildMapsSearchUrl } from "@/lib/links";
import { trackEvent } from "@/lib/analytics";

export function StickyMobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-base/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="grid grid-cols-2 gap-3 p-3">
        <Button
          href={buildWhatsAppLink()}
          variant="whatsapp"
          icon="whatsapp"
          fullWidth
          onClick={() => trackEvent("whatsapp_click", { source: "sticky-bar" })}
        >
          WhatsApp
        </Button>
        <Button
          href={buildMapsSearchUrl()}
          variant="primary"
          icon="maps"
          fullWidth
          onClick={() => trackEvent("maps_click", { source: "sticky-bar" })}
        >
          Lokasi
        </Button>
      </div>
    </div>
  );
}
