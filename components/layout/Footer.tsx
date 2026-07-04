"use client";

import { storeConfig } from "@/lib/content";
import { buildWhatsAppLink } from "@/lib/links";
import { trackEvent } from "@/lib/analytics";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-h3 font-bold">{storeConfig.name}</p>
            <p className="mt-2 max-w-sm text-caption text-white/70">
              {storeConfig.address.full}
            </p>
            <p className="mt-1 text-caption text-white/70">{storeConfig.hours}</p>
          </div>
          <div className="flex flex-col gap-2 text-caption">
            <a
              href={buildWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("whatsapp_click", { source: "footer" })}
              className="font-semibold text-whatsapp hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-whatsapp"
            >
              Chat WhatsApp
            </a>
            {storeConfig.social.instagram && (
              <a
                href={storeConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
        <p className="mt-8 border-t border-white/10 pt-6 text-caption text-white/50">
          © {year} {storeConfig.name}. Semua hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
}
