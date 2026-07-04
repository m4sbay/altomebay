import { StoreRoof } from "@/components/StoreRoof";
import { Nav } from "@/components/layout/Nav";
import { Hero } from "@/components/sections/Hero";
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import { WhyUs } from "@/components/sections/WhyUs";
import { About } from "@/components/sections/About";
import { LocationHours } from "@/components/sections/LocationHours";
import { Footer } from "@/components/footer/Footer";
import { StickyMobileCta } from "@/components/layout/StickyMobileCta";

export default function Home() {
  return (

    <>
      <StoreRoof topOffset={-40} />
      <Nav />
      <main id="main-content" className="pb-24 md:pb-0">
        <Hero />
        <CategoryGrid />
        <WhyUs />
        <About />
        <LocationHours />
        <Footer />
      </main>
      <StickyMobileCta />
    </>
  );
}
