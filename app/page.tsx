import About from "@/components/About";
import BentoGrid from "@/components/BentoGrid";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Industries from "@/components/Industries";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="bg-obsidian">
      <Navbar />
      <main>
        <Hero />
        <BentoGrid />
        <About />
        <Industries />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
