import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Testimonial data
const testimonials = [
  {
    id: 1,
    name: "Maria Rodriguez",
    role: "Small-Scale Vegetable Farmer",
    location: "Central Valley",
    image: "https://images.unsplash.com/photo-1590402494610-2c378a9114c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
    quote: "Greenupp's AI recommendations helped me increase my tomato yield by 27% while reducing water usage. The marketplace feature connected me with new buyers that pay premium prices for my certified crops.",
    metrics: ["27% yield increase", "22% water reduction", "3 new major buyers"]
  },
  {
    id: 2,
    name: "James Wilson",
    role: "Large-Scale Grain Producer",
    location: "Midwest Region",
    image: "https://images.unsplash.com/photo-1520052203542-d3095f1b6cf0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
    quote: "Managing 500 acres used to be overwhelming until I started using Greenupp. The field mapping, weather alerts, and crop planning tools have simplified our operation and improved our decision-making process.",
    metrics: ["15 hours saved weekly", "18% cost reduction", "Improved field planning"]
  },
  {
    id: 3,
    name: "Sarah Johnson",
    role: "Organic Fruit Grower",
    location: "Coastal Region",
    image: "https://images.unsplash.com/photo-1594608661623-aa0bd3a69799?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
    quote: "The blockchain traceability feature has been a game-changer for my organic apple orchard. Customers now scan our QR codes to verify our growing practices, which has built trust and increased our direct sales.",
    metrics: ["35% increase in direct sales", "Blockchain verification", "Higher customer trust"]
  }
];

// Awards and recognitions
const awards = [
  { name: "Agricultural Innovation Award 2023", logo: "fas fa-award" },
  { name: "Best Farm Management Software", logo: "fas fa-trophy" },
  { name: "Sustainability Excellence Recognition", logo: "fas fa-leaf" }
];

const SocialProof = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <section className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider mb-3">SUCCESS STORIES</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-space mb-4">Trusted by <span className="text-primary">Farmers Worldwide</span></h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-sm md:text-base">
            See how farmers like you are transforming their operations and achieving measurable results with Greenupp.
          </p>
        </motion.div>
        
        {/* Testimonial carousel */}
        <div className="mb-16">
          <div className="relative overflow-hidden rounded-xl">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial.id}
                className={`bg-card rounded-xl border border-primary/20 overflow-hidden shadow-lg shadow-primary/10 ${idx === activeIndex ? 'block' : 'hidden'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-5 h-full">
                  {/* Image column - 2/5 on desktop */}
                  <div className="md:col-span-2 h-64 md:h-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/10"></div>
                    <img
                      src={testimonial.image}
                      alt={`${testimonial.name}, ${testimonial.role}`}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 md:hidden">
                      <h3 className="text-white font-bold text-xl">{testimonial.name}</h3>
                      <p className="text-white/80 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  
                  {/* Content column - 3/5 on desktop */}
                  <div className="md:col-span-3 p-6 md:p-8 flex flex-col justify-center">
                    <div className="hidden md:block mb-4">
                      <h3 className="font-bold text-xl">{testimonial.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>{testimonial.role}</span>
                        <span className="mx-2">•</span>
                        <span>{testimonial.location}</span>
                      </div>
                    </div>
                    
                    <div className="text-4xl text-primary/20 mb-4">❝</div>
                    <blockquote className="text-lg mb-6 italic">
                      "{testimonial.quote}"
                    </blockquote>
                    
                    <div className="border-t border-border pt-4 mt-auto">
                      <h4 className="text-sm font-semibold mb-3">Measurable Results:</h4>
                      <div className="flex flex-wrap gap-2">
                        {testimonial.metrics.map((metric, idx) => (
                          <div 
                            key={idx}
                            className="bg-muted rounded-full px-3 py-1 text-xs flex items-center"
                          >
                            <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                            {metric}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Navigation dots */}
            <div className="flex justify-center mt-6 gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === activeIndex ? 'bg-primary w-8' : 'bg-primary/30'
                  }`}
                  aria-label={`View testimonial ${idx + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Video testimonials section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-card rounded-xl border border-primary/20 overflow-hidden relative group hover:shadow-lg transition-all duration-300">
            <div className="aspect-video bg-muted relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                  <i className="fas fa-play"></i>
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h3 className="text-white font-medium">Corn Field Success Story</h3>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground">Michael from Iowa shares how AI recommendations improved his corn production efficiency.</p>
            </div>
          </div>
          
          <div className="bg-card rounded-xl border border-primary/20 overflow-hidden relative group hover:shadow-lg transition-all duration-300">
            <div className="aspect-video bg-muted relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                  <i className="fas fa-play"></i>
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h3 className="text-white font-medium">Blockchain Tracking Demo</h3>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground">See how our CropTrace blockchain system works in this quick walkthrough video.</p>
            </div>
          </div>
          
          <div className="bg-card rounded-xl border border-primary/20 overflow-hidden relative group hover:shadow-lg transition-all duration-300">
            <div className="aspect-video bg-muted relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                  <i className="fas fa-play"></i>
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h3 className="text-white font-medium">Community Features</h3>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground">Learn how the Green Socials network connects farmers for knowledge sharing.</p>
            </div>
          </div>
        </motion.div>
        
        {/* Awards section */}
        <motion.div
          className="bg-muted rounded-xl border border-primary/10 p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold">Awards & Recognition</h3>
            <p className="text-sm text-muted-foreground">Greenupp's industry-leading agricultural technology has been recognized with multiple awards</p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {awards.map((award, idx) => (
              <div key={idx} className="flex flex-col items-center text-center max-w-[200px]">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <i className={`${award.logo} text-primary text-2xl`}></i>
                </div>
                <p className="text-sm font-medium">{award.name}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;