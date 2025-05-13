import { motion } from 'framer-motion';
import { Link } from 'wouter';

// Stats to display
const stats = [
  { label: "Active Farmers", value: "5,000+" },
  { label: "Acres Managed", value: "500,000+" },
  { label: "Transactions", value: "120,000+" },
  { label: "Countries", value: "25+" }
];

const CtaSection = () => {
  return (
    <section className="py-16 md:py-24 bg-primary relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-white/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-space mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Join Thousands of Farmers<br className="hidden md:block" /> Revolutionizing Agriculture
          </motion.h2>
          
          <motion.p 
            className="text-white/80 text-lg md:text-xl max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Start your digital farming journey today with our risk-free 30-day trial. 
            No credit card required.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link 
              href="/auth" 
              className="bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-lg text-lg font-medium transition-colors shadow-lg shadow-black/20"
            >
              Get Started Free
            </Link>
            
            <a 
              href="#features" 
              className="border border-white/30 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors backdrop-blur-sm"
            >
              See All Features
            </a>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 flex flex-col items-center"
              >
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-white/70 text-sm md:text-base font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
        
        <motion.div 
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 md:p-8 text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Need Help Getting Started?</h3>
          <p className="text-white/80 mb-6">
            Our agricultural technology experts are available to help you set up your digital farm and answer any questions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors">
              <i className="fas fa-headset"></i>
              <span>Schedule Demo</span>
            </button>
            
            <button className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors">
              <i className="fas fa-phone-alt"></i>
              <span>Contact Sales</span>
            </button>
            
            <button className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-colors">
              <i className="fas fa-envelope"></i>
              <span>Email Support</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;