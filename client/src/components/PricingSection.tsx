import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Smartphone,
  Users,
  Tractor,
  Store,
  Star,
  Shield,
  Zap,
  MessageSquare,
  ArrowRight,
  Crown,
  Gift,
} from "lucide-react";

const pricingPlans = [
  {
    id: "smallholder",
    name: "Ba Farmer Ba Kuchikolo",
    subtitle: "Small-scale Farmers",
    price: "K50",
    originalPrice: "K75",
    period: "/month",
    description:
      "Perfect for farmers with 0.5-5 hectares growing maize, groundnuts, and beans",
    icon: Users,
    gradient: "from-emerald-500 to-green-600",
    popular: false,
    savings: "Save K25/month",
    features: [
      "Weather alerts via SMS",
      "Basic crop recommendations",
      "Market price updates",
      "Planting calendar",
      "Pest & disease alerts",
      "Mobile money payments",
      "Offline access",
      "Bemba/Nyanja support",
    ],
    benefits: [
      "40% yield increase",
      "K2,000 savings per season",
      "Direct buyer connections",
    ],
    paymentMethods: ["MTN MoMo", "Airtel Money", "Zamtel Kwacha"],
    testimonial: {
      name: "John Mwanza",
      location: "Chongwe",
      quote: "K50 yamfunda kupanga chakudya chikulu!",
    },
  },
  {
    id: "commercial",
    name: "Ba Farmer Ba Ukulu",
    subtitle: "Commercial Farmers",
    price: "K500",
    originalPrice: "K750",
    period: "/month",
    description:
      "Advanced features for farmers with 5+ hectares and mechanized operations",
    icon: Tractor,
    gradient: "from-blue-500 to-indigo-600",
    popular: true,
    savings: "Save K250/month",
    features: [
      "Everything in Kuchikolo plan",
      "Satellite field monitoring",
      "Soil testing recommendations",
      "Equipment maintenance tracking",
      "Financial planning tools",
      "Priority expert support",
      "Advanced analytics",
      "API integrations",
    ],
    benefits: [
      "60% operational efficiency",
      "K10,000 cost savings",
      "Premium buyer network",
    ],
    paymentMethods: ["Bank Transfer", "Mobile Money", "Quarterly Payment"],
    testimonial: {
      name: "Mary Banda",
      location: "Mazabuka",
      quote: "Ndalanda K10,000 more per hectare!",
    },
  },
  {
    id: "business",
    name: "Ba Business",
    subtitle: "Agro-dealers & Buyers",
    price: "K1,200",
    originalPrice: "K1,500",
    period: "/month",
    description: "Complete solution for input suppliers and produce buyers",
    icon: Store,
    gradient: "from-purple-500 to-pink-600",
    popular: false,
    savings: "Save K300/month",
    features: [
      "Verified farmer network access",
      "Inventory management system",
      "Quality assurance tracking",
      "Bulk purchasing coordination",
      "Supply chain analytics",
      "White-label options",
      "Custom integrations",
      "24/7 support",
    ],
    benefits: [
      "500+ farmer connections",
      "30% waste reduction",
      "Quality premiums",
    ],
    paymentMethods: ["Bank Transfer", "Corporate Account", "Annual Billing"],
    testimonial: {
      name: "Peter Sikanyika",
      location: "Mkushi",
      quote: "Connected to 200+ farmers easily!",
    },
  },
];

const paymentLogos = {
  "MTN MoMo": "🟡",
  "Airtel Money": "🔴",
  "Zamtel Kwacha": "🟢",
  "Bank Transfer": "🏦",
  "Mobile Money": "📱",
  "Quarterly Payment": "📅",
  "Corporate Account": "🏢",
  "Annual Billing": "📊",
} as const;

