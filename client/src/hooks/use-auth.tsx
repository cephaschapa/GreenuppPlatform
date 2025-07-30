import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, LoginUser, RegisterUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Omit<User, "password">, Error, LoginUser>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<
    Omit<User, "password">,
    Error,
    RegisterUser
  >;
  resendVerificationMutation: UseMutationResult<any, Error, string>;
  refetchUser: () => Promise<any>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [location] = useLocation();
  const [lastUserRole, setLastUserRole] = useState<string | null>(null);

  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser,
  } = useQuery<User | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false, // Changed to false to prevent excessive refetching
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Refetch user data when the route changes, but only for significant changes
  useEffect(() => {
    // Only refetch if we don't have user data and we're not already loading
    if (!user && !isLoading) {
      console.log("No user data available, refetching");
      refetchUser();
    }
  }, [user, isLoading, refetchUser]);

  // Check for authentication cookies on component mount
  useEffect(() => {
    // Check if we have cookies but no user data yet
    if (
      document.cookie &&
      document.cookie.includes("connect.sid") &&
      !user &&
      !isLoading
    ) {
      console.log(
        "Authentication cookie detected, but no user data - refetching"
      );
      refetchUser();
    }
  }, [user, isLoading, refetchUser]);

  useEffect(() => {
    if (user && user.role) {
      setLastUserRole(user.role);
    }
  }, [user]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginUser) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: async (user: Omit<User, "password">) => {
      queryClient.setQueryData(["/api/user"], user);

      // Force refetch to ensure session is properly recognized
      await refetchUser();

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.firstName || user.username}!`,
      });
    },
    onError: (error: any) => {
      // Check for specific error types first
      if (error?.response?.data?.accountLocked) {
        // Don't show toast here - let the auth page handle account locked UI
        return;
      }

      if (error?.response?.data?.requiresEmailVerification) {
        // Don't show toast here - let the auth page handle email verification UI
        return;
      }

      toast({
        title: "Login failed",
        description:
          error?.response?.data?.message || error.message || "Login failed",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: async (response: any) => {
      // Check if email verification is required
      if (response.requiresEmailVerification) {
        toast({
          title: "Registration successful!",
          description:
            response.message ||
            "Please check your email to verify your account before logging in.",
        });
      } else {
        // Old flow for backward compatibility
        queryClient.setQueryData(["/api/user"], response);
        await refetchUser();
        toast({
          title: "Registration successful",
          description: `Welcome to Greenupp, ${
            response.firstName || response.username
          }!`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/auth/resend-verification", {
        email,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification link.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send verification email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: async () => {
      // Clear user data in client cache
      queryClient.setQueryData(["/api/user"], null);

      // Force refetch to ensure session state is updated
      await refetchUser();

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });

      // Redirect based on last user role
      if (lastUserRole === "admin") {
        window.location.href = "/admin/login";
      } else {
        window.location.href = "/auth";
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        resendVerificationMutation,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
