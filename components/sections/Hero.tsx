import { Bricolage_Grotesque } from "next/font/google";
import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { heroImages } from "@/lib/hero-images";
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
      <div className="hero-bricks hero-bricks-left" aria-hidden="true" />
      <div className="hero-bricks hero-bricks-right" aria-hidden="true" />
      <div className="container hero-intro">
        <p><span /> TOKO KELUARGA, UNTUK KESEHARIANMU</p>
        <h1 id="hero-heading">Kebutuhan Harian, <em>Dekat di Hati.</em></h1>
        <p className="hero-description">Dari isi dapur sampai teman santai. Belanja grosir &amp; eceran dengan kehangatan toko keluarga Altomebay.</p>
        <div className="hero-actions">
          <a className="action action-primary" href="#kategori">Jelajahi kategori <ArrowUpRight size={18} /></a>
          <a className="text-link" href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer">Hubungi toko <ArrowUpRight size={17} /></a>
        </div>
      </div>
      <div className="hero-gallery" role="region" aria-label="Galeri ilustrasi kebutuhan sehari-hari. Arahkan penunjuk atau fokus untuk menjeda." tabIndex={0}>
        <div className="hero-gallery-track">
          {[false, true].map((duplicate) => (
            <ul className="hero-gallery-group" key={String(duplicate)} aria-hidden={duplicate || undefined}>
              {heroImages.map((image) => (
                <li className="hero-gallery-card" key={image.src}>
                  <Image src={image.src} alt={duplicate ? "" : image.alt} width={640} height={480} sizes="(max-width: 639px) 72vw, (max-width: 1050px) 38vw, 360px" />
                  <div className="hero-gallery-caption"><span>{image.label}</span><span className="hero-placeholder-label">Ilustrasi sementara</span></div>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <div className="container hero-bottom"><span>Untuk rumah. Untuk keluarga. Untuk setiap hari.</span><a href="#kategori" aria-label="Gulir ke kategori belanja"><ArrowDown size={18} /></a></div>
    </section>
  );
}
