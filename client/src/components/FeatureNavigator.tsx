import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tractor,
  Bot,
  Store,
  CloudRain,
  CheckCircle,
  ArrowRight,
  Smartphone,
  MessageSquare,
  TrendingUp,
  Star,
  Zap,
  Globe,
} from "lucide-react";

const zambianFeatures = [
  {
    id: "weather-intelligence",
    icon: CloudRain,
    name: "Weather Intelligence",
    nameLocal: "Ukwishiba Kwa Mvula",
    description:
      "Get accurate weather forecasts and alerts specifically for Zambian farming conditions and seasonal patterns.",
    descriptionLocal:
      "Landani ma forecast ya mvula yabwino ukufuna ukwishiba nge nyengo za kulima.",
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    stats: "7-day accuracy: 94% for Zambian regions",
    benefits: [
      "SMS weather alerts in Bemba/Nyanja",
      "Seasonal planting recommendations",
      "Drought and flood early warnings",
      "Province-specific climate data",
    ],
    testimonial: {
      farmer: "Grace Mulenga, Kabwe",
      quote:
        "Weather alerts yamfundisha ukwaba nge mvula. Nabweza chakudya chikulu!",
    },
    keyFeature: "Works offline - perfect for rural areas",
  },
  {
    id: "ai-farming-assistant",
    icon: Bot,
    name: "AI Farming Assistant",
    nameLocal: "Muthandizi Wa AI",
    description:
      "Your personal farming expert that speaks your language and understands Zambian farming conditions.",
    descriptionLocal:
      "Muthandizi wanu wa kulima uyo amalankhula mu Chinyanja ndi Chibemba.",
    gradient: "from-purple-500 via-indigo-500 to-blue-500",
    stats: "Answers 95% of farming questions in local languages",
    benefits: [
      "WhatsApp integration for easy access",
      "Crop disease diagnosis with photos",
      "Fertilizer recommendations for Zambian soils",
      "Pest management in local languages",
    ],
    testimonial: {
      farmer: "Samuel Mbewe, Chipata",
      quote: "Ba AI bampafundisha ukupanga fertilizer properly. Very helpful!",
    },
    keyFeature: "Available 24/7 via WhatsApp",
  },
  {
    id: "direct-marketplace",
    icon: Store,
    name: "Direct Marketplace",
    nameLocal: "Msika Wachindunji",
    description:
      "Connect directly with buyers like Shoprite, avoiding middlemen and getting fair prices for your produce.",
    descriptionLocal:
      "Gulitsani kwa ba buyer ngati Shoprite mosavuta. Palibe ba middleman.",
    gradient: "from-emerald-500 via-green-500 to-lime-500",
    stats: "Average 87% price increase vs middlemen",
    benefits: [
      "Direct connections to Shoprite, Pick n Pay",
      "Quality verification and premium pricing",
      "Mobile money payments (MTN, Airtel)",
      "Bulk selling for cooperatives",
    ],
    testimonial: {
      farmer: "Agnes Chanda, Monze",
      quote: "Ndalanda K18/kg instead of K9/kg from middlemen. Amazing!",
    },
    keyFeature: "Verified buyers with guaranteed payments",
  },
  {
    id: "smart-farming-tools",
    icon: Tractor,
    name: "Smart Farming Tools",
    nameLocal: "Zipangizo Za Ulimi",
    description:
      "Digital tools designed for Zambian farmers to manage fields, crops, and farming activities efficiently.",
    descriptionLocal:
      "Zipangizo za pa phone zokuthandizani kukonza minda yanu bwino.",
    gradient: "from-orange-500 via-red-500 to-pink-500",
    stats: "50% increase in farm productivity",
    benefits: [
      "Field mapping with GPS coordinates",
      "Crop calendar for Zambian seasons",
      "Task reminders via SMS",
      "Equipment sharing with neighbors",
    ],
    testimonial: {
      farmer: "Grace Mulenga, Ndola",
      quote:
        "Ndimadziwa chakuti nchitenge liti pa field yanga. Very organized!",
    },
    keyFeature: "Works on basic smartphones",
  },
];

