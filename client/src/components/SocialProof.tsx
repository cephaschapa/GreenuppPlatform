import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  MapPin,
  Users,
  TrendingUp,
  Award,
  Shield,
  Globe,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Quote,
  Sprout,
  DollarSign,
  Calendar,
  CheckCircle,
  Brain,
  Database,
  Cloud,
  Lock,
  KeyRound,
  ShieldCheck,
  Truck,
} from "lucide-react";

const zambianTestimonials = [
  {
    id: 1,
    name: "John Mwanza",
    location: "Chongwe District, Lusaka Province",
    farmSize: "2 hectares",
    crops: ["Maize", "Groundnuts"],
    image: "👨‍🌾",
    quote:
      "GreenUpp yamfundisha ukwaba nge mvula. Saino ninshi nabweza chakudya chikulu chisuma 4 tons pa hectare instead of 1.5 tons.",
    quoteEn:
      "GreenUpp taught me about weather patterns. Now I harvest much more food - 4 tons per hectare instead of 1.5 tons.",
    results: {
      yieldIncrease: "167%",
      incomeBefore: "K3,000",
      incomeAfter: "K8,000",
      season: "2023/24",
    },
    rating: 5,
    verified: true,
    beforeAfter: {
      before: "Struggled with unpredictable weather, low yields",
      after: "Weather alerts help me plan better, yields tripled",
    },
  },
  {
    id: 2,
    name: "Mary Banda",
    location: "Mazabuka, Southern Province",
    farmSize: "5 hectares",
    crops: ["Maize", "Sweet Potatoes"],
    image: "👩‍🌾",
    quote:
      "Ninagulitsa direct ku Shoprite nge GreenUpp marketplace. Ndalanda K15/kg instead of K8/kg kwa ba middleman.",
    quoteEn:
      "I sell directly to Shoprite through GreenUpp marketplace. I get K15/kg instead of K8/kg from middlemen.",
    results: {
      yieldIncrease: "40%",
      incomeBefore: "K12,000",
      incomeAfter: "K28,000",
      season: "2023/24",
    },
    rating: 5,
    verified: true,
    beforeAfter: {
      before: "Sold to middlemen at low prices",
      after: "Direct buyer connections, premium prices",
    },
  },
  {
    id: 3,
    name: "Peter Sikanyika",
    location: "Mkushi, Central Province",
    farmSize: "8 hectares",
    crops: ["Maize", "Soybeans", "Wheat"],
    image: "👨‍🌾",
    quote:
      "Ba expert bali nge phone. Bampafundisha ukupanga fertilizer properly. Nasave K5,000 pa season.",
    quoteEn:
      "Experts are on the phone. They taught me how to apply fertilizer properly. I saved K5,000 per season.",
    results: {
      yieldIncrease: "55%",
      incomeBefore: "K25,000",
      incomeAfter: "K45,000",
      season: "2023/24",
    },
    rating: 5,
    verified: true,
    beforeAfter: {
      before: "Overused expensive fertilizers, poor soil health",
      after: "Precision application, healthy soil, lower costs",
    },
  },
  {
    id: 4,
    name: "Grace Mulenga",
    location: "Ndola, Copperbelt Province",
    farmSize: "1.5 hectares",
    crops: ["Vegetables", "Beans"],
    image: "👩‍🌾",
    quote:
      "Mobile money yapangila bwino. Ninlipila K50 pa month, lelo ndalanda K3,000 more pa season.",
    quoteEn:
      "Mobile money works well. I pay K50 per month, but now I earn K3,000 more per season.",
    results: {
      yieldIncrease: "80%",
      incomeBefore: "K4,000",
      incomeAfter: "K7,200",
      season: "2023/24",
    },
    rating: 5,
    verified: true,
    beforeAfter: {
      before: "Small-scale farming with limited knowledge",
      after: "Smart farming techniques, higher value crops",
    },
  },
];

const techVendors = [
  {
    name: "Metatron AI",
    logo: <Brain className="w-8 h-8 text-blue-600 mx-auto" />,
    description: "AI-powered insights and automation",
    type: "AI",
  },
  {
    name: "Hyperledger Fabric",
    logo: <Database className="w-8 h-8 text-purple-600 mx-auto" />,
    description: "Enterprise blockchain for secure records",
    type: "Blockchain",
  },
  {
    name: "Railway",
    logo: <Cloud className="w-8 h-8 text-orange-500 mx-auto" />,
    description: "Modern cloud deployment infrastructure",
    type: "Cloud",
  },
  {
    name: "Metatron Pay",
    logo: <DollarSign className="w-8 h-8 text-green-600 mx-auto" />,
    description: "Seamless digital payments for agriculture",
    type: "Payments",
  },
  {
    name: "Drop",
    logo: <Truck className="w-8 h-8 text-emerald-600 mx-auto" />,
    description: "Reliable delivery and logistics integration",
    type: "Deliveries",
  },
  {
    name: "SSL",
    logo: <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />,
    description: "Trusted & encrypted connections",
    type: "Trust",
  },
];

