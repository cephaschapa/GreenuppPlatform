import { motion } from "framer-motion";
import droneFieldImage from "../assets/drone-field.svg";

const Hero = () => {
  return (
    <header className="pt-28 pb-24 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20" 
        style={{
          backgroundImage: "radial-gradient(#00CC66 1px, transparent 1px)",
          backgroundSize: "20px 20px"
        }}
      />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="order-2 md:order-1">
            <h5 className="text-primary uppercase tracking-widest font-semibold mb-2 font-mono">AI-Powered Farming</h5>
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-space mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              The Future of <span className="bg-gradient-to-r from-[#00CC66] to-[#06E775] bg-clip-text text-transparent">Agriculture</span> Is Here
            </motion.h1>
            <motion.p 
              className="text-lg mb-8 text-gray-300 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Greenupp transforms traditional farming through AI, IoT, and blockchain technologies, enhancing productivity, sustainability, and profitability for farmers and livestock owners.
            </motion.p>
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <a href="#contact" className="bg-primary hover:bg-[#06E775] text-secondary px-8 py-3 rounded-md transition duration-300 font-medium inline-block">
                Start Free Trial
              </a>
              <a href="#features" className="border border-primary/50 hover:border-primary bg-[#2D2D2D] hover:bg-secondary px-8 py-3 rounded-md transition duration-300 font-medium inline-block">
                Explore Features
              </a>
            </motion.div>
            
            <motion.div 
              className="mt-10 flex items-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full border-2 border-secondary bg-gray-500"></div>
                <div className="w-10 h-10 rounded-full border-2 border-secondary bg-gray-500"></div>
                <div className="w-10 h-10 rounded-full border-2 border-secondary bg-gray-500"></div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Trusted by <span className="text-primary font-semibold">2,500+</span> farmers worldwide</p>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="order-1 md:order-2 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-lg shadow-primary/10"
              style={{ animation: "float 3s ease-in-out infinite" }}
            >
              <img 
                src={droneFieldImage} 
                alt="Futuristic farming with drone monitoring a green field" 
                className="w-full h-auto rounded-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-secondary to-transparent p-6">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="font-mono text-[#06E775]">AI monitoring active</span>
                </div>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
