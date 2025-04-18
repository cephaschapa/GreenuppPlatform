import { motion } from "framer-motion";
import farmerTechSvg from "../assets/farmer-tech.svg";

const benefits = [
  {
    icon: "fas fa-chart-line",
    title: "Increased Yield",
    description: "Optimize growing conditions and quickly address issues to maximize production.",
    metric: "+28%",
    metricLabel: "Average improvement:",
    percentage: 28
  },
  {
    icon: "fas fa-hand-holding-usd",
    title: "Cost Reduction",
    description: "Reduce waste and optimize resource usage with data-driven decision making.",
    metric: "-32%",
    metricLabel: "Average savings:",
    percentage: 32
  },
  {
    icon: "fas fa-leaf",
    title: "Sustainability",
    description: "Implement environmentally friendly practices that also improve your bottom line.",
    metric: "+45%",
    metricLabel: "Resource efficiency:",
    percentage: 45
  },
  {
    icon: "fas fa-clock",
    title: "Time Savings",
    description: "Automate monitoring and routine tasks to focus on strategic farm management.",
    metric: "12+ hours",
    metricLabel: "Hours saved weekly:",
    percentage: 60
  },
  {
    icon: "fas fa-tag",
    title: "Premium Pricing",
    description: "Command higher prices with transparent, traceable, and sustainable products.",
    metric: "+18%",
    metricLabel: "Price premium:",
    percentage: 18
  },
  {
    icon: "fas fa-shield-alt",
    title: "Risk Mitigation",
    description: "Anticipate and address potential issues before they impact your production.",
    metric: "-65%",
    metricLabel: "Risk reduction:",
    percentage: 65
  }
];

const BenefitsSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section id="benefits" className="py-20 bg-muted relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h5 className="text-primary uppercase tracking-widest font-semibold mb-2 font-mono">Benefits</h5>
          <h2 className="text-3xl md:text-4xl font-bold font-space mb-4">Transform Your <span className="text-primary">Agricultural</span> Business</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground">Discover how Greenupp delivers measurable improvements to your farming operations.</p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index}
              className="bg-card rounded-xl p-6 border border-primary/20 hover:border-primary/50 transition duration-300"
              variants={itemVariants}
            >
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-5">
                <i className={`${benefit.icon} text-primary text-2xl`}></i>
              </div>
              <h3 className="text-xl font-bold font-space mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>{benefit.metricLabel}</span>
                  <span className="text-primary font-semibold">{benefit.metric}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${benefit.percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                  ></motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-16 bg-card rounded-xl p-8 border border-primary/20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold font-space mb-4">Success Stories</h3>
              <p className="text-muted-foreground mb-6">See how farmers around the world are transforming their operations with Greenupp.</p>
              <div className="mb-8">
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 rounded-full mr-4 border-2 border-primary bg-muted"></div>
                  <div>
                    <p className="italic text-muted-foreground mb-2">"Greenupp's AI diagnostics caught a pest infestation before it became visible, saving our entire season. The ROI was almost immediate."</p>
                    <p className="font-semibold">Michael J., Corn Farmer, Iowa</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full mr-4 border-2 border-primary bg-muted"></div>
                  <div>
                    <p className="italic text-muted-foreground mb-2">"The blockchain traceability has allowed us to charge 22% more for our organic products. Customers love scanning the QR code to see the journey."</p>
                    <p className="font-semibold">Sarah T., Organic Vineyard, California</p>
                  </div>
                </div>
              </div>
              <a href="#" className="text-primary flex items-center group">
                <span className="mr-2 group-hover:mr-3 transition-all">Read more success stories</span>
                <i className="fas fa-arrow-right"></i>
              </a>
            </div>
            <div className="relative">
              <div className="rounded-xl overflow-hidden border border-primary/20 bg-background/95">
                <img 
                  src={farmerTechSvg} 
                  alt="Farmer using digital technology in field" 
                  className="w-full"
                />
              </div>
              <div className="absolute -bottom-5 right-5 bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium">
                +189% ROI
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection;
