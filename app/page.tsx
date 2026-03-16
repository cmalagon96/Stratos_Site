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

export default function Home() {
  return (
    <div className="bg-abyss">
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
