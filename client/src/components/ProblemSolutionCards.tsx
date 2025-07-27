import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CloudRain,
  TrendingUp,
  Users,
  DollarSign,
  Smartphone,
  Shield,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

const zambianChallenges = [
  {
    id: "weather-uncertainty",
    problem: "Mvula Yakaipa",
    problemEn: "Weather Uncertainty",
    solution: "Smart Weather Alerts",
    icon: CloudRain,
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    description:
      "Traditional farmers struggle with unpredictable weather patterns affecting crop planning and harvest timing.",
    localDescription:
      "Ba farmer bafwafwa nge mvula yabipa - balilila chakudya chashoma.",
    solutions: [
      "7-day weather forecasts via SMS",
      "Seasonal climate predictions",
      "Planting & harvest timing alerts",
      "Drought & flood early warnings",
    ],
    metrics: {
      improvement: "65% reduction in weather-related crop losses",
      savings: "K1,500 average savings per season",
      reach: "Available in all 10 provinces",
    },
    testimonial: {
      name: "Joseph Phiri",
      location: "Mumbwa District",
      quote:
        "GreenUpp yamfundisha ukwaba nge mvula. Saino ninshi nabweza chakudya chikulu.",
    },
  },
  {
    id: "market-access",
    problem: "Kugulitsa Kwavuta",
    problemEn: "Market Access Difficulty",
    solution: "Direct Buyer Network",
    icon: Users,
    gradient: "from-emerald-500 via-green-500 to-lime-500",
    description:
      "Smallholder farmers often sell through middlemen, receiving low prices for their produce.",
    localDescription:
      "Ba middleman balanda K8/kg, lelo ba buyer balanda K15/kg kwa GreenUpp.",
    solutions: [
      "Direct connection to verified buyers",
      "Real-time market price updates",
      "Quality premium negotiations",
      "Cooperative bulk selling support",
    ],
    metrics: {
      improvement: "87% price increase through direct sales",
      savings: "K3,000 additional income per hectare",
      reach: "Connected to 500+ verified buyers",
    },
    testimonial: {
      name: "Ruth Mwila",
      location: "Solwezi",
      quote:
        "Ninagulitsa direct ku Shoprite nge GreenUpp. Ndalanda K16/kg instead of K9!",
    },
  },
  {
    id: "knowledge-gap",
    problem: "Ukushiba Ukwishiba",
    problemEn: "Knowledge & Skills Gap",
    solution: "AI-Powered Learning",
    icon: Lightbulb,
    gradient: "from-purple-500 via-indigo-500 to-blue-500",
    description:
      "Limited access to modern farming techniques and agricultural extension services.",
    localDescription:
      "Ulimi wa kale tauletela chakudya chikulu. Tufwaya ukwishiba ukupya.",
    solutions: [
      "Personalized farming recommendations",
      "Video tutorials in local languages",
      "Expert consultation via WhatsApp",
      "Peer-to-peer knowledge sharing",
    ],
    metrics: {
      improvement: "45% average yield increase",
      savings: "K2,500 saved on unnecessary inputs",
      reach: "Available in Bemba, Nyanja, Tonga",
    },
    testimonial: {
      name: "Daniel Tembo",
      location: "Kasama",
      quote:
        "Ba expert bali nge phone. Bampafundisha ukupanga fertilizer properly.",
    },
  },
];

const ZambianValuePropositions = () => {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-white via-green-50/30 to-emerald-50/50 dark:from-slate-950 dark:via-green-950/30 dark:to-emerald-950/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "40px 40px",
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
              <Shield className="w-4 h-4" />
              Solving Real Zambian Farming Challenges
            </div>
          </Badge>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-slate-800 via-green-800 to-emerald-800 dark:from-slate-100 dark:via-green-100 dark:to-emerald-100 bg-clip-text text-transparent">
              From Problems to
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Profitable Solutions
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            We understand the unique challenges facing Zambian farmers. Here's
            how GreenUpp transforms your biggest problems into your greatest
            opportunities.
          </p>
        </motion.div>

        {/* Challenge Cards */}
        <div className="space-y-16">
          {zambianChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.2 }}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-8 lg:gap-12 items-center`}
            >
              {/* Problem Card */}
              <div className="flex-1 w-full">
                <Card className="relative overflow-hidden border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 backdrop-blur-sm hover:shadow-xl hover:shadow-red-500/10 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-2xl"></div>

                  <CardContent className="p-8 relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-red-800 dark:text-red-200">
                          {challenge.problem}
                        </h3>
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                          {challenge.problemEn}
                        </p>
                      </div>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                      {challenge.description}
                    </p>

                    <div className="bg-red-100/50 dark:bg-red-900/20 rounded-lg p-4 border-l-4 border-red-500">
                      <p className="text-sm italic text-red-800 dark:text-red-200">
                        "{challenge.localDescription}"
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                  <ArrowRight className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Solution Card */}
              <div className="flex-1 w-full">
                <Card className="relative overflow-hidden border-2 border-green-200 dark:border-green-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl hover:shadow-green-500/10 transition-all duration-500">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${challenge.gradient} opacity-5`}
                  ></div>

                  <CardContent className="p-8 relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${challenge.gradient} rounded-xl flex items-center justify-center shadow-md`}
                      >
                        <challenge.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
                          {challenge.solution}
                        </h3>
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                          Smart Technology Solution
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {challenge.solutions.map((solution, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {solution}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <div className="text-lg font-bold text-green-700 dark:text-green-300">
                          {challenge.metrics.improvement.split(" ")[0]}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          {challenge.metrics.improvement
                            .split(" ")
                            .slice(1)
                            .join(" ")}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <div className="text-lg font-bold text-green-700 dark:text-green-300">
                          {challenge.metrics.savings.split(" ")[0]}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          {challenge.metrics.savings
                            .split(" ")
                            .slice(1)
                            .join(" ")}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <div className="text-lg font-bold text-green-700 dark:text-green-300">
                          {challenge.metrics.reach.split(" ")[0]}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          {challenge.metrics.reach
                            .split(" ")
                            .slice(1)
                            .join(" ")}
                        </div>
                      </div>
                    </div>

                    {/* Testimonial */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {challenge.testimonial.name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm italic text-green-800 dark:text-green-200 mb-2">
                            "{challenge.testimonial.quote}"
                          </p>
                          <div className="text-xs text-green-600 dark:text-green-400">
                            <span className="font-medium">
                              {challenge.testimonial.name}
                            </span>{" "}
                            • {challenge.testimonial.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <Card className="bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 border-0 text-white max-w-4xl mx-auto">
            <CardContent className="p-8 sm:p-12">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                Ready to Transform Your Farm?
              </h3>
              <p className="text-green-100 mb-8 text-lg leading-relaxed">
                Zambian farmers who have already increased their yields and
                income with GreenUpp's smart farming solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-green-700 px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all duration-300"
                >
                  Start Free Trial - K50/month
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-green-700 transition-all duration-300"
                >
                  Book WhatsApp Demo
                </motion.button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default ZambianValuePropositions;
