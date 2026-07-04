// Semua nilai bertanda [GANTI] adalah placeholder — ganti sebelum publish.
export const storeConfig = {
  name: "altomebay",
  tagline: "Sembako lengkap, grosir & eceran — dekat dan ramah.",
  whatsapp: {
    number: "62812xxxxxxx", // [GANTI] nomor WhatsApp asli, format 62xxxxxxxxxx
    defaultMessage: "Halo altomebay, saya mau tanya stok...",
  },
  address: {
    full: "[GANTI: alamat lengkap toko]",
    // [GANTI] ganti jadi "nama toko + kota" asli, dipakai untuk link & embed maps
    mapsQuery: "altomebay toko sembako",
    // [GANTI] opsional: isi dengan url Google Maps asli (share link) untuk override mapsQuery
    mapsUrl: undefined as string | undefined,
  },
  hours: "Setiap hari 06.00–22.00", // [GANTI]
  social: {
    instagram: undefined as string | undefined, // [GANTI] opsional, mis. "https://instagram.com/altomebay"
  },
};

export type CategoryIcon =
  | "sembako"
  | "jajanan"
  | "rokok"
  | "pulsa"
  | "ewallet"
  | "air";

export const categories: {
  id: string;
  label: string;
  example: string;
  icon: CategoryIcon;
}[] = [
  {
    id: "sembako",
    label: "Sembako",
    example: "Beras, minyak, gula, telur, dll.",
    icon: "sembako",
  },
  {
    id: "jajanan",
    label: "Jajanan & Snack",
    example: "Camilan & minuman kemasan",
    icon: "jajanan",
  },
  {
    id: "rokok",
    label: "Rokok",
    example: "Berbagai merek, batangan & bungkus",
    icon: "rokok",
  },
  {
    id: "pulsa",
    label: "Pulsa & Data",
    example: "Semua operator, transaksi cepat",
    icon: "pulsa",
  },
  {
    id: "ewallet",
    label: "DANA / E-Wallet",
    example: "Top-up saldo & transfer",
    icon: "ewallet",
  },
  {
    id: "air",
    label: "Depot Air Isi Ulang",
    example: "Galon isi ulang, higienis",
    icon: "air",
  },
];

export const whyUsPoints = [
  {
    title: "Grosir & Eceran",
    description: "Beli satuan atau per pack, harga tetap bersahabat.",
  },
  {
    title: "Lengkap",
    description:
      "Sembako, jajanan, pulsa, sampai isi ulang galon — satu tempat.",
  },
  {
    title: "Dekat",
    description: "Gampang dijangkau, hemat waktu ke toko.",
  },
  {
    title: "Ramah & Keluarga",
    description:
      "Dilayani langsung oleh keluarga toko, bukan sekadar transaksi.",
  },
];

export const aboutStory = {
  heading: "Toko keluarga, sejak awal",
  paragraphs: [
    'Nama "altomebay" berasal dari inisial keluarga: ALimah, sugianTO, MElia, dan BAyu — empat nama yang menjadi fondasi toko ini.',
    "Berawal dari kebutuhan sehari-hari tetangga sekitar, altomebay tumbuh jadi tempat belanja sembako yang lengkap, dari grosir sampai eceran, dilayani langsung oleh keluarga.",
  ],
};
