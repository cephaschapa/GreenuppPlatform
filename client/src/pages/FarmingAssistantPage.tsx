import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, Sparkles, ArrowRight, Leaf } from 'lucide-react';

// Define the message interface
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const FarmingAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Hello! I\'m your farming assistant, GreenWisdom. How can I help you with your farming needs today?',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [includeFarmerContext, setIncludeFarmerContext] = useState(true);

  // Scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus on input when loaded
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Send a message to the AI assistant
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/farming-assistant/chat', {
        message,
        includeFarmerContext
      });
      return await response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      queryClient.invalidateQueries({ queryKey: ['/api/farming-assistant/chat-history'] });
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message to the conversation
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Send to backend API
    chatMutation.mutate(inputMessage);
    
    // Clear input field
    setInputMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto py-6 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex flex-col space-y-2 mb-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">AI Farming Assistant</h1>
        </div>
        <p className="text-muted-foreground">
          Get personalized farming advice powered by advanced AI.
        </p>
      </div>
      
      <Card className="flex-grow flex flex-col overflow-hidden">
        <CardHeader className="px-6 py-4 border-b">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8 bg-green-800">
              <AvatarFallback>GW</AvatarFallback>
              <AvatarImage src="/greenwisdom.png" alt="GreenWisdom" />
            </Avatar>
            <div>
              <CardTitle className="text-md">GreenWisdom</CardTitle>
              <CardDescription className="text-xs flex items-center">
                <div className="flex items-center">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                  <span>AI Powered</span>
                </div>
                {includeFarmerContext && (
                  <div className="flex items-center ml-2">
                    <Leaf className="h-3 w-3 mr-1 text-green-500" />
                    <span>Personalized</span>
                  </div>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 animate-pop-in ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                <div
                  className={`text-xs mt-1 ${
                    msg.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
          
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="rounded-lg px-4 py-2 bg-muted">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </CardContent>
        
        <CardFooter className="border-t p-4">
          <div className="flex items-center w-full space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIncludeFarmerContext(!includeFarmerContext)}
              className="flex-shrink-0"
            >
              {includeFarmerContext ? (
                <><Leaf className="h-4 w-4 mr-1" /> Using Farm Data</>
              ) : (
                <><Leaf className="h-4 w-4 mr-1 text-muted-foreground" /> Generic Advice</>
              )}
            </Button>
            
            <div className="relative flex-grow">
              <Input
                ref={inputRef}
                placeholder="Ask about crop management, soil health, pest control..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-12"
                disabled={chatMutation.isPending}
              />
              <Button
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={handleSendMessage}
                disabled={chatMutation.isPending || !inputMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      <div className="mt-3 text-xs text-muted-foreground text-center">
        <p>
          Powered by OpenAI. Responses are AI-generated and may not always be accurate.
          Always verify important agricultural decisions with local experts.
        </p>
      </div>
    </div>
  );
};

export default FarmingAssistantPage;