import { motion } from "framer-motion";
import aiCropAnalysisSvg from "../assets/ai-crop-analysis.svg";

const SolutionShowcase = () => {
  return (
    <section id="solutions" className="py-20 relative bg-background">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621271857589-84189aee5667?ixlib=rb-4.0.3&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h5 className="text-primary uppercase tracking-widest font-semibold mb-2 font-mono">Solutions</h5>
          <h2 className="text-3xl md:text-4xl font-bold font-space mb-4">Implemented <span className="text-primary">Platform</span> Features</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground">Explore the powerful features already available in our agricultural platform.</p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <div>
            <h3 className="text-2xl font-bold font-space mb-4">Green Socials Platform</h3>
            <p className="text-muted-foreground mb-6">Connect with other agricultural professionals through our robust social platform designed specifically for farmers and agribusiness.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                <span>Post updates, images, and agricultural tips</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                <span>Comment and react to other farmers' content</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                <span>Follow experts and receive notifications</span>
              </li>
            </ul>
            <a href="#" className="text-primary flex items-center group">
              <span className="mr-2 group-hover:mr-3 transition-all">Explore Green Socials</span>
              <i className="fas fa-arrow-right"></i>
            </a>
          </div>
          <div className="relative">
            <div className="rounded-xl overflow-hidden border border-primary/20 shadow-lg shadow-primary/10 bg-muted">
              <img 
                src="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80" 
                alt="Farmers sharing knowledge on digital platform" 
                className="w-full"
              />
            </div>
            <div className="absolute top-4 right-4 bg-secondary/80 backdrop-blur-sm border border-primary/20 rounded-lg p-3 font-mono text-xs">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                <span>SOCIAL FEED ACTIVE</span>
              </div>
              <div className="mt-1 text-[#06E775]">New posts: 5</div>
              <div className="mt-1">Followers: 128</div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <div className="order-2 md:order-1 relative">
            <div className="rounded-xl overflow-hidden border border-primary/20 shadow-lg shadow-primary/10">
              <img 
                src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=928&q=80" 
                alt="Farmers communicating through digital platform" 
                className="w-full"
              />
            </div>
            <div className="absolute bottom-4 right-4 bg-secondary/80 backdrop-blur-sm border border-primary/20 rounded-lg p-3 font-mono text-xs">
              <div className="flex items-center mb-1">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span>2 Users Online</span>
              </div>
              <div>Last message: 2m ago</div>
              <div className="mt-1 text-[#06E775]">New messages: 3</div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h3 className="text-2xl font-bold font-space mb-4">Stream Chat Messaging</h3>
            <p className="text-muted-foreground mb-6">Communicate instantly with fellow farmers, agricultural experts, and support staff through our reliable chat platform.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                <span>Private direct messaging with other users</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                <span>Reliable message delivery and history</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                <span>Mobile and desktop notifications</span>
              </li>
            </ul>
            <a href="#" className="text-primary flex items-center group">
              <span className="mr-2 group-hover:mr-3 transition-all">Start chatting now</span>
              <i className="fas fa-arrow-right"></i>
            </a>
          </div>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <div>
            <h3 className="text-2xl font-bold font-space mb-4">Agricultural Marketplace</h3>
            <p className="text-muted-foreground mb-6">Buy and sell agricultural products, equipment, and supplies through our specialized marketplace designed for the farming community.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                <span>Location-based listings with distance estimation</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                <span>Direct messaging with sellers and buyers</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                <span>Integrated shopping cart and checkout</span>
              </li>
            </ul>
            <a href="#" className="text-primary flex items-center group">
              <span className="mr-2 group-hover:mr-3 transition-all">Browse the marketplace</span>
              <i className="fas fa-arrow-right"></i>
            </a>
          </div>
          <div className="relative">
            <div className="rounded-xl overflow-hidden border border-primary/20 shadow-lg shadow-primary/10">
              <img 
                src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=928&q=80" 
                alt="Agricultural marketplace with various products" 
                className="w-full"
              />
            </div>
            <div className="absolute top-4 right-4 bg-secondary/80 backdrop-blur-sm border border-primary/20 rounded-lg p-3 font-mono text-xs">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span>VERIFIED SELLER</span>
              </div>
              <div className="mt-1">Rating: ★★★★★</div>
              <div className="mt-1 text-[#06E775]">12.3km away</div>
            </div>
            <div className="absolute bottom-4 left-4 bg-secondary/80 backdrop-blur-sm border border-primary/20 rounded-lg p-3 font-mono text-xs">
              <div className="font-bold mb-1">Organic Seeds</div>
              <div>$24.99 per kg</div>
              <div className="text-[#06E775] mt-1">In stock: 48 units</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SolutionShowcase;
