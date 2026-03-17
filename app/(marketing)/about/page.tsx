import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About",
  description:
    "Stratos Strategies LLC — senior infrastructure engineers at the intersection of aviation technology, genomic computing, and enterprise cloud architecture. We build and operate systems where precision is not optional.",
  openGraph: {
    title: "About — Stratos Strategies",
    description:
      "Senior engineers at the intersection of aviation technology, genomic computing, and enterprise cloud infrastructure. Where precision meets execution.",
    url: "https://stratosstrat.com/about",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
