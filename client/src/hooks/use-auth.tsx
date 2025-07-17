import { createContext, ReactNode, useContext, useEffect } from "react";
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
  refetchUser: () => Promise<any>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [location] = useLocation();

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
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: async (user: Omit<User, "password">) => {
      queryClient.setQueryData(["/api/user"], user);

      // Force refetch to ensure session is properly recognized
      await refetchUser();

      toast({
        title: "Registration successful",
        description: `Welcome to Greenupp, ${user.firstName || user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
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
