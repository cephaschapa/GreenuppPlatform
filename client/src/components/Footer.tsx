import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import greenuppLogo from "../assets/greenupp-full-logo.png";
import {
  Phone,
  Mail,
  MessageSquare,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Send,
  Sprout,
  Tractor,
  Store,
  Bot,
  CloudRain,
  Lightbulb,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

const footerSections = [
  {
    title: "Solutions",
    titleLocal: "Mayankho",
    links: [
      {
        name: "Small-scale Farmers",
        nameLocal: "Ba Farmer Ba Kuchikolo",
        href: "#smallholder",
        icon: Users,
      },
      {
        name: "Commercial Farmers",
        nameLocal: "Ba Farmer Ba Ukulu",
        href: "#commercial",
        icon: Tractor,
      },
      {
        name: "Agro-dealers",
        nameLocal: "Ba Business",
        href: "#business",
        icon: Store,
      },
      {
        name: "AI Assistant",
        nameLocal: "Muthandizi wa AI",
        href: "#ai-assistant",
        icon: Bot,
      },
    ],
  },
  {
    title: "Features",
    titleLocal: "Zinthu",
    links: [
      {
        name: "All Features",
        nameLocal: "Zonse",
        href: "/features",
        icon: Zap,
      },
      {
        name: "Weather Alerts",
        nameLocal: "Uthenga Wa Mvula",
        href: "#weather",
        icon: CloudRain,
      },
      {
        name: "Marketplace",
        nameLocal: "Msika",
        href: "#marketplace",
        icon: Store,
      },
      {
        name: "Crop Management",
        nameLocal: "Kukonza Mbeu",
        href: "#crops",
        icon: Sprout,
      },
      {
        name: "Mobile Money",
        nameLocal: "Ma Mobile Money",
        href: "#payments",
        icon: Phone,
      },
    ],
  },
  {
    title: "Support",
    titleLocal: "Chithandizo",
    links: [
      {
        name: "Help Center",
        nameLocal: "Malo A Chithandizo",
        href: "/help",
        icon: MessageSquare,
      },
      {
        name: "WhatsApp Support",
        nameLocal: "WhatsApp Chithandizo",
        href: "https://wa.me/260975808750",
        icon: MessageSquare,
      },
      {
        name: "Training Videos",
        nameLocal: "Ma Video A Kuphunzitsa",
        href: "/training",
        icon: Youtube,
      },
      {
        name: "Contact Us",
        nameLocal: "Tilumikizeni",
        href: "/contact",
        icon: Mail,
      },
    ],
  },
  {
    title: "Company",
    titleLocal: "Kampani",
    links: [
      { name: "About Us", nameLocal: "Za Ife", href: "/about", icon: Users },
      {
        name: "Privacy Policy",
        nameLocal: "Dongosolo La Chinsinsi",
        href: "/privacy",
        icon: Shield,
      },
      {
        name: "Research & Development",
        nameLocal: "Kafukufuku",
        href: "/rnd",
        icon: Lightbulb,
      },
      {
        name: "Our Mission",
        nameLocal: "Cholinga Chathu",
        href: "/mission",
        icon: Heart,
      },
      { name: "Careers", nameLocal: "Ntchito", href: "/careers", icon: Users },
      { name: "Blog", nameLocal: "Nkhani", href: "/blog", icon: Globe },
    ],
  },
];

// const zambianOffices = [
//   {
//     city: "Lusaka",
//     address: "Plot 123, Great East Road",
//     district: "Lusaka District",
//     phone: "+260-XXX-XXXX",
//     whatsapp: "+260-XXX-XXXX",
//     isMain: true,
//   },
//   {
//     city: "Ndola",
//     address: "Copperbelt Agricultural Center",
//     district: "Ndola District",
//     phone: "+260-XXX-XXXX",
//     whatsapp: "+260-XXX-XXXX",
//     isMain: false,
//   },
//   {
//     city: "Livingstone",
//     address: "Southern Province Hub",
//     district: "Livingstone District",
//     phone: "+260-XXX-XXXX",
//     whatsapp: "+260-XXX-XXXX",
//     isMain: false,
//   },
// ];

const socialLinks = [
  {
    name: "Facebook",
    icon: Facebook,
    href: "https://facebook.com/greenupp.zm",
    color: "text-blue-600",
  },
  {
    name: "Twitter",
    icon: Twitter,
    href: "https://twitter.com/greenupp_zm",
    color: "text-sky-500",
  },
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://instagram.com/greenupp.zm",
    color: "text-pink-600",
  },
  {
    name: "YouTube",
    icon: Youtube,
    href: "https://youtube.com/greenuppzambia",
    color: "text-red-600",
  },
];

