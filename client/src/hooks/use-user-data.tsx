import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export function useUserData() {
  const { user: authUser } = useAuth();
  
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const res = await apiRequest("PATCH", "/api/user", userData);
      return await res.json();
    },
    onSuccess: (updatedUser: User) => {
      // Update both the auth context and any other queries that use user data
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: "User information updated",
        description: "Your information has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update user information",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    user: authUser,
    updateUser: updateUserMutation.mutate,
    isUpdating: updateUserMutation.isPending,
  };
}