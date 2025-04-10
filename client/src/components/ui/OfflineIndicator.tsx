import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    // Function to update status
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      // Show toast notification when status changes
      if (online) {
        toast({
          title: 'You are back online',
          description: 'Your app is now connected to the internet.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'You are offline',
          description: 'Some features may be limited. Your changes will be saved and synced when you reconnect.',
          variant: 'destructive',
        });
      }
    };

    // Add event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [toast]);

  // If online, don't show anything
  if (isOnline) {
    return null;
  }

  // If offline, show an indicator
  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-destructive px-3 py-1.5 text-xs font-medium text-white">
      <WifiOff className="h-3.5 w-3.5" />
      <span>Offline</span>
    </div>
  );
}