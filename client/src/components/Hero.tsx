import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import greenuppLogo from "../assets/greenupp-full-logo.png";
import {
  Users,
  Tractor,
  Store,
  ArrowRight,
  CheckCircle,
  Star,
  MessageSquare,
  Shield,
  Globe,
  Smartphone,
  TrendingUp,
  Heart,
  Brain,
  Database,
  Lock,
  KeyRound,
} from "lucide-react";

const userTypes = [
  {
    id: "smallholder",
    icon: Users,
    title: "Ba Farmer Ba Kuchikolo",
    subtitle: "Small-scale Farmers",
    description: "0.5-5 hectares • Maize, Groundnuts, Beans",
    challenges: ["Limited capital", "Weather risks", "Market access"],
    benefits: [
      "40% yield increase",
      "K2,000 savings/hectare",
      "Direct market access",
    ],
    ctaText: "Start with K50/month",
    gradient: "from-emerald-500 to-green-600",
    users: "1,800+",
  },
  {
    id: "commercial",
    icon: Tractor,
    title: "Ba Farmer Ba Ukulu",
    subtitle: "Commercial Farmers",
    description: "5+ hectares • Mechanized operations",
    challenges: [
      "Operational efficiency",
      "Cost management",
      "Scale optimization",
    ],
    benefits: [
      "30% cost reduction",
      "Precision agriculture",
      "Supply chain control",
    ],
    ctaText: "Book consultation",
    gradient: "from-blue-500 to-indigo-600",
    users: "200+",
  },
  {
    id: "agro-dealer",
    icon: Store,
    title: "Ba Business",
    subtitle: "Agro-dealers & Buyers",
    description: "Input suppliers • Produce buyers",
    challenges: [
      "Farmer connections",
      "Inventory management",
      "Quality assurance",
    ],
    benefits: ["Verified farmer network", "Quality tracking", "Reduced waste"],
    ctaText: "Join marketplace",
    gradient: "from-purple-500 to-pink-600",
    users: "150+",
  },
];

const trustIndicators = [
  { icon: Brain, text: "AI First" },
  { icon: Database, text: "Blockchain" },
  { icon: Shield, text: "Trust" },
  { icon: KeyRound, text: "Data Integrity" },
  { icon: Lock, text: "Privacy" },
];

const Hero = () => {
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50 dark:from-slate-950 dark:via-green-950/30 dark:to-emerald-950 overflow-hidden">
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
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="pt-20 pb-16 lg:pt-28 lg:pb-24">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <Badge
                variant="outline"
                className="mb-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Pangeni Ulimi Wanu • Transform Your Farm
                </div>
              </Badge>
              <img
                src={greenuppLogo}
                alt="GreenUpp"
                className="h-12 mx-auto mb-6"
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-slate-800 via-green-800 to-emerald-800 dark:from-slate-100 dark:via-green-100 dark:to-emerald-100 bg-clip-text text-transparent">
                Smart Farming for
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Zambian Farmers
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed"
            >
              Join{" "}
              <span className="font-semibold text-green-700 dark:text-green-400">
                2,000+ Zambian farmers
              </span>{" "}
              increasing yields by 40% with AI-powered agriculture technology
              that works offline and speaks your language.
            </motion.p>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              {trustIndicators.map((indicator, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700"
                >
                  <indicator.icon className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {indicator.text}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* User Type Selector */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-16"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                Choose Your Farming Journey
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Select your farming type to see personalized benefits
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {userTypes.map((type, index) => (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="group"
                  onMouseEnter={() => setHoveredCard(type.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <Card
                    className={`relative overflow-hidden transition-all duration-500 cursor-pointer border-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-2xl hover:shadow-green-500/10 ${
                      selectedUserType === type.id
                        ? "border-green-500 shadow-xl shadow-green-500/20 scale-105"
                        : hoveredCard === type.id
                        ? "border-green-300 shadow-lg hover:scale-105"
                        : "border-slate-200 dark:border-slate-700 hover:border-green-200"
                    }`}
                    onClick={() =>
                      setSelectedUserType(
                        selectedUserType === type.id ? null : type.id
                      )
                    }
                  >
                    {/* Gradient Background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                    />

                    <CardContent className="p-8 relative z-10">
                      {/* Header */}
                      <div className="text-center mb-6">
                        <div
                          className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${type.gradient} p-0.5 group-hover:scale-110 transition-transform duration-300`}
                        >
                          <div className="w-full h-full bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center">
                            <type.icon className="w-8 h-8 text-slate-700 dark:text-slate-300" />
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                          {type.title}
                        </h3>
                        <p className="text-green-600 dark:text-green-400 font-medium mb-2">
                          {type.subtitle}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                          {type.description}
                        </p>

                        <div className="flex items-center justify-center gap-2 mb-4">
                          <Users className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700 dark:text-green-400">
                            {type.users} farmers
                          </span>
                        </div>
                      </div>

                      {/* Benefits Preview */}
                      <div className="space-y-3 mb-6">
                        {type.benefits.slice(0, 3).map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {benefit}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <Button
                        className={`w-full bg-gradient-to-r ${type.gradient} hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 text-white font-medium`}
                        size="lg"
                        asChild
                      >
                        <a href="/testing-waitlist">
                          {type.ctaText}
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </a>
                      </Button>

                      {/* Expanded Content */}
                      {selectedUserType === type.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700"
                        >
                          <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">
                            Common Challenges:
                          </h4>
                          <div className="space-y-2 mb-4">
                            {type.challenges.map((challenge, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2"
                              >
                                <div className="w-2 h-2 bg-red-400 rounded-full" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  {challenge}
                                </span>
                              </div>
                            ))}
                          </div>

                          <Link href="/auth">
                            <Button variant="outline" className="w-full">
                              Get Started Now
                            </Button>
                          </Link>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Main CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center"
          >
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Link href="/auth">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300"
                >
                  Yambani Lelo (Start Today)
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                className="border-2 border-slate-300 hover:border-green-500 bg-white/80 backdrop-blur-sm px-8 py-4 text-lg font-medium hover:bg-green-50 transition-all duration-300"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                WhatsApp Demo
              </Button>
            </div>

            {/* Success Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { icon: TrendingUp, value: "40%", label: "Yield Increase" },
                { icon: Users, value: "2,000+", label: "Active Farmers" },
                { icon: Heart, value: "10", label: "Provinces Covered" },
                { icon: Star, value: "4.8", label: "User Rating" },
              ].map((metric, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-xl flex items-center justify-center">
                    <metric.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {metric.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
