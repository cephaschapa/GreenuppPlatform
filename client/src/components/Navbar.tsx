import { FC, useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import greenuppLogo from "../assets/greenupp-full-logo.png";
import {
  Menu,
  X,
  ChevronDown,
  Globe,
  MessageSquare,
  Phone,
  Users,
  Tractor,
  Store,
  Sprout,
  MapPin,
  Star,
  Shield,
} from "lucide-react";

interface NavbarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const navigationItems = [
  {
    id: "solutions",
    label: "Solutions",
    labelLocal: "Mayankho",
    hasDropdown: true,
    items: [
      {
        icon: Users,
        title: "Ba Farmer Ba Kuchikolo",
        subtitle: "Small-scale Farmers",
        description: "0.5-5 hectares • Weather alerts • Market access",
        href: "#smallholder",
        gradient: "from-emerald-500 to-green-600",
      },
      {
        icon: Tractor,
        title: "Ba Farmer Ba Ukulu",
        subtitle: "Commercial Farmers",
        description: "5+ hectares • Precision agriculture • Analytics",
        href: "#commercial",
        gradient: "from-blue-500 to-indigo-600",
      },
      {
        icon: Store,
        title: "Ba Business",
        subtitle: "Agro-dealers & Buyers",
        description: "Input suppliers • Quality tracking • Networks",
        href: "#business",
        gradient: "from-purple-500 to-pink-600",
      },
    ],
  },
  {
    id: "features",
    label: "Features",
    labelLocal: "Zinthu",
    href: "/features",
  },
  {
    id: "about",
    label: "About",
    labelLocal: "Za Ife",
    href: "/about",
  },
  {
    id: "rnd",
    label: "R&D",
    labelLocal: "Kafukufuku",
    href: "/rnd",
  },
  {
    id: "privacy",
    label: "Privacy",
    labelLocal: "Chinsinsi",
    href: "/privacy",
  },
  {
    id: "pricing",
    label: "Pricing",
    labelLocal: "Mitengo",
    href: "#pricing",
  },
];

const ZambianNavbar: FC<NavbarProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const [isAppSubdomain, setIsAppSubdomain] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsAppSubdomain(window.location.hostname.startsWith("app."));

    // Handle scroll effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg border-b border-slate-200 dark:border-slate-700"
          : "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Link href="/" className="group relative flex items-center">
              <img
                src={greenuppLogo}
                alt="GreenUpp Logo"
                className="h-8 lg:h-10 w-auto"
              />
              <Badge
                variant="outline"
                className="ml-3 bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700 text-xs px-2 py-1"
              >
                <MapPin className="w-3 h-3 mr-1" />
                Zambia
              </Badge>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {isAppSubdomain ? (
              // App subdomain navigation - dashboard focused
              <>
                <Link
                  href="/fields"
                  className="text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 font-medium"
                >
                  Fields
                </Link>
                <Link
                  href="/tasks"
                  className="text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 font-medium"
                >
                  Tasks
                </Link>
                <Link
                  href="/marketplace"
                  className="text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 font-medium"
                >
                  Marketplace
                </Link>
                <Link
                  href="/weather"
                  className="text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 font-medium"
                >
                  Weather
                </Link>
              </>
            ) : (
              // Main domain navigation - marketing focused
              navigationItems.map((item) => (
                <div key={item.id} className="relative">
                  {item.hasDropdown ? (
                    <button
                      onClick={() => toggleDropdown(item.id)}
                      className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 font-medium"
                    >
                      {item.label}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === item.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  ) : (
                    <a
                      href={item.href}
                      className="text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 font-medium"
                    >
                      {item.label}
                    </a>
                  )}

                  {/* Dropdown Menu */}
                  {item.hasDropdown && activeDropdown === item.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
                          Choose Your Farming Type
                        </h3>
                        <div className="space-y-3">
                          {item.items?.map((subItem, index) => (
                            <a
                              key={index}
                              href={subItem.href}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 group"
                            >
                              <div
                                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${subItem.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}
                              >
                                <subItem.icon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                                  {subItem.title}
                                </div>
                                <div className="text-green-600 dark:text-green-400 text-xs font-medium">
                                  {subItem.subtitle}
                                </div>
                                <div className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                                  {subItem.description}
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <Globe className="w-4 h-4 mr-2" />
              EN
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth Buttons */}
            {!isAppSubdomain && (
              <div className="flex items-center space-x-3">
                <Link href="/testing-waitlist">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Sprout className="w-4 h-4 mr-2" />
                    Join the Waiting List
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg"
        >
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Mobile Navigation Items */}
            <div className="space-y-4 mb-6">
              {isAppSubdomain ? (
                // App subdomain mobile navigation
                <>
                  <Link
                    href="/fields"
                    className="block py-3 text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Fields
                  </Link>
                  <Link
                    href="/tasks"
                    className="block py-3 text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Tasks
                  </Link>
                  <Link
                    href="/marketplace"
                    className="block py-3 text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Marketplace
                  </Link>
                  <Link
                    href="/weather"
                    className="block py-3 text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Weather
                  </Link>
                </>
              ) : (
                // Main domain mobile navigation
                navigationItems.map((item) => (
                  <div key={item.id}>
                    {item.hasDropdown ? (
                      <div>
                        <button
                          onClick={() => toggleDropdown(item.id)}
                          className="flex items-center justify-between w-full py-3 text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 font-medium"
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              activeDropdown === item.id ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {activeDropdown === item.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.2 }}
                            className="pl-4 mt-2 space-y-3"
                          >
                            {item.items?.map((subItem, index) => (
                              <a
                                key={index}
                                href={subItem.href}
                                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <div
                                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${subItem.gradient} flex items-center justify-center flex-shrink-0`}
                                >
                                  <subItem.icon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                                    {subItem.title}
                                  </div>
                                  <div className="text-green-600 dark:text-green-400 text-xs">
                                    {subItem.subtitle}
                                  </div>
                                </div>
                              </a>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <a
                        href={item.href}
                        className="block py-3 text-slate-700 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Mobile Auth Buttons */}
            {!isAppSubdomain && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-3">
                <Link
                  href="/testing-waitlist"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg">
                    <Sprout className="w-4 h-4 mr-2" />
                    Join the Waiting List
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default ZambianNavbar;
