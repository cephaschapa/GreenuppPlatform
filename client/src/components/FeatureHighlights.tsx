import { motion } from "framer-motion";

const features = [
  {
    icon: "fas fa-users",
    title: "Green Socials",
    description: "Connect with other farmers and agricultural experts. Share posts, comment, react and follow other users in our agricultural community.",
    metric: "Real-time updates",
    version: "v1.0"
  },
  {
    icon: "fas fa-comment-dots",
    title: "Stream Chat",
    description: "Communicate directly with other farmers and experts through our reliable chat system. Get immediate help and share knowledge.",
    metric: "Instant messaging",
    version: "v1.0"
  },
  {
    icon: "fas fa-link",
    title: "CropTrace Blockchain",
    description: "Secure and transparent supply chain management from farm to table, ensuring product authenticity and quality.",
    metric: "Immutable records",
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
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
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
                    <i className="fas fa-bell text-primary"></i>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-space group-hover:text-primary transition-colors">Smart Notifications</h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-5">Stay updated with real-time notifications about social interactions, marketplace updates, and chat messages.</p>
                <div className="space-y-2 mb-4">
                  <div className="bg-background/80 dark:bg-muted rounded-lg p-2 flex items-start">
                    <i className="fas fa-comment-dots text-blue-500 mt-1 mr-2"></i>
                    <div>
                      <p className="text-xs font-medium">New Message</p>
                      <p className="text-xs text-muted-foreground">John Smith: What crops are you growing this season?</p>
                    </div>
                  </div>
                  
                  <div className="bg-background/80 dark:bg-muted rounded-lg p-2 flex items-start">
                    <i className="fas fa-heart text-red-500 mt-1 mr-2"></i>
                    <div>
                      <p className="text-xs font-medium">Social Update</p>
                      <p className="text-xs text-muted-foreground">Sarah liked your post about sustainable farming</p>
                    </div>
                  </div>
                </div>
                <div className="font-mono text-xs text-primary pt-2 border-t border-border">Notification system: Real-time with smart categorization</div>
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
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlights;
