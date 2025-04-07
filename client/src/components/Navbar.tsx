import { FC } from "react";
import { Link } from "wouter";

interface NavbarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const Navbar: FC<NavbarProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  return (
    <nav className="fixed w-full bg-secondary/90 backdrop-blur-md z-50 border-b border-primary/20">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-primary text-3xl mr-1">
            <i className="fas fa-leaf"></i>
          </div>
          <Link href="/" className="text-2xl font-bold font-space tracking-wider">
            Green<span className="text-primary">upp</span>
          </Link>
        </div>
        
        <div className="hidden md:flex space-x-8 items-center">
          <a href="#features" className="hover:text-primary transition duration-300">Features</a>
          <a href="#solutions" className="hover:text-primary transition duration-300">Solutions</a>
          <a href="#benefits" className="hover:text-primary transition duration-300">Benefits</a>
          <a href="#community" className="hover:text-primary transition duration-300">Community</a>
          <a href="#contact" className="bg-primary hover:bg-primary-light text-secondary px-5 py-2 rounded-md transition duration-300 font-medium">Get Started</a>
        </div>
        
        <button 
          className="md:hidden text-2xl" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>
      
      {/* Mobile Menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-secondary-light border-t border-primary/20 py-4`}>
        <div className="container mx-auto px-4 flex flex-col space-y-4">
          <a href="#features" className="py-2 hover:text-primary transition duration-300">Features</a>
          <a href="#solutions" className="py-2 hover:text-primary transition duration-300">Solutions</a>
          <a href="#benefits" className="py-2 hover:text-primary transition duration-300">Benefits</a>
          <a href="#community" className="py-2 hover:text-primary transition duration-300">Community</a>
          <a href="#contact" className="bg-primary hover:bg-primary-light text-secondary py-2 rounded-md transition duration-300 font-medium text-center mt-2">Get Started</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
