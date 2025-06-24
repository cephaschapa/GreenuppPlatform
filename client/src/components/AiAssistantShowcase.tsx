import { useState } from 'react';
import { motion } from 'framer-motion';

// Sample conversation for the interactive demo
const sampleConversation = [
  {
    type: 'user',
    message: 'What is the best time to plant corn in the southern region?'
  },
  {
    type: 'ai',
    message: 'In the southern region, the ideal time to plant corn is typically between mid-March and early May when soil temperatures consistently reach 60°F (15.5°C) at a 4-inch depth. Early planting often yields better results due to longer growing season, but make sure to check your specific location\'s last frost date and current soil moisture levels.'
  },
  {
    type: 'user',
    message: 'I have noticed some yellow spots on my corn leaves. What could this be?'
  },
  {
    type: 'ai',
    message: 'Yellow spots on corn leaves could indicate several issues. The most common causes are: 1) Nitrogen deficiency (yellowing starts at leaf tips and moves along the midrib in a V-shape), 2) Fungal diseases like Southern Corn Leaf Blight (rectangular yellow-to-brown lesions), or 3) Micronutrient deficiencies (zinc or iron). Can you share a photo of the affected leaves for a more precise diagnosis?'
  }
];

// Predefined questions users can try
const sampleQuestions = [
  "What crops work best with sandy soil?",
  "How do I manage aphid infestation organically?",
  "When should I irrigate my tomato plants?",
  "What's the optimal fertilizer for citrus trees?"
];

const AiAssistantShowcase = () => {
  const [conversation, setConversation] = useState(sampleConversation);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;
    
    // Add user message to conversation
    setConversation([...conversation, { type: 'user', message }]);
    setCurrentMessage('');
    
    // Simulate AI typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setConversation(prev => [...prev, { 
        type: 'ai', 
        message: `I understand you're asking about ${  message.toLowerCase()  }. In a real implementation, I would provide a detailed response based on agricultural best practices, your farm's specific conditions, and latest research. The AI assistant uses your farm data, location, and growing history to provide personalized recommendations.` 
      }]);
    }, 2000);
  };
  
  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-background">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left side - Conversation demo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="bg-card rounded-xl shadow-xl shadow-primary/10 border border-primary/20 overflow-hidden h-[500px] md:h-[550px] flex flex-col">
              {/* Header */}
              <div className="bg-muted p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <i className="fas fa-robot text-primary"></i>
                  </div>
                  <div>
                    <h3 className="font-medium">Greenupp AI Assistant</h3>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      <span>Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <button className="p-2 hover:bg-background/50 rounded-md transition-colors">
                    <i className="fas fa-expand-alt text-sm"></i>
                  </button>
                  <button className="p-2 hover:bg-background/50 rounded-md transition-colors">
                    <i className="fas fa-cog text-sm"></i>
                  </button>
                </div>
              </div>
              
              {/* Chat messages */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {conversation.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.type === 'user' 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : 'bg-muted rounded-tl-none'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg rounded-tl-none p-3">
                      <div className="flex space-x-1 items-center h-6">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Quick question suggestions */}
              <div className="p-3 border-t border-border bg-background/50 hidden md:block">
                <div className="text-xs text-muted-foreground mb-2">Try asking:</div>
                <div className="flex flex-wrap gap-2">
                  {sampleQuestions.map((question, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSendMessage(question)}
                      className="text-xs bg-muted hover:bg-muted/80 rounded-full px-3 py-1 text-foreground transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Input area */}
              <div className="p-3 border-t border-border bg-card flex items-center gap-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(currentMessage)}
                  placeholder="Ask about farming practices, crops, or weather..."
                  className="flex-grow bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button 
                  onClick={() => handleSendMessage(currentMessage)}
                  className="bg-primary hover:bg-primary/90 text-white rounded-md p-2 transition-colors"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* Right side - Description */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider mb-3">AI-POWERED ASSISTANT</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-space mb-6">Your Personal <span className="text-primary">Farming Expert</span></h2>
            
            <p className="text-muted-foreground mb-8">
              Greenupp's AI Assistant analyzes your farm's unique conditions to provide personalized recommendations backed by agricultural science and real-time data. Ask any farming question and get expert guidance instantly.
            </p>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center mt-1 mr-4 border border-border">
                  <i className="fas fa-brain text-primary"></i>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Contextual Awareness</h3>
                  <p className="text-sm text-muted-foreground">
                    Considers your location, climate, soil type, and previous crops to provide recommendations tailored to your specific farming conditions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center mt-1 mr-4 border border-border">
                  <i className="fas fa-camera text-primary"></i>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Visual Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload photos of your crops to diagnose diseases, pest issues, and nutrient deficiencies with 95% accuracy, with treatment recommendations.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center mt-1 mr-4 border border-border">
                  <i className="fas fa-chart-line text-primary"></i>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Data-Driven Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Access agricultural best practices based on data from thousands of farms, scientific research, and current market trends for optimal decision-making.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-muted rounded-lg p-4 border border-primary/10">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full overflow-hidden mr-3 flex-shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1520052203542-d3095f1b6cf0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80" 
                    alt="Farmer testimonial" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm italic mb-2">
                    "The AI assistant helped me identify a nutrient deficiency in my tomato crop that I'd been struggling with for weeks. Following its recommendations, I saw improvement within days."
                  </p>
                  <p className="text-xs font-medium">Carlos R., Vegetable Farmer</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AiAssistantShowcase;