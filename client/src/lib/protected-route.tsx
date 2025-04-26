import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useEffect, useState, createElement } from "react";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType;
};

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading, refetchUser } = useAuth();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // If we don't have a user and we're not loading, try refetching once
  useEffect(() => {
    const MAX_RETRIES = 1;
    
    if (!isLoading && !user && retryCount < MAX_RETRIES) {
      const doRetry = async () => {
        setIsRetrying(true);
        console.log('Protected route: No user found, attempting to refetch...');
        try {
          await refetchUser();
        } catch (error) {
          console.error('Error refetching user data:', error);
        }
        setIsRetrying(false);
        setRetryCount(prev => prev + 1);
      };
      
      // Check for session cookie as an indicator we might be logged in
      if (document.cookie && document.cookie.includes('connect.sid')) {
        console.log('Protected route: Session cookie found, retry might succeed');
        doRetry();
      } else {
        console.log('Protected route: No session cookie found, skipping retry');
        setRetryCount(MAX_RETRIES); // Skip retries if no cookie exists
      }
    }
  }, [user, isLoading, refetchUser, retryCount]);
  
  // Combined loading state (initial load or retry)
  const isCurrentlyLoading = isLoading || isRetrying;

  return (
    <Route path={path}>
      {() => {
        if (isCurrentlyLoading) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">
                {isRetrying ? 'Verifying your session...' : 'Loading...'}
              </p>
            </div>
          );
        }
        
        if (user) {
          return createElement(Component);
        }
        
        return <Redirect to="/auth" />;
      }}
    </Route>
  );
}