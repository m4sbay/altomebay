// Replace null values with verified store details before publishing.
export const storeConfig = {
  name: "altomebay",
  tagline: "Kebutuhan harian, dekat di hati.",
  whatsapp: { number: null as string | null, defaultMessage: "Halo Altomebay, saya mau tanya ketersediaan barang." },
  address: { full: null as string | null, mapsUrl: null as string | null, mapsQuery: "" },
  hours: null as string | null,
  social: { instagram: null as string | null },
};
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
