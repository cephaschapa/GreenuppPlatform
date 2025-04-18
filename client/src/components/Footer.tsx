import React from 'react';
import { Link } from 'wouter';
import { Leaf } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
          {/* Logo & About */}
          <div className="flex flex-col">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="font-space font-bold text-xl">Greenupp</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              Transforming agriculture through intelligent, mobile-first technologies with enhanced 
              marketplace capabilities and blockchain-enabled traceability.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-foreground mb-4">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/marketplace" className="text-muted-foreground hover:text-primary transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/marketplace/sellers" className="text-muted-foreground hover:text-primary transition-colors">
                  Find Sellers
                </Link>
              </li>
              <li>
                <Link href="/trace" className="text-muted-foreground hover:text-primary transition-colors">
                  Verify Products
                </Link>
              </li>
              <li>
                <Link href="/ai-knowledge-base" className="text-muted-foreground hover:text-primary transition-colors">
                  AI Knowledge Base
                </Link>
              </li>
            </ul>
          </div>

          {/* Farmers */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-foreground mb-4">For Farmers</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/auth" className="text-muted-foreground hover:text-primary transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/auth" className="text-muted-foreground hover:text-primary transition-colors">
                  Farm Management
                </Link>
              </li>
              <li>
                <Link href="/auth" className="text-muted-foreground hover:text-primary transition-colors">
                  Sell Your Products
                </Link>
              </li>
              <li>
                <Link href="/auth" className="text-muted-foreground hover:text-primary transition-colors">
                  Weather Forecasts
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-foreground mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="text-muted-foreground">
                22nd Floor, Findeco House
              </li>
              <li className="text-muted-foreground">
                Cairo Road, Lusaka, Zambia
              </li>
              <li className="text-muted-foreground">
                info@greenupp.com
              </li>
              <li className="text-muted-foreground">
                <a 
                  href="https://www.metatronltd.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Powered by Metatron Technologies Ltd
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-center sm:text-left text-sm text-muted-foreground">
            © {currentYear} Greenupp. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a 
              href="#" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;