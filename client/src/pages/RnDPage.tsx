import React, { useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  Cpu,
  Radio,
  Thermometer,
  Droplets,
  Zap,
  Satellite,
  Brain,
  Database,
  Camera,
  Wifi,
  Battery,
  MapPin,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle,
  Wrench,
  Beaker,
  Lightbulb,
  Target,
  TrendingUp,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const RnDPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const researchAreas = [
    {
      id: "iot-sensors",
      title: "Smart IoT Sensor Networks",
      description:
        "Developing low-cost, solar-powered sensors for continuous farm monitoring",
      icon: Radio,
      color: "blue",
      progress: 75,
      timeline: "Q2 2025 Beta Release",
      budget: "$150,000",
      technologies: [
        {
          name: "Soil Monitoring Sensors",
          description:
            "Multi-parameter sensors measuring moisture, pH, NPK levels, and temperature",
          specs: {
            "Battery Life": "2+ years solar-powered",
            "Transmission Range": "5km LoRaWAN",
            "Measurement Accuracy": "±2% for moisture, ±0.1 pH",
            "Environmental Rating": "IP67 waterproof",
            "Cost Target": "Under $50 per sensor",
          },
          status: "Prototype Testing",
          progress: 80,
        },
        {
          name: "Weather Microstations",
          description:
            "Hyperlocal weather monitoring with AI-powered prediction models",
          specs: {
            Parameters: "Temperature, humidity, wind, rainfall, UV, pressure",
            "Data Frequency": "Every 5 minutes",
            "Forecast Accuracy": "95% for 24-hour local predictions",
            Connectivity: "4G + LoRaWAN backup",
            Installation: "Plug-and-play setup",
          },
          status: "Field Trials",
          progress: 70,
        },
        {
          name: "Crop Health Cameras",
          description:
            "AI-powered visual monitoring for pest and disease detection",
          specs: {
            Resolution: "12MP with macro lens",
            "AI Processing": "Edge computing for real-time analysis",
            Power: "Solar panel + battery backup",
            "Analysis Speed": "< 30 seconds per image",
            "Disease Detection": "85+ crop diseases identified",
          },
          status: "Algorithm Training",
          progress: 60,
        },
      ],
    },
    {
      id: "ai-analytics",
      title: "Advanced AI & Machine Learning",
      description:
        "Creating intelligent systems that understand Zambian farming conditions",
      icon: Brain,
      color: "purple",
      progress: 85,
      timeline: "Continuous Development",
      budget: "$200,000",
      technologies: [
        {
          name: "Crop Yield Prediction AI",
          description:
            "Machine learning models predicting yields 3-6 months in advance",
          specs: {
            Accuracy: "90% for major crops (maize, beans, groundnuts)",
            "Data Sources": "Satellite, weather, soil, historical yields",
            "Update Frequency": "Daily model refinement",
            "Local Training": "Zambian-specific datasets",
            "Prediction Range": "3-6 months ahead",
          },
          status: "Production Ready",
          progress: 95,
        },
        {
          name: "Multilingual AI Assistant",
          description:
            "Natural language processing for Zambian languages and farming contexts",
          specs: {
            Languages: "English, Bemba, Nyanja, Tonga, Lozi",
            "Knowledge Base": "10,000+ farming scenarios",
            "Response Time": "< 3 seconds",
            Accuracy: "92% for farming questions",
            Integration: "WhatsApp, SMS, voice calls",
          },
          status: "Beta Testing",
          progress: 75,
        },
        {
          name: "Smart Irrigation AI",
          description:
            "AI-driven irrigation scheduling based on crop needs and weather",
          specs: {
            "Water Savings": "30-40% reduction in water usage",
            "Crop Coverage": "All major Zambian crops",
            "Sensor Integration": "Soil moisture + weather data",
            Automation: "Valve control and scheduling",
            ROI: "Payback within 1 growing season",
          },
          status: "Pilot Programs",
          progress: 65,
        },
      ],
    },
    {
      id: "blockchain",
      title: "Blockchain & Supply Chain",
      description: "Building transparent, traceable agricultural supply chains",
      icon: Database,
      color: "green",
      progress: 60,
      timeline: "Q3 2025 Launch",
      budget: "$120,000",
      technologies: [
        {
          name: "Farm-to-Fork Traceability",
          description: "Complete supply chain tracking from seed to consumer",
          specs: {
            Blockchain: "Hyperledger Fabric enterprise network",
            "QR Codes": "Unique identifiers for each batch",
            "Data Points": "50+ tracked parameters per product",
            Speed: "< 5 second trace completion",
            Integration: "ERP, POS, mobile apps",
          },
          status: "Development",
          progress: 70,
        },
        {
          name: "Smart Contracts for Farming",
          description:
            "Automated payments and agreements between farmers and buyers",
          specs: {
            "Contract Types": "Purchase agreements, insurance, loans",
            "Payment Methods": "Mobile money, bank transfers",
            Automation: "Trigger-based payments",
            "Dispute Resolution": "Built-in arbitration system",
            "Legal Framework": "Zambian commercial law compliant",
          },
          status: "Legal Review",
          progress: 50,
        },
        {
          name: "Carbon Credit Tracking",
          description:
            "Blockchain-verified carbon sequestration and trading platform",
          specs: {
            Measurement: "Satellite + soil sensors",
            Verification: "Third-party auditing",
            Trading: "International carbon markets",
            "Farmer Revenue": "Additional income stream",
            Transparency: "Public carbon impact dashboard",
          },
          status: "Research Phase",
          progress: 30,
        },
      ],
    },
    {
      id: "mobile-tech",
      title: "Mobile & Edge Computing",
      description:
        "Optimizing technology for rural connectivity and offline use",
      icon: Wifi,
      color: "orange",
      progress: 90,
      timeline: "Q1 2025 Updates",
      budget: "$80,000",
      technologies: [
        {
          name: "Offline-First Architecture",
          description:
            "Mobile apps that work seamlessly without internet connectivity",
          specs: {
            "Offline Duration": "30+ days without sync",
            "Data Sync": "Automatic when connected",
            Storage: "Local SQLite databases",
            Functionality: "80% features work offline",
            "Battery Optimization": "< 2% per hour usage",
          },
          status: "Production",
          progress: 20,
        },
        {
          name: "Edge AI Processing",
          description:
            "On-device AI processing for instant results without internet",
          specs: {
            "Model Size": "< 50MB on-device models",
            "Processing Speed": "< 2 seconds for analysis",
            Accuracy: "85% of cloud-based performance",
            "Device Support": "Android 8+ and iOS 12+",
            "Power Usage": "Optimized for low-end devices",
          },
          status: "Testing",
          progress: 30,
        },
        {
          name: "LoRaWAN Network Deployment",
          description:
            "Long-range, low-power wireless network for rural farm connectivity",
          specs: {
            Range: "15km in rural areas",
            "Battery Life": "10+ years for sensors",
            "Network Coverage": "500+ gateways planned",
            "Data Rate": "Sufficient for sensor data",
            Cost: "< $5/month per device",
          },
          status: "Pilot Deployment",
          progress: 40,
        },
      ],
    },
  ];

  const researchPartners = [
    {
      name: "University of Zambia",
      type: "Academic Research",
      focus: "Agricultural science and crop modeling",
      logo: "🎓",
    },
    {
      name: "CGIAR Research Centers",
      type: "International Collaboration",
      focus: "Climate-smart agriculture technologies",
      logo: "🌍",
    },
    {
      name: "Zambia Agricultural Research Institute",
      type: "Government Partnership",
      focus: "Local crop varieties and farming practices",
      logo: "🏛️",
    },
    {
      name: "Microsoft AI for Good",
      type: "Technology Partnership",
      focus: "AI model development and cloud infrastructure",
      logo: "☁️",
    },
    {
      name: "Hyperledger Foundation",
      type: "Open Source",
      focus: "Blockchain infrastructure and standards",
      logo: "🔗",
    },
    {
      name: "LoRa Alliance",
      type: "Industry Consortium",
      focus: "IoT connectivity standards and certification",
      logo: "📡",
    },
  ];

  const upcomingMilestones = [
    {
      quarter: "Q4 2025",
      milestones: [
        "Complete soil sensor field trials in 10 districts",
        "Launch edge AI processing in mobile app",
        "Deploy first 50 LoRaWAN gateways",
      ],
    },
    {
      quarter: "Q1 2026",
      milestones: [
        "Commercial release of IoT sensor kits",
        "Integrate blockchain traceability with major buyers",
        "Expand multilingual AI to 5 Zambian languages",
      ],
    },
    {
      quarter: "Q2 2026",
      milestones: [
        "Launch farm-to-fork traceability platform",
        "Deploy 200+ weather microstations",
        "Begin carbon credit pilot programs",
      ],
    },
    {
      quarter: "Q3 2026",
      milestones: [
        "Achieve 1000+ IoT devices deployed",
        "Launch smart contract marketplace",
        "Establish research lab in Lusaka",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>
          Research & Development - GreenUpp | IoT Agriculture Innovation
        </title>
        <meta
          name="description"
          content="Explore GreenUpp's cutting-edge R&D in IoT sensors, AI analytics, blockchain technology, and mobile solutions for smart agriculture in Zambia."
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
              Research & Development
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
              className="mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 px-4 py-2"
            >
              <Beaker className="w-4 h-4 mr-2" />
              Innovation Lab • IoT Technologies • AI Research
            </Badge>
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 dark:from-slate-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                Building the Future of
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Smart Agriculture
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Our R&D team is developing next-generation IoT sensors, AI
              analytics, and blockchain solutions specifically designed for
              Zambian farming conditions. Discover the cutting-edge technologies
              that will transform agriculture across Africa.
            </p>
          </motion.div>

          {/* Research Overview Cards */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-16"
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {researchAreas.map((area, index) => (
                <Card
                  key={area.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 bg-${area.color}-100 dark:bg-${area.color}-900 rounded-xl flex items-center justify-center mb-4`}
                    >
                      <area.icon
                        className={`w-6 h-6 text-${area.color}-600 dark:text-${area.color}-400`}
                      />
                    </div>
                    <h3 className="font-bold mb-2">{area.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {area.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{area.progress}%</span>
                      </div>
                      <Progress value={area.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{area.timeline}</span>
                        <span>{area.budget}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Detailed Technology Research */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold mb-8">Technology Deep Dive</h3>
            <Tabs defaultValue="iot-sensors" className="w-full">
              <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-2 w-full h-auto">
                {researchAreas.map((area) => (
                  <TabsTrigger
                    key={area.id}
                    value={area.id}
                    className="flex flex-col items-center gap-2 p-4 h-auto"
                  >
                    <area.icon className="w-5 h-5" />
                    <span className="text-xs text-center">{area.title}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {researchAreas.map((area) => (
                <TabsContent key={area.id} value={area.id} className="mt-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card
                      className={`border-${area.color}-200 dark:border-${area.color}-800 mb-6`}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <area.icon
                            className={`w-6 h-6 text-${area.color}-600 dark:text-${area.color}-400`}
                          />
                          {area.title}
                        </CardTitle>
                        <p className="text-muted-foreground">
                          {area.description}
                        </p>
                      </CardHeader>
                    </Card>

                    <div className="space-y-6">
                      {area.technologies.map((tech, techIndex) => (
                        <Card key={techIndex}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">
                                  {tech.name}
                                </CardTitle>
                                <p className="text-muted-foreground">
                                  {tech.description}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge
                                  variant={
                                    tech.progress > 80
                                      ? "default"
                                      : tech.progress > 50
                                      ? "secondary"
                                      : "outline"
                                  }
                                >
                                  {tech.status}
                                </Badge>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {tech.progress}% Complete
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {Object.entries(tech.specs).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="bg-muted/50 rounded-lg p-3"
                                  >
                                    <div className="font-medium text-sm">
                                      {key}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {value}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                            <div className="mt-4">
                              <Progress value={tech.progress} className="h-2" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </motion.section>

          {/* Research Partners */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold text-center mb-8">
              Research Partners & Collaborations
            </h3>
            {/* <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {researchPartners.map((partner, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{partner.logo}</div>
                    <h4 className="font-semibold mb-2">{partner.name}</h4>
                    <Badge variant="outline" className="mb-3">
                      {partner.type}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {partner.focus}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div> */}
          </motion.section>

          {/* Development Roadmap */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold text-center mb-8">
              2025 Development Roadmap
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingMilestones.map((period, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      {period.quarter}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {period.milestones.map((milestone, mIndex) => (
                        <li key={mIndex} className="flex items-start gap-2">
                          <Target className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{milestone}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Investment & Contact */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
              <CardContent className="p-8 text-center">
                <h3 className="text-3xl font-bold mb-4">
                  Join Our Innovation Journey
                </h3>
                <p className="text-blue-100 mb-6 max-w-3xl mx-auto text-lg">
                  We're looking for research partners, investors, and technology
                  collaborators to help accelerate agricultural innovation in
                  Zambia and across Africa. Get involved in building the future
                  of farming.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-blue-50"
                  >
                    <a href="mailto:research@metatronltd.com">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Research Partnerships
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-blue-600"
                  >
                    <a href="mailto:invest@metatronltd.com">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Investment Opportunities
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-blue-600"
                  >
                    <Link href="/about">
                      <Globe className="w-4 h-4 mr-2" />
                      Learn About Our Team
                    </Link>
                  </Button>
                </div>
                <div className="text-blue-200 text-sm">
                  Total R&D Investment: $550,000+ • 15+ Active Research Projects
                  • 50+ Patents Pending
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RnDPage;
