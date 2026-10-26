import {announcementMessages, storeConfig} from "@/lib/content";

export function AnnouncementBar() {
  const hours = storeConfig.hours?.trim();
  const messages = hours
    ? [...announcementMessages, `Jam operasional: ${hours}`]
    : announcementMessages;

  return (
    <aside className="announcement" aria-label="Informasi toko">
      <div className="announcement-viewport" tabIndex={0} role="region" aria-label="Pesan toko; saat animasi dikurangi, geser atau gunakan tombol panah untuk membaca">
        <div className="announcement-track">
          {[false, true].map((duplicate) => (
            <ul className="announcement-group" key={String(duplicate)} aria-hidden={duplicate || undefined}>
              {messages.map((message) => <li key={message}>{message}</li>)}
            </ul>
          ))}
        </div>
      </div>
    </aside>
  );
}
