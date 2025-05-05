import { useState, useEffect } from 'react';
import { StreamChatProvider } from '@/hooks/use-stream-chat';
import StreamChatComponent from '@/components/chat/StreamChatComponent';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

export default function StreamChatPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newChatUserId, setNewChatUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

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
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-5rem)]">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stream Chat</h1>
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

      <div className="h-[calc(100%-3rem)] border rounded-md overflow-hidden">
        <StreamChatProvider apiKey={STREAM_API_KEY}>
          <StreamChatComponent />
        </StreamChatProvider>
      </div>
    </div>
  );
}