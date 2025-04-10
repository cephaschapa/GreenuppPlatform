import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Save the install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      
      // Show the dialog after a short delay if the user hasn't installed yet
      // and hasn't dismissed the prompt recently
      const lastPrompt = localStorage.getItem('pwaPromptLastShown');
      const now = Date.now();
      
      if (!lastPrompt || (now - parseInt(lastPrompt)) > (3 * 24 * 60 * 60 * 1000)) { // 3 days
        setTimeout(() => setIsDialogOpen(true), 5000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check when the app is installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    setIsDialogOpen(false);
    
    if (!installPrompt) {
      return;
    }

    // Show the install prompt
    await installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
      // Save the timestamp when user dismissed the prompt
      localStorage.setItem('pwaPromptLastShown', Date.now().toString());
    }
    
    // Clear the saved prompt as it can't be used twice
    setInstallPrompt(null);
  };
  
  // Hide the button if the PWA is already installed or can't be installed
  if (isInstalled || !installPrompt) {
    return null;
  }

  return (
    <>
      <Button 
        variant="outline" 
        className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm"
        onClick={() => setIsDialogOpen(true)}
      >
        <Download className="h-4 w-4 mr-2" />
        Install App
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Install Greenupp</DialogTitle>
            <DialogDescription>
              Install Greenupp on your device for faster access and offline capabilities. No app store required!
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-black p-2">
                <img 
                  src="/icon.svg" 
                  alt="Greenupp Logo" 
                  className="h-12 w-12" 
                />
              </div>
              <div>
                <h3 className="font-semibold">Greenupp</h3>
                <p className="text-sm text-muted-foreground">Digital Agriculture Platform</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex flex-col items-center justify-center bg-muted p-2 rounded">
                <span className="font-semibold">Offline Access</span>
                <span className="text-xs text-muted-foreground">Use without internet</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-muted p-2 rounded">
                <span className="font-semibold">Fast Loading</span>
                <span className="text-xs text-muted-foreground">Instant startup</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-muted p-2 rounded">
                <span className="font-semibold">Home Screen</span>
                <span className="text-xs text-muted-foreground">Quick access</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-muted p-2 rounded">
                <span className="font-semibold">No App Store</span>
                <span className="text-xs text-muted-foreground">Direct install</span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Later
            </Button>
            <Button onClick={handleInstallClick}>
              <Download className="h-4 w-4 mr-2" />
              Install Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}