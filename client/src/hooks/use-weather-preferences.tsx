import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { WeatherPreferences } from "@shared/schema";

export function useWeatherPreferences() {
  const { toast } = useToast();

  // Fetch weather preferences
  const {
    data: preferences,
    isLoading,
    error,
    refetch
  } = useQuery<WeatherPreferences>({
    queryKey: ["/api/weather-preferences"],
    staleTime: 60000 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    // We want to accept 404s since we'll handle missing preferences through our mutations
    // Don't retry on 404 specifically
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false;
      return failureCount < 3;
    },
  });

  // Create weather preferences
  const createPreferencesMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Creating weather preferences with data:', data);
      try {
        const res = await apiRequest("POST", "/api/weather-preferences", data);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Server error response:', errorText);
          throw new Error(`Failed to create preferences: ${res.status} ${res.statusText}`);
        }
        
        const jsonResponse = await res.json();
        console.log('Create response:', jsonResponse);
        return jsonResponse;
      } catch (error) {
        console.error('Error creating weather preferences:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Weather preferences successfully created:', data);
      toast({
        title: "Weather preferences saved",
        description: "Your weather preferences have been saved successfully",
      });
      // Force a refresh of weather preferences data
      queryClient.invalidateQueries({ queryKey: ["/api/weather-preferences"] });
    },
    onError: (error) => {
      console.error('Error in create mutation:', error);
      toast({
        title: "Failed to save preferences",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Update weather preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Updating weather preferences with data:', data);
      try {
        // Always use PATCH - our backend handles creating new preferences if they don't exist
        const res = await apiRequest("PATCH", "/api/weather-preferences", data);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Server error response:', errorText);
          throw new Error(`Failed to update preferences: ${res.status} ${res.statusText}`);
        }
        
        const jsonResponse = await res.json();
        console.log('Update response:', jsonResponse);
        return jsonResponse;
      } catch (error) {
        console.error('Error updating weather preferences:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Weather preferences successfully updated:', data);
      toast({
        title: "Weather preferences updated",
        description: "Your weather preferences have been updated successfully",
      });
      // Force a refresh of weather preferences data
      queryClient.invalidateQueries({ queryKey: ["/api/weather-preferences"] });
    },
    onError: (error) => {
      console.error('Error in update mutation:', error);
      toast({
        title: "Failed to update preferences",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Fetches weather data for a specific location
  const fetchWeatherForLocation = (location: string) => {
    return useQuery({
      queryKey: ["/api/weather", location],
      queryFn: async () => {
        const res = await apiRequest("GET", `/api/weather?location=${encodeURIComponent(location)}`);
        return res.json();
      },
      staleTime: 60000 * 30, // 30 minutes
    });
  };

  return {
    preferences,
    isLoading,
    error,
    refetch,
    createPreferencesMutation,
    updatePreferencesMutation,
    fetchWeatherForLocation,
  };
}