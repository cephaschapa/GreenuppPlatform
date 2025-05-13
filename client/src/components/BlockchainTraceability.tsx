import { motion } from 'framer-motion';

const BlockchainTraceability = () => {
  return (
    <section className="py-16 md:py-24 bg-muted relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider mb-3">BLOCKCHAIN VERIFICATION</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-space mb-6">Track Your Crops <span className="text-primary">From Seed to Sale</span></h2>
            
            <p className="text-muted-foreground mb-8">
              Greenupp's CropTrace blockchain system creates an immutable record of your agricultural products throughout their lifecycle, providing transparency, authenticity verification, and building consumer trust.
            </p>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center mt-1 mr-4 border border-border">
                  <i className="fas fa-shield-alt text-primary"></i>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Tamper-Proof Records</h3>
                  <p className="text-sm text-muted-foreground">
                    Every action, from planting to harvesting to distribution, is permanently recorded on the blockchain, creating an unalterable history of your products.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center mt-1 mr-4 border border-border">
                  <i className="fas fa-qrcode text-primary"></i>
                </div>
                <div>
                  <h3 className="font-medium mb-1">QR Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate unique QR codes for your products that buyers can scan to instantly verify authenticity, growing conditions, and handling practices.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center mt-1 mr-4 border border-border">
                  <i className="fas fa-tag text-primary"></i>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Premium Pricing</h3>
                  <p className="text-sm text-muted-foreground">
                    Blockchain-verified products command up to 15% higher prices, as consumers are willing to pay more for guaranteed authenticity and ethical production.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md transition-colors inline-flex items-center justify-center group">
                <span>Learn About CropTrace</span>
                <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
              </button>
              
              <button className="border border-primary/50 hover:border-primary bg-transparent hover:bg-primary/5 px-6 py-3 rounded-md transition-colors inline-flex items-center justify-center">
                <i className="fas fa-play-circle mr-2 text-primary"></i>
                <span>Watch Demo</span>
              </button>
            </div>
          </motion.div>
          
          {/* Right side - Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-card rounded-xl border border-primary/20 shadow-xl shadow-primary/10 p-6 md:p-8 overflow-hidden">
              {/* Flow diagram */}
              <div className="relative">
                <div className="absolute h-full w-1 bg-muted left-[30px] top-0 hidden sm:block z-0"></div>
                
                {/* Step 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="flex items-start mb-10 relative z-10"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center border-4 border-card">
                    <i className="fas fa-seedling text-primary text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-lg mb-2">Planting & Growth</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Record seed type, planting date, soil conditions, and field location, creating the first block in your crop's blockchain.
                    </p>
                    <div className="bg-background/50 rounded-lg p-3 text-xs border border-border">
                      <div className="flex items-center mb-1">
                        <i className="fas fa-hashtag text-primary mr-2"></i>
                        <span className="font-mono">Block #1: 0x8e7c1f...</span>
                      </div>
                      <span>Seed: Organic Heirloom Tomato, Planted: May 10, 2023</span>
                    </div>
                  </div>
                </motion.div>
                
                {/* Step 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="flex items-start mb-10 relative z-10"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 flex-shrink-0 flex items-center justify-center border-4 border-card">
                    <i className="fas fa-clipboard-list text-blue-500 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-lg mb-2">Care & Maintenance</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Log all treatments, irrigation, and farming practices throughout the growing season.
                    </p>
                    <div className="bg-background/50 rounded-lg p-3 text-xs border border-border">
                      <div className="flex items-center mb-1">
                        <i className="fas fa-hashtag text-blue-500 mr-2"></i>
                        <span className="font-mono">Block #8: 0x3a6b2d...</span>
                      </div>
                      <span>Organic compost application, Integrated pest management</span>
                    </div>
                  </div>
                </motion.div>
                
                {/* Step 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="flex items-start mb-10 relative z-10"
                >
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 flex-shrink-0 flex items-center justify-center border-4 border-card">
                    <i className="fas fa-box-open text-amber-500 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-lg mb-2">Harvest & Processing</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Document harvest date, yield, quality metrics, and post-harvest handling procedures.
                    </p>
                    <div className="bg-background/50 rounded-lg p-3 text-xs border border-border">
                      <div className="flex items-center mb-1">
                        <i className="fas fa-hashtag text-amber-500 mr-2"></i>
                        <span className="font-mono">Block #23: 0xf92c5a...</span>
                      </div>
                      <span>Harvested: Aug 15, 2023, Yield: 28kg, Grade A quality</span>
                    </div>
                  </div>
                </motion.div>
                
                {/* Step 4 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="flex items-start relative z-10"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex-shrink-0 flex items-center justify-center border-4 border-card">
                    <i className="fas fa-qrcode text-green-500 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-lg mb-2">Verification & Sale</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Generate QR codes for marketplace listings, enabling customers to verify the complete history of your products.
                    </p>
                    <div className="bg-background/50 rounded-lg p-3 border border-border relative overflow-hidden">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-white p-1 rounded flex items-center justify-center flex-shrink-0">
                          <div className="w-full h-full border border-black grid grid-cols-4 grid-rows-4 gap-px">
                            {Array(16).fill(0).map((_, i) => (
                              <div key={i} className={`bg-black ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`}></div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col justify-center">
                          <div className="text-xs font-medium mb-1">Scan to verify authenticity</div>
                          <div className="text-[10px] text-muted-foreground">
                            Product ID: ORG-TOM-23-42A<br />
                            Farm: Green Valley Organics<br />
                            <span className="text-green-500">✓ Verified by Hyperledger Fabric</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Tech badges */}
            <div className="absolute -bottom-4 -right-4 md:bottom-4 md:right-4 flex gap-2">
              <div className="bg-card/80 backdrop-blur-sm px-3 py-1 rounded-full border border-primary/20 text-xs font-mono shadow-md">
                Hyperledger Fabric
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BlockchainTraceability;