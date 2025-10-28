import { ReactNode } from "react";
import { Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface OnboardingGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * OnboardingGuard ensures that users complete onboarding before accessing protected content.
 * If a user has not completed onboarding, they are redirected to /onboarding.
 */
export function OnboardingGuard({ children, fallback }: OnboardingGuardProps) {
  const { user, isLoading: authLoading } = useAuth();

  // Check onboarding status for authenticated users
  const { data: onboardingStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/user/onboarding-status"],
    queryFn: async () => {
      const response = await fetch("/api/user/onboarding-status");
      if (!response.ok) {
        // If the request fails, assume onboarding is not completed to be safe
        console.warn(
          "Failed to fetch onboarding status, assuming not completed"
        );
        return { completed: false, step: 1, data: {} };
      }
      return await response.json();
    },
    enabled: !!user?.id,
    retry: 1, // Only retry once to avoid infinite loops
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Show loading state while checking authentication or onboarding status
  if (authLoading || (user && statusLoading)) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">
            Checking account setup...
          </p>
        </div>
      )
    );
  }

  // If user is not authenticated, let the auth system handle it
  if (!user) {
    return <>{children}</>;
  }

  // Admin users bypass onboarding
  if (user.role === "admin") {
    return <>{children}</>;
  }

  // If onboarding is not completed, redirect to onboarding
  if (onboardingStatus && !onboardingStatus.completed) {
    console.log("User onboarding not completed, redirecting to /onboarding");
    return <Redirect to="/onboarding" />;
  }

  // If onboarding is completed or status is unknown, allow access
  return <>{children}</>;
}

/**
 * Higher-order component version of OnboardingGuard for easier use with route components
 */
export function withOnboardingGuard<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function OnboardingGuardedComponent(props: P) {
    return (
      <OnboardingGuard fallback={fallback}>
        <Component {...props} />
      </OnboardingGuard>
    );
  };
}
