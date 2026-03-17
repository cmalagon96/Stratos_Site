import type { Metadata } from "next";
import { Inter } from "next/font/google";
import MotionProvider from "@/components/MotionProvider";
import PostHogProvider from "@/components/PostHogProvider";
import "./globals.css";

// Inter — geometric grotesque, matches the Stratos logo wordmark exactly
// P0-06: Removed unused weights 300, 500 — saves ~60-90KB of font data
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap"
});

const BASE_URL = "https://stratosstrat.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  // Template so nested pages can set a short title like "Pricing" and get
  // "Pricing — Stratos Strategies" automatically.
  title: {
    default:  "Stratos Strategies LLC — Infrastructure for the Frontiers of Life and Flight",
    template: "%s — Stratos Strategies",
  },
  description:
    "Aviation infrastructure systems, genomic data pipelines, and enterprise cloud architecture. Where precision meets execution.",

  applicationName: "Stratos Strategies",
  authors: [{ name: "Stratos Strategies LLC", url: BASE_URL }],
  keywords: [
    "AWS cloud infrastructure",
    "NIST 800-171 compliance",
    "aviation MRO software",
    "genomic data pipelines",
    "enterprise cloud architecture",
    "NIH dbGaP",
    "bioinformatics cloud",
  ],
  referrer: "origin-when-cross-origin",

  robots: {
    index:     true,
    follow:    true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },

  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         BASE_URL,
    siteName:    "Stratos Strategies LLC",
    title:       "Stratos Strategies LLC — Infrastructure for the Frontiers of Life and Flight",
    description: "Aviation infrastructure systems, genomic data pipelines, and enterprise cloud architecture. Where precision meets execution.",
    images: [
      {
        url:    "/og-image.png",
        width:  1200,
        height: 630,
        alt:    "Stratos Strategies LLC — Infrastructure for the Frontiers of Life and Flight",
      },
    ],
  },

  twitter: {
    card:        "summary_large_image",
    title:       "Stratos Strategies LLC — Infrastructure for the Frontiers of Life and Flight",
    description: "Aviation infrastructure systems, genomic data pipelines, and enterprise cloud architecture.",
    images:      ["/og-image.png"],
  },

  alternates: {
    canonical: BASE_URL,
  },

  icons: {
    icon:    "/favicon.ico",
    apple:   "/apple-touch-icon.png",
  },

  // TODO: add manifest, Google Search Console token when domain is live
  // manifest: "/site.webmanifest",
  // verification: { google: "xxxxxxxxxxxxxxxxxxxx" },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} bg-abyss text-text-mid antialiased`}
      >
        {/* P1-07: Skip-nav link for keyboard/screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-none focus:border focus:border-emerald focus:bg-abyss focus:px-4 focus:py-2 focus:text-xs focus:uppercase focus:tracking-widest focus:text-emerald focus:outline-none"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Skip to main content
        </a>
        {/* P0-06: LazyMotion wrapper — loads domAnimation (~15KB) instead of full bundle */}
        <PostHogProvider>
          <MotionProvider>
            {children}
          </MotionProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
