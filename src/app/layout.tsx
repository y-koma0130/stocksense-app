import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../../styled-system/styles.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StockSense - AI投資支援プラットフォーム",
  description:
    "中期〜長期視点で「今買っておくといい銘柄」をAIが自動提示する投資支援プラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
