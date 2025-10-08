import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeatureNavigator from "@/components/FeatureNavigator";
import SocialProof from "@/components/SocialProof";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle smooth scrolling for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');

      if (anchor) {
        e.preventDefault();
        const targetId = anchor.getAttribute("href");

        if (targetId === "#") return;

        const targetElement = document.querySelector(targetId as string);
        if (targetElement) {
          window.scrollTo({
            top: (targetElement as HTMLElement).offsetTop - 80,
            behavior: "smooth",
          });

          // Close mobile menu if open
          if (mobileMenuOpen) {
            setMobileMenuOpen(false);
          }
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iIzMzMyIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIvPjwvZz48L3N2Zz4=')] bg-[length:20px_20px] opacity-5 pointer-events-none dark:opacity-10"></div>
      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main>
        {/* Hero Section */}
        <Hero />

        {/* Social Proof - moved up for credibility */}
        <SocialProof />

        {/* Feature Navigation - condensed */}
        <FeatureNavigator />

        {/* Pricing Section */}
        <PricingSection />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
