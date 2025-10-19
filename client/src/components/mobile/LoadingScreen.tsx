import { Loader2, Leaf } from "lucide-react";
import { motion } from "framer-motion";

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({ 
  message = "Loading...", 
  fullScreen = true 
}: LoadingScreenProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
        className="w-12 h-12 mx-auto mb-4 text-primary"
      >
        <Leaf className="w-12 h-12" />
      </motion.div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
}

/**
 * Inline loader for small sections
 */
export function InlineLoader({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
        {message && (
          <p className="text-xs text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Button loading state
 */
export function ButtonLoader() {
  return <Loader2 className="w-4 h-4 animate-spin" />;
}

/**
 * Spinner only (no container)
 */
export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
  );
}


