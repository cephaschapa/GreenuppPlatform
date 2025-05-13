import { motion } from "framer-motion";
import droneFieldImage from "../assets/drone-field.svg";
import greenuppLogo from "../assets/greenupp-full-logo.png";
import { Link } from "wouter";

const Hero = () => {
  return (
    <header className="pt-24 md:pt-28 pb-16 md:pb-24 relative overflow-hidden bg-background">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-20" 
        style={{
          backgroundImage: "radial-gradient(var(--primary) 1px, transparent 1px)",
          backgroundSize: "20px 20px"
        }}
      />
      
      {/* Decorative blur elements */}
      <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
          {/* Left column - Value proposition */}
          <div className="order-2 md:order-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-primary text-xs font-mono tracking-wider">AI-POWERED PLATFORM</span>
              </div>
            </div>
            
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-space mb-4 md:mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Transform Your Farm with <span className="bg-gradient-to-r from-[#00CC66] to-[#06E775] bg-clip-text text-transparent">AI-Powered Intelligence</span>
            </motion.h1>
            
            <motion.p 
              className="text-base md:text-lg mb-6 md:mb-8 text-muted-foreground leading-relaxed max-w-xl mx-auto md:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Increase yields, reduce costs, and simplify management with the complete digital farming platform that brings AI, IoT, blockchain, and social networking together in one seamless experience.
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
              
              <button className="border border-primary/50 hover:border-primary bg-muted/50 hover:bg-muted px-6 sm:px-8 py-3 rounded-md transition-all duration-300 font-medium inline-flex items-center justify-center">
                <i className="fas fa-play-circle mr-2 text-primary"></i>
                <span>Watch Demo</span>
              </button>
            </motion.div>
            
            {/* Trust indicators */}
            <motion.div 
              className="mt-8 md:mt-12 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center justify-center md:justify-start gap-4 md:gap-6">
                <div className="flex -space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                    <i className="fas fa-user-alt text-primary/60 text-xs"></i>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                    <i className="fas fa-user-alt text-primary/60 text-xs"></i>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                    <i className="fas fa-user-alt text-primary/60 text-xs"></i>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-xs font-medium">
                    5k+
                  </div>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Trusted by <span className="text-primary font-semibold">5,000+</span> farmers countrywide</p>
                </div>
              </div>
              
              {/* Technology badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3 border-t border-border">
                <div className="flex items-center bg-card/80 px-3 py-1 rounded-full border border-primary/10 text-xs">
                  <i className="fas fa-brain text-primary mr-2 text-xs"></i>
                  <span>OpenAI Powered</span>
                </div>
                <div className="flex items-center bg-card/80 px-3 py-1 rounded-full border border-primary/10 text-xs">
                  <i className="fas fa-link text-primary mr-2 text-xs"></i>
                  <span>Blockchain Verified</span>
                </div>
                <div className="flex items-center bg-card/80 px-3 py-1 rounded-full border border-primary/10 text-xs">
                  <i className="fas fa-wifi text-primary mr-2 text-xs"></i>
                  <span>IoT Ready</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Right column - Animation & visualization */}
          <motion.div 
            className="order-1 md:order-2 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-xl shadow-primary/10 z-10 bg-card"
              style={{ animation: "float 6s ease-in-out infinite" }}
            >
              {/* Digital farm landscape visualization */}
              <div className="aspect-[4/3] w-full relative overflow-hidden">
                <img 
                  src={droneFieldImage} 
                  alt="Digital farm landscape with data visualization" 
                  className="w-full h-auto rounded-t-xl"
                />
                
                {/* Animated data points overlaid on image */}
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="absolute top-[20%] left-[30%] w-4 h-4 bg-primary/30 rounded-full pulse-animation"></div>
                  <div className="absolute top-[40%] left-[60%] w-5 h-5 bg-blue-500/30 rounded-full pulse-animation" style={{animationDelay: "1s"}}></div>
                  <div className="absolute top-[65%] left-[45%] w-6 h-6 bg-amber-500/30 rounded-full pulse-animation" style={{animationDelay: "2s"}}></div>
                </div>
                
                {/* Data visualization layer */}
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/40 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="font-mono text-primary">AI analysis in progress</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Live dashboard preview */}
              <div className="p-4 border-t border-border">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <i className="fas fa-chart-line text-primary text-xs"></i>
                    </div>
                    <span className="font-medium text-sm">Farm Dashboard</span>
                  </div>
                  <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono">LIVE</div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted/50 rounded-md p-2 text-center">
                    <div className="text-xs text-muted-foreground">Soil Moisture</div>
                    <div className="font-medium text-sm">68<span className="text-xs">%</span></div>
                  </div>
                  <div className="bg-muted/50 rounded-md p-2 text-center">
                    <div className="text-xs text-muted-foreground">Temperature</div>
                    <div className="font-medium text-sm">24<span className="text-xs">°C</span></div>
                  </div>
                  <div className="bg-muted/50 rounded-md p-2 text-center">
                    <div className="text-xs text-muted-foreground">Yield Forecast</div>
                    <div className="font-medium text-sm text-primary">+12<span className="text-xs">%</span></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tech element decorations */}
            <div className="absolute -top-2 -left-2 w-8 h-8 md:w-12 md:h-12 border border-primary/40 rounded-lg z-0 backdrop-blur-sm bg-card/80 hidden md:flex items-center justify-center">
              <span className="text-xs md:text-sm font-mono text-primary">AI</span>
            </div>
            <div className="absolute top-1/4 -right-3 w-8 h-8 md:w-12 md:h-12 border border-primary/40 rounded-lg z-0 backdrop-blur-sm bg-card/80 hidden md:flex items-center justify-center rotate-12">
              <span className="text-xs md:text-sm font-mono text-primary">IoT</span>
            </div>
            <div className="absolute -bottom-4 left-1/4 w-8 h-8 md:w-12 md:h-12 border border-primary/40 rounded-lg z-0 backdrop-blur-sm bg-card/80 hidden md:flex items-center justify-center -rotate-6">
              <span className="text-xs md:text-sm font-mono text-primary">ML</span>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* CSS for pulse animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse-animation {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.5); opacity: 0.4; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        
        .pulse-animation {
          animation: pulse-animation 4s infinite;
        }
        `
      }} />
    </header>
  );
};

export default Hero;
