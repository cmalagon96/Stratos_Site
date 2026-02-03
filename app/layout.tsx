import type { Metadata } from "next";
import {
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Plus_Jakarta_Sans
} from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-plus-jakarta-sans",
  display: "swap"
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-sans",
  display: "swap"
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-ibm-plex-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Stratos Strategies LLC — Infrastructure. Intelligence. Execution.",
  description:
    "Cloud infrastructure, compliance engineering, full-stack development, and automation consulting.",
  metadataBase: new URL("https://stratosstrat.com"),
  openGraph: {
    title: "Stratos Strategies LLC — Infrastructure. Intelligence. Execution.",
    description:
      "Cloud infrastructure, compliance engineering, full-stack development, and automation consulting.",
    type: "website",
    url: "https://stratosstrat.com"
  },
  twitter: {
    card: "summary_large_image",
    title: "Stratos Strategies LLC — Infrastructure. Intelligence. Execution.",
    description:
      "Cloud infrastructure, compliance engineering, full-stack development, and automation consulting."
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
        className={`${plusJakartaSans.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} bg-navy-deep text-silver-light antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
