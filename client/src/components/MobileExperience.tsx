import { motion } from 'framer-motion';

const MobileExperience = () => {
  const features = [
    { 
      icon: "fas fa-wifi-slash", 
      title: "Offline Mode", 
      description: "Continue using essential features in the field even without internet connectivity."
    },
    { 
      icon: "fas fa-bell", 
      title: "Real-time Alerts", 
      description: "Receive critical notifications for weather events, market opportunities, and crop care."
    },
    { 
      icon: "fas fa-camera", 
      title: "Field Documentation", 
      description: "Capture photos of crops and field conditions with automatic tagging and analysis."
    },
    { 
      icon: "fas fa-map-marker-alt", 
      title: "GPS Field Mapping", 
      description: "Mark boundaries, issues, and points of interest directly from your mobile device."
    }
  ];
  
  return (
    <section className="py-16 md:py-24 bg-muted relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12 md:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider mb-3">MOBILE FIRST</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-space mb-4">Farming at Your <span className="text-primary">Fingertips</span></h2>
            <p className="max-w-2xl mx-auto text-muted-foreground text-sm md:text-base">
              Manage your farm from anywhere with our intuitive mobile applications, designed to work seamlessly in the field.
            </p>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-8 md:gap-12 items-center">
          {/* Left side - Features */}
          <motion.div 
            className="lg:col-span-3 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-card rounded-xl p-5 border border-primary/20 flex items-start gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                  <i className={`${feature.icon} text-primary`}></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
            
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border">
                  <i className="fab fa-apple text-lg"></i>
                </div>
                <div>
                  <h4 className="font-medium">iOS Application</h4>
                  <p className="text-xs text-muted-foreground">Available on the App Store</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border">
                  <i className="fab fa-android text-lg"></i>
                </div>
                <div>
                  <h4 className="font-medium">Android Application</h4>
                  <p className="text-xs text-muted-foreground">Available on Google Play</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border">
                  <i className="fas fa-globe text-lg"></i>
                </div>
                <div>
                  <h4 className="font-medium">Progressive Web App</h4>
                  <p className="text-xs text-muted-foreground">Use directly from your browser</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Right side - Device mockups */}
          <motion.div 
            className="lg:col-span-4 flex justify-center items-center relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Device mockups */}
            <div className="relative w-full max-w-lg">
              {/* iPhone mockup - front */}
              <div className="absolute top-0 left-[50%] transform -translate-x-1/2 z-20 w-[220px] md:w-[260px]">
                <div className="bg-black rounded-[36px] p-2 shadow-xl">
                  <div className="bg-card overflow-hidden rounded-[28px] aspect-[9/19.5] relative">
                    {/* Mobile app UI - Dashboard */}
                    <div className="w-full h-full flex flex-col">
                      {/* Status bar */}
                      <div className="h-6 bg-background/80 flex items-center justify-between px-4 text-[10px]">
                        <div>9:41 AM</div>
                        <div className="flex items-center gap-1">
                          <i className="fas fa-signal"></i>
                          <i className="fas fa-wifi"></i>
                          <i className="fas fa-battery-three-quarters"></i>
                        </div>
                      </div>
                      
                      {/* App content */}
                      <div className="flex-grow">
                        {/* Header */}
                        <div className="p-3 bg-primary text-white">
                          <div className="flex justify-between items-center">
                            <div className="text-xs font-medium">Dashboard</div>
                            <div className="flex items-center gap-2">
                              <i className="fas fa-bell text-[10px]"></i>
                              <i className="fas fa-cog text-[10px]"></i>
                            </div>
                          </div>
                        </div>
                        
                        {/* Weather widget */}
                        <div className="p-3 bg-primary/5 m-2 rounded-lg text-[10px]">
                          <div className="flex justify-between items-center mb-1">
                            <div className="font-medium">Today's Weather</div>
                            <i className="fas fa-sun text-amber-500"></i>
                          </div>
                          <div className="flex justify-between">
                            <span>24°C</span>
                            <span>8km/h Wind</span>
                            <span>0% Rain</span>
                          </div>
                        </div>
                        
                        {/* Task list */}
                        <div className="p-2">
                          <div className="text-[10px] font-medium mb-1">Today's Tasks</div>
                          <div className="space-y-1">
                            <div className="bg-muted p-1.5 rounded flex items-center text-[8px]">
                              <div className="w-3 h-3 rounded-full bg-primary/20 mr-1 flex items-center justify-center">
                                <i className="fas fa-check text-[6px] text-primary"></i>
                              </div>
                              <span>Inspect south field irrigation</span>
                            </div>
                            <div className="bg-muted p-1.5 rounded flex items-center text-[8px]">
                              <div className="w-3 h-3 rounded-full bg-primary/20 mr-1 flex items-center justify-center">
                                <i className="fas fa-check text-[6px] text-primary"></i>
                              </div>
                              <span>Order new fertilizer supplies</span>
                            </div>
                            <div className="bg-muted p-1.5 rounded flex items-center text-[8px]">
                              <div className="w-3 h-3 rounded-full bg-background mr-1"></div>
                              <span>Check corn field moisture levels</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Field status */}
                        <div className="p-2 mt-1">
                          <div className="text-[10px] font-medium mb-1">Field Status</div>
                          <div className="h-[60px] bg-muted rounded-lg overflow-hidden relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <i className="fas fa-leaf text-primary text-xs"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom navigation */}
                      <div className="h-12 bg-background border-t border-border flex items-center justify-around px-2">
                        <div className="flex flex-col items-center">
                          <i className="fas fa-home text-primary text-[10px]"></i>
                          <span className="text-[8px]">Home</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <i className="fas fa-chart-bar text-[10px] text-muted-foreground"></i>
                          <span className="text-[8px]">Data</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <i className="fas fa-plus-circle text-[10px] text-muted-foreground"></i>
                          <span className="text-[8px]">Add</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <i className="fas fa-users text-[10px] text-muted-foreground"></i>
                          <span className="text-[8px]">Social</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <i className="fas fa-user text-[10px] text-muted-foreground"></i>
                          <span className="text-[8px]">Profile</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* iPad mockup - behind on the right */}
              <div className="absolute -bottom-10 -right-5 sm:right-0 lg:right-10 z-10 hidden md:block">
                <div className="bg-black rounded-[24px] p-3 shadow-xl transform rotate-12 opacity-80">
                  <div className="bg-card overflow-hidden rounded-[18px] w-[220px] aspect-[4/3] relative">
                    {/* Tablet app UI - Field view */}
                    <div className="w-full h-full flex flex-col">
                      {/* App content */}
                      <div className="h-6 bg-muted flex items-center justify-between px-3 text-[8px]">
                        <div className="font-medium">Field Map</div>
                        <div className="flex items-center gap-1">
                          <i className="fas fa-layer-group"></i>
                          <i className="fas fa-expand"></i>
                        </div>
                      </div>
                      
                      <div className="flex-grow bg-muted/40 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <i className="fas fa-map text-primary/30 text-4xl"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Android mockup - behind on the left */}
              <div className="absolute -bottom-5 -left-5 sm:left-0 lg:left-10 z-10 hidden md:block">
                <div className="bg-gray-800 rounded-[20px] p-1.5 shadow-xl transform -rotate-12 opacity-80">
                  <div className="bg-card overflow-hidden rounded-[16px] w-[180px] aspect-[10/19] relative">
                    {/* Android app UI - Social feed */}
                    <div className="w-full h-full flex flex-col">
                      <div className="p-2 flex justify-between items-center bg-primary text-[8px] text-white">
                        <span>Green Socials</span>
                        <i className="fas fa-search"></i>
                      </div>
                      
                      <div className="flex-grow p-1.5 space-y-1.5">
                        <div className="bg-muted rounded-lg p-1.5">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-3 h-3 rounded-full bg-primary/20"></div>
                            <span className="text-[6px] font-medium">John D.</span>
                          </div>
                          <div className="text-[6px]">Just harvested our first corn crop of the season!</div>
                        </div>
                        
                        <div className="bg-muted rounded-lg p-1.5">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-3 h-3 rounded-full bg-primary/20"></div>
                            <span className="text-[6px] font-medium">Sarah M.</span>
                          </div>
                          <div className="text-[6px]">Has anyone tried the new irrigation system?</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Base platform */}
              <div className="w-full h-12 bg-gradient-to-r from-muted/0 via-muted/80 to-muted/0 rounded-full blur-md mt-8"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MobileExperience;