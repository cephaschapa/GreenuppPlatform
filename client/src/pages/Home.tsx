import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProblemSolutionCards from "@/components/ProblemSolutionCards";
import FeatureNavigator from "@/components/FeatureNavigator";
import AiAssistantShowcase from "@/components/AiAssistantShowcase";
import BlockchainTraceability from "@/components/BlockchainTraceability";
import SocialProof from "@/components/SocialProof";
import MobileExperience from "@/components/MobileExperience";
import GettingStartedSteps from "@/components/GettingStartedSteps";
import PricingSection from "@/components/PricingSection";
import CtaSection from "@/components/CtaSection";
import ContactSection from "@/components/ContactSection";
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
        const targetId = anchor.getAttribute('href');
        
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId as string);
        if (targetElement) {
          window.scrollTo({
            top: (targetElement as HTMLElement).offsetTop - 80,
            behavior: 'smooth'
          });
          
          // Close mobile menu if open
          if (mobileMenuOpen) {
            setMobileMenuOpen(false);
          }
        }
      }
    };
    
    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, [mobileMenuOpen]);
  
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iIzMzMyIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIvPjwvZz48L3N2Zz4=')] bg-[length:20px_20px] opacity-5 pointer-events-none dark:opacity-10"></div>
      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      
      <main>
        {/* Hero Section */}
        <Hero />
        
        {/* Problem-Solution Cards */}
        <ProblemSolutionCards />
        
        {/* Feature Navigation */}
        <FeatureNavigator />
        
        {/* AI Assistant Showcase */}
        <AiAssistantShowcase />
        
        {/* Blockchain Traceability */}
        <BlockchainTraceability />
        
        {/* Social Proof */}
        <SocialProof />
        
        {/* Mobile Experience */}
        <MobileExperience />
        
        {/* Getting Started Steps */}
        <GettingStartedSteps />
        
        {/* Pricing Section */}
        <PricingSection />
        
        {/* CTA Section */}
        <CtaSection />
        
        {/* Contact Section */}
        <ContactSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
