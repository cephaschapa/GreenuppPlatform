import { useState, useEffect } from "react";
import { StreamChatProvider, useStreamChat } from "@/hooks/use-stream-chat";
import StreamChatComponent from "@/components/chat/StreamChatComponent";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
// import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  // DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Get the Stream Chat API key from environment variables
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY || "";

interface StreamChatUser {
  id: string;
  name: string;
  email?: string;
  image?: string;
  role?: string;
}

function DiagnosticPanel() {
  const [status, setStatus] = useState<unknown>(null);
  const [testResult, setTestResult] = useState<unknown>(null);
  const [webhookStatus, setWebhookStatus] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const { toast } = useToast();

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("GET", "/api/stream-chat/status");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch Stream Chat status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTestLoading(true);
    try {
      const response = await apiRequest(
        "GET",
        "/api/stream-chat/test-connection"
      );
      const data = await response.json();
      setTestResult(data);
      if (data.success) {
        toast({
          title: "Success",
          description: "Connection test successful",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Connection test failed",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: "Failed to test Stream Chat connection",
        variant: "destructive",
      });
      setTestResult({
        success: false,
        error:
          error && typeof error === "object" && "message" in error
            ? error.message
            : "Unknown error",
      });
    } finally {
      setTestLoading(false);
    }
  };

  const checkWebhookStatus = async () => {
    setWebhookLoading(true);
    try {
      const response = await apiRequest(
        "GET",
        "/api/stream-chat/webhooks/health"
      );
      const data = await response.json();
      setWebhookStatus(data);
      if (data.status === "healthy") {
        toast({
          title: "Webhooks Healthy",
          description: "Webhook endpoints are working correctly",
        });
      } else {
        toast({
          title: "Webhook Warning",
          description: "Webhook endpoints may have issues",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Webhook Error",
        description: "Failed to check webhook status",
        variant: "destructive",
      });
      setWebhookStatus({
        status: "error",
        error: "Failed to connect to webhook endpoints",
      });
    } finally {
      setWebhookLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Stream Chat Diagnostics</CardTitle>
        <CardDescription>
          Use these tools to diagnose Stream Chat connectivity issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 flex-wrap">
            <Button onClick={checkStatus} disabled={loading}>
              {loading ? "Checking..." : "Check API Status"}
            </Button>
            <Button
              onClick={testConnection}
              disabled={testLoading}
              variant="secondary"
            >
              {testLoading ? "Testing..." : "Test Connection"}
            </Button>
            <Button
              onClick={checkWebhookStatus}
              disabled={webhookLoading}
              variant="outline"
            >
              {webhookLoading ? "Checking..." : "Check Webhooks"}
            </Button>
          </div>

          {status && (
            <div className="p-4 border rounded-lg bg-muted">
              <h3 className="font-semibold mb-2">API Status</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(status, null, 2)}
              </pre>
            </div>
          )}

          {testResult && (
            <div
              className={`p-4 border rounded-lg ${
                testResult.success ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <h3 className="font-semibold mb-2">Connection Test Result</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}

          {webhookStatus && (
            <div
              className={`p-4 border rounded-lg ${
                webhookStatus.status === "healthy" ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <h3 className="font-semibold mb-2">Webhook Status</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(webhookStatus, null, 2)}
              </pre>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p>
              API Key:{" "}
              {STREAM_API_KEY
                ? `${STREAM_API_KEY.substring(0, 5)}...`
                : "Not set"}
            </p>
            <p>Front-end ENV var: VITE_STREAM_API_KEY</p>
            <p>Back-end ENV vars: STREAM_API_KEY, STREAM_API_SECRET</p>
            <p className="mt-2 text-xs">
              💡 <strong>Webhook Setup:</strong> Configure webhooks in Stream
              Chat dashboard to enable message notifications
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Create a component for selecting users within the StreamChatProvider context
function NewChatDialogContent({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const { createDirectChannel } = useStreamChat();
  const [newChatUserId, setNewChatUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  // Fetch users from our API
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery<{ users: Array<{ id: number; name: string; role: string }> }>({
    queryKey: ["/api/stream-chat/users"],
    enabled: open, // Only fetch when dialog is open
  });

  const users = usersData?.users || [];

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setNewChatUserId("");
      setSelectedUser(null);
    }
  }, [open]);

  const startNewChat = async () => {
    if (!selectedUser || !newChatUserId) return;

    setIsCreatingChat(true);
    try {
      // Use the StreamChat API to create a direct channel
      const channel = await createDirectChannel(
        parseInt(newChatUserId, 10),
        selectedUser.name
      );

      if (channel) {
        toast({
          title: "Chat Created",
          description: `Started chat with ${selectedUser.name}`,
        });
        onOpenChange(false);
      } else {
        throw new Error("Failed to create chat channel");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Start a New Chat</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="userId">Select a User</Label>
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-3 border border-destructive text-destructive rounded-md text-sm">
              Failed to load users. Please try again.
            </div>
          ) : users.length === 0 ? (
            <div className="p-3 border rounded-md text-muted-foreground text-sm">
              No users available to chat with.
            </div>
          ) : (
            <select
              id="userId"
              className="w-full p-2 border rounded-md"
              value={newChatUserId}
              onChange={(e) => {
                const userId = e.target.value;
                setNewChatUserId(userId);
                setSelectedUser(
                  users.find((u: StreamChatUser) => u.id.toString() === userId) || null
                );
              }}
            >
              <option value="">Select a user</option>
              {users.map((u: StreamChatUser) => (
                <option key={u.id} value={u.id.toString()}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          )}
        </div>
        {selectedUser && (
          <div className="p-3 border rounded-md bg-accent">
            <div className="font-semibold">{selectedUser.name}</div>
            <div className="text-sm text-muted-foreground">
              {selectedUser.role}
            </div>
          </div>
        )}
        <Button
          onClick={startNewChat}
          disabled={!newChatUserId || isCreatingChat}
          className="w-full"
        >
          {isCreatingChat ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Chat...
            </>
          ) : (
            "Start Chat"
          )}
        </Button>
      </div>
    </DialogContent>
  );
}

export default function StreamChatPage() {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Ensure we have the API key
  useEffect(() => {
    if (!STREAM_API_KEY) {
      toast({
        title: "Configuration Error",
        description:
          "Stream Chat API key is missing. Please add it to your environment variables.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[calc(100vh-5rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-destructive/20 border border-destructive text-destructive p-4 rounded-md">
          <h2 className="font-bold">Authentication Required</h2>
          <p>
            You need to be logged in to use the chat feature. Please log in or
            register to continue.
          </p>
        </div>
        <Button
          onClick={() => (window.location.href = "/auth")}
          className="mt-4"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  // Check if API key is available
  if (!STREAM_API_KEY) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-destructive/20 border border-destructive text-destructive p-4 rounded-md">
          <h2 className="font-bold">Stream Chat Configuration Error</h2>
          <p>
            The Stream Chat API key is missing. Please make sure the
            VITE_STREAM_API_KEY environment variable is set.
          </p>
        </div>
        <Button
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="mt-4"
        >
          {showDiagnostics ? "Hide Diagnostics" : "Show Diagnostics"}
        </Button>
        {showDiagnostics && <DiagnosticPanel />}
      </div>
    );
  }

  return (
    <DashboardLayout title="" description="" styles="w-full">
      <div className="flex flex-col h-[calc(100vh-4rem)] lg:w-2/3 fixed overflow-hidden left-[256px] top-16">
        <div className="">
          <div className="flex ">
            {/* Dialog is now triggered by floating action button in StreamChatComponent */}
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              {isCreateDialogOpen && (
                <StreamChatProvider apiKey={STREAM_API_KEY}>
                  <NewChatDialogContent
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                  />
                </StreamChatProvider>
              )}
            </Dialog>
          </div>

          {showDiagnostics && <DiagnosticPanel />}
        </div>

        <div
          className={`flex-1 border-t rounded-t-lg shadow-sm overflow-hidden ${
            showDiagnostics ? "mt-2" : "mt-0"
          }`}
        >
          <StreamChatProvider apiKey={STREAM_API_KEY}>
            <StreamChatComponent
              onNewChatClick={() => setIsCreateDialogOpen(true)}
            />
          </StreamChatProvider>
        </div>
      </div>
    </DashboardLayout>
  );
}
