import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  Send,
  Loader2,
  User,
  Bot,
  X,
  Maximize2,
  MessageSquare,
} from "lucide-react";
import greenuppLogo from "@/assets/greenupp-full-logo.png";
import { cn } from "@/lib/utils";
import Markdown from "react-markdown";
import {
  saveAIAssistantMessage,
  getAIAssistantMessagesBySession,
  saveAIAssistantSession,
  getAIAssistantSessionsByUser,
  AIAssistantMessage,
  AIAssistantSession,
} from "@/lib/indexedDb";
import { Link } from "wouter";

export function PopoverAssistant() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AIAssistantMessage[]>([]);
  const [currentSession, setCurrentSession] =
    useState<AIAssistantSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load last session or create new one
  useEffect(() => {
    const loadSession = async () => {
      if (!user) return;

      // Get all sessions
      const sessions = await getAIAssistantSessionsByUser(user.id);

      let session: AIAssistantSession;
      if (sessions.length > 0) {
        // Use most recent session
        session = sessions[sessions.length - 1];
      } else {
        // Create a new session
        session = {
          id: crypto.randomUUID(),
          userId: user.id,
          title: "New Conversation",
          lastMessageDate: Date.now(),
          contextData: {},
        };
        await saveAIAssistantSession(session);
      }

      setCurrentSession(session);

      // Load messages for this session
      const sessionMessages = await getAIAssistantMessagesBySession(session.id);
      setMessages(sessionMessages);
    };

    if (open) {
      loadSession();
    }
  }, [user, open]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current && open) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Query for farming context
  const { data: farmingContext } = useQuery({
    queryKey: ["/api/farming-assistant/context"],
    enabled: !!user && open,
  });

  // Send message mutation
  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/farming-assistant/chat", {
        message,
        context: farmingContext,
      });
      return response.json();
    },
    onSuccess: async (data) => {
      if (!currentSession) return;

      // Create assistant message
      const assistantMessage: AIAssistantMessage = {
        id: crypto.randomUUID(),
        userId: user!.id,
        sessionId: currentSession.id,
        content: data.message,
        role: "assistant",
        timestamp: Date.now(),
      };

      // Save to local storage
      await saveAIAssistantMessage(assistantMessage);

      // Update UI
      setMessages((prev) => [...prev, assistantMessage]);

      // Update session last message time
      const updatedSession = {
        ...currentSession,
        lastMessageDate: Date.now(),
      };
      await saveAIAssistantSession(updatedSession);
      setCurrentSession(updatedSession);
    },
    onError: async (error: Error) => {
      if (!currentSession) return;

      // Create error message
      const errorMessage: AIAssistantMessage = {
        id: crypto.randomUUID(),
        userId: user!.id,
        sessionId: currentSession.id,
        content: "Sorry, I encountered an error. Please try again later.",
        role: "assistant",
        timestamp: Date.now(),
      };

      // Save to local storage
      await saveAIAssistantMessage(errorMessage);

      // Update UI
      setMessages((prev) => [...prev, errorMessage]);

      // Show toast
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !currentSession || !user) return;

    // Create user message
    const userMessage: AIAssistantMessage = {
      id: crypto.randomUUID(),
      userId: user!.id,
      sessionId: currentSession.id,
      content: input,
      role: "user",
      timestamp: Date.now(),
    };

    // Save to local storage
    await saveAIAssistantMessage(userMessage);

    // Update UI
    setMessages((prev) => [...prev, userMessage]);

    // Clear input
    setInput("");

    // Send to API
    sendMessage(input);

    // Update session last message time
    const updatedSession = {
      ...currentSession,
      lastMessageDate: Date.now(),
    };
    await saveAIAssistantSession(updatedSession);
    setCurrentSession(updatedSession);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="h-14 w-14 p-0 rounded-full shadow-lg hover:shadow-xl transition-all">
            <Brain className="h-8 w-8" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] h-[600px] flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={greenuppLogo} alt="Greenupp Logo" className="h-6" />
                <DialogTitle>AI Farming Assistant</DialogTitle>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/farming-assistant">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpen(false)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </Link>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogHeader>

          {/* Messages container */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <img
                  src={greenuppLogo}
                  alt="Greenupp Logo"
                  className="h-10 mb-4"
                />
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                  <Brain size={30} />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  AI Farming Assistant
                </h3>
                <p className="text-muted-foreground text-sm">
                  I can provide personalized farming advice based on your
                  specific crops, soil conditions, and region. Ask me anything
                  about farming!
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "mb-4 max-w-[85%] animate-in fade-in-50 slide-in-from-bottom-3 duration-300",
                      message.role === "user" ? "ml-auto text-right" : "mr-auto"
                    )}
                  >
                    <div
                      className={cn(
                        "inline-block rounded-lg px-4 py-2",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border"
                      )}
                    >
                      <div className="flex gap-2 items-center mb-1">
                        {message.role === "user" ? (
                          <>
                            <span className="font-medium">You</span>
                            <User className="h-3 w-3" />
                          </>
                        ) : (
                          <>
                            <Bot className="h-3 w-3" />
                            <span className="font-medium">AI Assistant</span>
                          </>
                        )}
                      </div>

                      <div
                        className={cn(
                          "text-left leading-relaxed",
                          message.role === "user"
                            ? ""
                            : "prose-sm prose prose-stone dark:prose-invert max-w-none"
                        )}
                      >
                        {message.role === "user" ? (
                          <p>{message.content}</p>
                        ) : (
                          <Markdown>{message.content}</Markdown>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </ScrollArea>

          {/* Input area */}
          <form
            onSubmit={handleSubmit}
            className="border-t p-4 flex gap-2 items-end"
          >
            <Textarea
              placeholder="Ask anything about farming..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[60px] max-h-[120px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isPending || !input.trim()}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
