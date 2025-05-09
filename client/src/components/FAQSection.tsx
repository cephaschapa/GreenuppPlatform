import { useState } from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQSection = () => {
  const [activeCategory, setActiveCategory] = useState<string>("general");
  
  const categories = [
    { id: "general", label: "General" },
    { id: "features", label: "Features" },
    { id: "technical", label: "Technical" },
    { id: "pricing", label: "Pricing" },
    { id: "security", label: "Security & Privacy" }
  ];
  
  const faqs = {
    general: [
      {
        question: "What is Greenupp?",
        answer: "Greenupp is a comprehensive digital agriculture platform that empowers farmers with intelligent tools, agricultural intelligence, and advanced social networking capabilities. Our platform integrates AI, IoT, and blockchain technologies to revolutionize farming practices and improve agricultural outcomes."
      },
      {
        question: "Who can use Greenupp?",
        answer: "Greenupp is designed for all types of farmers, from small-scale operations to large commercial enterprises. Our platform is customizable to meet the specific needs of different farming types including crop farming, livestock management, hydroponics, aquaculture, and mixed farming operations."
      },
      {
        question: "Do I need special equipment to use Greenupp?",
        answer: "No special equipment is required to start using the basic features of Greenupp. All you need is a smartphone, tablet, or computer with internet access. For advanced features like IoT integration, we offer compatible sensors and devices that can enhance your experience, but these are optional."
      },
      {
        question: "Is Greenupp available worldwide?",
        answer: "Yes, Greenupp is designed for global use. While some features may be optimized for specific regions due to climate data and local agricultural practices, our core platform and community features are available to farmers worldwide."
      }
    ],
    features: [
      {
        question: "What are the key features of Greenupp?",
        answer: "Greenupp offers a wide range of features including smart dashboard for farm management, weather analytics and forecasting, crop recommendation, yield prediction, marketplace for buying and selling, blockchain traceability for crop provenance, plant disease diagnosis through AI, Green Socials network for farmer community, and real-time chat for expert consultations."
      },
      {
        question: "How does the Blockchain Traceability (CropTrace) feature work?",
        answer: "Our CropTrace feature uses Hyperledger Fabric blockchain technology to create an immutable record of your agricultural products from seed to market. Each stage of production is recorded with a digital signature, creating a transparent supply chain that consumers can verify through QR codes, enhancing trust and potentially increasing the value of your products."
      },
      {
        question: "Can I use Greenupp when I'm offline?",
        answer: "Yes, Greenupp features offline mode capabilities. Essential data is stored locally on your device and will sync once you're connected to the internet again. This ensures you can access critical information and continue recording data even in areas with limited connectivity."
      },
      {
        question: "How accurate is the weather prediction system?",
        answer: "Our weather prediction system combines data from multiple meteorological sources and uses advanced AI models to provide hyperlocal forecasts with up to 90% accuracy for 7-day predictions. The system continuously improves as it learns your specific microclimate patterns over time."
      }
    ],
    technical: [
      {
        question: "Is Greenupp a Progressive Web App (PWA)?",
        answer: "Yes, Greenupp is built as a Progressive Web App, which means it can be installed directly from your browser to your device home screen. This provides an app-like experience with faster loading times and some offline capabilities without requiring download from an app store."
      },
      {
        question: "What technologies power Greenupp's AI recommendations?",
        answer: "Greenupp uses a combination of machine learning algorithms, computer vision, and natural language processing. Our crop recommendations utilize supervised learning models trained on agricultural datasets, while disease detection employs convolutional neural networks analyzing images of plants for anomalies."
      },
      {
        question: "Can I integrate my existing farm management software with Greenupp?",
        answer: "We're working on building an API ecosystem that will allow integration with popular farm management software. Currently, we support data import and export in standard formats that can be used with other systems. For enterprise users, we offer custom integration solutions."
      },
      {
        question: "How does the mobile app compare to the web version?",
        answer: "The mobile PWA version offers all the critical features of the web platform optimized for smaller screens and touch interfaces. Some data-intensive analytics may have simplified visualizations on mobile, but all core functionality is consistent across devices."
      }
    ],
    pricing: [
      {
        question: "How much does Greenupp cost?",
        answer: "Greenupp offers a tiered pricing model starting with a free basic plan that includes essential farm management tools. Premium plans start at $15/month for individual farmers and scale based on farm size and feature requirements. Enterprise pricing is available for large operations with custom needs."
      },
      {
        question: "Is there a free trial available?",
        answer: "Yes, we offer a 30-day free trial of our premium features to help you determine which plan best fits your needs. No credit card is required to start the trial, and you can downgrade to the free plan at any time if you choose not to continue with premium features."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept major credit cards, PayPal, and in select regions, mobile payment options. For annual subscriptions, we also offer bank transfer options. Enterprise customers can arrange for invoicing based on their specific requirements."
      },
      {
        question: "Do you offer special pricing for agricultural cooperatives or groups?",
        answer: "Yes, we offer group discounts for cooperatives and farming collectives. Contact our sales team to discuss your specific needs and we can create a custom pricing package that works for your organization while providing access to all members."
      }
    ],
    security: [
      {
        question: "How secure is my farm data on Greenupp?",
        answer: "Security is a top priority at Greenupp. We employ industry-standard encryption for all data in transit and at rest. Your farm data is stored in secure cloud environments with regular security audits. We implement strict access controls and never share your personal or farm data with third parties without your explicit consent."
      },
      {
        question: "Who owns the data I input into Greenupp?",
        answer: "You retain full ownership of all data you input into the Greenupp platform. We have a clear data policy that ensures your information is only used to provide and improve our services. You can export or delete your data at any time."
      },
      {
        question: "How does Greenupp handle user privacy?",
        answer: "We adhere to international privacy standards including GDPR. Our privacy policy clearly outlines how we collect, use, and protect your information. We minimize data collection to only what's necessary to provide our services and give users granular control over their privacy settings."
      },
      {
        question: "Is my marketplace transaction information secure?",
        answer: "Yes, all marketplace transactions use secure payment processing with industry-standard protocols. Sensitive payment information is never stored on our servers, and transaction details are encrypted. Our blockchain traceability features add an additional layer of security and transparency to marketplace interactions."
      }
    ]
  };
  
  type FAQCategory = keyof typeof faqs;
  
  return (
    <section id="faq" className="py-20 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iIzMzMyIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIvPjwvZz48L3N2Zz4=')] bg-[length:20px_20px] opacity-5 pointer-events-none"></div>
      
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider mb-3">QUESTIONS & ANSWERS</div>
          <h2 className="text-3xl md:text-4xl font-bold font-space mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">Find answers to common questions about Greenupp's features, technology, pricing, and security.</p>
        </motion.div>
        
        <motion.div 
          className="mb-10 flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category.id 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-card hover:bg-primary/10 border border-border"
              }`}
            >
              {category.label}
            </button>
          ))}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto bg-card rounded-xl border border-border overflow-hidden"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs[activeCategory as FAQCategory].map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border">
                <AccordionTrigger className="py-5 px-6 hover:no-underline hover:bg-muted/20 group text-left">
                  <div className="flex items-start">
                    <span className="text-primary mr-3 pt-1 group-hover:text-primary/80">Q:</span>
                    <span className="font-medium group-hover:text-primary transition-colors">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5 pt-0">
                  <div className="flex pl-7 -mt-2">
                    <div className="text-muted-foreground">
                      {faq.answer}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
        
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-muted-foreground mb-4">Still have questions? We're here to help.</p>
          <a 
            href="#contact" 
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <i className="fas fa-comment-dots mr-2"></i>
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;