import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Wifi, 
  WifiOff, 
  Database, 
  AlertCircle 
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

// Temporary simplified version without OfflineProvider dependency
export function OfflineStatusPanel() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineModeEnabled, setOfflineModeEnabled] = useState<boolean>(
    localStorage.getItem('offlineModeEnabled') === 'true'
  );
  const [isInstalling, setIsInstalling] = useState(false);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const handleOfflineModeToggle = (enabled: boolean) => {
    setOfflineModeEnabled(enabled);
    localStorage.setItem('offlineModeEnabled', enabled.toString());
  };
  
  // Handle installing as PWA
  const handleInstallPWA = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (!promptEvent) {
      return;
    }

    setIsInstalling(true);
    
    // Show the prompt
    promptEvent.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await promptEvent.userChoice;
    
    setIsInstalling(false);
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the saved prompt since it can't be used again
    (window as any).deferredPrompt = null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Connection Status
          </CardTitle>
          <CardDescription>
            {isOnline
              ? "You're currently online. All data is synced with the server."
              : "You're currently offline. Some features may be limited."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Label htmlFor="offline-mode" className="font-medium">
                Offline Mode
              </Label>
              <span className="text-xs text-gray-500">
                {offlineModeEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <Switch
              id="offline-mode"
              checked={offlineModeEnabled}
              onCheckedChange={handleOfflineModeToggle}
            />
          </div>
          
          <div className="mt-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Enhanced offline features coming soon</AlertTitle>
              <AlertDescription>
                Advanced offline features are under development and will be available soon.
                This will include full offline storage and sync capabilities.
              </AlertDescription>
            </Alert>
          </div>
          
          {offlineModeEnabled && (
            <div className="mt-4">
              <Alert 
                variant="default" 
                className="bg-primary/10 border-primary/30"
              >
                <Database className="h-4 w-4" />
                <AlertTitle>Offline Storage</AlertTitle>
                <AlertDescription>
                  Basic offline settings will be saved to your device. Full offline capabilities
                  are coming in a future update.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          {/* Display PWA install button if available */}
          {(window as any).deferredPrompt && (
            <Button
              variant="default"
              size="sm"
              onClick={handleInstallPWA}
              disabled={isInstalling}
              className="flex items-center gap-2"
            >
              {isInstalling ? 'Installing...' : 'Install App'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}