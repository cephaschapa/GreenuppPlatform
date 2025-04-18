import { motion } from "framer-motion";

// General features (Phase 1)
const generalFeatures = [
  {
    icon: "fas fa-viruses",
    title: "Crop Disease Diagnosis",
    description: "AI-powered tools that use image recognition and sensor data to identify and diagnose crop diseases early, providing treatment recommendations."
  },
  {
    icon: "fas fa-link",
    title: "Crop Tracing",
    description: "Blockchain-based system to trace the journey of crops from farm to table, ensuring transparency and trust in the supply chain."
  },
  {
    icon: "fas fa-store",
    title: "Marketplace",
    description: "An online marketplace where farmers can buy and sell agricultural products, equipment, and supplies, connecting them directly to buyers."
  },
  {
    icon: "fas fa-cloud-sun-rain",
    title: "Weather Service",
    description: "Real-time weather forecasting tailored to specific farm locations, helping farmers plan activities and mitigate risks related to weather conditions."
  },
  {
    icon: "fas fa-users",
    title: "Social Feed & Interaction",
    description: "A social platform for farmers to share experiences, ask for advice, and collaborate on best practices, fostering a community of knowledge sharing."
  },
  {
    icon: "fas fa-robot",
    title: "AI Assistance",
    description: "AI-driven insights and recommendations for improving crop yields, pest management, and resource optimization based on data analysis."
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
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider mb-3">GREENUPP PLATFORM</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-space mb-4">General Purpose <span className="text-primary">Client</span></h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-sm md:text-base">A versatile platform where farmers can manage all aspects of their operations, from monitoring crop health to accessing market prices.</p>
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
                  <i className="fas fa-comment-dots text-primary"></i>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-space group-hover:text-primary transition-colors">Chat Service</h3>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-5">Integrated chat service for instant communication with experts, support teams, and other farmers, facilitating quick problem resolution and information exchange.</p>
              <div className="flex flex-wrap gap-2">
                <div className="bg-muted rounded-lg px-3 py-1 text-xs sm:text-sm flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Expert Support
                </div>
                <div className="bg-muted rounded-lg px-3 py-1 text-xs sm:text-sm flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Community Chat
                </div>
                <div className="bg-muted rounded-lg px-3 py-1 text-xs sm:text-sm flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Voice Calls
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
          </div>
          
          <div className="bg-card p-5 sm:p-6 rounded-xl border border-primary/20 relative overflow-hidden group hover:shadow-lg hover:shadow-primary/10 transition-all">
            <div className="relative z-10">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-bell text-primary"></i>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-space group-hover:text-primary transition-colors">Smart Notifications</h3>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-5">Automated alerts and notifications for important events such as weather changes, market price shifts, pest outbreaks, and more, keeping farmers informed in real-time.</p>
              
              <div className="space-y-2 mb-4">
                <div className="bg-muted rounded-lg p-2 flex items-start">
                  <i className="fas fa-exclamation-triangle text-yellow-500 mt-1 mr-2"></i>
                  <div>
                    <p className="text-xs font-medium">Weather Alert</p>
                    <p className="text-xs text-muted-foreground">Heavy rain expected in your area in 6 hours</p>
                  </div>
                </div>
                
                <div className="bg-muted rounded-lg p-2 flex items-start">
                  <i className="fas fa-chart-line text-green-500 mt-1 mr-2"></i>
                  <div>
                    <p className="text-xs font-medium">Market Update</p>
                    <p className="text-xs text-muted-foreground">Corn prices increased by 5% today</p>
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