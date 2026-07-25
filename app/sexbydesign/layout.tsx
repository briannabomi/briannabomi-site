import type { Metadata } from "next";

const title = "Why You’re Not Having the Sex You Want | Sex by Design";
const description =
  "Get clear on what’s blocking sex and connection so you can decide whether to repair your current relationship or create a new one that actually fits.";

export const metadata: Metadata = {
  title,
  description,
  applicationName: "Sex by Design",
  category: "education",
  alternates: {
    canonical: "/sexbydesign",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Sex by Design",
    title,
    description,
    url: "/sexbydesign",
    images: [
      {
        url: "/og.png",
        width: 1662,
        height: 946,
        alt: "Why You’re Not Having the Sex You Want — The Intimacy Audit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
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

export default function SexByDesignLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Why You’re Not Having the Sex You Want",
            url: "https://www.briannabomi.com/sexbydesign",
            description,
            inLanguage: "en",
          }).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}