const ZambianPricingSection = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-green-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-green-950/30">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='40' cy='40' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>

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
              <Smartphone className="w-4 h-4" />
              Mobile Money Ready • Affordable Pricing
            </div>
          </Badge>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-slate-800 via-green-800 to-emerald-800 dark:from-slate-100 dark:via-green-100 dark:to-emerald-100 bg-clip-text text-transparent">
              Choose Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Farming Plan
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Transparent pricing designed for Zambian farmers. Pay with mobile
            money, get instant access, and start transforming your farm today.
          </p>

          {/* Special Offer Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg"
          >
            <Gift className="w-5 h-5" />
            <span>Limited Time: 30% Off First 3 Months!</span>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative ${
                plan.popular ? "lg:scale-105 lg:-mt-4" : ""
              }`}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              <Card
                className={`relative overflow-hidden transition-all duration-500 cursor-pointer border-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm hover:shadow-2xl ${
                  plan.popular
                    ? "border-green-500 shadow-xl shadow-green-500/20"
                    : selectedPlan === plan.id
                    ? "border-green-400 shadow-lg shadow-green-500/10"
                    : hoveredPlan === plan.id
                    ? "border-green-300 shadow-lg hover:scale-105"
                    : "border-slate-200 dark:border-slate-700 hover:border-green-200"
                }`}
                onClick={() =>
                  setSelectedPlan(selectedPlan === plan.id ? null : plan.id)
                }
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                <CardHeader className="text-center pb-4 relative z-10">
                  {/* Icon */}
                  <div
                    className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.gradient} p-0.5 hover:scale-110 transition-transform duration-300`}
                  >
                    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center">
                      <plan.icon className="w-10 h-10 text-slate-700 dark:text-slate-300" />
                    </div>
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-green-600 dark:text-green-400 font-medium mb-2">
                    {plan.subtitle}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    {plan.description}
                  </p>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                        {plan.price}
                      </span>
                      <span className="text-lg text-slate-600 dark:text-slate-400">
                        {plan.period}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-sm line-through text-slate-400">
                        {plan.originalPrice}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        {plan.savings}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-8 pb-8 relative z-10">
                  {/* Key Benefits */}
                  <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 text-sm">
                      Key Benefits:
                    </h4>
                    <div className="space-y-2">
                      {plan.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features.slice(0, 6).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {feature}
                        </span>
                      </div>
                    ))}
                    {plan.features.length > 6 && (
                      <div className="text-center">
                        <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                          + {plan.features.length - 6} more features
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Payment Methods */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Payment Options:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {plan.paymentMethods.map((method, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs"
                        >
                          <span>
                            {paymentLogos[method as keyof typeof paymentLogos]}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {method}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full bg-gradient-to-r ${plan.gradient} hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 text-white font-medium mb-6`}
                    size="lg"
                  >
                    Start {plan.name}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  {/* Testimonial */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-xs">
                          {plan.testimonial.name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs italic text-slate-700 dark:text-slate-300 mb-1">
                          "{plan.testimonial.quote}"
                        </p>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-medium">
                            {plan.testimonial.name}
                          </span>{" "}
                          • {plan.testimonial.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            {[
              {
                icon: Shield,
                text: "30-Day Money Back",
                subtext: "Risk-free trial",
              },
              {
                icon: Smartphone,
                text: "Mobile Money Ready",
                subtext: "Pay with MoMo",
              },
              {
                icon: MessageSquare,
                text: "WhatsApp Support",
                subtext: "24/7 help in English & Bemba",
              },
              {
                icon: Zap,
                text: "Instant Activation",
                subtext: "Start farming smarter today",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-xl flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {item.text}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {item.subtext}
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Link */}
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Questions about pricing?{" "}
            <a
              href="mailto:cephas@metatronltd.com"
              className="text-green-600 hover:text-green-700 font-medium underline"
            >
              Email us
            </a>{" "}
            or{" "}
            <a
              href="https://wa.me/260975808750"
              className="text-green-600 hover:text-green-700 font-medium underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp us
            </a>
          </p>

          {/* Enterprise CTA */}
          <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-0 text-white max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4">
                Need a Custom Solution?
              </h3>
              <p className="text-slate-300 mb-6">
                Large farms, cooperatives, and organizations get special pricing
                and custom features.
              </p>
              <Button
                asChild
                variant="outline"
                className="border-white text-slate-800 hover:bg-white hover:text-slate-700"
              >
                <a href="mailto:cephas@metatronltd.com">Contact Sales Team</a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default ZambianPricingSection;
