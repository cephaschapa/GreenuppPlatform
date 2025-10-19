import { useState } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType?: "uri" | "base64";
  source?: "camera" | "photos" | "prompt";
}

export interface CameraResult {
  uri: string;
  base64?: string;
  format?: string;
}

export const useCamera = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNative = Capacitor.isNativePlatform();

  const takePicture = async (
    options: CameraOptions = {}
  ): Promise<CameraResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isNative) {
        // Web fallback - use native file input
        return await webCameraFallback();
      }

      const image = await Camera.getPhoto({
        quality: options.quality || 80,
        allowEditing: options.allowEditing || false,
        resultType:
          options.resultType === "base64"
            ? CameraResultType.Base64
            : CameraResultType.Uri,
        source: getCameraSource(options.source || "prompt"),
      });

      return {
        uri: image.webPath || "",
        base64: image.base64String,
        format: image.format,
      };
    } catch (err: any) {
      // Handle user cancellation
      if (err.message === "User cancelled photos app") {
        setError(null);
        return null;
      }
      
      setError(err.message || "Failed to capture image");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getCameraSource = (source: string) => {
    switch (source) {
      case "camera":
        return CameraSource.Camera;
      case "photos":
        return CameraSource.Photos;
      default:
        return CameraSource.Prompt;
    }
  };

  const webCameraFallback = (): Promise<CameraResult> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment";

      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            resolve({
              uri: result,
              base64: result.split(",")[1],
              format: file.type,
            });
          };
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(file);
        } else {
          reject(new Error("No file selected"));
        }
      };

      input.oncancel = () => {
        reject(new Error("User cancelled photos app"));
      };

      input.click();
    });
  };

  return {
    takePicture,
    isLoading,
    error,
    isNative,
    isSupported: true, // Camera is supported on all platforms
  };
};


