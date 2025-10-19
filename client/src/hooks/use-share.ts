import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";

export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
  files?: string[];
}

export const useShare = () => {
  const isNative = Capacitor.isNativePlatform();
  const isSupported = isNative || ('share' in navigator);

  /**
   * Share content using native share sheet or Web Share API
   */
  const share = async (options: ShareOptions) => {
    try {
      if (!isSupported) {
        // Fallback: copy to clipboard
        if (options.url) {
          await navigator.clipboard.writeText(options.url);
          return { 
            success: true, 
            message: "Link copied to clipboard",
            method: 'clipboard'
          };
        }
        throw new Error("Share not supported and no URL to copy");
      }

      if (isNative) {
        // Native share via Capacitor
        await Share.share({
          title: options.title,
          text: options.text,
          url: options.url,
          dialogTitle: options.dialogTitle || "Share",
        });

        return { success: true, method: 'native' };
      } else if (navigator.share) {
        // Web Share API
        await navigator.share({
          title: options.title,
          text: options.text,
          url: options.url,
        });

        return { success: true, method: 'web' };
      }

      throw new Error("Share not available");
    } catch (error: any) {
      if (error.message === "Share canceled" || error.name === "AbortError") {
        return { success: false, canceled: true };
      }
      
      // Last resort: copy to clipboard
      if (options.url) {
        try {
          await navigator.clipboard.writeText(options.url);
          return { 
            success: true, 
            message: "Link copied to clipboard",
            method: 'clipboard'
          };
        } catch (clipError) {
          throw new Error("Failed to share or copy link");
        }
      }
      
      throw error;
    }
  };

  /**
   * Check if sharing is available
   */
  const canShare = async (data?: { files?: File[] }): Promise<boolean> => {
    if (isNative) return true;
    
    if (navigator.share) {
      if (data?.files && navigator.canShare) {
        return navigator.canShare(data as ShareData);
      }
      return true;
    }
    
    // Clipboard fallback is always available
    return 'clipboard' in navigator;
  };

  return {
    share,
    canShare,
    isSupported,
  };
};


