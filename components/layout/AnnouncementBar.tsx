import {announcementMessages, storeConfig} from "@/lib/content";

export function AnnouncementBar() {
  const hours = storeConfig.hours?.trim();
  const messages = hours
    ? [...announcementMessages, `Jam operasional: ${hours}`]
    : announcementMessages;

  return (
    <aside className="announcement flex flex-row flex-nowrap items-center w-full [height:2.375rem] overflow-hidden bg-brand text-on-brand" aria-label="Informasi toko">
      <div className="announcement-viewport [flex:1_1_0%] min-w-0 h-full" tabIndex={0} role="region" aria-label="Pesan toko; saat animasi dikurangi, geser atau gunakan tombol panah untuk membaca">
        <div className="announcement-track flex flex-row flex-nowrap items-center w-max h-full gap-0">
          {[false, true].map((duplicate) => (
            <ul className="announcement-group flex-row flex-nowrap min-w-screen justify-around gap-0 p-0 list-none" key={String(duplicate)} aria-hidden={duplicate || undefined}>
              {messages.map((message) => <li key={message}>{message}</li>)}
            </ul>
          ))}
        </div>
      </div>
    </aside>
  );
}
