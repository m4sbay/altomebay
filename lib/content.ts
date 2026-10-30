// Official store details; leave unconfirmed fields null.
export const storeConfig = {
  name: "Ruko Altomebay Serasah",
  tagline: "Kebutuhan harian, dekat di hati.",
  whatsapp: { number: "6281273474170", displayNumber: "081273474170", defaultMessage: "Halo, saya mau tanya tentang produk yang tersedia di toko." },
  address: {
    full: "Ruko Altomebay, Serasah, Kec. Pemayung, Kabupaten Batang Hari, Jambi 36657",
    mapsUrl: "https://maps.app.goo.gl/ww2V2cmzXPmcp3Ku8?g_st=ic",
    // Official Google Share embed supplied by the owner; preserve its place identity.
    mapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.1184758056647!2d103.41020147570069!3d-1.6725576361717935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e2f7bf799ade3a5%3A0xa9d91f687fe0af53!2sRuko%20Altomebay%20Serasah!5e0!3m2!1sid!2sid!4v1793385563140!5m2!1sid!2sid",
  },
  hours: null as string | null,
  social: { instagram: null as string | null },
};
// Add verified opening hours in storeConfig.hours; the bar includes them automatically.
export const announcementMessages = [
  "Belanja dekat, kebutuhan lengkap",
  "Grosir & eceran untuk kebutuhan sehari-hari",
  "Belanja mudah, nggak perlu jauh-jauh",
];

export type CategoryIcon = "sembako" | "jajanan" | "rokok" | "pulsa" | "ewallet" | "air";
export const categories: {id:string;label:string;example:string;icon:CategoryIcon;art:string;count:string}[] = [
 {id:"sembako",label:"Sembako",example:"Beras, minyak, gula & telur",icon:"sembako",art:"pantry",count:"UNTUK DAPUR"},
 {id:"jajanan",label:"Jajanan & minuman",example:"Camilan dan minuman favorit",icon:"jajanan",art:"snacks",count:"TEMAN SANTAI"},
 {id:"rokok",label:"Rokok",example:"Pilihan merek di toko",icon:"rokok",art:"packs",count:"KEBUTUHAN LAIN"},
];
export const services = [
 {number:"01",title:"Pulsa & paket data",description:"Tetap terhubung. Tanyakan pilihan pulsa dan paket data untuk operatormu.",icon:"pulsa" as CategoryIcon},
 {number:"02",title:"Top-up e-wallet",description:"Isi saldo dompet digital, termasuk DANA. Konfirmasi kebutuhanmu langsung ke toko.",icon:"ewallet" as CategoryIcon},
 {number:"03",title:"Depot air isi ulang",description:"Kebutuhan air minum keluarga, lebih dekat dari rumah. Tanyakan layanan isi ulang galon.",icon:"air" as CategoryIcon},
];
export const whyUsPoints = [
 {title:"Grosir & eceran",description:"Belanja satuan untuk hari ini, atau per pack untuk persediaan."},
 {title:"Beragam kebutuhan",description:"Dari isi dapur sampai pulsa, temukan kebutuhanmu di satu tempat."},
 {title:"Dekat dengan keseharian",description:"Toko untuk kebutuhan sehari-hari keluarga dan tetangga sekitar."},
 {title:"Dilayani keluarga",description:"Ada sapaan dan perhatian di balik setiap belanjaan."},
];
export const aboutStory = {heading:"Empat nama. Satu cerita keluarga.",paragraphs:[
 "Altomebay berawal dari keluarga. ALimah, sugianTO, MElia, dan BAyu — empat nama yang kami satukan menjadi identitas toko.",
 "Kami hadir untuk kebutuhan sehari-hari: dari belanja kecil untuk rumah, sampai persediaan grosir. Dengan pelayanan keluarga, kami ingin menjadi bagian yang dekat dari keseharianmu."
]};
export const assets = {
 hero:{label:"Foto utama toko",size:"1600 × 1200 px",ratio:"4:3"},
 about:{label:"Foto keluarga / suasana toko",size:"1200 × 900 px",ratio:"4:3"},
 category:{label:"Foto kategori",size:"600 × 600 px",ratio:"1:1"},
 promotion:{label:"Banner promo",size:"1600 × 640 px desktop · 900 × 900 px mobile",ratio:"5:2 / 1:1"},
};
