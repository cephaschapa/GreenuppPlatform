import { FC } from "react";
import { Link } from "wouter";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const Navbar: FC<NavbarProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  return (
    <nav className="fixed w-full bg-background/95 backdrop-blur-md z-50 border-b border-primary/20 shadow-md shadow-black/10 dark:shadow-black/20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-2 md:py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-primary text-2xl md:text-3xl mr-1 relative">
            <i className="fas fa-leaf"></i>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          </div>
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold font-space tracking-wider group relative"
          >
            Green
            <span className="text-primary group-hover:animate-pulse transition-all">
              upp
            </span>
            <span className="absolute -top-2 -right-12  text-white text-xs px-2 py-0.5 rounded-full font-semibold">
              BETA
            </span>
          </Link>
        </div>

        <div className="hidden md:flex space-x-6 lg:space-x-8 items-center">
          <a
            href="#features"
            className="hover:text-primary transition duration-300 relative group"
          >
            Features
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
          </a>
          <a
            href="#solutions"
            className="hover:text-primary transition duration-300 relative group"
          >
            Solutions
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
          </a>
          <a
            href="#advanced-features"
            className="hover:text-primary transition duration-300 relative group"
          >
            Platform
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
          </a>
          <Link
            href="/marketplace"
            className="hover:text-primary transition duration-300 relative group"
          >
            Marketplace
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
          </Link>
          <a
            href="#benefits"
            className="hover:text-primary transition duration-300 relative group"
          >
            Benefits
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
          </a>
          <a
            href="#community"
            className="hover:text-primary transition duration-300 relative group"
          >
            Community
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
          </a>
          <ThemeToggle />
          <Link
            href="/auth"
            className="group bg-primary hover:bg-primary/90 text-secondary px-4 py-2 rounded-md transition-all duration-300 font-medium inline-flex items-center"
          >
            <span>Get Started</span>
            <i className="fas fa-arrow-right ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"></i>
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-3">
          <button
            className="flex items-center justify-center w-9 h-9 rounded-md border border-primary/30 hover:border-primary/80 hover:bg-primary/10 transition-all duration-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <i className="fas fa-times text-primary text-lg"></i>
            ) : (
              <i className="fas fa-bars text-primary text-lg"></i>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`
          ${mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0 pointer-events-none"} 
          md:hidden fixed left-0 right-0 top-[51px] bg-background/95 backdrop-blur-md border-t border-primary/20
          transition-all duration-300 ease-in-out transform-gpu overflow-hidden
        `}
      >
        <div className="container mx-auto px-4 py-2 md:px-6 lg:px-8 max-w-7xl flex flex-col space-y-2">
          <a
            href="#features"
            className="py-3 border-b border-border hover:text-primary hover:pl-2 transition-all duration-300 flex items-center"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-6 h-6 rounded-full border border-primary/50 flex items-center justify-center mr-3">
              <span className="font-mono text-primary text-xs">01</span>
            </div>
            <span>Features</span>
            <i className="fas fa-chevron-right ml-auto text-xs text-primary/70"></i>
          </a>
          <a
            href="#solutions"
            className="py-3 border-b border-border hover:text-primary hover:pl-2 transition-all duration-300 flex items-center"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-6 h-6 rounded-full border border-primary/50 flex items-center justify-center mr-3">
              <span className="font-mono text-primary text-xs">02</span>
            </div>
            <span>Solutions</span>
            <i className="fas fa-chevron-right ml-auto text-xs text-primary/70"></i>
          </a>
          <a
            href="#advanced-features"
            className="py-3 border-b border-border hover:text-primary hover:pl-2 transition-all duration-300 flex items-center"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-6 h-6 rounded-full border border-primary/50 flex items-center justify-center mr-3">
              <span className="font-mono text-primary text-xs">03</span>
            </div>
            <span>Platform</span>
            <i className="fas fa-chevron-right ml-auto text-xs text-primary/70"></i>
          </a>
          <Link
            href="/marketplace"
            className="py-3 border-b border-gray-800 hover:text-primary hover:pl-2 transition-all duration-300 flex items-center"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-6 h-6 rounded-full border border-primary/50 flex items-center justify-center mr-3">
              <span className="font-mono text-primary text-xs">04</span>
            </div>
            <span>Marketplace</span>
            <i className="fas fa-chevron-right ml-auto text-xs text-primary/70"></i>
          </Link>
          <a
            href="#benefits"
            className="py-3 border-b border-gray-800 hover:text-primary hover:pl-2 transition-all duration-300 flex items-center"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-6 h-6 rounded-full border border-primary/50 flex items-center justify-center mr-3">
              <span className="font-mono text-primary text-xs">05</span>
            </div>
            <span>Benefits</span>
            <i className="fas fa-chevron-right ml-auto text-xs text-primary/70"></i>
          </a>
          <a
            href="#community"
            className="py-3 border-b border-gray-800 hover:text-primary hover:pl-2 transition-all duration-300 flex items-center"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-6 h-6 rounded-full border border-primary/50 flex items-center justify-center mr-3">
              <span className="font-mono text-primary text-xs">06</span>
            </div>
            <span>Community</span>
            <i className="fas fa-chevron-right ml-auto text-xs text-primary/70"></i>
          </a>
          <Link
            href="/auth"
            className="group bg-secondary hover:bg-primary text-primary hover:text-secondary py-3 rounded-md transition-all duration-300 font-medium text-center mt-2 border border-primary flex items-center justify-center"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>Get Started</span>
            <i className="fas fa-arrow-right ml-2 group-hover:ml-3 transition-all"></i>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
