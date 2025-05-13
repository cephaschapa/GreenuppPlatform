import { Link } from 'wouter';
import greenuppLogo from "../assets/greenupp-full-logo.png";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <img 
                src={greenuppLogo} 
                alt="Greenupp Logo" 
                className="h-10 w-auto mb-4"
              />
            </div>
            <p className="text-muted-foreground max-w-md mb-6">
              Revolutionizing agriculture through AI-driven technology, blockchain traceability, and comprehensive digital farming solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-twitter text-xl"></i>
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-facebook text-xl"></i>
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-linkedin text-xl"></i>
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <i className="fab fa-instagram text-xl"></i>
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/auth" className="text-muted-foreground hover:text-primary transition-colors">Login</Link>
              </li>
              <li>
                <Link href="/ai-knowledge-base" className="text-muted-foreground hover:text-primary transition-colors">Knowledge Base</Link>
              </li>
              <li>
                <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Contact</h3>
            <address className="not-italic text-muted-foreground space-y-2">
              <p className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-2 text-primary"></i>
                <span>Metatron Technologies<br/>Murex Shopping Complex,<br/>Alick Nkhata Road,<br/>Lusaka, Zambia</span>
              </p>
              <p className="flex items-start">
                <i className="fas fa-envelope mt-1 mr-2 text-primary"></i>
                <span>
                  <a href="mailto:cephas@metatronltd.com" className="hover:text-primary transition-colors">cephas@metatronltd.com</a><br/>
                  <a href="mailto:cephaschapa@gmail.com" className="hover:text-primary transition-colors">cephaschapa@gmail.com</a>
                </span>
              </p>
              <p className="flex items-start">
                <i className="fas fa-phone-alt mt-1 mr-2 text-primary"></i>
                <a href="tel:+260975808750" className="hover:text-primary transition-colors">+260 975 808 750</a>
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Metatron Technologies. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;