// System status indicator logic
type SystemStatus = "healthy" | "issues" | "unknown";

const getStatusProps = (status: SystemStatus) => {
  switch (status) {
    case "healthy":
      return {
        color: "bg-green-500 animate-pulse",
        label: "All systems normal",
        text: "text-green-600 dark:text-green-400",
      };
    case "issues":
      return {
        color: "bg-red-500 animate-pulse",
        label: "Issues detected",
        text: "text-red-600 dark:text-red-400",
      };
    default:
      return {
        color: "bg-gray-400",
        label: "Status unknown",
        text: "text-gray-500 dark:text-gray-400",
      };
  }
};

const ZambianFooter = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>("unknown");

  useEffect(() => {
    fetch("/api/health/")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data && (data.status === "ok" || data.status === "healthy")) {
          setSystemStatus("healthy");
        } else {
          setSystemStatus("issues");
        }
      })
      .catch(() => setSystemStatus("unknown"));
  }, []);

  const statusProps = getStatusProps(systemStatus);

  return (
    <footer className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='40' cy='40' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-full blur-2xl"></div>

      <div className="relative z-10">
        {/* Newsletter Section */}
        <div className="border-b border-slate-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Stay Connected
                </span>
                <br />
                <span className="text-slate-300">
                  Get Farming Tips via WhatsApp
                </span>
              </h3>
              <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Join 2,000+ Zambian farmers receiving weekly farming tips,
                weather alerts, and market prices directly to your phone.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                      <Input
                        type="tel"
                        placeholder="Enter your WhatsApp number (+260...)"
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500"
                      />
                    </div>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-medium px-8"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Subscribe
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  {/* WhatsApp Contact Button */}
                  <div className="text-center">
                    <p className="text-slate-400 text-sm mb-3">
                      Or get instant help:
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                    >
                      <a
                        href="https://wa.me/260975808750?text=Hi%20GreenUpp%2C%20I%20need%20help%20with%20farming"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        WhatsApp Support (+260-975-808-750)
                      </a>
                    </Button>
                  </div>

                  <p className="text-xs text-slate-400 mt-3 text-center">
                    Free SMS alerts • Unsubscribe anytime • Privacy protected
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 space-y-8"
            >
              <div>
                <img
                  src={greenuppLogo}
                  alt="GreenUpp Logo"
                  className="h-10 w-auto mb-6"
                />
                <p className="text-slate-300 leading-relaxed mb-6">
                  Empowering Zambian farmers with smart technology, local
                  language support, and direct market access. Growing together
                  for a prosperous agricultural future.
                </p>
                <p className="text-green-400 font-medium italic">
                  "Tikule pamodzi - Let's grow together"
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-200 mb-4">
                  Trusted by:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Removed trustIndicators.map as per edit hint */}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="font-semibold text-slate-200 mb-4">
                  Follow Us:
                </h4>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.1 }}
                      className="w-10 h-10 bg-slate-800/50 hover:bg-slate-700 rounded-lg flex items-center justify-center border border-slate-700 transition-all duration-300"
                    >
                      <social.icon className={`w-5 h-5 ${social.color}`} />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Footer Links */}
            {footerSections.map((section, sectionIndex) => (
              <motion.div
                key={sectionIndex}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
                className="space-y-6"
              >
                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">
                    {section.title}
                  </h4>
                  <p className="text-sm text-green-400 font-medium">
                    {section.titleLocal}
                  </p>
                </div>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <motion.li
                      key={linkIndex}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: linkIndex * 0.05 }}
                    >
                      <a
                        href={link.href}
                        className="group flex items-center gap-3 text-slate-400 hover:text-green-400 transition-colors duration-200"
                      >
                        <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        <div>
                          <div className="text-sm">{link.name}</div>
                          <div className="text-xs text-slate-500 group-hover:text-green-500">
                            {link.nameLocal}
                          </div>
                        </div>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-slate-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h4 className="text-xl font-semibold text-slate-200 mb-4 text-center">
                Our Vision & Roadmap
              </h4>
              <p className="text-slate-400 max-w-2xl mx-auto text-center mb-2">
                GreenUpp is building a platform to empower Zambian farmers with
                technology, local language support, and direct market access. We
                are working towards launching soon and are seeking feedback from
                the community to shape our features and partnerships.
              </p>
              <p className="text-green-400 text-center font-medium">
                Want to help shape the future?{" "}
                <span className="underline">Join our early access list!</span>
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h4 className="text-xl font-semibold text-slate-200 mb-8 text-center">
                Contact Us
              </h4>
              <div className="grid md:grid-cols-3 gap-6 justify-center">
                <div className="md:col-span-1 flex flex-col items-center">
                  <div className="text-slate-400 text-center">
                    <strong>Email:</strong>
                    <br />
                    <a
                      href="mailto:cephas@metatronltd.com"
                      className="hover:text-green-400"
                    >
                      cephas@metatronltd.com
                    </a>
                    <br />
                    <a
                      href="mailto:info@metatronltd.com"
                      className="hover:text-green-400"
                    >
                      info@metatronltd.com
                    </a>
                  </div>
                </div>
                <div className="md:col-span-1 flex flex-col items-center">
                  <div className="text-slate-400 text-center">
                    <strong>Phone:</strong>
                    <br />
                    <a
                      href="tel:+260975808750"
                      className="hover:text-green-400"
                    >
                      +260 975 808 750
                    </a>
                  </div>
                </div>
                <div className="md:col-span-1 flex flex-col items-center">
                  <div className="text-slate-400 text-center">
                    <strong>Address:</strong>
                    <br />
                    Murax Shopping Complex
                    <br />
                    Along Alick Nkata Road
                    <br />
                    Lusaka, Zambia
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col md:flex-row justify-between items-center gap-6"
            >
              <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <span>© 2024 GreenUpp Zambia.</span>
                  <span>All rights reserved.</span>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href="/privacy"
                    className="hover:text-green-400 transition-colors"
                  >
                    Privacy Policy
                  </a>
                  <span>•</span>
                  <a
                    href="/terms"
                    className="hover:text-green-400 transition-colors"
                  >
                    Terms of Service
                  </a>
                  <span>•</span>
                  <a
                    href="/cookies"
                    className="hover:text-green-400 transition-colors"
                  >
                    Cookie Policy
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500 animate-pulse" />
                <span>for Zambian farmers</span>
                <div className="flex items-center gap-1 ml-2">
                  <span className="text-green-400">🇿🇲</span>
                  <Sprout className="w-4 h-4 text-green-400" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      {/* System Status Indicator */}
      <div className="flex justify-center items-center py-2">
        <span className={`flex items-center gap-2 text-sm ${statusProps.text}`}>
          <span
            className={`w-3 h-3 rounded-full inline-block ${statusProps.color}`}
          ></span>
          {statusProps.label}
        </span>
      </div>
    </footer>
  );
};

export default ZambianFooter;
