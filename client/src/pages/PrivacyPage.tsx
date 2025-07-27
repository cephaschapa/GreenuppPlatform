import React, { useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  Database,
  Globe,
  MessageSquare,
  Smartphone,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PrivacyPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const privacyPrinciples = [
    {
      icon: Shield,
      title: "Data Protection",
      description:
        "Your farming data is encrypted and protected with enterprise-grade security measures.",
    },
    {
      icon: Lock,
      title: "Minimal Collection",
      description:
        "We only collect data necessary to provide and improve our agricultural services.",
    },
    {
      icon: Eye,
      title: "Transparency",
      description:
        "Clear, understandable explanations of how your data is used and shared.",
    },
    {
      icon: Database,
      title: "Data Ownership",
      description:
        "You own your farming data - export, delete, or control access at any time.",
    },
  ];

  const dataTypes = [
    {
      category: "Account Information",
      description: "Basic profile data needed for your GreenUpp account",
      examples: [
        "Name, email, phone number",
        "Farm location and size",
        "Crop types and farming methods",
      ],
      retention: "Account lifetime + 30 days after deletion",
      sharing: "Never shared with third parties",
    },
    {
      category: "Agricultural Data",
      description:
        "Farm-specific information to provide personalized recommendations",
      examples: [
        "Weather preferences and alerts",
        "Crop planting and harvest records",
        "Soil test results and field maps",
      ],
      retention: "7 years for historical analysis",
      sharing: "Anonymized for research (with consent)",
    },
    {
      category: "Usage Analytics",
      description:
        "How you interact with our platform to improve user experience",
      examples: [
        "Feature usage patterns",
        "App performance metrics",
        "Error logs and crash reports",
      ],
      retention: "2 years maximum",
      sharing: "Aggregated insights only",
    },
    {
      category: "Communication Data",
      description: "Messages and interactions within the platform",
      examples: [
        "AI assistant conversations",
        "WhatsApp integration messages",
        "Support ticket history",
      ],
      retention: "1 year after conversation ends",
      sharing: "Never shared - strictly confidential",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>
          Privacy Policy - GreenUpp | Protecting Your Agricultural Data
        </title>
        <meta
          name="description"
          content="Learn how GreenUpp protects your farming data, respects your privacy, and gives you control over your agricultural information."
        />
      </Helmet>

      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iIzMzMyIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIvPjwvZz48L3N2Zz4=')] bg-[length:20px_20px] opacity-5 pointer-events-none dark:opacity-10"></div>

      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="relative pt-24 pb-16">
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
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
              Privacy Policy
            </h1>
            <Badge variant="outline" className="ml-auto">
              Last Updated: December 2024
            </Badge>
          </div>

          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/50">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">
                      Privacy-First Agriculture Technology
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                      At GreenUpp, we understand that your farming data is
                      valuable and personal. This privacy policy explains how we
                      collect, use, protect, and give you control over your
                      agricultural information. We're committed to transparency
                      and putting farmers first.
                    </p>
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">
                        GDPR Compliant • Farmer-Owned Data • No Hidden Sharing
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy Principles */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-8">Our Privacy Principles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {privacyPrinciples.map((principle, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <principle.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">
                          {principle.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {principle.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Data Collection */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-8">What Data We Collect</h2>
            <div className="space-y-6">
              {dataTypes.map((dataType, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-primary" />
                      {dataType.category}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      {dataType.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium mb-2 text-green-700 dark:text-green-300">
                          Examples
                        </h4>
                        <ul className="space-y-1">
                          {dataType.examples.map((example, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-300">
                          Data Retention
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {dataType.retention}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-purple-700 dark:text-purple-300">
                          Sharing Policy
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {dataType.sharing}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Your Rights */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-8">Your Rights & Controls</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    Data Access & Control
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Export Your Data</span>
                        <p className="text-sm text-muted-foreground">
                          Download all your farming data in standard formats
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Delete Your Account</span>
                        <p className="text-sm text-muted-foreground">
                          Permanently remove all personal data (30-day grace
                          period)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Correct Information</span>
                        <p className="text-sm text-muted-foreground">
                          Update or fix any incorrect data about your farm
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Restrict Processing</span>
                        <p className="text-sm text-muted-foreground">
                          Limit how we use specific data types
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Communication Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <span className="font-medium">SMS Preferences</span>
                        <p className="text-sm text-muted-foreground">
                          Control weather alerts, price updates, and
                          notifications
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <span className="font-medium">
                          WhatsApp Integration
                        </span>
                        <p className="text-sm text-muted-foreground">
                          Opt-in/out of AI assistant WhatsApp conversations
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <span className="font-medium">
                          Marketing Communications
                        </span>
                        <p className="text-sm text-muted-foreground">
                          Unsubscribe from promotional content anytime
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <span className="font-medium">
                          Data Sharing Consent
                        </span>
                        <p className="text-sm text-muted-foreground">
                          Choose if anonymized data can help research
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.section>

          {/* Security & Third Parties */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Security Measures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">
                        End-to-end encryption for sensitive farming data
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">
                        Regular security audits and penetration testing
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">
                        Data stored in secure, GDPR-compliant facilities
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">
                        Access controls and staff privacy training
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">
                        Immediate breach notification (within 72 hours)
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Third-Party Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">
                        Weather Data Providers
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Location data shared with weather services for accurate
                        forecasts
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Payment Processors</h4>
                      <p className="text-sm text-muted-foreground">
                        MTN MoMo, Airtel Money for secure subscription payments
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">AI Services</h4>
                      <p className="text-sm text-muted-foreground">
                        Anonymized crop data for AI training (with explicit
                        consent)
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Analytics</h4>
                      <p className="text-sm text-muted-foreground">
                        Aggregated usage patterns to improve platform
                        performance
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.section>

          {/* Contact & Updates */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-16"
          >
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/50">
              <CardContent className="p-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">
                    Questions About Your Privacy?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                    We're here to help. Contact our privacy team for any
                    questions about your data, or to exercise your privacy
                    rights.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button asChild>
                      <a href="mailto:privacy@metatronltd.com">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Email Privacy Team
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a
                        href="https://wa.me/260975808750?text=I have questions about GreenUpp's privacy policy"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Smartphone className="w-4 h-4 mr-2" />
                        WhatsApp Support
                      </a>
                    </Button>
                  </div>

                  <div className="mt-8 pt-6 border-t border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">
                        <strong>Policy Updates:</strong> We'll notify you 30
                        days before any significant privacy policy changes
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Legal Information */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="bg-muted/50">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold mb-4">Legal Information</h2>
                <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                  <div>
                    <h3 className="font-medium text-foreground mb-2">
                      Data Controller
                    </h3>
                    <p>
                      Metatron Limited
                      <br />
                      Zambia
                      <br />
                      Registration: [Company Number]
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-2">
                      Applicable Laws
                    </h3>
                    <p>
                      This policy complies with GDPR, Zambian Data Protection
                      laws, and international privacy standards.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-2">
                      Dispute Resolution
                    </h3>
                    <p>
                      Privacy disputes resolved through mediation, with right to
                      data protection authority complaints.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-2">
                      Policy Version
                    </h3>
                    <p>
                      Version 1.0 - December 2024
                      <br />
                      Previous versions available on request
                    </p>
                  </div>
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

export default PrivacyPage;
