import { motion } from "framer-motion";

const SolutionShowcase = () => {
  return (
    <section id="solutions" className="py-20 relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621271857589-84189aee5667?ixlib=rb-4.0.3&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h5 className="text-primary uppercase tracking-widest font-semibold mb-2 font-mono">Solutions</h5>
          <h2 className="text-3xl md:text-4xl font-bold font-space mb-4">Comprehensive <span className="text-primary">Agricultural</span> Suite</h2>
          <p className="max-w-2xl mx-auto text-gray-400">Our platform offers integrated solutions for every aspect of modern farming.</p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <div>
            <h3 className="text-2xl font-bold font-space mb-4">AI Crop Analysis & Diagnosis</h3>
            <p className="text-gray-400 mb-6">Upload images from your smartphone to instantly identify diseases, pests, nutrient deficiencies, and growth stages with our advanced computer vision system.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                <span>Disease detection with 99.2% accuracy</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                <span>Personalized treatment recommendations</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                <span>Growth stage monitoring and yield prediction</span>
              </li>
            </ul>
            <a href="#" className="text-primary flex items-center group">
              <span className="mr-2 group-hover:mr-3 transition-all">Learn more about crop analysis</span>
              <i className="fas fa-arrow-right"></i>
            </a>
          </div>
          <div className="relative">
            <div className="rounded-xl overflow-hidden border border-primary/20 shadow-lg shadow-primary/10">
              <img 
                src="https://images.unsplash.com/photo-1612709875071-3d9972bfe9e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=928&q=80" 
                alt="AI analyzing crop health with digital overlay" 
                className="w-full"
              />
            </div>
            <div className="absolute top-4 right-4 bg-secondary/80 backdrop-blur-sm border border-primary/20 rounded-lg p-3 font-mono text-xs">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2"></span>
                <span>AI ANALYSIS ACTIVE</span>
              </div>
              <div className="mt-1 text-[#06E775]">Detecting: Leaf Blight</div>
              <div className="mt-1">Confidence: 97.8%</div>
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
                src="https://images.unsplash.com/photo-1620127682229-33388276e540?ixlib=rb-4.0.3&auto=format&fit=crop&w=928&q=80" 
                alt="IoT sensors in agricultural field with data visualization" 
                className="w-full"
              />
            </div>
            <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
              <div className="bg-secondary/80 backdrop-blur-sm border border-primary/20 rounded-full h-24 w-24 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-primary font-bold text-xl">24.3°C</div>
                  <div className="text-xs font-mono mt-1">Soil Temp</div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 right-4 bg-secondary/80 backdrop-blur-sm border border-primary/20 rounded-lg p-3 font-mono text-xs">
              <div className="mb-1">Humidity: 68%</div>
              <div>Moisture: 42%</div>
              <div className="mt-1 text-[#06E775]">Status: Optimal</div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h3 className="text-2xl font-bold font-space mb-4">IoT Environmental Monitoring</h3>
            <p className="text-gray-400 mb-6">Deploy our network of smart sensors to continuously monitor soil conditions, weather patterns, and environmental factors affecting your crops.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                <span>Real-time soil moisture, temperature, and nutrient tracking</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                <span>Automated irrigation and fertigation control</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                <span>Early warning system for environmental changes</span>
              </li>
            </ul>
            <a href="#" className="text-primary flex items-center group">
              <span className="mr-2 group-hover:mr-3 transition-all">Explore IoT solutions</span>
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
            <h3 className="text-2xl font-bold font-space mb-4">Blockchain Supply Chain</h3>
            <p className="text-gray-400 mb-6">Track your products from farm to consumer with our tamper-proof blockchain technology, building trust and commanding premium prices.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                <span>QR code tracking for consumer transparency</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                <span>Certification and compliance documentation</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                <span>Smart contracts for automated payments</span>
              </li>
            </ul>
            <a href="#" className="text-primary flex items-center group">
              <span className="mr-2 group-hover:mr-3 transition-all">Learn about blockchain traceability</span>
              <i className="fas fa-arrow-right"></i>
            </a>
          </div>
          <div className="relative">
            <div className="rounded-xl overflow-hidden border border-primary/20 shadow-lg shadow-primary/10">
              <img 
                src="https://images.unsplash.com/photo-1561414927-6d86591d0c4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=928&q=80" 
                alt="Digital representation of blockchain in agriculture" 
                className="w-full"
              />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-secondary/80 backdrop-blur-md border border-primary/20 rounded-xl p-4 max-w-xs">
              <div className="flex items-center mb-2">
                <i className="fas fa-shield-alt text-primary mr-2"></i>
                <span className="font-bold font-space">Verified Product Journey</span>
              </div>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  <span>Harvested: June 12, 2023</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  <span>Processed: June 13, 2023</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  <span>Shipped: June 15, 2023</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-truck text-[#06E775] mr-2"></i>
                  <span>In Transit: Est. Arrival June 18</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SolutionShowcase;
