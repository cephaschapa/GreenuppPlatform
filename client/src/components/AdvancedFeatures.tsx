import { motion } from "framer-motion";

// Currently implemented features
const generalFeatures = [
  {
    icon: "fas fa-users",
    title: "Green Socials Platform",
    description: "A fully functional social network where farmers share experiences, follow experts, and build an agricultural community with posts, comments, and reactions."
  },
  {
    icon: "fas fa-comment-dots",
    title: "Stream Chat",
    description: "Reliable real-time messaging system that enables direct communication between farmers, experts, and support staff with message history and notifications."
  },
  {
    icon: "fas fa-link",
    title: "CropTrace",
    description: "Blockchain-based system to trace the journey of crops from farm to table, ensuring transparency and trust in the supply chain with immutable records."
  },
  {
    icon: "fas fa-store",
    title: "Agricultural Marketplace",
    description: "A comprehensive marketplace where farmers can buy and sell agricultural products with location-based listings, secure checkout, and integrated messaging."
  },
  {
    icon: "fas fa-bell",
    title: "Smart Notifications",
    description: "Intelligent notification system that keeps users informed about social interactions, marketplace updates, chat messages and platform activities."
  },
  {
    icon: "fas fa-shopping-cart",
    title: "Cart Management",
    description: "Seamless shopping experience with a fully functional cart system allowing users to add items, adjust quantities, and proceed to checkout."
  }
];

// Specialized features (Phase 2)
const specializedFeatures = [
  {
    icon: "fas fa-satellite",
    title: "Real-time Data Capture",
    description: "Utilizing IoT devices and sensors to collect data on soil health, weather conditions, crop growth, and other key metrics for actionable insights."
  },
  {
    icon: "fas fa-map-marked-alt",
    title: "Field Mapping",
    description: "Advanced GPS and satellite imaging technology to create detailed farm field maps, enabling precision farming techniques and efficient resource allocation."
  },
  {
    icon: "fas fa-drone",
    title: "Drone Plant Monitoring",
    description: "Deployment of drones with cameras and sensors to monitor crop health, identify issues, and assess plant growth in real-time."
  },
  {
    icon: "fas fa-chart-network",
    title: "ERP System",
    description: "A comprehensive Enterprise Resource Planning system to manage all aspects of farm operations, ensuring efficient and streamlined processes."
  },
  {
    icon: "fas fa-seedling",
    title: "Crop Management",
    description: "Tools for planning and managing crop cycles, including planting schedules, irrigation needs, fertilization plans, and harvest timelines."
  },
  {
    icon: "fas fa-graduation-cap",
    title: "Training & Support",
    description: "Access to educational resources, tutorials, and expert consultations to help farmers improve skills and adopt new technologies."
  }
];

const AdvancedFeatures = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
    <section id="advanced-features" className="py-16 md:py-20 bg-muted relative">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        {/* Phase 1 Features */}
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider mb-3">AVAILABLE FEATURES</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-space mb-4">Current <span className="text-primary">Platform</span> Capabilities</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-sm md:text-base">Explore the robust features already implemented in our agricultural platform, designed to enhance productivity and connectivity.</p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {generalFeatures.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-card rounded-xl p-5 sm:p-6 border border-primary/20 transition-all duration-300 h-full flex flex-col hover:shadow-lg hover:shadow-primary/10 group relative overflow-hidden"
              variants={itemVariants}
            >
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-primary/20 transition-colors">
                  <i className={`${feature.icon} text-primary text-xl sm:text-2xl`}></i>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-space mb-2 sm:mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 flex-grow">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Features */}
        <motion.div 
          className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-card p-5 sm:p-6 rounded-xl border border-primary/20 relative overflow-hidden group hover:shadow-lg hover:shadow-primary/10 transition-all">
            <div className="relative z-10">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-images text-primary"></i>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-space group-hover:text-primary transition-colors">Social Media Stories</h3>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-5">Share temporary content with the agricultural community through our Stories feature. Post images and updates that automatically disappear after 24 hours.</p>
              <div className="flex flex-wrap gap-2">
                <div className="bg-muted rounded-lg px-3 py-1 text-xs sm:text-sm flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  24-hour Stories
                </div>
                <div className="bg-muted rounded-lg px-3 py-1 text-xs sm:text-sm flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Image Sharing
                </div>
                <div className="bg-muted rounded-lg px-3 py-1 text-xs sm:text-sm flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Story Viewer
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
          </div>
          
          <div className="bg-card p-5 sm:p-6 rounded-xl border border-primary/20 relative overflow-hidden group hover:shadow-lg hover:shadow-primary/10 transition-all">
            <div className="relative z-10">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-newspaper text-primary"></i>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-space group-hover:text-primary transition-colors">News Feed</h3>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-5">Stay updated with the latest agricultural news, trends, and innovations through our personalized news feed tailored to your farming interests.</p>
              
              <div className="space-y-2 mb-4">
                <div className="bg-muted rounded-lg p-2 flex items-start">
                  <i className="fas fa-leaf text-green-500 mt-1 mr-2"></i>
                  <div>
                    <p className="text-xs font-medium">Sustainable Farming</p>
                    <p className="text-xs text-muted-foreground">New organic farming techniques gain popularity</p>
                  </div>
                </div>
                
                <div className="bg-muted rounded-lg p-2 flex items-start">
                  <i className="fas fa-tractor text-blue-500 mt-1 mr-2"></i>
                  <div>
                    <p className="text-xs font-medium">Technology Update</p>
                    <p className="text-xs text-muted-foreground">Smart irrigation systems reduce water usage by 30%</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </motion.div>
        
        {/* Phase 2 Features */}
        <motion.div 
          className="text-center mb-12 md:mb-16 mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider mb-3">COMING SOON</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-space mb-4">Greenupp <span className="text-primary">2.0</span></h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-sm md:text-base">A tailored interface designed specifically for farmers, focusing on ease of use and access to critical farming tools and data.</p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {specializedFeatures.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-card/90 rounded-xl p-5 sm:p-6 border border-primary/20 transition-all duration-300 h-full flex flex-col hover:shadow-lg hover:shadow-primary/10 group relative overflow-hidden backdrop-blur-sm"
              variants={itemVariants}
            >
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-primary/20 transition-colors">
                  <i className={`${feature.icon} text-primary text-xl sm:text-2xl`}></i>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-space mb-2 sm:mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 flex-grow">{feature.description}</p>
              </div>
              
              <div className="mt-auto pt-3 border-t border-border/50">
                <span className="text-xs font-mono text-primary/70">Coming in Phase 2</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AdvancedFeatures;