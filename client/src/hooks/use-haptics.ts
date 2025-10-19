import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

export const useHaptics = () => {
  const isNative = Capacitor.isNativePlatform();
  const isSupported = isNative || 'vibrate' in navigator;

  /**
   * Light impact feedback - for subtle interactions
   */
  const impact = async (style: "light" | "medium" | "heavy" = "medium") => {
    if (!isSupported) return;

    try {
      if (isNative) {
        const impactStyle = {
          light: ImpactStyle.Light,
          medium: ImpactStyle.Medium,
          heavy: ImpactStyle.Heavy,
        }[style];

        await Haptics.impact({ style: impactStyle });
      } else {
        // Web fallback
        const duration = { light: 10, medium: 20, heavy: 30 }[style];
        navigator.vibrate(duration);
      }
    } catch (error) {
      console.warn("Haptics not supported", error);
    }
  };

  /**
   * Notification feedback - for important events
   */
  const notification = async (
    type: "success" | "warning" | "error" = "success"
  ) => {
    if (!isSupported) return;

    try {
      if (isNative) {
        const notificationType = {
          success: NotificationType.Success,
          warning: NotificationType.Warning,
          error: NotificationType.Error,
        }[type];

        await Haptics.notification({ type: notificationType });
      } else {
        // Web fallback - different patterns for different types
        const pattern = {
          success: [30, 50, 30],
          warning: [50, 30, 50],
          error: [100, 50, 100],
        }[type];
        
        navigator.vibrate(pattern);
      }
    } catch (error) {
      console.warn("Haptics not supported", error);
    }
  };

  /**
   * Custom vibration pattern
   */
  const vibrate = async (duration: number | number[] = 100) => {
    if (!isSupported) return;

    try {
      if (isNative && typeof duration === 'number') {
        await Haptics.vibrate({ duration });
      } else if ('vibrate' in navigator) {
        navigator.vibrate(duration);
      }
    } catch (error) {
      console.warn("Haptics not supported", error);
    }
  };

  /**
   * Selection start feedback
   */
  const selectionStart = async () => {
    if (!isNative) return;
    try {
      await Haptics.selectionStart();
    } catch (error) {
      console.warn("Haptics not supported", error);
    }
  };

  /**
   * Selection changed feedback
   */
  const selectionChanged = async () => {
    if (!isNative) return;
    try {
      await Haptics.selectionChanged();
    } catch (error) {
      console.warn("Haptics not supported", error);
    }
  };

  /**
   * Selection end feedback
   */
  const selectionEnd = async () => {
    if (!isNative) return;
    try {
      await Haptics.selectionEnd();
    } catch (error) {
      console.warn("Haptics not supported", error);
    }
  };

  return {
    impact,
    notification,
    vibrate,
    selectionStart,
    selectionChanged,
    selectionEnd,
    isSupported,
  };
};


