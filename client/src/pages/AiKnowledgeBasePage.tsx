import React, { useState } from 'react';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Footer from '@/components/Footer';

const AiKnowledgeBasePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>AI Technology Knowledge Base | Greenupp</title>
        <meta name="description" content="Learn about the AI technology powering Greenupp's agricultural platform" />
      </Helmet>

      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <main className="flex-1 container max-w-6xl py-8 mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/" className="inline-block">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-3xl font-bold tracking-tight">AI Knowledge Base</h1>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden bg-primary/10 rounded-lg p-8 mb-10"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}>
          <div className="absolute right-0 -top-10 opacity-20 rotate-12">
            <svg width="180" height="180" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 0L80 40L40 80L0 40L40 0Z" className="fill-primary" />
              <path d="M40 10L70 40L40 70L10 40L40 10Z" className="fill-background" />
              <path d="M40 20L60 40L40 60L20 40L40 20Z" className="fill-primary" />
              <path d="M40 30L50 40L40 50L30 40L40 30Z" className="fill-background" />
            </svg>
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4">Digital Agriculture Technology Platform</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
              <p className="text-xl text-muted-foreground">
                Greenupp is a comprehensive digital platform that leverages artificial intelligence, 
                blockchain technology, and modern web capabilities to transform farming practices. 
                This knowledge base provides detailed documentation on all our platform features 
                and how they work together to improve agricultural outcomes.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="bg-background/80 backdrop-blur rounded-lg px-4 py-3 inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-sm font-medium">Computer Vision</span>
              </div>
              <div className="bg-background/80 backdrop-blur rounded-lg px-4 py-3 inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                <span className="text-sm font-medium">Machine Learning</span>
              </div>
              <div className="bg-background/80 backdrop-blur rounded-lg px-4 py-3 inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                <span className="text-sm font-medium">Blockchain</span>
              </div>
              <div className="bg-background/80 backdrop-blur rounded-lg px-4 py-3 inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                <span className="text-sm font-medium">Predictive Analytics</span>
              </div>
              <div className="bg-background/80 backdrop-blur rounded-lg px-4 py-3 inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                <span className="text-sm font-medium">Social Networking</span>
              </div>
              <div className="bg-background/80 backdrop-blur rounded-lg px-4 py-3 inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                <span className="text-sm font-medium">Geospatial Analysis</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Climate Analysis AI</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Our climate analysis AI combines data from multiple sources including weather stations,
                satellite imagery, and historical climate databases to create comprehensive climate models
                specific to your farm's location.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Neural networks identify weather patterns</li>
                <li>Time-series forecasting for prediction</li>
                <li>Regression models for trend analysis</li>
                <li>Classification algorithms for weather events</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Crop Analytics AI</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Our Crop Analytics AI evaluates multiple factors affecting crop growth and health,
                providing recommendations for optimal management throughout the growing cycle.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Machine learning models for crop growth prediction</li>
                <li>Optimization algorithms for resource allocation</li>
                <li>Comparative analysis against benchmark data</li>
                <li>Soil-crop-climate relationship modeling</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Disease Detection AI</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Our plant disease detection system uses computer vision and deep learning to identify plant diseases,
              pest infestations, and nutrient deficiencies from images taken with your smartphone.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">How It Works</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Capture a photo of your plant</li>
                  <li>AI analyzes visual patterns and discoloration</li>
                  <li>Compares against database of known diseases</li>
                  <li>Provides diagnosis and treatment recommendations</li>
                </ol>
              </div>
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">Technology Used</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Convolutional Neural Networks (CNNs)</li>
                  <li>Transfer learning with pre-trained models</li>
                  <li>Image segmentation and feature extraction</li>
                  <li>Ensemble methods for increased accuracy</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Yield Prediction AI</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Our yield prediction system combines historical data, current conditions, and machine learning
              to forecast crop yields with increasing accuracy throughout the growing season.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">Data Sources</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Historical yield data</li>
                  <li>Current weather conditions</li>
                  <li>Soil quality measurements</li>
                  <li>Satellite imagery</li>
                  <li>Crop management activities</li>
                </ul>
              </div>
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">Prediction Benefits</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Market planning and contract negotiation</li>
                  <li>Better harvest logistics and resource allocation</li>
                  <li>Earlier identification of potential problems</li>
                  <li>Financial planning and crop insurance decisions</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Yield predictions are presented with confidence levels and continually improve 
              as the system learns from actual outcomes on your farm and similar operations in your region.
            </p>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Blockchain Traceability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Our CropTrace system uses Hyperledger Fabric blockchain technology to create immutable, verifiable 
              records for your crops from planting to harvest and beyond, building trust and transparency.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">Key Features</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>QR code generation for product tracking</li>
                  <li>Tamper-proof event recording</li>
                  <li>Public verification portal</li>
                  <li>Integration with marketplace listings</li>
                  <li>Certification and standards compliance</li>
                </ul>
              </div>
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">Technology Advantages</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Energy-efficient permissioned blockchain</li>
                  <li>Enterprise-grade security</li>
                  <li>Scalable architecture</li>
                  <li>Privacy controls for sensitive data</li>
                  <li>Digital signatures for authentication</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Unlike public blockchains like Bitcoin or Ethereum, Hyperledger Fabric uses a fraction of the energy while 
              providing the security and immutability benefits needed for agricultural supply chain traceability.
            </p>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Stream Chat Communication Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Our Stream Chat integration provides reliable, real-time communication between farmers, agricultural experts, 
              and suppliers with guaranteed message delivery, even in areas with unstable internet connectivity.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">Key Features</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Direct messaging between platform users</li>
                  <li>Message persistence with offline support</li>
                  <li>Secure, encrypted communications</li>
                  <li>Real-time typing indicators and read receipts</li>
                  <li>Media sharing (images, documents, etc.)</li>
                </ul>
              </div>
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">Technical Implementation</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>HTTP polling for improved reliability</li>
                  <li>Client-side message queuing for offline use</li>
                  <li>Optimized for low-bandwidth environments</li>
                  <li>Consistent user experience across devices</li>
                  <li>Custom UI with Greenupp's design language</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Our chat platform is designed for agricultural contexts, enabling quick consultation with experts about 
              crop issues, coordination with suppliers, and knowledge sharing between farmers facing similar challenges.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Green Socials Network</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Green Socials is our specialized agricultural social network that connects farmers worldwide, 
              enabling knowledge sharing, community building, and collaborative problem-solving.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">Network Features</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Customizable farmer profiles</li>
                  <li>News feed with agricultural content</li>
                  <li>Post creation with rich media support</li>
                  <li>Comments, reactions, and sharing</li>
                  <li>Follow system for content curation</li>
                  <li>Stories functionality for quick updates</li>
                </ul>
              </div>
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">Benefits for Farmers</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Knowledge exchange with peers globally</li>
                  <li>Solution sharing for common challenges</li>
                  <li>Community support during critical seasons</li>
                  <li>Regional agricultural news and updates</li>
                  <li>Visibility for innovative farming practices</li>
                  <li>Direct connections to buyers and suppliers</li>
                </ul>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mt-4">
              <h4 className="font-medium mb-2">AI-Powered Content Curation</h4>
              <p className="text-sm text-muted-foreground">
                Our content recommendation system analyzes your farm profile, location, crop types, and interaction patterns 
                to surface the most relevant posts, farming techniques, and connections. This ensures you see content that's 
                directly applicable to your specific agricultural context and challenges.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Agricultural Marketplace</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Our enhanced agricultural marketplace connects farmers directly with buyers, suppliers, and service providers 
              using location-based technology to facilitate efficient local transactions and reduce supply chain complexity.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">Marketplace Features</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Verified seller profiles with ratings</li>
                  <li>Location-based product discovery</li>
                  <li>Distance calculation and proximity filters</li>
                  <li>Product categories with detailed listings</li>
                  <li>Integrated secure payment processing</li>
                  <li>In-app messaging with sellers</li>
                  <li>Product reviews and quality ratings</li>
                </ul>
              </div>
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">Technical Specifications</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>H3 geospatial indexing for precise location data</li>
                  <li>Efficient distance calculations using hexagonal grid</li>
                  <li>Stripe integration for secure payments</li>
                  <li>Shopping cart functionality with quantity management</li>
                  <li>Real-time inventory updates</li>
                  <li>Integration with blockchain traceability</li>
                  <li>Mobile-optimized interface with offline catalog browsing</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              The marketplace prioritizes local agricultural commerce to reduce food miles and transportation costs, 
              while blockchain integration ensures product authenticity and transparent supply chains.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Progressive Web App (PWA) Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Greenupp is built as a Progressive Web App (PWA), providing an app-like experience with 
              offline capabilities and improved performance for farmers working in areas with limited connectivity.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">Offline Functionality</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Access critical farm data without internet</li>
                  <li>Record field observations offline</li>
                  <li>Queue activities to sync when connection restores</li>
                  <li>Offline-first architecture with progressive enhancement</li>
                  <li>Cached weather forecasts and recommendations</li>
                </ul>
              </div>
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">Performance Benefits</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Fast loading times with service worker caching</li>
                  <li>Reduced data usage for slower connections</li>
                  <li>Home screen installation on mobile devices</li>
                  <li>Push notifications for critical alerts</li>
                  <li>Background sync for data reliability</li>
                </ul>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mt-4">
              <h4 className="font-medium mb-2">Technical Implementation</h4>
              <p className="text-sm text-muted-foreground">
                Our PWA is built using service workers for caching and offline functionality, IndexedDB for 
                local data storage, and a synchronization system that ensures data consistency between the 
                device and server. This creates a resilient application that continues to function in the 
                challenging connectivity environments often encountered in agricultural settings.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>General AI Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Greenupp uses a variety of AI technologies throughout the platform to make farming more efficient, 
              productive, and sustainable.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">Natural Language Processing</h4>
                <p className="text-sm">
                  AI-powered search and recommendations help you find relevant information,
                  marketplace listings, and answers to your agricultural questions.
                </p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">Decision Support Systems</h4>
                <p className="text-sm">
                  AI analyzes multiple data sources to provide actionable insights for
                  planting, treatment, and harvesting decisions.
                </p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="font-medium mb-2">Optimization Algorithms</h4>
                <p className="text-sm">
                  Advanced algorithms help optimize resource allocation, field layouts,
                  and crop rotations for maximum efficiency and yield.
                </p>
              </div>
            </div>
            <p className="text-sm font-medium">Our AI commitment:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
              <li>Transparent data usage and privacy protections</li>
              <li>Human oversight for critical decisions</li>
              <li>Continual learning and improvement</li>
              <li>Accountability and explainable results</li>
              <li>Designed to augment farmer knowledge, not replace it</li>
            </ul>
          </CardContent>
        </Card>

        {/* Call to Action Section */}
        <div className="bg-primary/10 rounded-lg p-8 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <h2 className="text-2xl font-bold">Start using AI in your farming today</h2>
              <p className="text-muted-foreground">
                Join thousands of farmers who are already leveraging our AI-powered platform to 
                increase yields, reduce costs, and farm more sustainably.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/auth">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link href="/#features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Resources Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Additional Resources</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 hover:bg-primary/5 transition-colors">
              <h3 className="font-medium mb-2">Verify Product Traceability</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Use our verification tool to check the authenticity and origin of farm products.
              </p>
              <Link href="/verify-trace" className="text-sm text-primary font-medium">
                Learn more →
              </Link>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-primary/5 transition-colors">
              <h3 className="font-medium mb-2">Marketplace</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Browse our AI-powered marketplace for agricultural products and services.
              </p>
              <Link href="/public/marketplace" className="text-sm text-primary font-medium">
                Visit marketplace →
              </Link>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-primary/5 transition-colors">
              <h3 className="font-medium mb-2">Metatron Technologies</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Learn about the technology partner behind Greenupp's AI systems.
              </p>
              <a 
                href="https://www.metatronltd.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary font-medium"
              >
                Visit website →
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AiKnowledgeBasePage;