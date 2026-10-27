import { Bricolage_Grotesque } from "next/font/google";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { heroImages } from "@/lib/hero-images";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppLink } from "@/lib/links";
import "./hero.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hero",
  axes: ["opsz", "wdth"],
});

export function Hero() {
  return (
    <section className={`hero hero-centered ${bricolage.variable}`} aria-labelledby="hero-heading">
      <div className="hero-bricks absolute [z-index:0] pointer-events-none [width:3.75rem] [height:3.75rem] bg-base hero-bricks-left [left:-1.875rem] [box-shadow:3.75rem_-3.75rem_var(--color-base),_0_3.75rem_var(--color-base),_3.75rem_7.5rem_var(--color-base),_7.5rem_11.25rem_var(--color-base),_0_11.25rem_var(--color-base),_3.75rem_15rem_var(--color-base)]" aria-hidden="true" />
      <div className="hero-bricks absolute [z-index:0] pointer-events-none [width:3.75rem] [height:3.75rem] bg-base hero-bricks-right [right:-1.875rem] [box-shadow:-3.75rem_3.75rem_var(--color-base),_0_7.5rem_var(--color-base),_-3.75rem_11.25rem_var(--color-base),_-7.5rem_15rem_var(--color-base),_0_15rem_var(--color-base),_-3.75rem_18.75rem_var(--color-base)]" aria-hidden="true" />
      <div className="container [width:min(var(--container-page),calc(100%_-_var(--page-gutter)_*_2))] mx-auto hero-intro relative [z-index:1] text-center [padding-top:var(--section-space)]">
        <p> TOKO KELUARGA, UNTUK KESEHARIANMU</p>
        <h1 id="hero-heading">Kebutuhan Harian, <em>Dekat di Hati.</em></h1>
        <p className="hero-description text-ink-soft">Dari isi dapur sampai teman santai. Belanja grosir &amp; eceran dengan kehangatan toko keluarga Altomebay.</p>
        <div className="hero-actions flex items-center">
          <Button href="#kategori">Jelajahi kategori</Button>
          <Button variant="secondary" href={buildWhatsAppLink()} external icon="whatsapp">Hubungi toko</Button>
        </div>
      </div>
      <div className="hero-gallery relative [z-index:1] [margin-top:clamp(2.5rem,_5vw,_4rem)] [padding-block:.5rem_1rem]" role="region" aria-label="Galeri ilustrasi kebutuhan sehari-hari. Arahkan penunjuk atau fokus untuk menjeda." tabIndex={0}>
        <div className="hero-gallery-track flex w-max">
          {[false, true].map((duplicate) => (
            <ul className="hero-gallery-group [flex:0_0_auto] [gap:var(--hero-gallery-gap)] m-0 [padding:0_var(--hero-gallery-gap)_0_0] list-none" key={String(duplicate)} aria-hidden={duplicate || undefined}>
              {heroImages.map((image) => (
                <li className="hero-gallery-card [flex:0_0_var(--hero-card-width)] overflow-hidden bg-base" key={image.src}>
                  <Image src={image.src} alt={duplicate ? "" : image.alt} width={640} height={480} sizes="(max-width: 639px) 72vw, (max-width: 1050px) 38vw, 360px" />
                  <div className="hero-gallery-caption grid [gap:.25rem]"><span>{image.label}</span><span className="hero-placeholder-label text-ink-soft">Ilustrasi sementara</span></div>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <div className="container [width:min(var(--container-page),calc(100%_-_var(--page-gutter)_*_2))] mx-auto hero-bottom justify-between items-center"><span>Untuk rumah. Untuk keluarga. Untuk setiap hari.</span><a href="#kategori" aria-label="Gulir ke kategori belanja"><ArrowDown size={18} /></a></div>
    </section>
  );
}
