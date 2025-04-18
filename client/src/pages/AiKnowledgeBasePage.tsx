import React from 'react';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Brain, Cloud, Leaf, LineChart, Microscope, Sprout } from 'lucide-react';
import PublicNavbar from '@/components/navigation/PublicNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import Footer from '@/components/Footer';

const AiKnowledgeBasePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>AI Technology Knowledge Base | Greenupp</title>
        <meta name="description" content="Learn about the AI technology powering Greenupp's agricultural platform" />
      </Helmet>

      <PublicNavbar />

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

        <div className="prose prose-lg dark:prose-invert max-w-none mb-10">
          <p className="text-xl text-muted-foreground">
            Greenupp leverages advanced artificial intelligence to transform farming practices. 
            This knowledge base explains how our AI technologies work to help you make better 
            agricultural decisions.
          </p>
        </div>

        <Tabs defaultValue="climate">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-8">
            <TabsTrigger value="climate" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              <span className="hidden md:inline">Climate</span>
            </TabsTrigger>
            <TabsTrigger value="crops" className="flex items-center gap-2">
              <Sprout className="h-4 w-4" />
              <span className="hidden md:inline">Crop Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="disease" className="flex items-center gap-2">
              <Microscope className="h-4 w-4" />
              <span className="hidden md:inline">Disease Detection</span>
            </TabsTrigger>
            <TabsTrigger value="yield" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              <span className="hidden md:inline">Yield Prediction</span>
            </TabsTrigger>
            <TabsTrigger value="blockchain" className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              <span className="hidden md:inline">Traceability</span>
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden md:inline">General AI</span>
            </TabsTrigger>
          </TabsList>

          {/* Climate AI */}
          <TabsContent value="climate" className="space-y-8">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-primary" />
                    Climate Analysis AI
                  </CardTitle>
                  <CardDescription>
                    How our AI interprets weather data to provide actionable insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium">How It Works</h3>
                    <p>
                      Our climate analysis AI combines data from multiple sources including weather stations, 
                      satellite imagery, and historical climate databases to create comprehensive climate models 
                      specific to your farm's location.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-primary/10 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Data Collection</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Real-time weather data from OpenWeather API</li>
                          <li>Historical patterns from climate databases</li>
                          <li>Satellite imagery for regional analysis</li>
                          <li>Microclimate data from nearby weather stations</li>
                        </ul>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-4">
                        <h4 className="font-medium mb-2">AI Processing</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Neural networks identify weather patterns</li>
                          <li>Time-series forecasting for prediction</li>
                          <li>Regression models for trend analysis</li>
                          <li>Classification algorithms for weather events</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-medium">Key Features</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Microclimate Mapping</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            AI creates detailed microclimate maps for your specific fields, 
                            identifying areas with different temperature, humidity, and sun exposure 
                            patterns to optimize planting decisions.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Extreme Weather Prediction</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            Machine learning algorithms analyze atmospheric conditions to predict 
                            extreme weather events like heavy rainfall, drought, or frost with 
                            greater lead time than traditional forecasts.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Seasonal Planning</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            AI analyzes multi-year climate trends to recommend optimal planting 
                            and harvesting windows, adjusting for changing climate patterns in 
                            your region.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Climate-Crop Matching</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            Our AI matches crop varieties to your specific climate conditions, 
                            suggesting alternatives that might perform better given your unique 
                            weather patterns.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-xl font-medium mb-2">The Technology Behind It</h3>
                    <p className="mb-4">
                      Our climate analysis system uses ensemble machine learning models that combine 
                      various AI approaches to increase accuracy:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <span className="font-medium">Recurrent Neural Networks (RNNs)</span>: Process time-series 
                        weather data to identify patterns over time
                      </li>
                      <li>
                        <span className="font-medium">Convolutional Neural Networks (CNNs)</span>: Analyze satellite 
                        imagery to detect regional weather patterns
                      </li>
                      <li>
                        <span className="font-medium">Random Forest Models</span>: Combine multiple predictive models 
                        for more accurate forecasting
                      </li>
                      <li>
                        <span className="font-medium">Gradient Boosting</span>: Refine predictions by learning from 
                        previous forecast errors
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Crop Analytics */}
          <TabsContent value="crops" className="space-y-8">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sprout className="h-5 w-5 text-primary" />
                    Crop Analytics AI
                  </CardTitle>
                  <CardDescription>
                    How our AI analyzes crop data to optimize growth and management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium">How It Works</h3>
                    <p>
                      Our Crop Analytics AI evaluates multiple factors affecting crop growth and health, 
                      providing recommendations for optimal management throughout the growing cycle.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-primary/10 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Data Sources</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Crop growth stage tracking</li>
                          <li>Soil composition and nutrient levels</li>
                          <li>Water usage and irrigation patterns</li>
                          <li>Historical yield performance</li>
                          <li>Weather impacts on specific crops</li>
                        </ul>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-4">
                        <h4 className="font-medium mb-2">AI Processing</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Machine learning models for crop growth prediction</li>
                          <li>Optimization algorithms for resource allocation</li>
                          <li>Comparative analysis against benchmark data</li>
                          <li>Soil-crop-climate relationship modeling</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-medium">Key Features</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Growth Stage Monitoring</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            AI tracks crop development through growth stages, alerting you 
                            when crucial interventions like fertilization or pest control are 
                            most effective.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Resource Optimization</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            AI calculates optimal resource application (water, fertilizer, labor) 
                            based on crop needs, soil conditions, and weather forecasts to reduce 
                            waste and maximize efficiency.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Variety Selection</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            Our AI analyzes performance data from thousands of crop varieties 
                            to recommend those best suited to your specific soil type, climate, 
                            and management practices.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Rotation Planning</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            AI generates optimal crop rotation schedules based on soil health, 
                            pest pressures, market demand, and complementary nutrient needs 
                            of different crops.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-xl font-medium mb-2">The Technology Behind It</h3>
                    <p className="mb-4">
                      Our crop analytics system combines several AI technologies to create comprehensive 
                      crop management recommendations:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <span className="font-medium">Machine Learning Regression Models</span>: Predict 
                        crop responses to different management practices
                      </li>
                      <li>
                        <span className="font-medium">Decision Trees</span>: Create branching recommendation 
                        pathways based on your specific conditions
                      </li>
                      <li>
                        <span className="font-medium">Reinforcement Learning</span>: Optimize management 
                        practices by learning from successful outcomes
                      </li>
                      <li>
                        <span className="font-medium">Bayesian Networks</span>: Model complex relationships 
                        between soil, crops, climate, and management
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Disease Detection */}
          <TabsContent value="disease" className="space-y-8">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Microscope className="h-5 w-5 text-primary" />
                    Plant Disease Detection AI
                  </CardTitle>
                  <CardDescription>
                    How our AI identifies and diagnoses plant diseases from images
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium">How It Works</h3>
                    <p>
                      Our disease detection AI uses computer vision and deep learning to analyze images 
                      of plant leaves, stems, and fruit to identify diseases, nutrient deficiencies, and 
                      pest damage with high accuracy.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-primary/10 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Image Analysis Process</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Image preprocessing and enhancement</li>
                          <li>Feature extraction from plant tissue</li>
                          <li>Pattern recognition of disease symptoms</li>
                          <li>Comparison with disease database</li>
                          <li>Severity assessment and progression prediction</li>
                        </ul>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-4">
                        <h4 className="font-medium mb-2">AI Processing</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Convolutional neural networks (CNNs) for image classification</li>
                          <li>Transfer learning from pre-trained models</li>
                          <li>Object detection for localized symptoms</li>
                          <li>Multi-class classification for diverse diagnoses</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-medium">Key Features</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Early Detection</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            AI can identify disease symptoms before they're visible to the human eye, 
                            allowing for intervention before the disease spreads throughout your crop.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Treatment Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            After diagnosis, the system suggests treatment options ranked by 
                            effectiveness, sustainability, and cost, considering your specific 
                            farming practices.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Risk Assessment</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            The AI evaluates the risk of disease spread based on current 
                            weather conditions, crop density, and pathogen characteristics to 
                            help prioritize interventions.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Continuous Learning</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            Our system improves with each analysis, learning from confirmed 
                            diagnoses to become more accurate for your specific crops and 
                            local disease pressures.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-xl font-medium mb-2">The Technology Behind It</h3>
                    <p className="mb-4">
                      Our disease detection system leverages advanced computer vision and AI techniques:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <span className="font-medium">Deep Convolutional Neural Networks</span>: Identify patterns 
                        in plant images associated with specific diseases
                      </li>
                      <li>
                        <span className="font-medium">Instance Segmentation</span>: Precisely locate affected areas 
                        on plant surfaces
                      </li>
                      <li>
                        <span className="font-medium">Transfer Learning</span>: Leverage knowledge from millions of 
                        analyzed plant images
                      </li>
                      <li>
                        <span className="font-medium">Ensemble Models</span>: Combine multiple analysis techniques 
                        for higher diagnostic accuracy
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Yield Prediction */}
          <TabsContent value="yield" className="space-y-8">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-primary" />
                    Yield Prediction AI
                  </CardTitle>
                  <CardDescription>
                    How our AI forecasts crop yields with high accuracy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium">How It Works</h3>
                    <p>
                      Our yield prediction AI integrates multiple data sources to create accurate harvest 
                      forecasts that help with planning, resource allocation, and financial decisions.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-primary/10 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Data Inputs</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Historical yield data from your farm</li>
                          <li>Current crop health and growth stage</li>
                          <li>Soil conditions and fertilizer applications</li>
                          <li>Weather patterns and forecasts</li>
                          <li>Management practices and interventions</li>
                          <li>Regional benchmark data</li>
                        </ul>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-4">
                        <h4 className="font-medium mb-2">AI Processing</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Multiple regression models for initial forecasts</li>
                          <li>Time-series forecasting as crops develop</li>
                          <li>Scenario modeling for different conditions</li>
                          <li>Confidence interval calculations</li>
                          <li>Continuous recalibration as new data arrives</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-medium">Key Features</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Dynamic Forecasting</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            Predictions update automatically as new data comes in about weather 
                            conditions, crop development, and management actions you've taken.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Field-Level Detail</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            Rather than a single farm-wide prediction, our AI provides 
                            field-specific forecasts that account for micro-conditions 
                            and management differences.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Risk Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            The system identifies potential threats to predicted yields and 
                            quantifies their impact, helping you prioritize interventions to 
                            protect your harvest.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Economic Modeling</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            Yield forecasts are connected to market price data to provide revenue 
                            projections and help with timing harvest for optimal returns.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-xl font-medium mb-2">The Technology Behind It</h3>
                    <p className="mb-4">
                      Our yield prediction system uses sophisticated machine learning techniques:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <span className="font-medium">Ensemble Learning</span>: Combines multiple prediction 
                        models to increase accuracy
                      </li>
                      <li>
                        <span className="font-medium">Gradient Boosting Decision Trees</span>: Handle complex 
                        non-linear relationships between variables
                      </li>
                      <li>
                        <span className="font-medium">LSTM Neural Networks</span>: Process sequential data 
                        to identify temporal patterns
                      </li>
                      <li>
                        <span className="font-medium">Monte Carlo Simulations</span>: Generate probability 
                        distributions for different yield outcomes
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Blockchain Traceability */}
          <TabsContent value="blockchain" className="space-y-8">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-primary" />
                    Blockchain Traceability
                  </CardTitle>
                  <CardDescription>
                    How our CropTrace technology creates transparent supply chains
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium">How It Works</h3>
                    <p>
                      Our CropTrace technology uses Hyperledger Fabric blockchain to create an immutable 
                      record of your crop's journey from planting to harvest and beyond, building trust 
                      with buyers and consumers.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-primary/10 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Blockchain Components</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Immutable distributed ledger for record-keeping</li>
                          <li>Smart contracts for automated verification</li>
                          <li>Consensus mechanisms for data validation</li>
                          <li>Cryptographic security for data integrity</li>
                          <li>QR code generation for public verification</li>
                        </ul>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Data Captured</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Planting details (date, seed source, location)</li>
                          <li>Growing practices (organic, conventional)</li>
                          <li>Input applications (fertilizer, pest control)</li>
                          <li>Harvest information (date, yield, quality)</li>
                          <li>Processing and transport details</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-medium">Key Features</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Farm-to-Consumer Transparency</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            Every step in your crop's journey is recorded and verifiable, allowing 
                            consumers to see exactly where their food came from and how it was grown.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">QR Code Verification</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            Each crop batch receives a unique QR code that consumers can scan to 
                            view its complete history, building trust and authenticating your products.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Certification Integration</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            Organic, fair trade, and other certifications can be directly linked to 
                            your blockchain records, simplifying verification and audits.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Market Premium Support</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            Verified traceability often commands higher prices in the marketplace, 
                            with blockchain verification serving as proof of your sustainable practices.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-xl font-medium mb-2">The Technology Behind It</h3>
                    <p className="mb-4">
                      Our blockchain traceability system combines several technologies:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <span className="font-medium">Hyperledger Fabric</span>: Enterprise-grade permissioned 
                        blockchain for secure, private data recording
                      </li>
                      <li>
                        <span className="font-medium">Smart Contracts</span>: Automated verification of criteria 
                        and requirements at each stage
                      </li>
                      <li>
                        <span className="font-medium">QR Code Generation</span>: Creates unique, tamper-proof 
                        links to blockchain records
                      </li>
                      <li>
                        <span className="font-medium">Public Verification Portal</span>: Consumer-friendly interface 
                        for tracing product origins
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* General AI */}
          <TabsContent value="general" className="space-y-8">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    General AI Integration
                  </CardTitle>
                  <CardDescription>
                    How AI powers our entire platform to deliver personalized insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium">How It Works</h3>
                    <p>
                      Our platform integrates AI throughout the entire system, creating an intelligent 
                      assistant that learns from your farm data to provide increasingly personalized 
                      and valuable insights over time.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-primary/10 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Core AI Capabilities</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Natural language processing for queries</li>
                          <li>Machine learning for pattern recognition</li>
                          <li>Predictive analytics for forecasting</li>
                          <li>Computer vision for image analysis</li>
                          <li>Recommendation systems for decision support</li>
                        </ul>
                      </div>
                      <div className="bg-primary/10 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Application Throughout Platform</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Task prioritization and scheduling</li>
                          <li>Resource allocation optimization</li>
                          <li>Alert and notification systems</li>
                          <li>Market intelligence and pricing</li>
                          <li>Equipment maintenance prediction</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-medium">Key Features</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Personalized User Experience</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            The AI learns your preferences, priorities, and farming style to 
                            customize the interface and recommendations specifically for you.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Decision Support</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            For major decisions, the AI presents multiple options with projected 
                            outcomes and confidence levels, helping you choose the best course of action.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Continuous Learning</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            The system improves with every interaction, adapting to your feedback 
                            and learning from the outcomes of previous recommendations.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Knowledge Integration</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground">
                            Our AI combines your farm's specific data with broader agricultural 
                            research and best practices to provide contextually relevant advice.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-xl font-medium mb-2">The Technology Behind It</h3>
                    <p className="mb-4">
                      Our integrated AI system leverages multiple technologies:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <span className="font-medium">Large Language Models</span>: Power natural language 
                        understanding and knowledge access
                      </li>
                      <li>
                        <span className="font-medium">Multi-modal AI</span>: Processes different types of data 
                        (text, images, time-series) in a unified system
                      </li>
                      <li>
                        <span className="font-medium">Federated Learning</span>: Improves predictions while 
                        maintaining privacy of farm-specific data
                      </li>
                      <li>
                        <span className="font-medium">Explainable AI</span>: Provides transparent reasoning 
                        behind recommendations, not just black-box answers
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">How to Start Using Our AI Features</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">1. Input Your Farm Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Begin by setting up your farm profile with field boundaries, crop types, 
                  and historical data. The more information you provide, the more personalized 
                  your AI insights will be.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. Connect Weather Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Enable location services to get microclimate data for your specific fields. 
                  Our AI will use this to generate climate insights customized to your farm's location.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">3. Start Recording Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Log your farming activities, crop observations, and management decisions. 
                  Each data point improves the AI's understanding of your operation and enhances 
                  future recommendations.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-center mt-8">
            <Link href="/auth" className="inline-block">
              <Button size="lg" className="gap-2">
                Get Started with AI-Powered Farming
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AiKnowledgeBasePage;