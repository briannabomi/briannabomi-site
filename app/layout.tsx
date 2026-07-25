import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

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

const baseMetadata: Metadata = {
  title: "Why You’re Not Having the Sex You Want | Sex by Design",
  description:
    "Get clear on what’s blocking sex and connection so you can decide whether to repair your current relationship or create a new one that actually fits.",
  applicationName: "Sex by Design",
  category: "education",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Sex by Design",
    title: "Why You’re Not Having the Sex You Want | Sex by Design",
    description:
      "Get clear on what’s blocking sex and connection so you can decide whether to repair your current relationship or create a new one that actually fits.",
  },
  twitter: {
    card: "summary",
    title: "Why You’re Not Having the Sex You Want | Sex by Design",
    description:
      "Get clear on what’s blocking sex and connection so you can decide whether to repair your current relationship or create a new one that actually fits.",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const requestHost = forwardedHost || requestHeaders.get("host")?.trim();

  if (!requestHost) {
    return baseMetadata;
  }

  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol =
    forwardedProtocol === "http" || forwardedProtocol === "https"
      ? forwardedProtocol
      : requestHost.startsWith("localhost")
        ? "http"
        : "https";

  let socialImageUrl: string;
  try {
    socialImageUrl = new URL("/og.png", `${protocol}://${requestHost}`).toString();
  } catch {
    return baseMetadata;
  }

  return {
    ...baseMetadata,
    openGraph: {
      ...baseMetadata.openGraph,
      images: [
        {
          url: socialImageUrl,
          width: 1662,
          height: 946,
          alt: "Why You’re Not Having the Sex You Want — The Intimacy Audit",
        },
      ],
    },
    twitter: {
      ...baseMetadata.twitter,
      card: "summary_large_image",
      images: [socialImageUrl],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fraunces.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: "Why You’re Not Having the Sex You Want",
              description:
                "Get clear on what’s blocking sex and connection so you can decide whether to repair your current relationship or create a new one that actually fits.",
              inLanguage: "en",
            }).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
