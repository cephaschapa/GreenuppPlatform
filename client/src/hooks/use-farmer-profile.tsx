import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { FarmerProfile, InsertFarmerProfile } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useFarmerProfile() {
  const {
    data: profile,
    error,
    isLoading,
  } = useQuery<FarmerProfile>({
    queryKey: ["/api/farmer-profile"],
    refetchOnWindowFocus: false,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<FarmerProfile>) => {
      const res = await apiRequest("PATCH", "/api/farmer-profile", profileData);
      return await res.json();
    },
    onSuccess: (updatedProfile: FarmerProfile) => {
      queryClient.setQueryData(["/api/farmer-profile"], updatedProfile);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (profileData: InsertFarmerProfile) => {
      const res = await apiRequest("POST", "/api/farmer-profile", profileData);
      return await res.json();
    },
    onSuccess: (newProfile: FarmerProfile) => {
      queryClient.setQueryData(["/api/farmer-profile"], newProfile);
      toast({
        title: "Profile created",
        description: "Your profile has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutate,
    createProfile: createProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    isCreating: createProfileMutation.isPending,
  };
}