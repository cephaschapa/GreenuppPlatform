import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const pricingPlans = [
  {
    name: "Starter",
    description: "Perfect for small farms just beginning their digital journey",
    monthlyPrice: 19,
    annualPrice: 189,
    features: [
      "Up to 3 fields",
      "Basic weather forecasting",
      "Crop planning tool",
      "Task management",
      "Community access",
      "Mobile app access"
    ],
    popular: false,
    ctaText: "Start Free Trial",
    color: "border-blue-500"
  },
  {
    name: "Growth",
    description: "Enhanced features for growing farms seeking optimization",
    monthlyPrice: 49,
    annualPrice: 489,
    features: [
      "Up to 10 fields",
      "Advanced weather insights",
      "AI crop recommendations",
      "Yield predictions",
      "Full marketplace access",
      "Plant disease diagnosis",
      "Email & chat support"
    ],
    popular: true,
    ctaText: "Start Free Trial",
    color: "border-primary"
  },
  {
    name: "Enterprise",
    description: "Complete solution for large farms with complex operations",
    monthlyPrice: 99,
    annualPrice: 989,
    features: [
      "Unlimited fields",
      "Hyperlocal weather data",
      "Advanced AI analytics",
      "CropTrace blockchain",
      "Equipment tracking",
      "Team management",
      "API integrations",
      "Dedicated account manager"
    ],
    popular: false,
    ctaText: "Contact Sales",
    color: "border-purple-500"
  }
];

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  
  return (
    <section id="pricing" className="py-16 md:py-24 bg-muted relative overflow-hidden">
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
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider mb-3">PRICING PLANS</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-space mb-4">Invest in Your Farm's <span className="text-primary">Future</span></h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-sm md:text-base">
            Choose the plan that best fits your operation size and needs. All plans include a 30-day free trial.
          </p>
          
          {/* Billing toggle */}
          <div className="flex items-center justify-center mt-8 mb-12">
            <span className={`text-sm mr-2 ${!isAnnual ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
            <div className="flex items-center">
              <Switch id="billing-toggle" checked={isAnnual} onCheckedChange={setIsAnnual} />
              <Label htmlFor="billing-toggle" className="ml-2">
                <div className="flex items-center">
                  <span className={`text-sm ${isAnnual ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>Annual</span>
                  <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">Save 20%</span>
                </div>
              </Label>
            </div>
          </div>
        </motion.div>
        
        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              className={`bg-card rounded-xl border-2 ${plan.color} overflow-hidden relative ${
                plan.popular ? 'shadow-xl shadow-primary/20 md:-mt-4 md:mb-4' : 'shadow-lg'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {plan.popular && (
                <div className="bg-primary text-white text-xs font-medium py-1 text-center">
                  MOST POPULAR
                </div>
              )}
              
              <div className="p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <div className="text-3xl md:text-4xl font-bold">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    per {isAnnual ? 'year' : 'month'}
                  </div>
                </div>
                
                <button className={`w-full py-3 rounded-lg font-medium mb-6 transition-colors ${
                  plan.popular 
                    ? 'bg-primary hover:bg-primary/90 text-white' 
                    : 'bg-muted hover:bg-muted/80'
                }`}>
                  {plan.ctaText}
                </button>
                
                <div className="border-t border-border pt-6">
                  <div className="text-sm font-medium mb-3">Plan includes:</div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-primary mr-2 mt-0.5"><i className="fas fa-check"></i></span>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Enterprise note */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Need a custom solution? <a href="#contact" className="text-primary font-medium hover:underline">Contact our sales team</a> for a tailored implementation designed for your specific agricultural operation.
          </p>
        </motion.div>
        
        {/* ROI Calculator - Teaser */}
        <motion.div
          className="mt-16 bg-card rounded-xl border border-primary/20 p-6 md:p-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-grow">
              <h3 className="text-xl font-bold mb-2">Calculate Your Potential ROI</h3>
              <p className="text-muted-foreground text-sm">
                See how quickly Greenupp can pay for itself through increased yields, reduced costs, and operational efficiencies.
              </p>
            </div>
            <div className="flex-shrink-0">
              <button className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg transition-colors font-medium">
                Open ROI Calculator
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;