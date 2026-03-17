import About from "@/components/About";
import BentoGrid from "@/components/BentoGrid";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
// P0-05: Hero is lazy-loaded via HeroLoader (Client Component) which uses
// next/dynamic with ssr:false. This eliminates SSR overhead for the Three.js
// canvas and avoids Math.random() hydration mismatches (P2-03).
import HeroLoader from "@/components/HeroLoader";
import Industries from "@/components/Industries";
import Navbar from "@/components/Navbar";
import Services from "@/components/Services";
import TrustBar from "@/components/TrustBar";
import { OrganizationSchema, WebSiteSchema } from "@/components/JsonLd";

export default function Home() {
  return (
    <div className="bg-abyss">
      {/* Structured data — Organization + WebSite schema for Google rich results */}
      <OrganizationSchema
        name="Stratos Strategies LLC"
        url="https://stratosstrat.com"
        description="Aviation infrastructure systems, genomic data pipelines, and enterprise cloud architecture."
        sameAs={[
          "https://www.linkedin.com/company/stratos-strategies",
        ]}
      />
      <WebSiteSchema
        name="Stratos Strategies"
        url="https://stratosstrat.com"
        description="Infrastructure for the Frontiers of Life and Flight."
      />

      <Navbar />
      {/* P1-07: id="main-content" is the skip-nav target from layout.tsx */}
      <main id="main-content">
        <HeroLoader />
        <TrustBar />
        <BentoGrid />
        <Services />
        <About />
        <Industries />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
