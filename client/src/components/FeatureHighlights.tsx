import { motion } from "framer-motion";

const features = [
  {
    icon: "fas fa-cloud-sun-rain",
    title: "Weather Intelligence",
    description: "Access real-time weather updates, forecasts, and climate analysis tailored specifically to your farm's location.",
    metric: "Precision forecasting",
    version: "v1.0"
  },
  {
    icon: "fas fa-seedling",
    title: "Smart Farming",
    description: "Receive AI-powered crop recommendations, yield predictions, and growth monitoring to optimize your agricultural operations.",
    metric: "Yield improvement",
    version: "v1.0"
  },
  {
    icon: "fas fa-viruses",
    title: "Plant Diagnosis",
    description: "Identify plant diseases and get treatment recommendations using advanced image recognition and artificial intelligence.",
    metric: "Early detection",
    version: "v1.0"
  },
  {
    icon: "fas fa-link",
    title: "CropTrace Blockchain",
    description: "Track your agricultural products from seed to store with immutable blockchain records that verify authenticity and origin.",
    metric: "Transparent traceability",
    version: "v1.0"
  }
];

const FeatureHighlights = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section id="features" className="py-16 md:py-20 bg-muted relative">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider mb-3">CORE FEATURES</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-space mb-4">Powered by Advanced <span className="text-primary">Technology</span></h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-sm md:text-base">Our comprehensive digital platform integrates cutting-edge technologies to revolutionize agricultural practices.</p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-card rounded-xl p-5 sm:p-6 border border-primary/20 transition-all duration-300 h-full flex flex-col hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 group relative overflow-hidden"
              variants={itemVariants}
            >
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-primary/20 transition-colors">
                  <i className={`${feature.icon} text-primary text-xl sm:text-2xl`}></i>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-space mb-2 sm:mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 flex-grow">{feature.description}</p>
                <div className="flex flex-wrap gap-2 justify-between items-center mt-auto pt-2 border-t border-border">
                  <span className="text-primary text-xs sm:text-sm font-medium">{feature.metric}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground font-mono">{feature.version}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="mt-10 md:mt-16">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider mb-3">ENHANCED SOLUTIONS</div>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-card p-5 sm:p-6 rounded-xl border border-primary/20 relative overflow-hidden group hover:shadow-lg hover:shadow-primary/10 transition-all">
              <div className="relative z-10">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-users text-primary"></i>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-space group-hover:text-primary transition-colors">Green Socials Network</h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-5">Connect with farmers worldwide through our specialized agricultural social network with posts, comments, and sharing.</p>
                <div className="space-y-2 mb-4">
                  <div className="bg-background/80 dark:bg-muted rounded-lg p-2 flex items-start">
                    <i className="fas fa-newspaper text-blue-500 mt-1 mr-2"></i>
                    <div>
                      <p className="text-xs font-medium">News Feed</p>
                      <p className="text-xs text-muted-foreground">Follow updates from your agricultural community</p>
                    </div>
                  </div>
                  
                  <div className="bg-background/80 dark:bg-muted rounded-lg p-2 flex items-start">
                    <i className="fas fa-user-friends text-green-500 mt-1 mr-2"></i>
                    <div>
                      <p className="text-xs font-medium">Community Building</p>
                      <p className="text-xs text-muted-foreground">Connect with other farmers and agricultural experts</p>
                    </div>
                  </div>
                </div>
                <div className="font-mono text-xs text-primary pt-2 border-t border-border">Social platform: Knowledge sharing and community support</div>
              </div>
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            <div className="bg-card p-5 sm:p-6 rounded-xl border border-primary/20 relative overflow-hidden group hover:shadow-lg hover:shadow-primary/10 transition-all">
              <div className="relative z-10">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-store text-primary"></i>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-space group-hover:text-primary transition-colors">Agricultural Marketplace</h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-5">Buy and sell agricultural products with location-based services that connect you with nearby farmers and suppliers.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="bg-background/80 dark:bg-muted rounded-lg px-3 py-1 text-xs sm:text-sm flex items-center border border-border">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Verified Sellers
                  </div>
                  <div className="bg-background/80 dark:bg-muted rounded-lg px-3 py-1 text-xs sm:text-sm flex items-center border border-border">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Distance Estimation
                  </div>
                  <div className="bg-background/80 dark:bg-muted rounded-lg px-3 py-1 text-xs sm:text-sm flex items-center border border-border">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Product Reviews
                  </div>
                </div>
                <div className="font-mono text-xs text-primary pt-2 border-t border-border">Built-in cart functionality with seamless checkout process</div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 gap-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-card p-5 sm:p-6 rounded-xl border border-primary/20 relative overflow-hidden group hover:shadow-lg hover:shadow-primary/10 transition-all">
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <i className="fas fa-comment-dots text-primary"></i>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold font-space group-hover:text-primary transition-colors">Stream Chat Platform</h3>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground mb-5">Communicate seamlessly with fellow farmers and experts through our reliable direct messaging system.</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="bg-background/80 dark:bg-muted rounded-lg p-2 flex items-start">
                      <i className="fas fa-comment-alt text-violet-500 mt-1 mr-2"></i>
                      <div>
                        <p className="text-xs font-medium">Private Messaging</p>
                        <p className="text-xs text-muted-foreground">Secure one-on-one conversations with other users</p>
                      </div>
                    </div>
                    
                    <div className="bg-background/80 dark:bg-muted rounded-lg p-2 flex items-start">
                      <i className="fas fa-bell text-amber-500 mt-1 mr-2"></i>
                      <div>
                        <p className="text-xs font-medium">Smart Notifications</p>
                        <p className="text-xs text-muted-foreground">Get alerted about new messages and important updates</p>
                      </div>
                    </div>
                  </div>
                  <div className="font-mono text-xs text-primary pt-2 border-t border-border">Messaging system: Reliable with offline support</div>
                </div>
                
                <div className="relative bg-background/50 dark:bg-muted/30 rounded-lg p-3 border border-border h-full flex flex-col">
                  <div className="font-medium text-xs mb-3 pb-2 border-b border-border">Chat Preview</div>
                  <div className="space-y-3 flex-grow overflow-hidden">
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex-shrink-0 mr-2"></div>
                      <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg px-3 py-2 text-xs max-w-[80%]">
                        <p>Hi there! How's your corn crop doing with the recent rainfall?</p>
                      </div>
                    </div>
                    <div className="flex items-start justify-end">
                      <div className="bg-primary/10 rounded-lg px-3 py-2 text-xs max-w-[80%]">
                        <p>It's doing well! The rainfall has actually helped with growth.</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex-shrink-0 ml-2"></div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-border flex">
                    <div className="bg-background dark:bg-muted rounded flex-grow h-6 mr-2"></div>
                    <div className="w-6 h-6 rounded-full bg-primary/70 flex items-center justify-center">
                      <i className="fas fa-paper-plane text-background text-[10px]"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlights;
