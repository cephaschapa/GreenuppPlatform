import { useState } from "react";
import { cn } from "@/lib/utils";

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  thumbnail?: boolean;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Smart image component that automatically optimizes Cloudinary images
 * Falls back to regular img for local/non-Cloudinary URLs
 */
export function CloudinaryImage({
  src,
  alt,
  width,
  height,
  className = "",
  thumbnail = false,
  priority = false,
  onLoad,
  onError,
}: CloudinaryImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Check if this is a Cloudinary URL
  const isCloudinary = src?.includes("cloudinary.com");

  // Generate optimized Cloudinary URL
  const getOptimizedUrl = (url: string): string => {
    if (!isCloudinary) return url;

    // If already has transformations, return as-is
    if (url.includes("/upload/w_") || url.includes("/upload/q_auto")) {
      return url;
    }

    // Build transformations
    const transformations: string[] = [];

    // Add size transformations
    if (thumbnail) {
      transformations.push("w_300,h_300,c_fill");
    } else if (width && height) {
      transformations.push(`w_${width},h_${height},c_limit`);
    } else if (width) {
      transformations.push(`w_${width},c_scale`);
    }

    // Always add quality and format optimization
    transformations.push("q_auto", "f_auto");

    // Insert transformations into URL
    const transformString = transformations.join(",");
    return url.replace("/upload/", `/upload/${transformString}/`);
  };

  const optimizedSrc = getOptimizedUrl(src);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Show placeholder while loading
  if (!isLoaded && !hasError) {
    return (
      <div
        className={cn("relative overflow-hidden bg-muted", className)}
        style={{ width, height }}
      >
        <div className="absolute inset-0 bg-muted animate-pulse" />
        <img
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className="opacity-0 absolute inset-0 w-full h-full object-cover"
        />
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs">Failed to load</p>
        </div>
      </div>
    );
  }

  // Show loaded image
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ width, height }}
    >
      <img
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="w-full h-full object-cover transition-opacity duration-300 opacity-100"
      />
      {isCloudinary && (
        <div className="absolute bottom-0 right-0 bg-black/50 text-white text-[8px] px-1 opacity-0 hover:opacity-100 transition-opacity">
          CDN
        </div>
      )}
    </div>
  );
}

/**
 * Avatar component specifically for user profile pictures
 */
export function CloudinaryAvatar({
  src,
  alt,
  size = 40,
  className = "",
  fallback,
}: {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
  fallback?: React.ReactNode;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold",
          className
        )}
        style={{ width: size, height: size }}
      >
        {fallback}
      </div>
    );
  }

  return (
    <CloudinaryImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      thumbnail
      className={cn("rounded-full", className)}
    />
  );
}

/**
 * Product/listing image for marketplace
 */
export function MarketplaceImage({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <CloudinaryImage
      src={src}
      alt={alt}
      width={800}
      height={800}
      className={cn("aspect-square", className)}
      priority={priority}
    />
  );
}
