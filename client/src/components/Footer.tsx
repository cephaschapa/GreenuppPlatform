import { Logo } from "./Logo";

const Footer = () => {
  return (
    <footer className="bg-secondary py-16 border-t border-primary/20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Logo size="lg" href="/" />
            </div>
            <p className="text-gray-400 mb-6 max-w-md">Empowering farmers with cutting-edge technology to transform agriculture for a sustainable and profitable future.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition duration-300">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition duration-300">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition duration-300">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition duration-300">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition duration-300">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-lg">Solutions</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-primary transition duration-300">AI Crop Analysis</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition duration-300">IoT Sensor Network</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition duration-300">Blockchain Traceability</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition duration-300">Weather Forecasting</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition duration-300">Digital Marketplace</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-lg">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-primary transition duration-300">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition duration-300">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition duration-300">Press</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition duration-300">Sustainability</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition duration-300">Partners</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-lg">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-primary transition duration-300">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition duration-300">Knowledge Base</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition duration-300">Community Forum</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition duration-300">Developer API</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition duration-300">Contact Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm mb-2 md:mb-0">&copy; {new Date().getFullYear()} Greenupp Technologies. All rights reserved.</p>
            <p className="text-gray-600 text-xs font-mono mb-4 md:mb-0">
              <span className="mr-1">Engineered by</span>
              <a 
                href="https://www.metatronltd.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:text-primary/80 transition-colors inline-flex items-center"
              >
                Metatron Technologies Ltd
                <span className="ml-1 text-xs opacity-60">↗</span>
              </a>
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="#" className="text-gray-500 hover:text-primary transition duration-300">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-primary transition duration-300">Terms of Service</a>
            <a href="#" className="text-gray-500 hover:text-primary transition duration-300">Cookie Policy</a>
            <a href="#" className="text-gray-500 hover:text-primary transition duration-300">GDPR</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
