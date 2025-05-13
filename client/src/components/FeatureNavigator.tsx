import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const features = [
  {
    id: "farm-management",
    icon: "fas fa-tractor",
    name: "Farm Management",
    description: "Manage all aspects of your farm operations with intuitive digital tools for field mapping, crop planning, and task scheduling.",
    stats: "Increase operational efficiency by up to 42%",
    bulletPoints: [
      "Digital field mapping with satellite integration",
      "Crop rotation planning and optimization",
      "Task scheduling with team assignment",
      "Equipment maintenance tracking"
    ],
    image: "/field-mapping-visualization.png" // Placeholder
  },
  {
    id: "ai-assistant",
    icon: "fas fa-robot",
    name: "AI Assistant",
    description: "Your personal farming advisor powered by advanced AI to provide recommendations based on your specific farming conditions.",
    stats: "Get answers to 90% of common farming questions instantly",
    bulletPoints: [
      "Personalized crop recommendations",
      "Disease diagnosis with 95% accuracy",
      "Weather impact predictions",
      "Farming best practices tailored to your region"
    ],
    image: "/ai-assistant-visualization.png" // Placeholder
  },
  {
    id: "marketplace",
    icon: "fas fa-store",
    name: "Marketplace",
    description: "Buy and sell agricultural products with location-based services that connect you with nearby farmers and suppliers.",
    stats: "Connect with buyers and sellers within a 50km radius",
    bulletPoints: [
      "Verified seller profiles with ratings",
      "Precise location-based product discovery",
      "Secure in-app messaging with buyers/sellers",
      "Integrated payment processing options"
    ],
    image: "/marketplace-visualization.png" // Placeholder
  },
  {
    id: "weather",
    icon: "fas fa-cloud-sun-rain",
    name: "Weather Intelligence",
    description: "Access hyperlocal weather forecasts and receive alerts about conditions that may affect your crops and operations.",
    stats: "Prepare for weather events 3-5 days earlier than traditional forecasts",
    bulletPoints: [
      "Field-specific microclimate monitoring",
      "Severe weather alerts with action recommendations",
      "Historical weather data analysis",
      "Weather-based task scheduling optimization"
    ],
    image: "/weather-visualization.png" // Placeholder
  },
  {
    id: "social",
    icon: "fas fa-users",
    name: "Green Socials",
    description: "Connect with other farmers, share knowledge, and build your agricultural community through our specialized social network.",
    stats: "Access knowledge from 5,000+ agricultural professionals",
    bulletPoints: [
      "Farm progress sharing with privacy controls",
      "Agricultural groups by crop type or region",
      "Knowledge exchange forums with expert verification",
      "Event organization and discovery"
    ],
    image: "/social-visualization.png" // Placeholder
  }
];

const FeatureNavigator = () => {
  const [activeTab, setActiveTab] = useState("farm-management");
  
  return (
    <section id="features" className="py-16 md:py-24 bg-muted relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -top-[20%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-[10%] -left-[5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider mb-3">FEATURE HIGHLIGHTS</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-space mb-4">Advanced Features for<br className="hidden sm:block" /> <span className="text-primary">Modern Farming</span></h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-sm md:text-base">
            Explore our comprehensive suite of tools designed to transform how you manage your farm, connect with other farmers, and optimize your operations.
          </p>
        </motion.div>
        
        <Tabs defaultValue="farm-management" value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Feature Navigation */}
          <div className="mb-8 mx-auto max-w-4xl">
            <TabsList className="h-auto p-1 bg-background/80 backdrop-blur-sm flex flex-wrap justify-center">
              {features.map(feature => (
                <TabsTrigger 
                  key={feature.id}
                  value={feature.id}
                  className={`
                    flex items-center gap-2 py-2 px-4 text-sm rounded-lg
                    data-[state=active]:shadow-sm data-[state=active]:shadow-primary/20
                    data-[state=active]:bg-primary data-[state=active]:text-white
                    transition-all duration-300
                  `}
                >
                  <i className={`${feature.icon} text-sm`}></i>
                  <span className="hidden sm:inline">{feature.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {/* Feature Content */}
          {features.map(feature => (
            <TabsContent 
              key={feature.id} 
              value={feature.id}
              className="mb-0 mt-0"
            >
              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center bg-card rounded-xl border border-primary/20 p-6 md:p-8 shadow-lg shadow-primary/5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Feature description - 2 columns */}
                <div className="lg:col-span-2 order-2 lg:order-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10">
                      <i className={`${feature.icon} text-primary`}></i>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold font-space">{feature.name}</h3>
                  </div>
                  
                  <p className="text-muted-foreground mb-6">{feature.description}</p>
                  
                  <div className="bg-muted rounded-lg p-3 mb-6 inline-block">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-primary/20 mr-3 flex-shrink-0"></div>
                      <p className="text-sm font-medium">{feature.stats}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {feature.bulletPoints.map((point, idx) => (
                      <div key={idx} className="flex items-start">
                        <i className="fas fa-check-circle text-primary mt-0.5 mr-2"></i>
                        <p className="text-sm">{point}</p>
                      </div>
                    ))}
                  </div>
                  
                  <button className="flex items-center text-primary hover:text-primary/90 text-sm font-medium group">
                    <span>Learn more about {feature.name}</span>
                    <i className="fas fa-arrow-right ml-2 transition-transform group-hover:translate-x-1"></i>
                  </button>
                </div>
                
                {/* Feature visualization - 3 columns */}
                <div className="lg:col-span-3 order-1 lg:order-2">
                  <div className="aspect-[16/9] w-full rounded-lg bg-background/50 overflow-hidden border border-primary/10 relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-card/30 via-transparent to-transparent"></div>
                    <div className="flex items-center justify-center h-full">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <i className={`${feature.icon} text-primary text-2xl`}></i>
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <div className="text-xs font-mono bg-card/80 backdrop-blur-sm px-2 py-1 rounded border border-primary/10">
                        {feature.id.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default FeatureNavigator;