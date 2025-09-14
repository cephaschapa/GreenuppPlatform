import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useParams } from "wouter";
import { useEffect, useState, createElement } from "react";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType;
  allowedRoles?: string[]; // Optional role restriction
};

export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isLoading, refetchUser } = useAuth();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // If we don't have a user and we're not loading, try refetching once
  useEffect(() => {
    const MAX_RETRIES = 1;

    if (!isLoading && !user && retryCount < MAX_RETRIES) {
      const doRetry = async () => {
        setIsRetrying(true);
        // console.log("Protected route: No user found, attempting to refetch...");
        try {
          await refetchUser();
        } catch (error) {
          // console.error("Error refetching user data:", error);
        }
        setIsRetrying(false);
        setRetryCount((prev) => prev + 1);
      };

      doRetry();
    }
  }, [isLoading, user, refetchUser, retryCount]);

  return (
    <Route path={path}>
      {(params) => {
        // If still loading or retrying, show loading state
        if (isLoading || isRetrying) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          );
        }

        // If no user after retry, redirect to auth
        if (!user) {
          return <Redirect to="/auth" />;
        }

        // Role-based access control
        if (allowedRoles && !allowedRoles.includes(user.role)) {
          // console.warn(
          //   `User role ${
          //     user.role
          //   } not allowed for route ${path}. Allowed roles: ${allowedRoles.join(
          //     ", "
          //   )}`
          // );
          return <Redirect to="/auth" />;
        }

        // Check if the route contains a userId parameter
        const userId = (params as any).userId;
        const currentPath = window.location.pathname;

        if (userId) {
          // Ensure user can only access their own routes
          if (userId !== user.id.toString()) {
            // console.warn(
            //   `User ${user.id} attempted to access route for user ${userId}`
            // );
            // Redirect to their own equivalent route
            const redirectPath = currentPath.replace(
              `/${userId}/`,
              `/${user.id}/`
            );
            return <Redirect to={redirectPath} />;
          }

          // Ensure user is accessing the correct role-based route
          const rolePrefix = getRolePrefixFromPath(currentPath);
          const expectedRolePrefix = getRolePrefixForUser(user.role);

          if (rolePrefix && rolePrefix !== expectedRolePrefix) {
            // console.warn(
            //   `User with role ${user.role} attempted to access ${rolePrefix} route`
            // );
            // Redirect to correct role-based route
            const correctedPath = currentPath.replace(
              `/${rolePrefix}/${userId}/`,
              `/${expectedRolePrefix}/${user.id}/`
            );
            return <Redirect to={correctedPath} />;
          }
        }

        return createElement(Component, params);
      }}
    </Route>
  );
}

// Helper function to extract role prefix from path
function getRolePrefixFromPath(path: string): string | null {
  const match = path.match(/\/(farmer|buyer|seller)\/\d+/);
  return match ? match[1] : null;
}

// Helper function to get expected role prefix for user
function getRolePrefixForUser(userRole: string): string {
  switch (userRole) {
    case "farmer":
      return "farmer";
    case "buyer":
      return "buyer";
    case "supplier":
    case "seller":
      return "seller";
    default:
      return "farmer"; // Default fallback
  }
}
