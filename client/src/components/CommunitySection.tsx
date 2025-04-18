import { motion } from "framer-motion";

const CommunitySection = () => {
  return (
    <section id="community" className="py-20 relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5"></div>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h5 className="text-primary uppercase tracking-widest font-semibold mb-2 font-mono">Community</h5>
          <h2 className="text-3xl md:text-4xl font-bold font-space mb-4">Join the <span className="text-primary">Agricultural</span> Revolution</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground">Connect with innovative farmers and experts from around the world.</p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, staggerChildren: 0.2 }}
        >
          <motion.div 
            className="bg-secondary rounded-xl p-6 border border-primary/20 hover:border-primary/50 transition duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <i className="fas fa-users text-primary"></i>
              </div>
              <h3 className="text-xl font-bold font-space">Knowledge Exchange</h3>
            </div>
            <p className="text-muted-foreground mb-4">Share experiences, ask questions, and learn from other farmers facing similar challenges.</p>
            <div className="bg-card rounded-lg p-4 mb-4 border border-border/40">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full mr-3 bg-gray-600"></div>
                <div>
                  <p className="font-medium mb-1">Robert H.</p>
                  <p className="text-sm text-gray-400">Anyone using drip irrigation with the moisture sensors? My setup keeps giving false readings...</p>
                  <div className="flex text-xs mt-2 text-gray-500">
                    <span className="mr-3">2h ago</span>
                    <span className="mr-3">12 replies</span>
                  </div>
                </div>
              </div>
            </div>
            <a href="#" className="text-primary text-sm flex items-center group">
              <span className="mr-2 group-hover:mr-3 transition-all">Join the discussion</span>
              <i className="fas fa-arrow-right"></i>
            </a>
          </motion.div>
          
          <motion.div 
            className="bg-secondary rounded-xl p-6 border border-primary/20 hover:border-primary/50 transition duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <i className="fas fa-graduation-cap text-primary"></i>
              </div>
              <h3 className="text-xl font-bold font-space">Learning Hub</h3>
            </div>
            <p className="text-muted-foreground mb-4">Access webinars, tutorials, and courses to master modern agricultural techniques.</p>
            <div className="bg-card rounded-lg p-4 mb-4 border border-border/40">
              <div className="mb-3">
                <span className="bg-primary/20 text-primary text-xs rounded-full px-2 py-1">Upcoming</span>
              </div>
              <h4 className="font-medium mb-1">Advanced Sensor Calibration</h4>
              <p className="text-sm text-gray-400 mb-2">Learn how to properly calibrate soil sensors for maximum accuracy.</p>
              <div className="flex text-xs text-gray-500">
                <span className="mr-3"><i className="far fa-calendar mr-1"></i> June 28</span>
                <span><i className="far fa-clock mr-1"></i> 60 min</span>
              </div>
            </div>
            <a href="#" className="text-primary text-sm flex items-center group">
              <span className="mr-2 group-hover:mr-3 transition-all">Browse all resources</span>
              <i className="fas fa-arrow-right"></i>
            </a>
          </motion.div>
          
          <motion.div 
            className="bg-secondary rounded-xl p-6 border border-primary/20 hover:border-primary/50 transition duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <i className="fas fa-laptop-code text-primary"></i>
              </div>
              <h3 className="text-xl font-bold font-space">Developer API</h3>
            </div>
            <p className="text-muted-foreground mb-4">Integrate Greenupp with your existing farm management software or create custom applications.</p>
            <div className="bg-[#2D2D2D] rounded-lg p-4 mb-4 font-mono text-xs overflow-x-auto">
              <pre className="text-gray-300">GET /api/v1/sensors/<span className="text-primary">sensor_id</span>/readings</pre>
              <pre className="text-gray-300">{"{\n  \"moisture\": 42.3,\n  \"temperature\": 24.1,\n  \"pH\": 6.8,\n  \"timestamp\": \"2023-06-18T14:23:16Z\"\n}"}</pre>
            </div>
            <a href="#" className="text-primary text-sm flex items-center group">
              <span className="mr-2 group-hover:mr-3 transition-all">API documentation</span>
              <i className="fas fa-arrow-right"></i>
            </a>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="rounded-2xl bg-gradient-to-r from-[#2D2D2D] to-secondary relative overflow-hidden border border-primary/20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <img 
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1332&q=80" 
              alt="Fields at sunset" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12 relative z-10">
            <div>
              <h3 className="text-2xl font-bold font-space mb-4">Global Community</h3>
              <p className="text-muted-foreground mb-6">Join 25,000+ innovative farmers from over 40 countries who are reshaping the future of agriculture together.</p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">25K+</div>
                  <div className="text-gray-400">Active Members</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">40+</div>
                  <div className="text-gray-400">Countries</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">250+</div>
                  <div className="text-gray-400">Daily Posts</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">12</div>
                  <div className="text-gray-400">Languages</div>
                </div>
              </div>
              <a href="#" className="bg-primary hover:bg-primary/80 text-primary-foreground px-6 py-3 rounded-md transition duration-300 font-medium inline-block">
                Join Community
              </a>
            </div>
            <div className="flex flex-wrap gap-3 items-center justify-center">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="w-14 h-14 rounded-full border-2 border-primary bg-gray-600"></div>
              ))}
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                +1K
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CommunitySection;
