import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, LoginUser, RegisterUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Omit<User, "password">, Error, LoginUser>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<Omit<User, "password">, Error, RegisterUser>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  // Fetch the current user
  const userQuery = useQuery<User | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: 1,
  });
  
  const { data: user, error, isLoading, refetch } = userQuery;
  
  // Log any auth errors but don't show toast for expected 401s
  if (error) {
    console.error("Auth query error:", error);
    if (error.message && !error.message.includes("401")) {
      toast({
        title: "Authentication Error",
        description: `Failed to verify authentication: ${error.message}`,
        variant: "destructive",
      });
    }
  }

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginUser) => {
      console.log('Login attempt with credentials:', { email: credentials.email });
      
      try {
        const res = await apiRequest("POST", "/api/login", credentials);
        console.log('Login response status:', res.status);
        const data = await res.json();
        console.log('Login successful, got user data:', { id: data.id, email: data.email });
        return data;
      } catch (err: any) {
        console.error('Login error:', err.message);
        throw err;
      }
    },
    onSuccess: (user: Omit<User, "password">) => {
      console.log('Login mutation success, setting user data');
      queryClient.setQueryData(["/api/user"], user);
      // Force a refetch to ensure we have the correct user data
      refetch();
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.firstName || user.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error('Login mutation error:', error);
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
    onSuccess: (user: Omit<User, "password">) => {
      queryClient.setQueryData(["/api/user"], user);
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
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
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

  // Use type assertion to handle nullable user properly
  // We know this is safe because we're using returnNull in the queryFn options
  return (
    <AuthContext.Provider
      value={{
        user: (user ?? null) as User | null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
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