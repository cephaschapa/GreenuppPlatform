import { motion } from "framer-motion";

const features = [
  {
    icon: "fas fa-robot",
    title: "AI-Driven Diagnostics",
    description: "Instant crop and livestock health diagnosis using advanced computer vision and machine learning algorithms.",
    metric: "99.2% accuracy",
    version: "v4.2.1"
  },
  {
    icon: "fas fa-microchip",
    title: "IoT Sensor Network",
    description: "Real-time environmental monitoring with smart sensors that track soil health, moisture, temperature, and more.",
    metric: "24/7 monitoring",
    version: "hardware v2"
  },
  {
    icon: "fas fa-link",
    title: "Blockchain Traceability",
    description: "Secure and transparent supply chain management from farm to table, ensuring product authenticity and quality.",
    metric: "Immutable records",
    version: "hash-secured"
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
    <section id="features" className="py-20 bg-[#2D2D2D] relative">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-space mb-4">Powered by Advanced <span className="text-primary">Technology</span></h2>
          <p className="max-w-2xl mx-auto text-gray-400">Our comprehensive digital platform integrates cutting-edge technologies to revolutionize agricultural practices.</p>
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
              className="bg-secondary rounded-xl p-6 border border-primary/20 transition duration-300 h-full flex flex-col hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
              variants={itemVariants}
            >
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-5">
                <i className={`${feature.icon} text-primary text-2xl`}></i>
              </div>
              <h3 className="text-xl font-bold font-space mb-3">{feature.title}</h3>
              <p className="text-gray-400 mb-4 flex-grow">{feature.description}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-primary text-sm font-medium">{feature.metric}</span>
                <span className="text-sm text-gray-500 font-mono">{feature.version}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-secondary p-6 rounded-xl border border-primary/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold font-space mb-4">Weather Forecasting & Analytics</h3>
              <p className="text-gray-400 mb-6">Advanced predictive models provide hyperlocal weather forecasts tailored to your farm's exact location.</p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-[#2D2D2D] rounded-lg p-3 text-center">
                  <i className="fas fa-sun text-yellow-400 mb-1"></i>
                  <p className="text-xs">Mon</p>
                  <p className="text-sm font-medium">24°C</p>
                </div>
                <div className="bg-[#2D2D2D] rounded-lg p-3 text-center">
                  <i className="fas fa-cloud-sun text-gray-400 mb-1"></i>
                  <p className="text-xs">Tue</p>
                  <p className="text-sm font-medium">22°C</p>
                </div>
                <div className="bg-[#2D2D2D] rounded-lg p-3 text-center">
                  <i className="fas fa-cloud-rain text-blue-400 mb-1"></i>
                  <p className="text-xs">Wed</p>
                  <p className="text-sm font-medium">18°C</p>
                </div>
                <div className="bg-[#2D2D2D] rounded-lg p-3 text-center">
                  <i className="fas fa-sun text-yellow-400 mb-1"></i>
                  <p className="text-xs">Thu</p>
                  <p className="text-sm font-medium">23°C</p>
                </div>
              </div>
              <div className="font-mono text-xs text-gray-500">Next rainfall prediction: 21 hours | Accuracy 94%</div>
            </div>
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-xl"></div>
          </div>
          
          <div className="bg-secondary p-6 rounded-xl border border-primary/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold font-space mb-4">Digital Marketplace</h3>
              <p className="text-gray-400 mb-6">Connect directly with buyers and eliminate middlemen to increase your profits.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="bg-[#2D2D2D] rounded-lg px-3 py-1 text-sm flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Verified Buyers
                </div>
                <div className="bg-[#2D2D2D] rounded-lg px-3 py-1 text-sm flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Secure Payments
                </div>
                <div className="bg-[#2D2D2D] rounded-lg px-3 py-1 text-sm flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Smart Contracts
                </div>
              </div>
              <div className="font-mono text-xs text-primary">Average profit increase: +24% compared to traditional channels</div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-xl"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureHighlights;
