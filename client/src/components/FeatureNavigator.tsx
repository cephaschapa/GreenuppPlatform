import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CloudRain,
  Bot,
  Store,
  Smartphone,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: CloudRain,
    name: "Weather Intelligence",
    nameLocal: "Ukwishiba Kwa Mvula",
    description:
      "7-day forecasts, drought warnings, SMS alerts in your language",
    gradient: "from-blue-500 to-cyan-500",
    benefit: "94% accuracy for Zambian regions",
  },
  {
    icon: Bot,
    name: "AI Farming Assistant",
    nameLocal: "Muthandizi Wa AI",
    description:
      "24/7 expert advice via WhatsApp, crop diagnosis, pest control",
    gradient: "from-purple-500 to-indigo-500",
    benefit: "Available in Bemba & Nyanja",
  },
  {
    icon: Store,
    name: "Direct Marketplace",
    nameLocal: "Msika Wachindunji",
    description: "Sell directly to Shoprite, Pick n Pay—no middlemen",
    gradient: "from-emerald-500 to-green-500",
    benefit: "87% higher prices on average",
  },
  {
    icon: Smartphone,
    name: "Works Offline",
    nameLocal: "Ingagwira Offline",
    description: "Full functionality on basic phones, no internet required",
    gradient: "from-orange-500 to-red-500",
    benefit: "Perfect for rural areas",
  },
];

const FeatureNavigator = () => {
  return (
    <section className="py-16 lg:py-20 relative bg-gradient-to-b from-white via-green-50/20 to-white dark:from-slate-900 dark:via-green-950/20 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Everything You Need to Succeed
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Smart technology built specifically for Zambian farming conditions
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-2 border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.gradient} p-3 shadow-lg`}
                  >
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
                    {feature.name}
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-3">
                    {feature.nameLocal}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/30 rounded-lg py-2 px-3">
                    <CheckCircle className="w-4 h-4" />
                    {feature.benefit}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 border-0 text-white max-w-3xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                Ready to 10x Your Farm?
              </h3>
              <p className="text-green-100 mb-6 text-lg">
                Start earning more with smarter farming technology
              </p>
              <Button
                size="lg"
                className="bg-white text-green-700 hover:bg-green-50 font-bold px-10 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                asChild
              >
                <a href="/auth">
                  Get Started Now - K50/month
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureNavigator;
