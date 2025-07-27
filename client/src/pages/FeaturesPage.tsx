import React, { useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  Users,
  Tractor,
  Store,
  CheckCircle,
  Star,
  Smartphone,
  Cloud,
  Brain,
  Database,
  Zap,
  Globe,
  MessageSquare,
  TrendingUp,
  Shield,
  MapPin,
  Calendar,
  DollarSign,
  BarChart3,
  Camera,
  Wifi,
  WifiOff,
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const FeaturesPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userTypes = [
    {
      id: "smallholder",
      name: "Ba Farmer Ba Kuchikolo",
      subtitle: "Small-scale Farmers (0.5-5 hectares)",
      icon: Users,
      color: "emerald",
      description:
        "Essential smart farming tools designed for small-scale farmers growing maize, groundnuts, and beans",
      users: "1,800+ active farmers",
      features: [
        {
          category: "Weather Intelligence",
          icon: Cloud,
          items: [
            {
              name: "7-day SMS weather forecasts",
              description: "Accurate forecasts sent directly to your phone",
            },
            {
              name: "Planting calendar alerts",
              description:
                "Know exactly when to plant based on weather patterns",
            },
            {
              name: "Drought & flood warnings",
              description: "Early warnings to protect your crops",
            },
            {
              name: "Seasonal climate predictions",
              description: "Plan your farming year with confidence",
            },
          ],
        },
        {
          category: "AI Farming Assistant",
          icon: Brain,
          items: [
            {
              name: "WhatsApp crop advice",
              description: "Get instant farming advice through WhatsApp",
            },
            {
              name: "Pest identification",
              description: "Photo-based pest and disease diagnosis",
            },
            {
              name: "Fertilizer recommendations",
              description: "Optimize fertilizer use for your soil type",
            },
            {
              name: "Local language support",
              description: "AI assistance in Bemba, Nyanja, and English",
            },
          ],
        },
        {
          category: "Market Access",
          icon: DollarSign,
          items: [
            {
              name: "Direct buyer connections",
              description: "Sell directly to verified buyers like Shoprite",
            },
            {
              name: "Real-time price updates",
              description: "Know current market prices for your crops",
            },
            {
              name: "Mobile money payments",
              description: "Secure payments via MTN MoMo and Airtel Money",
            },
            {
              name: "Quality premium tracking",
              description: "Get paid more for higher quality produce",
            },
          ],
        },
        {
          category: "Offline Capabilities",
          icon: WifiOff,
          items: [
            {
              name: "Offline data sync",
              description: "Record farm data without internet connection",
            },
            {
              name: "SMS-based alerts",
              description: "Critical information via SMS when offline",
            },
            {
              name: "Cached recommendations",
              description: "Access previous advice without internet",
            },
            {
              name: "Local data storage",
              description: "Your data safely stored on your device",
            },
          ],
        },
      ],
    },
    {
      id: "commercial",
      name: "Ba Farmer Ba Ukulu",
      subtitle: "Commercial Farmers (5+ hectares)",
      icon: Tractor,
      color: "blue",
      description:
        "Advanced precision agriculture tools for mechanized farming operations",
      users: "200+ commercial farms",
      features: [
        {
          category: "Precision Agriculture",
          icon: MapPin,
          items: [
            {
              name: "Satellite field monitoring",
              description: "Monitor crop health from space imagery",
            },
            {
              name: "GPS field mapping",
              description: "Precise field boundaries and area calculations",
            },
            {
              name: "Variable rate application",
              description: "Optimize input application across fields",
            },
            {
              name: "Yield mapping",
              description: "Track productivity variations within fields",
            },
          ],
        },
        {
          category: "Equipment Management",
          icon: Tractor,
          items: [
            {
              name: "Machinery tracking",
              description: "Monitor equipment location and usage",
            },
            {
              name: "Maintenance scheduling",
              description: "Automated maintenance reminders",
            },
            {
              name: "Fuel consumption analytics",
              description: "Optimize fuel usage and costs",
            },
            {
              name: "Performance monitoring",
              description: "Track equipment efficiency metrics",
            },
          ],
        },
        {
          category: "Advanced Analytics",
          icon: BarChart3,
          items: [
            {
              name: "Profit & loss analysis",
              description: "Detailed financial performance tracking",
            },
            {
              name: "Cost per hectare reports",
              description: "Understand your true production costs",
            },
            {
              name: "ROI optimization",
              description: "Maximize return on agricultural investments",
            },
            {
              name: "Predictive modeling",
              description: "Forecast yields and plan accordingly",
            },
          ],
        },
        {
          category: "Data Integration",
          icon: Database,
          items: [
            {
              name: "ERP system integration",
              description: "Connect with existing farm management systems",
            },
            {
              name: "IoT sensor networks",
              description: "Soil moisture, temperature, and pH monitoring",
            },
            {
              name: "Weather station data",
              description: "Hyperlocal weather monitoring",
            },
            {
              name: "Supply chain tracking",
              description: "Full traceability from seed to sale",
            },
          ],
        },
      ],
    },
    {
      id: "business",
      name: "Ba Business",
      subtitle: "Agro-dealers & Buyers",
      icon: Store,
      color: "purple",
      description:
        "Complete B2B platform for input suppliers and produce buyers",
      users: "150+ agribusinesses",
      features: [
        {
          category: "Farmer Network Management",
          icon: Users,
          items: [
            {
              name: "Verified farmer database",
              description: "Access to 2,000+ verified farmers",
            },
            {
              name: "Farmer segmentation",
              description: "Target farmers by size, crops, and location",
            },
            {
              name: "Communication tools",
              description: "Bulk SMS and WhatsApp messaging",
            },
            {
              name: "Relationship tracking",
              description: "Monitor interactions and transactions",
            },
          ],
        },
        {
          category: "Inventory & Supply Chain",
          icon: Database,
          items: [
            {
              name: "Real-time inventory tracking",
              description: "Monitor stock levels across locations",
            },
            {
              name: "Demand forecasting",
              description: "Predict farmer input needs",
            },
            {
              name: "Quality assurance tools",
              description: "Track product quality throughout supply chain",
            },
            {
              name: "Automated reordering",
              description: "Never run out of essential inputs",
            },
          ],
        },
        {
          category: "Marketplace Features",
          icon: Globe,
          items: [
            {
              name: "Bulk purchasing coordination",
              description: "Aggregate farmer orders for better prices",
            },
            {
              name: "Quality grading system",
              description: "Standardized produce quality assessment",
            },
            {
              name: "Contract farming tools",
              description: "Manage agreements with farmers",
            },
            {
              name: "Price discovery",
              description: "Transparent pricing for all participants",
            },
          ],
        },
        {
          category: "Business Intelligence",
          icon: TrendingUp,
          items: [
            {
              name: "Market analytics",
              description: "Understand supply and demand trends",
            },
            {
              name: "Customer insights",
              description: "Deep farmer behavior analytics",
            },
            {
              name: "Financial reporting",
              description: "Comprehensive business performance reports",
            },
            {
              name: "Competitive analysis",
              description: "Benchmark against market competitors",
            },
          ],
        },
      ],
    },
  ];

  const coreCapabilities = [
    {
      icon: Brain,
      title: "AI-Powered",
      description:
        "Advanced machine learning for personalized farming recommendations",
    },
    {
      icon: Database,
      title: "Blockchain Verified",
      description: "Immutable records for complete supply chain transparency",
    },
    {
      icon: Smartphone,
      title: "Mobile-First",
      description: "Optimized for smartphones with offline capabilities",
    },
    {
      icon: Shield,
      title: "Data Secure",
      description:
        "Enterprise-grade security protecting your agricultural data",
    },
    {
      icon: Globe,
      title: "Multilingual",
      description:
        "Available in English, Bemba, Nyanja, and more local languages",
    },
    {
      icon: Zap,
      title: "Real-Time",
      description:
        "Instant alerts, live market prices, and immediate AI responses",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>
          Features - GreenUpp | Smart Farming Tools for Every Farmer
        </title>
        <meta
          name="description"
          content="Explore GreenUpp's comprehensive smart farming features designed for smallholder farmers, commercial operations, and agribusinesses across Zambia."
        />
      </Helmet>

      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iIzMzMyIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIvPjwvZz48L3N2Zz4=')] bg-[length:20px_20px] opacity-5 pointer-events-none dark:opacity-10"></div>

      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="relative pt-24 pb-16">
        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="flex items-center gap-2 mb-8">
            <Link href="/" className="inline-block">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-3xl font-bold tracking-tight">
              Platform Features
            </h1>
          </div>

          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge
              variant="outline"
              className="mb-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-2"
            >
              <Zap className="w-4 h-4 mr-2" />
              Comprehensive Agricultural Technology Platform
            </Badge>
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-800 via-green-800 to-emerald-800 dark:from-slate-100 dark:via-green-100 dark:to-emerald-100 bg-clip-text text-transparent">
                Features Designed for
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Every Type of Farmer
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From smallholder farmers growing 0.5 hectares to commercial
              operations spanning hundreds of hectares, GreenUpp provides the
              right tools for your agricultural needs.
            </p>
          </motion.div>

          {/* Core Capabilities */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold text-center mb-8">
              Core Platform Capabilities
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {coreCapabilities.map((capability, index) => (
                <Card
                  key={index}
                  className="text-center hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-xl flex items-center justify-center">
                      <capability.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="font-semibold mb-2">{capability.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {capability.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Features by User Type */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Tabs defaultValue="smallholder" className="w-full">
              {/* User Type Selector */}
              <div className="flex justify-center mb-12">
                <TabsList className="grid grid-cols-1 lg:grid-cols-3 gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg h-auto">
                  {userTypes.map((userType) => (
                    <TabsTrigger
                      key={userType.id}
                      value={userType.id}
                      className="flex flex-col items-center gap-3 p-6 rounded-xl transition-all duration-300 data-[state=active]:shadow-lg min-w-[250px]"
                    >
                      <userType.icon className="w-8 h-8" />
                      <div className="text-center">
                        <div className="font-semibold">{userType.name}</div>
                        <div className="text-xs opacity-80">
                          {userType.subtitle}
                        </div>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Feature Details for Each User Type */}
              {userTypes.map((userType) => (
                <TabsContent
                  key={userType.id}
                  value={userType.id}
                  className="mt-8"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* User Type Header */}
                    <Card
                      className={`border-${userType.color}-200 dark:border-${userType.color}-800 bg-${userType.color}-50/50 dark:bg-${userType.color}-950/50 mb-8`}
                    >
                      <CardContent className="p-8">
                        <div className="flex items-start gap-6">
                          <div
                            className={`w-16 h-16 bg-gradient-to-br from-${userType.color}-500 to-${userType.color}-600 rounded-2xl flex items-center justify-center shadow-lg`}
                          >
                            <userType.icon className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-3xl font-bold mb-2">
                              {userType.name}
                            </h3>
                            <p className="text-lg text-muted-foreground mb-4">
                              {userType.description}
                            </p>
                            <div className="flex items-center gap-4">
                              <Badge variant="secondary" className="gap-1">
                                <Users className="w-3 h-3" />
                                {userType.users}
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <Star className="w-3 h-3" />
                                4.8/5 Rating
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Feature Categories */}
                    <div className="grid lg:grid-cols-2 gap-8">
                      {userType.features.map((category, categoryIndex) => (
                        <Card
                          key={categoryIndex}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 bg-${userType.color}-100 dark:bg-${userType.color}-900 rounded-lg flex items-center justify-center`}
                              >
                                <category.icon
                                  className={`w-5 h-5 text-${userType.color}-600 dark:text-${userType.color}-400`}
                                />
                              </div>
                              {category.category}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {category.items.map((item, itemIndex) => (
                                <div
                                  key={itemIndex}
                                  className="flex items-start gap-3"
                                >
                                  <CheckCircle
                                    className={`w-4 h-4 text-${userType.color}-600 dark:text-${userType.color}-400 mt-0.5 flex-shrink-0`}
                                  />
                                  <div>
                                    <div className="font-medium">
                                      {item.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {item.description}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* CTA Section */}
                    <Card className="mt-8 bg-gradient-to-r from-slate-800 to-slate-900 border-0 text-white">
                      <CardContent className="p-8 text-center">
                        <h3 className="text-2xl font-bold mb-4">
                          Ready to Transform Your Farming?
                        </h3>
                        <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                          Join thousands of Zambian farmers already using
                          GreenUpp to increase yields, reduce costs, and access
                          better markets.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                          <Button
                            asChild
                            size="lg"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Link href="/auth">Start Free Trial</Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            className="border-white text-slate-800 hover:bg-white hover:text-slate-700"
                          >
                            <Link href="/about">Learn More</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FeaturesPage;
