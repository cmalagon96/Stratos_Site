import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

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
        className={`${GeistSans.variable} ${GeistMono.variable} bg-obsidian text-slate-300 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
