import { motion } from "framer-motion";

const cards = [
  {
    problem: "Guesswork",
    solution: "Precision",
    icon: "fas fa-bullseye",
    color: "from-amber-500 to-orange-600",
    description: "Traditional farming relies on intuition and experience. Greenupp uses AI and data science to provide precision recommendations based on your specific farm conditions.",
    metric: "Up to 30% increase in yield efficiency"
  },
  {
    problem: "Isolation",
    solution: "Connection",
    icon: "fas fa-network-wired",
    color: "from-blue-500 to-indigo-600",
    description: "Managing your farm alone makes it difficult to access knowledge and markets. Greenupp connects you to other farmers, experts, and buyers through a dedicated agricultural network.",
    metric: "Access to 5,000+ agricultural professionals"
  },
  {
    problem: "Complexity",
    solution: "Simplicity",
    icon: "fas fa-sliders-h",
    color: "from-emerald-500 to-green-600",
    description: "Juggling multiple tools and paperwork creates unnecessary complexity. Greenupp unifies all your farming needs in one intuitive platform that works online and offline.",
    metric: "Save 15+ hours per week on farm management"
  }
];

const ProblemSolutionCards = () => {
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
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider mb-3">TRANSFORMING AGRICULTURE</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-space mb-4">From <span className="text-primary">Challenges</span> to Solutions</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-sm md:text-base">
            See how Greenupp addresses the most common challenges faced by modern farmers with innovative technology.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              className="bg-card overflow-hidden rounded-xl border border-primary/20 h-full relative group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Top decoration */}
              <div className={`h-2 w-full bg-gradient-to-r ${card.color}`}></div>
              
              <div className="p-6 md:p-8">
                {/* Icon */}
                <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-5">
                  <i className={`${card.icon} text-primary text-xl`}></i>
                </div>
                
                {/* From/To heading */}
                <h3 className="text-xl md:text-2xl font-bold font-space mb-3">
                  From <span className="text-muted-foreground">{card.problem}</span> to <span className="text-primary">{card.solution}</span>
                </h3>
                
                {/* Description */}
                <p className="text-muted-foreground mb-6">
                  {card.description}
                </p>
                
                {/* Metric */}
                <div className="mt-auto pt-4 border-t border-border">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary/30 mr-2"></div>
                    <p className="text-sm font-medium">{card.metric}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSolutionCards;