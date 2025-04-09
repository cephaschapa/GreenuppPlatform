import { useState } from 'react';
import { useOfflineStatus } from '@/components/OfflineProvider';
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
  RefreshCw, 
  Trash2, 
  AlertTriangle, 
  Check 
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function OfflineStatusPanel() {
  const {
    isOnline,
    offlineModeEnabled,
    pendingRequests,
    isSyncing,
    enableOfflineMode,
    disableOfflineMode,
    syncOfflineData,
    clearOfflineData,
    registerServiceWorker
  } = useOfflineStatus();

  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleOfflineModeToggle = (enabled: boolean) => {
    if (enabled) {
      enableOfflineMode();
    } else {
      disableOfflineMode();
    }
  };

  const handleClearOfflineData = async () => {
    await clearOfflineData();
    setShowClearDialog(false);
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
          
          {offlineModeEnabled && (
            <div className="mt-4 space-y-4">
              <Alert 
                variant={offlineModeEnabled ? "default" : "destructive"}
                className={offlineModeEnabled ? "bg-primary/10 border-primary/30" : ""}
              >
                <Database className="h-4 w-4" />
                <AlertTitle>Offline Storage</AlertTitle>
                <AlertDescription>
                  {offlineModeEnabled
                    ? "Your data will be stored on this device when you're offline and synced when you reconnect."
                    : "Offline storage is disabled. You won't be able to make changes while offline."}
                </AlertDescription>
              </Alert>
              
              {pendingRequests > 0 && (
                <Alert variant="destructive" className="bg-amber-500/10 border-amber-500/30">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertTitle>Pending Changes</AlertTitle>
                  <AlertDescription>
                    You have {pendingRequests} {pendingRequests === 1 ? 'change' : 'changes'} waiting to be synced.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
        {offlineModeEnabled && (
          <CardFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={syncOfflineData}
                disabled={!isOnline || isSyncing || pendingRequests === 0}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
              
              <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-red-500 border-red-500/20 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear Offline Data
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This will delete all cached data and pending changes stored on this device.
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowClearDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleClearOfflineData}
                    >
                      Clear Data
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Display PWA install button if available */}
            {(window as any).deferredPrompt && (
              <Button
                variant="default"
                size="sm"
                onClick={handleInstallPWA}
                disabled={isInstalling}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                {isInstalling ? 'Installing...' : 'Install App'}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}