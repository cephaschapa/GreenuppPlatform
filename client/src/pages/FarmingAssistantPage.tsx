import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Brain,
  Send,
  Loader2,
  User,
  Bot,
  Info,
  History,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Markdown from "react-markdown";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  saveAIAssistantMessage, 
  getAIAssistantMessagesBySession,
  saveAIAssistantSession,
  getAIAssistantSessionsByUser,
  deleteAIAssistantSession,
  AIAssistantMessage,
  AIAssistantSession
} from "@/lib/indexedDb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [sessions, setSessions] = useState<AIAssistantSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(false);
  const [showSessions, setShowSessions] = useState<boolean>(false);

  // Create a new session
  const createNewSession = async () => {
    if (!user) return;
    
    const sessionId = `session_${Date.now()}`;
    const newSession: AIAssistantSession = {
      id: sessionId,
      userId: user.id,
      title: 'New Conversation',
      lastMessageDate: Date.now(),
      contextData: {}, // Will be updated with farming context later
    };
    
    // Save the new session
    await saveAIAssistantSession(newSession);
    setCurrentSessionId(sessionId);
    
    // Add welcome message
    const welcomeMessage: AIAssistantMessage = {
      id: `${sessionId}_welcome`,
      userId: user.id,
      role: 'assistant',
      content: "👋 Hello! I'm your AI Farming Assistant, ready to provide personalized advice based on your crops, soil conditions, and region. How can I help you today?",
      timestamp: Date.now(),
      sessionId: sessionId,
    };
    
    await saveAIAssistantMessage(welcomeMessage);
    
    // Update UI
    setMessages([{
      id: welcomeMessage.id,
      role: welcomeMessage.role,
      content: welcomeMessage.content,
      timestamp: new Date(welcomeMessage.timestamp),
    }]);
    
    // Refresh sessions list
    await loadSessions();
    
    return sessionId;
  };
  
  // Load all sessions for current user
  const loadSessions = async () => {
    if (!user) return;
    
    setIsLoadingSessions(true);
    try {
      const userSessions = await getAIAssistantSessionsByUser(user.id);
      setSessions(userSessions);
      
      // If we have sessions but no current session selected, load the most recent one
      if (userSessions.length > 0 && !currentSessionId) {
        setCurrentSessionId(userSessions[0].id);
        await loadMessagesForSession(userSessions[0].id);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };
  
  // Load messages for a specific session
  const loadMessagesForSession = async (sessionId: string) => {
    if (!sessionId || !user) return;
    
    try {
      const sessionMessages = await getAIAssistantMessagesBySession(sessionId);
      
      // Convert to our Message interface format
      const formattedMessages: Message[] = sessionMessages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      }));
      
      setMessages(formattedMessages);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error('Error loading messages for session:', error);
    }
  };
  
  // Delete a session
  const deleteSession = async (sessionId: string) => {
    try {
      await deleteAIAssistantSession(sessionId);
      toast({
        title: "Session deleted",
        description: "The conversation has been removed",
      });
      
      // If we deleted the current session, clear messages and create a new session
      if (sessionId === currentSessionId) {
        setCurrentSessionId("");
        setMessages([]);
        await createNewSession();
      }
      
      // Refresh sessions list
      await loadSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    }
  };
  
  // Initialize on load
  useEffect(() => {
    const initializeChat = async () => {
      if (user) {
        await loadSessions();
        
        // If no sessions found after loading, create a new one
        if (sessions.length === 0 && !isLoadingSessions) {
          await createNewSession();
        }
      }
    };
    
    initializeChat();
  }, [user]);

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
  const { mutate: sendMessageToApi, isPending } = useMutation({
    mutationFn: async (payload: { message: string, sessionId: string }) => {
      const response = await apiRequest("POST", "/api/farming-assistant/chat", {
        message: payload.message, // Simple format
        sessionId: payload.sessionId,
      });
      return response.json();
    },
    onSuccess: async (data, variables) => {
      if (!user) return;
      
      // Create assistant message
      const assistantMessage: AIAssistantMessage = {
        id: `${variables.sessionId}_${Date.now()}`,
        userId: user.id,
        role: "assistant",
        content: data.response,
        timestamp: Date.now(),
        sessionId: variables.sessionId,
      };
      
      // Save to IndexedDB
      await saveAIAssistantMessage(assistantMessage);
      
      // Update session's lastMessageDate
      const session = sessions.find(s => s.id === variables.sessionId);
      if (session) {
        await saveAIAssistantSession({
          ...session,
          lastMessageDate: assistantMessage.timestamp,
        });
        
        // Refresh sessions list
        loadSessions();
      }
      
      // Add assistant's response to UI
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessage.id,
          role: assistantMessage.role,
          content: assistantMessage.content,
          timestamp: new Date(assistantMessage.timestamp),
        },
      ]);
    },
    onError: async (error: Error, variables) => {
      if (!user) return;
      
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
      
      // Create error message
      const errorMessage: AIAssistantMessage = {
        id: `${variables.sessionId}_${Date.now()}`,
        userId: user.id,
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        timestamp: Date.now(),
        sessionId: variables.sessionId,
      };
      
      // Save to IndexedDB
      await saveAIAssistantMessage(errorMessage);
      
      // Add error message to UI
      setMessages((prev) => [
        ...prev,
        {
          id: errorMessage.id,
          role: errorMessage.role,
          content: errorMessage.content,
          timestamp: new Date(errorMessage.timestamp),
        },
      ]);
    },
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    // If no active session, create one
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = await createNewSession() || '';
      if (!sessionId) return;
    }

    // Create user message for IndexedDB
    const userMessage: AIAssistantMessage = {
      id: `${sessionId}_${Date.now()}`,
      userId: user.id,
      role: "user",
      content: input,
      timestamp: Date.now(),
      sessionId: sessionId,
    };
    
    // Save to IndexedDB
    await saveAIAssistantMessage(userMessage);
    
    // Update session title if it's the first message
    const session = sessions.find(s => s.id === sessionId);
    if (session && session.title === 'New Conversation') {
      // Use first few words of message as title
      const title = input.substring(0, 30) + (input.length > 30 ? '...' : '');
      await saveAIAssistantSession({
        ...session,
        title,
        lastMessageDate: userMessage.timestamp,
      });
      
      // Refresh sessions list
      loadSessions();
    }
    
    // Add user message to UI
    setMessages((prev) => [
      ...prev,
      {
        id: userMessage.id,
        role: userMessage.role,
        content: userMessage.content,
        timestamp: new Date(userMessage.timestamp),
      },
    ]);

    // Send to API
    sendMessageToApi({
      message: input,
      sessionId: sessionId,
    });

    // Clear input field
    setInput("");

    // Set first message flag for context loading
    if (!firstMessageSent) {
      setFirstMessageSent(true);
    }
  };

  return (
    <DashboardLayout title="AI Farming Assistant" description="Get personalized farming advice powered by AI">
      <div className="max-w-4xl mx-auto">
        {/* Mobile header - hidden on desktop */}
        <div className="flex items-center mb-6 md:hidden">
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
                  {farmingContext.crops && farmingContext.crops.length > 0 ? (
                    <>Crops: {farmingContext.crops.map((c) => c.name).join(", ")}.</>
                  ) : null}{" "}
                  {farmingContext.fields && farmingContext.fields.length > 0 ? (
                    <>Location: {farmingContext.fields[0].location}.</>
                  ) : null}{" "}
                  {farmingContext.soilTypes && farmingContext.soilTypes.length > 0 ? (
                    <>Soil: {farmingContext.soilTypes.join(", ")}.</>
                  ) : null}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Messages container */}
        <div className="bg-card border rounded-lg p-4 h-[calc(100vh-16rem)] md:h-[calc(100vh-22rem)] overflow-y-auto flex flex-col gap-4">
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
    </DashboardLayout>
  );
}