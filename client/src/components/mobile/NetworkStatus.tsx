import { useState, useEffect } from "react";
import { WifiOff, Wifi, CloudOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      setShowBanner(true);
      
      // Hide reconnected message after 3 seconds
      setTimeout(() => {
        setShowBanner(false);
        setJustReconnected(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
      setJustReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Show banner initially if offline
    if (!navigator.onLine) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-sm font-medium shadow-lg",
            isOnline
              ? "bg-green-500 text-white"
              : "bg-amber-500 text-white"
          )}
        >
          <div className="flex items-center justify-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4" />
                <span>Back online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span>You're offline - Some features may be limited</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Inline network status indicator (for use in components)
 */
export function InlineNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg text-sm">
      <CloudOff className="w-4 h-4 text-amber-600" />
      <span className="text-amber-900 dark:text-amber-100">
        Offline mode - Changes will sync when connected
      </span>
    </div>
  );
}

/**
 * Hook to check network status
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      
      // Reset wasOffline flag after 5 seconds
      setTimeout(() => setWasOffline(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
  };
}


