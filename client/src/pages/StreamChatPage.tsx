import { useState, useEffect } from 'react';
import { StreamChatProvider } from '@/hooks/use-stream-chat';
import StreamChatComponent from '@/components/chat/StreamChatComponent';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';

// Define mock users for demo
const mockUsers = [
  {
    id: 1,
    name: 'John Farmer',
    role: 'farmer'
  },
  {
    id: 2,
    name: 'Jane Supplier',
    role: 'supplier'
  },
  {
    id: 3,
    name: 'Mike Buyer',
    role: 'buyer'
  }
];

// Get the Stream Chat API key from environment variables
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY || '';

function DiagnosticPanel() {
  const [status, setStatus] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const { toast } = useToast();

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', '/api/stream-chat/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch Stream Chat status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTestLoading(true);
    try {
      const response = await apiRequest('GET', '/api/stream-chat/test-connection');
      const data = await response.json();
      setTestResult(data);
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Connection test successful',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Connection test failed',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to test Stream Chat connection',
        variant: 'destructive',
      });
      setTestResult({
        success: false,
        error: error && typeof error === 'object' && 'message' in error 
          ? error.message 
          : 'Unknown error',
      });
    } finally {
      setTestLoading(false);
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
          <div className="flex gap-4">
            <Button onClick={checkStatus} disabled={loading}>
              {loading ? 'Checking...' : 'Check API Status'}
            </Button>
            <Button onClick={testConnection} disabled={testLoading} variant="secondary">
              {testLoading ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>

          {status && (
            <div className="p-4 border rounded-lg bg-muted">
              <h3 className="font-semibold mb-2">API Status</h3>
              <pre className="text-xs overflow-auto">{JSON.stringify(status, null, 2)}</pre>
            </div>
          )}

          {testResult && (
            <div className={`p-4 border rounded-lg ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className="font-semibold mb-2">Connection Test Result</h3>
              <pre className="text-xs overflow-auto">{JSON.stringify(testResult, null, 2)}</pre>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p>API Key: {STREAM_API_KEY ? `${STREAM_API_KEY.substring(0, 5)}...` : 'Not set'}</p>
            <p>Front-end ENV var: VITE_STREAM_API_KEY</p>
            <p>Back-end ENV vars: STREAM_API_KEY, STREAM_API_SECRET</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StreamChatPage() {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newChatUserId, setNewChatUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Ensure we have the API key
  useEffect(() => {
    if (!STREAM_API_KEY) {
      toast({
        title: 'Configuration Error',
        description: 'Stream Chat API key is missing. Please add it to your environment variables.',
        variant: 'destructive',
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
            You need to be logged in to use the chat feature. Please log in or register to continue.
          </p>
        </div>
        <Button onClick={() => window.location.href = '/auth'} className="mt-4">
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
            The Stream Chat API key is missing. Please make sure the VITE_STREAM_API_KEY environment
            variable is set.
          </p>
        </div>
        <Button onClick={() => setShowDiagnostics(!showDiagnostics)} className="mt-4">
          {showDiagnostics ? 'Hide Diagnostics' : 'Show Diagnostics'}
        </Button>
        {showDiagnostics && <DiagnosticPanel />}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-5rem)]">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stream Chat</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowDiagnostics(!showDiagnostics)} variant="outline" size="sm">
            {showDiagnostics ? 'Hide Diagnostics' : 'Show Diagnostics'}
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>New Chat</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start a New Chat</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">Select a User</Label>
                  <select
                    id="userId"
                    className="w-full p-2 border rounded-md"
                    value={newChatUserId}
                    onChange={(e) => {
                      setNewChatUserId(e.target.value);
                      setSelectedUser(
                        mockUsers.find((u: { id: number }) => u.id.toString() === e.target.value) || null
                      );
                    }}
                  >
                    <option value="">Select a user</option>
                    {mockUsers.map((user: { id: number; name: string }) => (
                      <option key={user.id} value={user.id.toString()}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedUser && (
                  <div className="p-3 border rounded-md bg-accent">
                    <div className="font-semibold">{selectedUser.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedUser.role}</div>
                  </div>
                )}
                <Button
                  onClick={() => {
                    // In a real app, we'd use StreamChatContext's createDirectChannel
                    // For now, just close the dialog and show a toast
                    toast({
                      title: 'Chat Started',
                      description: `Started chat with ${selectedUser?.name || 'user'}`,
                    });
                    setIsCreateDialogOpen(false);
                  }}
                  disabled={!newChatUserId}
                  className="w-full"
                >
                  Start Chat
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {showDiagnostics && <DiagnosticPanel />}

      <div className={`${showDiagnostics ? 'h-[calc(100%-12rem)]' : 'h-[calc(100%-3rem)]'} border rounded-md overflow-hidden`}>
        <StreamChatProvider apiKey={STREAM_API_KEY}>
          <StreamChatComponent />
        </StreamChatProvider>
      </div>
    </div>
  );
}