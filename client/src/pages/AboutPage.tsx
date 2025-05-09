import React, { useState } from 'react';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, GlobeIcon, BrainCircuitIcon, UsersIcon, LeafIcon, ShieldIcon, BadgeCheckIcon, SparklesIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

const AboutPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const founderProfiles = [
    {
      name: "Cephas Chapa",
      title: "Founder & Software Engineer",
      bio: "Visionary software engineer with expertise in advanced web technologies, AI integration, and blockchain solutions. Cephas leads Greenupp's technical development and implementation strategy.",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=250&h=250&auto=format&fit=crop",
    },
    {
      name: "Edson Mwimba",
      title: "Environmental Engineer",
      bio: "With a background in sustainable agricultural practices and environmental systems, Edson brings critical expertise in developing ecologically sound farming solutions and resource optimization.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&h=250&auto=format&fit=crop",
    },
    {
      name: "Dr. Lila Mwangi",
      title: "Agricultural Science Advisor",
      bio: "With over 15 years experience in agricultural research and a Ph.D. in Sustainable Agriculture, Dr. Mwangi provides scientific guidance on crop management and agricultural best practices.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=250&h=250&auto=format&fit=crop",
    }
  ];

  const valueItems = [
    {
      icon: <LeafIcon className="w-10 h-10 text-green-500" />,
      title: "Environmental Stewardship",
      description: "We believe farming must work in harmony with nature. Our platform prioritizes sustainable practices that preserve soil health, reduce chemical inputs, and protect biodiversity."
    },
    {
      icon: <GlobeIcon className="w-10 h-10 text-blue-500" />,
      title: "Global Food Security",
      description: "We're committed to increasing agricultural productivity while ensuring food systems are resilient and accessible. Technology should benefit farmers of all sizes across all regions."
    },
    {
      icon: <BrainCircuitIcon className="w-10 h-10 text-purple-500" />,
      title: "Knowledge Democratization",
      description: "Agricultural expertise should be available to everyone. We're dedicated to making advanced farming knowledge and AI-driven insights accessible regardless of a farmer's resources."
    },
    {
      icon: <UsersIcon className="w-10 h-10 text-amber-500" />,
      title: "Community Empowerment",
      description: "Farming thrives through community. Our platform fosters meaningful connections between farmers, enabling knowledge sharing and mutual support across regions and specialties."
    },
    {
      icon: <ShieldIcon className="w-10 h-10 text-rose-500" />,
      title: "Data Sovereignty",
      description: "Farmers own their data. We commit to transparent data practices, ensuring agricultural data benefits those who generate it while protecting their privacy and digital rights."
    },
    {
      icon: <BadgeCheckIcon className="w-10 h-10 text-teal-500" />,
      title: "Integrity & Transparency",
      description: "We maintain the highest standards of honesty in our technology, business practices, and communications, ensuring our platform earns and keeps the trust of the farming community."
    }
  ];

  const timelineEvents = [
    {
      year: "2020",
      title: "The Seed is Planted",
      description: "Greenupp began as a research collaboration between agricultural scientists and AI engineers seeking to address global farming challenges."
    },
    {
      year: "2021",
      title: "First Field Tests",
      description: "Initial prototypes of our crop monitoring and prediction systems were tested with small-scale farmers across three continents."
    },
    {
      year: "2022",
      title: "Formal Launch",
      description: "Greenupp was officially founded, securing seed funding to develop our comprehensive digital agriculture platform."
    },
    {
      year: "2023",
      title: "Platform Expansion",
      description: "Introduction of our blockchain traceability system and agricultural marketplace, connecting farmers directly to consumers and suppliers."
    },
    {
      year: "2024",
      title: "Community Growth",
      description: "Launch of Green Socials network and Stream Chat, fostering a global community of knowledge sharing among farmers."
    },
    {
      year: "2025",
      title: "Looking Forward",
      description: "Ongoing development of integrated IoT systems, drone monitoring, and expanded enterprise solutions for commercial agriculture."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>About Greenupp | Vision, Values and Team</title>
        <meta name="description" content="Learn about Greenupp's vision for sustainable agriculture, our core values, and the team behind our agricultural technology platform." />
      </Helmet>

      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 relative bg-primary/5 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
          <div className="absolute right-0 bottom-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2"></div>
          <div className="absolute left-0 top-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/3"></div>
          
          <div className="container max-w-6xl mx-auto px-4 relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <Link href="/" className="inline-block">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-3xl font-bold tracking-tight">About Us</h1>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider mb-3">OUR MISSION</div>
                <h2 className="text-4xl font-bold mb-6 leading-tight font-space">Transforming Agriculture Through Digital Innovation</h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Greenupp exists to revolutionize farming through accessible technology that empowers 
                  farmers, promotes sustainable practices, and builds resilient food systems for future generations.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="#values">
                    <Button className="gap-2">
                      <SparklesIcon className="w-4 h-4" />
                      Our Values
                    </Button>
                  </Link>
                  <Link href="#team">
                    <Button variant="outline" className="gap-2">
                      <UsersIcon className="w-4 h-4" />
                      Meet Our Team
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/30 rounded-lg blur-xl"></div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/30 rounded-lg blur-xl"></div>
                <div className="relative border-8 border-background rounded-2xl shadow-2xl overflow-hidden aspect-video">
                  <img 
                    src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop" 
                    alt="Modern farming with technology" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-20">
          <div className="container max-w-6xl mx-auto px-4">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider mb-3">OUR VISION</div>
              <h2 className="text-4xl font-bold mb-6 font-space">A World Where Agriculture Thrives in Harmony with Technology</h2>
              <p className="text-muted-foreground text-lg">
                We envision a future where every farmer, regardless of size or resources, has access to powerful digital tools 
                that enhance productivity, sustainability, and profitability. Our platform bridges the gap between 
                traditional farming wisdom and cutting-edge technology, creating a new paradigm for global agriculture.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-2xl font-bold mb-4 text-primary">Agricultural Transformation</h3>
                <p className="text-muted-foreground mb-6">
                  We believe digital agriculture can address the most pressing challenges facing our food systems today. 
                  From climate change adaptation to resource optimization, Greenupp provides solutions that help farmers 
                  produce more with less environmental impact while improving their livelihoods.
                </p>
                <h3 className="text-2xl font-bold mb-4 text-primary">Inclusive Innovation</h3>
                <p className="text-muted-foreground">
                  Technology should serve all farmers, not just those with resources. We design our platform to be 
                  accessible across diverse farming contexts and scales, from small family farms in developing regions 
                  to large commercial operations in industrialized countries.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold mb-4 text-primary">Connected Communities</h3>
                <p className="text-muted-foreground mb-6">
                  The future of farming is collaborative. Through our Green Socials network and communication tools, 
                  we're building bridges between agricultural communities worldwide, enabling knowledge exchange that 
                  transcends geographical, cultural, and economic boundaries.
                </p>
                <h3 className="text-2xl font-bold mb-4 text-primary">Data-Driven Sustainability</h3>
                <p className="text-muted-foreground">
                  We're committed to leveraging AI and data analytics to help farmers make more sustainable decisions. 
                  By providing actionable insights on resource management, biodiversity, and ecosystem health, 
                  we empower farmers to be stewards of both productivity and environmental wellbeing.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section id="values" className="py-20 bg-primary/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
          <div className="container max-w-6xl mx-auto px-4 relative z-10">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider mb-3">OUR VALUES</div>
              <h2 className="text-4xl font-bold mb-6 font-space">Core Principles That Guide Us</h2>
              <p className="text-muted-foreground text-lg">
                At Greenupp, our values shape every aspect of our platform development, business decisions, and 
                community relationships. These principles reflect our commitment to responsible innovation in agriculture.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {valueItems.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full border-primary/10 hover:border-primary/30 transition-colors">
                    <CardContent className="pt-6">
                      <div className="mb-4">{value.icon}</div>
                      <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Journey Timeline */}
        <section className="py-20">
          <div className="container max-w-6xl mx-auto px-4">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider mb-3">OUR JOURNEY</div>
              <h2 className="text-4xl font-bold mb-6 font-space">From Seed to Harvest</h2>
              <p className="text-muted-foreground text-lg">
                Greenupp's growth has been guided by a commitment to understanding farmers' needs and 
                developing technology that creates genuine positive impact in agriculture.
              </p>
            </motion.div>

            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-primary/20"></div>
              
              <div className="space-y-16">
                {timelineEvents.map((event, index) => (
                  <motion.div 
                    key={index}
                    className={`relative flex items-start gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/3 w-4 h-4 bg-primary rounded-full border-4 border-background"></div>
                    
                    <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider mb-2">
                        {event.year}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                      <p className="text-muted-foreground">{event.description}</p>
                    </div>
                    
                    <div className="md:w-1/2"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="py-20 bg-primary/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
          <div className="container max-w-6xl mx-auto px-4 relative z-10">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider mb-3">OUR TEAM</div>
              <h2 className="text-4xl font-bold mb-6 font-space">The Innovators Behind Greenupp</h2>
              <p className="text-muted-foreground text-lg">
                Our multidisciplinary team brings together expertise in agricultural science, artificial intelligence, 
                sustainability, and business to create technology that addresses real-world farming challenges.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {founderProfiles.map((profile, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="text-center"
                >
                  <div className="relative w-48 h-48 mx-auto mb-6 overflow-hidden rounded-full border-4 border-background shadow-lg">
                    <img 
                      src={profile.image} 
                      alt={profile.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold">{profile.name}</h3>
                  <p className="text-primary font-medium mb-3">{profile.title}</p>
                  <p className="text-muted-foreground">{profile.bio}</p>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="mt-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="text-muted-foreground mb-6">
                Beyond our leadership team, Greenupp is powered by a diverse global team of agricultural specialists, 
                software engineers, data scientists, UX designers, and sustainability experts working together to 
                revolutionize farming technology.
              </p>
              <Link href="/careers">
                <Button variant="outline" className="gap-2">
                  Join Our Team
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Join Our Mission CTA */}
        <section className="py-20">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="bg-primary/10 rounded-2xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-space">Join Us in Reimagining Agriculture</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Whether you're a farmer, agricultural expert, technology enthusiast, or someone passionate about 
                  sustainable food systems, there's a place for you in the Greenupp community. Together, we're 
                  building the future of farming.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/auth">
                    <Button size="lg">Get Started Today</Button>
                  </Link>
                  <Link href="/#features">
                    <Button variant="outline" size="lg">Explore Features</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;