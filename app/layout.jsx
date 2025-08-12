// C:\Users\aditya wirz\compfest17\gatotkota\app\layout.jsx

import { Montserrat, Geist_Mono } from "next/font/google"; // <-- 1. IMPOR MONTSERRAT
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

// 2. KONFIGURASI FONT MONTSERRAT
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ['400', '500', '700'], // Pilih weight yang Anda butuhkan (400=regular, 500=medium, 700=bold)
  variable: "--font-montserrat", // Nama variabel CSS untuk font ini
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Gatotkota App",
  description: "My awesome Next.js application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* 3. TERAPKAN KE BODY */}
      <body
        className={`${montserrat.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}