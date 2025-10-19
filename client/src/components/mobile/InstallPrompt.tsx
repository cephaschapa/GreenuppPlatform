import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS (no beforeinstallprompt support)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS && !window.matchMedia("(display-mode: standalone)").matches) {
      // Show iOS-specific install instructions
      const hasShownIOSPrompt = localStorage.getItem("iosInstallPromptShown");
      if (!hasShownIOSPrompt) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 30000); // Show after 30 seconds
      }
      return;
    }

    // Listen for install prompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after 30 seconds or on second visit
      const installPromptShown = localStorage.getItem("installPromptShown");
      const visitCount = parseInt(localStorage.getItem("visitCount") || "0");
      
      localStorage.setItem("visitCount", (visitCount + 1).toString());

      if (!installPromptShown && visitCount >= 1) {
        setTimeout(() => setShowPrompt(true), 30000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.setItem("installPromptShown", "true");
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      localStorage.setItem("installPromptShown", "true");
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("installPromptShown", "true");
    
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      localStorage.setItem("iosInstallPromptShown", "true");
    }
  };

  if (isInstalled || !showPrompt) return null;

  // iOS-specific prompt
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
      >
        <Card className="shadow-lg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1">
                  {isIOS ? "Add to Home Screen" : "Install GreenUpp"}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {isIOS
                    ? "Tap the Share button below, then 'Add to Home Screen'"
                    : "Install our app for quick access and offline use"}
                </p>

                <div className="flex gap-2">
                  {!isIOS && deferredPrompt && (
                    <Button
                      size="sm"
                      onClick={handleInstall}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Install
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={handleDismiss}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}


