import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inter — geometric grotesque, matches the Stratos logo wordmark exactly
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Stratos Strategies LLC — Infrastructure for the Frontiers of Life and Flight",
  description:
    "Aviation infrastructure systems, genomic data pipelines, and enterprise cloud architecture. Where precision meets execution.",
  metadataBase: new URL("https://stratosstrat.com"),
  openGraph: {
    title: "Stratos Strategies LLC — Infrastructure for the Frontiers of Life and Flight",
    description:
      "Aviation infrastructure systems, genomic data pipelines, and enterprise cloud architecture.",
    type: "website",
    url: "https://stratosstrat.com"
  },
  twitter: {
    card: "summary_large_image",
    title: "Stratos Strategies LLC — Infrastructure for the Frontiers of Life and Flight",
    description:
      "Aviation infrastructure systems, genomic data pipelines, and enterprise cloud architecture."
  }
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
        {children}
      </body>
    </html>
  );
}
