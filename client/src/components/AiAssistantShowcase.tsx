import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bot,
  MessageSquare,
  Smartphone,
  Globe,
  Zap,
  CheckCircle,
  ArrowRight,
  Send,
  Mic,
  Camera,
  Star,
  Users,
  Clock,
  Languages,
  Brain,
  Sparkles,
} from "lucide-react";

const chatMessages = [
  {
    id: 1,
    type: "user",
    message: "Ninafuna ukwishiba chakuti nchitenge liti chakudya changa?",
    messageEn: "I want to know what's wrong with my crops?",
    timestamp: "10:30 AM",
    language: "Bemba",
  },
  {
    id: 2,
    type: "ai",
    message:
      "Muli bwanji! Ndingakuthandizeni. Tumizani chithunzi cha chakudya chanu, ndipo ndidzakufotokozani vuto ndi njira yothetsera.",
    messageEn:
      "Hello! I can help you. Send a photo of your crop, and I'll explain the problem and solution.",
    timestamp: "10:30 AM",
    language: "Nyanja",
    features: [
      "Photo analysis",
      "Disease diagnosis",
      "Treatment recommendations",
    ],
  },
  {
    id: 3,
    type: "user",
    message: "[📷 Photo of maize with leaf blight]",
    messageEn: "[Photo of maize with leaf blight]",
    timestamp: "10:31 AM",
    hasImage: true,
  },
  {
    id: 4,
    type: "ai",
    message:
      "Ndawona! Chimanga chanu chili ndi matenda otchedwa 'Northern Leaf Blight'. Izi zimachitika chifukwa cha chinyezi chambiri. Njira yothetsera:",
    messageEn:
      "I can see! Your maize has Northern Leaf Blight disease. This happens due to high humidity. Solution:",
    timestamp: "10:32 AM",
    language: "Nyanja",
    solutions: [
      "Gwiritsani ntchito mankhwala a Mancozeb (2g pa lita ya madzi)",
      "Thirani masamba owonongeka",
      "Sungani kuti pali mpweya wabwino pakati pa zomera",
    ],
    solutionsEn: [
      "Use Mancozeb fungicide (2g per liter of water)",
      "Remove affected leaves",
      "Ensure good air circulation between plants",
    ],
  },
];

const aiCapabilities = [
  {
    icon: Camera,
    title: "Photo Diagnosis",
    titleLocal: "Kuwona Pa Chithunzi",
    description: "Take a photo of your crop and get instant disease diagnosis",
    accuracy: "95%",
    languages: ["English", "Bemba", "Nyanja", "Tonga"],
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Integration",
    titleLocal: "WhatsApp Support",
    description: "Chat with AI assistant directly through WhatsApp",
    accuracy: "24/7",
    languages: ["Always available"],
  },
  {
    icon: Globe,
    title: "Local Weather Integration",
    titleLocal: "Mvula Ya Kuno",
    description: "Weather-based farming recommendations for your area",
    accuracy: "10 Provinces",
    languages: ["Real-time data"],
  },
  {
    icon: Brain,
    title: "Smart Recommendations",
    titleLocal: "Malangizo Anzeru",
    description: "Personalized advice based on your farm and location",
    accuracy: "90%",
    languages: ["Contextual advice"],
  },
];

const ZambianAiShowcase = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % chatMessages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentMessage = chatMessages[currentMessageIndex];

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-blue-50/30 via-white to-purple-50/30 dark:from-blue-950/30 dark:via-slate-900 dark:to-purple-950/30">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236366f1' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='50' cy='50' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "100px 100px",
          }}
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>

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
            className="mb-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 px-4 py-2"
          >
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Assistant • Muthandizi wa AI
            </div>
          </Badge>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
              Your Personal Farming
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI Expert
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Get instant farming advice in your local language. Our AI
            understands Zambian farming conditions and speaks Bemba, Nyanja, and
            Tonga.
          </p>
        </motion.div>

        {/* Main Demo Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Chat Interface Demo */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">GreenUpp AI Assistant</h3>
                    <p className="text-xs opacity-90 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      Online • Speaks Bemba, Nyanja, Tonga
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTranslation(!showTranslation)}
                      className="text-white hover:bg-white/20 text-xs"
                    >
                      <Languages className="w-4 h-4 mr-1" />
                      {showTranslation ? "Hide" : "Show"} English
                    </Button>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <CardContent className="p-6 h-96 overflow-y-auto bg-slate-50 dark:bg-slate-800">
                <div className="space-y-4">
                  {chatMessages
                    .slice(0, currentMessageIndex + 1)
                    .map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.3 }}
                        className={`flex ${
                          msg.type === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-sm rounded-2xl p-4 ${
                            msg.type === "user"
                              ? "bg-green-600 text-white"
                              : "bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                          }`}
                        >
                          {msg.hasImage ? (
                            <div className="bg-slate-200 dark:bg-slate-600 rounded-lg p-4 mb-2 text-center">
                              <Camera className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Photo of maize crop
                              </p>
                            </div>
                          ) : (
                            <>
                              <p
                                className={`text-sm leading-relaxed ${
                                  msg.type === "user"
                                    ? "text-white"
                                    : "text-slate-800 dark:text-slate-200"
                                }`}
                              >
                                {msg.message}
                              </p>

                              {showTranslation && msg.messageEn && (
                                <p
                                  className={`text-xs mt-2 italic opacity-80 ${
                                    msg.type === "user"
                                      ? "text-green-100"
                                      : "text-slate-600 dark:text-slate-400"
                                  }`}
                                >
                                  English: {msg.messageEn}
                                </p>
                              )}
                            </>
                          )}

                          {msg.solutions && (
                            <div className="mt-3 space-y-2">
                              {msg.solutions.map((solution, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm text-slate-800 dark:text-slate-200">
                                      {solution}
                                    </p>
                                    {showTranslation && msg.solutionsEn && (
                                      <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1">
                                        {msg.solutionsEn[idx]}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div
                            className={`flex items-center justify-between mt-2 ${
                              msg.type === "user"
                                ? "text-green-100"
                                : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            <span className="text-xs">{msg.timestamp}</span>
                            {msg.language && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-0">
                                {msg.language}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </CardContent>

              {/* Chat Input */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="text-slate-500">
                    <Camera className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-slate-500">
                    <Mic className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 text-sm text-slate-500">
                    Type your farming question...
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* AI Capabilities */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                AI Capabilities
              </h3>

              <div className="space-y-4">
                {aiCapabilities.map((capability, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-xl flex items-center justify-center flex-shrink-0">
                            <capability.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
                              {capability.title}
                            </h4>
                            <p className="text-green-600 dark:text-green-400 text-sm font-medium mb-2">
                              {capability.titleLocal}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                              {capability.description}
                            </p>
                            <div className="flex items-center gap-4">
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                {capability.accuracy}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500" />
                                <span className="text-xs text-slate-500">
                                  {capability.languages[0]}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  95%
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Accuracy Rate
                </div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200 dark:border-green-800">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  24/7
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Available
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Try AI Assistant Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Free for all GreenUpp users • Available via WhatsApp
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: Languages,
              title: "Multi-Language Support",
              description: "Speaks Bemba, Nyanja, Tonga, and English fluently",
              stat: "4 Languages",
            },
            {
              icon: Smartphone,
              title: "Works Offline",
              description: "Basic features work without internet connection",
              stat: "Offline Ready",
            },
            {
              icon: Users,
              title: "Farmer Community",
              description:
                "Learn from 2,000+ farmers' experiences and solutions",
              stat: "2,000+ Users",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {feature.description}
                  </p>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    {feature.stat}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ZambianAiShowcase;
