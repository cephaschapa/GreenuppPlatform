import { motion } from 'framer-motion';

const steps = [
  {
    number: 1,
    title: "Create Your Account",
    description: "Sign up and create your farm profile with basic information about your operation.",
    icon: "fas fa-user-plus",
    time: "1 minute",
    color: "from-blue-500 to-indigo-600"
  },
  {
    number: 2,
    title: "Map Your First Field",
    description: "Import existing field boundaries or easily draw them on our interactive map.",
    icon: "fas fa-map-marked-alt",
    time: "2 minutes",
    color: "from-green-500 to-emerald-600"
  },
  {
    number: 3,
    title: "Add Your Crops",
    description: "Enter current and planned crops to receive customized recommendations.",
    icon: "fas fa-seedling",
    time: "2 minutes",
    color: "from-amber-500 to-orange-600"
  },
  {
    number: 4,
    title: "Get AI Recommendations",
    description: "Receive instant AI-powered insights tailored to your specific farming conditions.",
    icon: "fas fa-robot",
    time: "Instant",
    color: "from-purple-500 to-violet-600"
  }
];

const GettingStartedSteps = () => {
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
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider mb-3">QUICK SETUP</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-space mb-4">Get Started in <span className="text-primary">Minutes</span></h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-sm md:text-base">
            Greenupp is designed for busy farmers. Our streamlined onboarding process gets you up and running with minimal effort.
          </p>
        </motion.div>
        
        {/* Timeline steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line */}
          <div className="absolute left-[15px] md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/80 to-primary/20 transform md:-translate-x-1/2 z-0"></div>
          
          {/* Steps */}
          <div className="space-y-12 md:space-y-0 relative z-10">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                className={`md:grid md:grid-cols-2 md:gap-8 items-center ${
                  index % 2 === 0 ? '' : 'md:rtl'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {/* Step number and content */}
                <div className={`flex md:block ${index % 2 === 0 ? '' : 'md:text-right ltr'}`}>
                  <div className="relative flex items-center mb-4 md:mb-0">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${step.color} text-white flex items-center justify-center text-sm font-bold z-20 mr-4 md:mr-0 md:mb-0 md:mx-auto shadow-lg shadow-primary/20`}>
                      {step.number}
                    </div>
                    <h3 className="text-xl font-bold md:hidden">{step.title}</h3>
                  </div>
                  
                  <div className="hidden md:block pt-10">
                    <h3 className="text-xl md:text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                    <div className="mt-3 inline-flex items-center bg-muted/50 rounded-full px-3 py-1">
                      <i className="fas fa-clock text-primary mr-2 text-xs"></i>
                      <span className="text-sm">{step.time}</span>
                    </div>
                  </div>
                </div>
                
                {/* Visual element */}
                <div className={`pl-12 md:pl-0 ${index % 2 === 0 ? 'md:rtl' : ''}`}>
                  <div className="bg-card border border-primary/20 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="md:hidden mb-4">
                      <p className="text-muted-foreground">{step.description}</p>
                      <div className="mt-3 inline-flex items-center bg-muted/50 rounded-full px-3 py-1">
                        <i className="fas fa-clock text-primary mr-2 text-xs"></i>
                        <span className="text-sm">{step.time}</span>
                      </div>
                    </div>
                    
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-4 text-white md:mx-auto`}>
                      <i className={`${step.icon} text-2xl`}></i>
                    </div>
                    
                    <div className="hidden md:block">
                      <div className="h-4 bg-muted/50 rounded-full w-4/5 mx-auto mb-2"></div>
                      <div className="h-4 bg-muted/50 rounded-full w-3/5 mx-auto mb-2"></div>
                      <div className="h-4 bg-muted/50 rounded-full w-2/3 mx-auto"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Bottom CTA */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our guided setup process walks you through each step with clear instructions. No technical expertise required.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md transition-colors inline-flex items-center justify-center">
              <span>Start Your Free Trial</span>
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
            
            <button className="border border-primary/50 hover:border-primary bg-transparent hover:bg-primary/5 px-6 py-3 rounded-md transition-colors inline-flex items-center justify-center">
              <i className="fas fa-headset mr-2"></i>
              <span>Schedule a Demo</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GettingStartedSteps;