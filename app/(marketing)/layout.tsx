import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CrispChat from "@/components/CrispChat";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-abyss">
      <Navbar />
      <main id="main-content" className="pt-24">
        {children}
      </main>
      <Footer />
      {/* Lazy-loaded support widget — only on marketing pages, not dashboard/admin */}
      <CrispChat />
    </div>
  );
}
