import { useState } from 'react';
import { Link } from 'wouter';
import { 
  Menu, 
  X, 
  Home, 
  ShoppingBag, 
  Info, 
  Phone,
  User,
  Users
} from 'lucide-react';

import { Button } from "@/components/ui/button";

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-background/95 backdrop-blur-md shadow-sm border-b border-primary/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <nav className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-primary text-xl relative">
              <i className="fas fa-leaf"></i>
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
            </div>
            <span className="text-xl font-bold font-space tracking-wider">
              Green<span className="text-primary">upp</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-foreground/80 hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/marketplace" className="text-foreground/80 hover:text-primary transition-colors">
              Marketplace
            </Link>
            <Link href="/marketplace/sellers" className="text-foreground/80 hover:text-primary transition-colors">
              Sellers
            </Link>
            <Link href="/#features" className="text-foreground/80 hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="/#about" className="text-foreground/80 hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/#contact" className="text-foreground/80 hover:text-primary transition-colors">
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild size="sm">
              <Link href="/auth?mode=login">Log In</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth?mode=register">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-primary/10 mt-3">
            <Link 
              href="/" 
              className="flex items-center gap-2 px-2 py-2 text-foreground/80 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link 
              href="/marketplace" 
              className="flex items-center gap-2 px-2 py-2 text-foreground/80 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Marketplace</span>
            </Link>
            <Link 
              href="/marketplace/sellers" 
              className="flex items-center gap-2 px-2 py-2 text-foreground/80 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Users className="h-4 w-4" />
              <span>Sellers</span>
            </Link>
            <Link 
              href="/#features" 
              className="flex items-center gap-2 px-2 py-2 text-foreground/80 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Info className="h-4 w-4" />
              <span>Features</span>
            </Link>
            <Link 
              href="/#about" 
              className="flex items-center gap-2 px-2 py-2 text-foreground/80 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Info className="h-4 w-4" />
              <span>About</span>
            </Link>
            <Link 
              href="/#contact" 
              className="flex items-center gap-2 px-2 py-2 text-foreground/80 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Phone className="h-4 w-4" />
              <span>Contact</span>
            </Link>

            <div className="pt-2 mt-2 border-t border-primary/10 flex flex-col gap-2">
              <Button variant="outline" asChild size="sm" className="justify-start" onClick={() => setMobileMenuOpen(false)}>
                <Link href="/auth?mode=login">
                  <User className="h-4 w-4 mr-2" />
                  Log In
                </Link>
              </Button>
              <Button asChild size="sm" className="justify-start" onClick={() => setMobileMenuOpen(false)}>
                <Link href="/auth?mode=register">
                  <User className="h-4 w-4 mr-2" />
                  Sign Up
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}