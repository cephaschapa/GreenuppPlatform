import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import greenuppLogo from "../assets/greenupp-full-logo.png";
import {
  ArrowRight,
  TrendingUp,
  Users,
  MapPin,
  Star,
  Sparkles,
  Clock,
} from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-[85vh] bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50 dark:from-slate-950 dark:via-green-950/30 dark:to-emerald-950 overflow-hidden flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10 py-20">
        <div className="text-center">
          {/* Urgency Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Badge
              variant="outline"
              className="mb-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 backdrop-blur-sm border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-5 py-2.5 text-base animate-pulse"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">
                  Limited: Only 50 spots left this month!
                </span>
              </div>
            </Badge>
            <img src={greenuppLogo} alt="GreenUpp" className="h-14 mx-auto" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Increase Your Harvest by 35%
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl lg:text-3xl text-slate-700 dark:text-slate-200 mb-4 max-w-4xl mx-auto font-medium"
          >
            AI-Powered Farming Technology for Zambian Farmers
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl mx-auto"
          >
            Join{" "}
            <span className="font-bold text-green-600 dark:text-green-400">
              2,000+ Zambian farmers
            </span>{" "}
            earning more with smart weather alerts, AI advice in Bemba & Nyanja,
            and direct market access—all offline-ready.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
          >
            <Link href="/auth">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-6 text-xl font-bold shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="w-6 h-6 mr-2" />
                Start Free Today - K50/mo
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              className="border-2 border-slate-700 dark:border-slate-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-10 py-6 text-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300"
              onClick={() =>
                window.open("https://wa.me/260XXXXXXXXX", "_blank")
              }
            >
              Watch 2-Min Demo
            </Button>
          </motion.div>

          {/* Social Proof Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              {
                icon: TrendingUp,
                value: "35%",
                label: "Yield Increase",
                color: "text-green-600 dark:text-green-400",
              },
              {
                icon: Users,
                value: "2,000+",
                label: "Active Farmers",
                color: "text-blue-600 dark:text-blue-400",
              },
              {
                icon: MapPin,
                value: "10",
                label: "Provinces",
                color: "text-purple-600 dark:text-purple-400",
              },
              {
                icon: Star,
                value: "4.8/5",
                label: "User Rating",
                color: "text-yellow-600 dark:text-yellow-400",
              },
            ].map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <metric.icon
                  className={`w-8 h-8 mx-auto mb-2 ${metric.color}`}
                />
                <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                  {metric.value}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {metric.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
