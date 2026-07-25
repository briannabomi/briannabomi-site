import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.briannabomi.com",
  ),
  title: {
    default: "Brianna Bomi",
    template: "%s | Brianna Bomi",
  },
  description: "Brianna Bomi",
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fraunces.variable}`}>
        {children}
      </body>
    </html>
  );
}
