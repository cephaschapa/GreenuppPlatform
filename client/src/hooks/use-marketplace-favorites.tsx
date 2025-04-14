import { useQuery, useMutation } from "@tanstack/react-query";
import { MarketplaceFavorite } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useMarketplaceFavorites() {
  const { toast } = useToast();

  // Fetch user's favorites
  const {
    data: favorites,
    isLoading,
    error,
  } = useQuery<MarketplaceFavorite[]>({
    queryKey: ["/api/marketplace/favorites"],
    retry: false, // Don't retry as it will fail if user is not logged in
  });

  // Check if a listing is in favorites
  const isFavorite = (listingId: number): boolean => {
    if (!favorites) return false;
    return favorites.some(favorite => favorite.listingId === listingId);
  };

  // Get favorite ID by listing ID
  const getFavoriteId = (listingId: number): number | undefined => {
    if (!favorites) return undefined;
    const favorite = favorites.find(fav => fav.listingId === listingId);
    return favorite?.id;
  };

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async (listingId: number) => {
      const response = await apiRequest("POST", "/api/marketplace/favorites", {
        listingId,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/favorites"] });
      toast({
        title: "Added to favorites",
        description: "This listing has been added to your favorites",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add to favorites: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (favoriteId: number) => {
      const response = await apiRequest(
        "DELETE",
        `/api/marketplace/favorites/${favoriteId}`
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/favorites"] });
      toast({
        title: "Removed from favorites",
        description: "This listing has been removed from your favorites",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to remove from favorites: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Toggle favorite status
  const toggleFavorite = (listingId: number) => {
    const favoriteId = getFavoriteId(listingId);
    
    if (favoriteId) {
      removeFromFavoritesMutation.mutate(favoriteId);
    } else {
      addToFavoritesMutation.mutate(listingId);
    }
  };

  return {
    favorites,
    isLoading,
    error,
    isFavorite,
    toggleFavorite,
    addToFavoritesMutation,
    removeFromFavoritesMutation,
  };
}