const ZambianFeatureNavigator = () => {
  const [activeFeature, setActiveFeature] = useState(zambianFeatures[0].id);
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  // const currentFeature =
  //   zambianFeatures.find((f) => f.id === activeFeature) || zambianFeatures[0];

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-blue-50/30 dark:from-emerald-950/50 dark:via-slate-900 dark:to-blue-950/30">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='60' cy='60' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "120px 120px",
          }}
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

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
              <Zap className="w-4 h-4" />
              Smart Technology for Zambian Farmers
            </div>
          </Badge>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-slate-800 via-green-800 to-emerald-800 dark:from-slate-100 dark:via-green-100 dark:to-emerald-100 bg-clip-text text-transparent">
              Powerful Features
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Built for Zambia
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Every feature is designed with Zambian farmers in mind - from local
            language support to mobile money integration.
          </p>
        </motion.div>

        {/* Feature Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-16"
        >
          <Tabs
            value={activeFeature}
            onValueChange={setActiveFeature}
            className="w-full"
          >
            {/* Feature Tabs */}
            <div className="flex justify-center mb-12">
              <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg h-[120px]">
                {zambianFeatures.map((feature, _index) => (
                  <TabsTrigger
                    key={feature.id}
                    value={feature.id}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 data-[state=active]:shadow-lg ${
                      activeFeature === feature.id
                        ? `bg-gradient-to-br ${feature.gradient} text-white data-[state=active]:text-white`
                        : "hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                    onMouseEnter={() => setHoveredFeature(feature.id)}
                    onMouseLeave={() => setHoveredFeature(null)}
                  >
                    <motion.div
                      animate={{
                        scale:
                          activeFeature === feature.id ||
                          hoveredFeature === feature.id
                            ? 1.1
                            : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <feature.icon className="w-6 h-6" />
                    </motion.div>
                    <div className="text-center">
                      <div className="font-semibold text-sm">
                        {feature.name}
                      </div>
                      <div className="text-xs opacity-80">
                        {feature.nameLocal}
                      </div>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Feature Content */}
            {zambianFeatures.map((feature) => (
              <TabsContent key={feature.id} value={feature.id} className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="grid lg:grid-cols-2 gap-12 items-center"
                >
                  {/* Feature Details */}
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5 shadow-lg`}
                        >
                          <div className="w-full h-full bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <feature.icon className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            {feature.name}
                          </h3>
                          <p className="text-green-600 dark:text-green-400 font-medium">
                            {feature.nameLocal}
                          </p>
                        </div>
                      </div>

                      <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                        {feature.description}
                      </p>

                      <p className="text-base text-slate-600 dark:text-slate-400 italic border-l-4 border-green-200 pl-4">
                        {feature.descriptionLocal}
                      </p>
                    </div>

                    {/* Key Stats */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-6 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3 mb-3">
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="font-semibold text-green-800 dark:text-green-200">
                          Key Performance
                        </span>
                      </div>
                      <p className="text-green-700 dark:text-green-300 font-medium">
                        {feature.stats}
                      </p>
                    </div>

                    {/* Benefits List */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Key Benefits:
                      </h4>
                      <div className="grid gap-3">
                        {feature.benefits.map((benefit, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {benefit}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Key Feature Highlight */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-blue-800 dark:text-blue-200">
                          {feature.keyFeature}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Feature Visualization */}
                  <div className="relative">
                    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-500">
                      <CardContent className="p-8">
                        {/* Testimonial */}
                        <div className="mb-8">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {feature.testimonial.farmer.split(" ")[0][0]}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 dark:text-slate-100">
                                {feature.testimonial.farmer}
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                Verified Farmer
                              </div>
                            </div>
                            <div className="ml-auto">
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          <blockquote className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                            "{feature.testimonial.quote}"
                          </blockquote>
                        </div>

                        {/* Feature Demo Visualization */}
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <feature.icon className="w-5 h-5 text-green-600" />
                              <span className="font-medium text-slate-800 dark:text-slate-100">
                                {feature.name} Demo
                              </span>
                            </div>
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              LIVE
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                Status
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                Active
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                Coverage
                              </span>
                              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                All 10 Provinces
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                Users
                              </span>
                              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                2,000+ Farmers
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-8 text-center">
                          <Button
                            className={`bg-gradient-to-r ${feature.gradient} hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 text-white font-medium px-8`}
                            size="lg"
                          >
                            Try {feature.name}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-green-600 via-emerald-700 to-teal-800 border-0 text-white max-w-4xl mx-auto">
            <CardContent className="p-8 sm:p-12">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                Ready to Transform Your Farm?
              </h3>
              <p className="text-green-100 mb-8 text-lg leading-relaxed">
                Join Zambian farmers using these smart farming tools to increase
                yields and profits.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-green-700 hover:bg-green-50 font-bold px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Start WhatsApp Demo
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white text-green-700 hover:bg-green-50 font-bold px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <Globe className="w-5 h-5 mr-2" />
                  View All Features
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default ZambianFeatureNavigator;