const stats = [
  {
    icon: Users,
    value: "2,000+",
    label: "Active Farmers",
    description: "Across all 10 provinces",
  },
  {
    icon: TrendingUp,
    value: "40%",
    label: "Average Yield Increase",
    description: "First season results",
  },
  {
    icon: DollarSign,
    value: "K2,000",
    label: "Average Savings",
    description: "Per hectare per season",
  },
  {
    icon: MapPin,
    value: "10",
    label: "Provinces Covered",
    description: "Nationwide presence",
  },
];

const ZambianSocialProof = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % zambianTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) =>
        (prev - 1 + zambianTestimonials.length) % zambianTestimonials.length
    );
  };

  const currentFarmer = zambianTestimonials[currentTestimonial];

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-white via-green-50/30 to-emerald-50/50 dark:from-slate-950 dark:via-green-950/30 dark:to-emerald-950/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='50' cy='50' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "100px 100px",
          }}
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge
            variant="outline"
            className="mb-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-2"
          >
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Trusted by Zambian Farmers
            </div>
          </Badge>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-slate-800 via-green-800 to-emerald-800 dark:from-slate-100 dark:via-green-100 dark:to-emerald-100 bg-clip-text text-transparent">
              Real Stories from
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Real Farmers
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            See how Zambian farmers are transforming their operations and
            increasing profits with GreenUpp's smart farming technology.
          </p>
        </motion.div>

        {/* Success Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-xl flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {stat.description}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Featured Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mb-16"
        >
          <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-2 border-green-200 dark:border-green-800 shadow-xl hover:shadow-2xl transition-all duration-500 max-w-5xl mx-auto">
            <CardContent className="p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                {/* Farmer Profile */}
                <div className="flex-shrink-0 text-center lg:text-left">
                  <div className="w-24 h-24 mx-auto lg:mx-0 mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-4xl shadow-lg">
                    {currentFarmer.image}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                    {currentFarmer.name}
                  </h3>
                  <div className="flex items-center justify-center lg:justify-start gap-1 text-green-600 dark:text-green-400 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{currentFarmer.location}</span>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {currentFarmer.farmSize} • {currentFarmer.crops.join(", ")}
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    {currentFarmer.verified && (
                      <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Testimonial Content */}
                <div className="flex-1">
                  <Quote className="w-8 h-8 text-green-600 mb-4" />

                  {/* Local Language Quote */}
                  <blockquote className="text-lg italic text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                    "{currentFarmer.quote}"
                  </blockquote>

                  {/* English Translation */}
                  <blockquote className="text-base text-slate-600 dark:text-slate-400 mb-6 leading-relaxed border-l-4 border-green-200 pl-4">
                    English: "{currentFarmer.quoteEn}"
                  </blockquote>

                  {/* Results */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                        +{currentFarmer.results.yieldIncrease}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        Yield Increase
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-center">
                      <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                        {currentFarmer.results.incomeBefore} →{" "}
                        {currentFarmer.results.incomeAfter}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        Income Change
                      </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-3 text-center col-span-2 lg:col-span-1">
                      <div className="text-sm font-bold text-purple-700 dark:text-purple-300">
                        {currentFarmer.results.season}
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">
                        Season
                      </div>
                    </div>
                  </div>

                  {/* Before/After */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border-l-4 border-red-400">
                      <div className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                        Before GreenUpp:
                      </div>
                      <div className="text-xs text-red-700 dark:text-red-300">
                        {currentFarmer.beforeAfter.before}
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border-l-4 border-green-400">
                      <div className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                        After GreenUpp:
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-300">
                        {currentFarmer.beforeAfter.after}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button
                  variant="outline"
                  onClick={prevTestimonial}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  {zambianTestimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentTestimonial
                          ? "bg-green-600"
                          : "bg-slate-300"
                      }`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={nextTestimonial}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Partnerships */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-8">
            Powered by Leading Technologies
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {techVendors.map((vendor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="mb-3">{vendor.logo}</div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
                      {vendor.name}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      {vendor.description}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {vendor.type}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ZambianSocialProof;
