import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "altomebay — Sembako lengkap, grosir & eceran",
  description:
    "Toko sembako keluarga altomebay: sembako, jajanan, rokok, pulsa & data, DANA/e-wallet, dan depot air isi ulang. Grosir maupun eceran.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} antialiased`}>
      <body className="min-h-screen bg-base text-ink">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-brand focus:px-6 focus:py-3 focus:text-white focus:shadow-soft-hover"
        >
          Lewati ke konten utama
        </a>
        {children}
      </body>
    </html>
  );
}
