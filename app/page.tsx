import {Nav} from "@/components/layout/Nav";
import {Hero} from "@/components/sections/Hero";
import {CategoryGrid} from "@/components/sections/CategoryGrid";
import {Promotion} from "@/components/sections/Promotion";
import {Services} from "@/components/sections/Services";
import {WhyUs} from "@/components/sections/WhyUs";
import {About} from "@/components/sections/About";
import {LocationHours} from "@/components/sections/LocationHours";
import {Footer} from "@/components/footer/Footer";
import {StickyMobileCta} from "@/components/layout/StickyMobileCta";
export default function Home(){return <div id="beranda"><Nav/><main id="main-content"><Hero/><CategoryGrid/><Promotion/><Services/><WhyUs/><About/><LocationHours/></main><Footer/><StickyMobileCta/></div>;}
