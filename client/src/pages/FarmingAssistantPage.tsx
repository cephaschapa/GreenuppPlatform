import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Brain,
  Send,
  Loader2,
  User,
  Bot,
  AlertTriangle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Markdown from "react-markdown";

// Define message interface
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export default function FarmingAssistantPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [firstMessageSent, setFirstMessageSent] = useState(false);

  // Add a welcome message on first load
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "👋 Hello! I'm your AI Farming Assistant, ready to provide personalized advice based on your crops, soil conditions, and region. How can I help you today?",
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when page loads
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Define types for the farming context
  interface FarmingContext {
    crops?: { id: number; name: string; }[];
    fields?: { id: number; name: string; location: string; }[];
    soilTypes?: string[];
    region?: string;
  }
  
  // Fetch farming context (crops, fields, etc.) for personalized responses
  const { data: farmingContext, isLoading: isLoadingContext } = useQuery<FarmingContext>({
    queryKey: ["/api/farming-assistant/context"],
    enabled: firstMessageSent,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Send message mutation
  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/farming-assistant/chat", {
        message,
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Add assistant's response to messages
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "I'm sorry, I encountered an error while processing your request. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to state
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Send to API
    sendMessage(input);

    // Clear input field
    setInput("");

    // Set first message flag for context loading
    if (!firstMessageSent) {
      setFirstMessageSent(true);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl px-4 md:px-6">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-4">
          <Brain size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-space tracking-tight">
            AI Farming Assistant
          </h1>
          <p className="text-sm text-muted-foreground">
            Get personalized farming advice powered by AI
          </p>
        </div>
      </div>

      {/* Context indicator (when available) */}
      {farmingContext && (
        <Card className="p-3 mb-4 bg-muted/30 border border-muted">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info size={14} className="mt-0.5" />
            <div>
              <p>
                <span className="font-medium">AI Assistant is using context from your farm:</span>{" "}
                {farmingContext.crops && farmingContext.crops.length > 0 && (
                  <>Crops: {farmingContext.crops.map((c) => c.name).join(", ")}.</>
                )}{" "}
                {farmingContext.fields && farmingContext.fields.length > 0 && (
                  <>Location: {farmingContext.fields[0].location}.</>
                )}{" "}
                {farmingContext.soilTypes && farmingContext.soilTypes.length > 0 && (
                  <>Soil: {farmingContext.soilTypes.join(", ")}.</>
                )}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Messages container */}
      <div className="bg-card border rounded-lg p-4 h-[calc(100vh-16rem)] overflow-y-auto flex flex-col gap-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex items-start gap-3 max-w-[85%] animate-in fade-in-0 zoom-in-95 duration-300", {
              "ml-auto": message.role === "user",
            })}
          >
            {/* Avatar */}
            {message.role !== "user" ? (
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary flex-shrink-0">
                <Bot size={16} />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-secondary/80 text-secondary-foreground order-last flex-shrink-0">
                <User size={16} />
              </div>
            )}

            {/* Message bubble */}
            <div
              className={cn(
                "py-2.5 px-3 rounded-lg",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              )}
            >
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <Markdown>{message.content}</Markdown>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isPending && (
          <div className="flex items-start gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary flex-shrink-0">
              <Bot size={16} />
            </div>
            <div className="py-2.5 px-3 rounded-lg bg-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input form */}
      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
        <Textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about crop management, pest control, soil health..."
          className="min-h-[52px] max-h-32 py-3"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          className="h-[52px] w-[52px] p-0"
          disabled={isPending || !input.trim()}
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
}