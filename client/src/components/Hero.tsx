import { motion } from "framer-motion";
import droneFieldImage from "../assets/drone-field.svg";
import { Link } from "wouter";

const Hero = () => {
  return (
    <header className="pt-24 md:pt-28 pb-16 md:pb-24 relative overflow-hidden bg-background">
      <div className="absolute inset-0 z-0 opacity-20" 
        style={{
          backgroundImage: "radial-gradient(var(--primary) 1px, transparent 1px)",
          backgroundSize: "20px 20px"
        }}
      />
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
          <div className="order-2 md:order-1 text-center md:text-left">
            <h5 className="text-primary uppercase tracking-widest font-semibold mb-2 font-mono text-sm md:text-base">AI-Powered Farming</h5>
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-space mb-4 md:mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              The Future of <span className="bg-gradient-to-r from-[#00CC66] to-[#06E775] bg-clip-text text-transparent">Agriculture</span> Is Here
            </motion.h1>
            <motion.p 
              className="text-base md:text-lg mb-6 md:mb-8 text-muted-foreground leading-relaxed max-w-xl mx-auto md:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Greenupp transforms traditional farming through AI, IoT, and blockchain technologies, enhancing productivity, sustainability, and profitability for farmers and livestock owners.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href="/auth" className="group bg-primary hover:bg-primary/90 text-secondary px-6 sm:px-8 py-3 rounded-md transition-all duration-300 font-medium inline-flex items-center justify-center">
                <span>Get Started</span>
                <i className="fas fa-arrow-right ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"></i>
              </Link>
              <a href="#features" className="border border-primary/50 hover:border-primary bg-muted/50 hover:bg-muted px-6 sm:px-8 py-3 rounded-md transition-all duration-300 font-medium inline-flex items-center justify-center">
                <span>Explore Features</span>
                <i className="fas fa-chevron-down ml-2 text-xs text-primary"></i>
              </a>
            </motion.div>
            
            <motion.div 
              className="mt-8 md:mt-10 flex items-center justify-center md:justify-start gap-4 md:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex -space-x-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-background bg-muted"></div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-background bg-muted"></div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-background bg-muted"></div>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Trusted by <span className="text-primary font-semibold">2,500+</span> farmers worldwide</p>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="order-1 md:order-2 relative max-w-md mx-auto md:max-w-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-lg shadow-primary/10 z-10"
              style={{ animation: "float 3s ease-in-out infinite" }}
            >
              <img 
                src={droneFieldImage} 
                alt="Futuristic farming with drone monitoring a green field" 
                className="w-full h-auto rounded-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-card/90 to-transparent p-4 md:p-6">
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="font-mono text-primary">AI monitoring active</span>
                </div>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
            
            {/* Tech elements decoration */}
            <div className="absolute -top-2 -left-2 w-8 h-8 md:w-12 md:h-12 border border-primary/40 rounded-lg z-0 backdrop-blur-sm bg-card/80 hidden md:flex items-center justify-center">
              <span className="text-xs md:text-sm font-mono text-primary">AI</span>
            </div>
            <div className="absolute top-1/4 -right-3 w-8 h-8 md:w-12 md:h-12 border border-primary/40 rounded-lg z-0 backdrop-blur-sm bg-card/80 hidden md:flex items-center justify-center rotate-12">
              <span className="text-xs md:text-sm font-mono text-primary">IoT</span>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
