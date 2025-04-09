import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

export interface WeatherPreference {
  id?: number;
  userId?: number;
  location: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export function useWeatherPreferences() {
  // Get the user's weather preferences
  const { 
    data: preferences, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/weather-preferences'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/weather-preferences');
        return await response.json();
      } catch (error) {
        console.error('Error fetching weather preferences:', error);
        return null;
      }
    }
  });

  // Create a new weather preference
  const createMutation = useMutation({
    mutationFn: async (data: Omit<WeatherPreference, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiRequest('POST', '/api/weather-preferences', data);
      return await response.json();
    },
    onSuccess: (newPreference) => {
      queryClient.setQueryData(['/api/weather-preferences'], newPreference);
    }
  });

  // Update an existing weather preference
  const updateMutation = useMutation({
    mutationFn: async (data: Pick<WeatherPreference, 'id' | 'location'>) => {
      const response = await apiRequest('PATCH', `/api/weather-preferences/${data.id}`, {
        location: data.location
      });
      return await response.json();
    },
    onSuccess: (updatedPreference) => {
      queryClient.setQueryData(['/api/weather-preferences'], updatedPreference);
    }
  });

  return {
    preferences,
    isLoading,
    error,
    createWeatherPreference: createMutation.mutate,
    updateWeatherPreference: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending
  };
}