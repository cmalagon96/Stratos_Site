import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Industries from "@/components/Industries";
import Navbar from "@/components/Navbar";
import Services from "@/components/Services";

export default function Home() {
  return (
    <div className="bg-navy-deep">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <About />
        <Industries />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
