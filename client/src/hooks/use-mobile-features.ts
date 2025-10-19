// Export all mobile feature hooks from a single entry point

export { useCamera } from "./use-camera";
export { useGeolocation } from "./use-geolocation";
export { useHaptics } from "./use-haptics";
export { useShare } from "./use-share";
export { useIsMobile } from "./use-mobile";
export { useMediaQuery } from "./use-media-query";

// Re-export types
export type { CameraOptions, CameraResult } from "./use-camera";
export type { GeolocationOptions, LocationCoordinates } from "./use-geolocation";
export type { ShareOptions } from "./use-share";


