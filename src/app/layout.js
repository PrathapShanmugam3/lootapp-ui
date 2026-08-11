import { Inter } from "next/font/google";
import "@/styles/tailwind.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Loot Hat",
  description: "Loot Hat — India's affiliate earning platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
