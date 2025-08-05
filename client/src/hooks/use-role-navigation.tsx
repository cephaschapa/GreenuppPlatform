import { useAuth } from "@/hooks/use-auth";
import { useCallback } from "react";

export function useRoleNavigation() {
  const { user } = useAuth();

  // Get the role-based base path for the current user
  const getBasePath = useCallback(() => {
    if (!user) return "";
    const userId = user.id.toString();

    if (user.role === "farmer") return `/farmer/${userId}`;
    if (user.role === "buyer") return `/buyer/${userId}`;
    if (user.role === "supplier" || user.role === "seller")
      return `/seller/${userId}`;

    return "";
  }, [user]);

  // Generate role-based URLs
  const getUrl = useCallback(
    (path: string) => {
      const basePath = getBasePath();
      if (!basePath) return path;

      // Remove leading slash if present to avoid double slashes
      const cleanPath = path.startsWith("/") ? path.slice(1) : path;
      return `${basePath}/${cleanPath}`;
    },
    [getBasePath]
  );

  // Navigate to a role-based route
  const navigateTo = useCallback(
    (path: string) => {
      const url = getUrl(path);
      window.location.href = url;
    },
    [getUrl]
  );

  // Check if current user can access a specific role-based route
  const canAccessRoute = useCallback(
    (routePath: string, targetUserId?: string) => {
      if (!user) return false;

      // If targetUserId is provided, ensure it matches current user
      if (targetUserId && targetUserId !== user.id.toString()) {
        return false;
      }

      // Extract role from route path
      const roleMatch = routePath.match(/\/(farmer|buyer|seller)\/(\d+)/);
      if (!roleMatch) return true; // Non role-based routes are accessible

      const [, routeRole, routeUserId] = roleMatch;

      // Check if user ID matches
      if (routeUserId !== user.id.toString()) {
        return false;
      }

      // Check if role matches
      const userRolePrefix = user.role === "supplier" ? "seller" : user.role;
      return routeRole === userRolePrefix;
    },
    [user]
  );

  // Get dashboard URL for current user
  const getDashboardUrl = useCallback(() => {
    return getUrl("dashboard");
  }, [getUrl]);

  // Get marketplace URL for current user
  const getMarketplaceUrl = useCallback(() => {
    return getUrl("marketplace");
  }, [getUrl]);

  // Get profile URL for current user
  const getProfileUrl = useCallback(() => {
    return getUrl("profile");
  }, [getUrl]);

  // Get settings URL for current user
  const getSettingsUrl = useCallback(() => {
    return getUrl("settings");
  }, [getUrl]);

  return {
    user,
    getBasePath,
    getUrl,
    navigateTo,
    canAccessRoute,
    getDashboardUrl,
    getMarketplaceUrl,
    getProfileUrl,
    getSettingsUrl,
  };
}
