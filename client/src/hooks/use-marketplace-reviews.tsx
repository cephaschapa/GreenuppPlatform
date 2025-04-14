import { useQuery, useMutation } from "@tanstack/react-query";
import { MarketplaceReview } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export type CreateReviewData = {
  listingId?: number;
  sellerId: number;
  rating: number;
  review?: string;
};

export type UpdateReviewData = {
  reviewId: number;
  rating: number;
  review?: string;
};

export function useMarketplaceReviews(listingId?: number, sellerId?: number) {
  const { toast } = useToast();

  // Parameter validation
  if (!listingId && !sellerId) {
    throw new Error("Either listingId or sellerId must be provided");
  }

  // Query key based on what we're fetching
  const queryKey = listingId 
    ? ["/api/marketplace/reviews", { listingId }] 
    : ["/api/marketplace/reviews", { sellerId }];

  // Fetch reviews
  const {
    data: reviews,
    isLoading,
    error,
  } = useQuery<MarketplaceReview[]>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (listingId) params.append("listingId", listingId.toString());
      if (sellerId) params.append("sellerId", sellerId.toString());
      
      const response = await apiRequest(
        "GET", 
        `/api/marketplace/reviews?${params.toString()}`
      );
      return await response.json();
    },
  });

  // Calculate average rating
  const averageRating = reviews?.length 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  // Check if user has already reviewed
  const hasUserReviewed = (userId: number): boolean => {
    if (!reviews) return false;
    return reviews.some(review => review.reviewerId === userId);
  };

  // Get user's review
  const getUserReview = (userId: number): MarketplaceReview | undefined => {
    if (!reviews) return undefined;
    return reviews.find(review => review.reviewerId === userId);
  };

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (data: CreateReviewData) => {
      const response = await apiRequest("POST", "/api/marketplace/reviews", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Review submitted",
        description: "Your review has been successfully submitted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to submit review: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update review mutation
  const updateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, ...data }: UpdateReviewData) => {
      const response = await apiRequest(
        "PATCH",
        `/api/marketplace/reviews/${reviewId}`,
        data
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Review updated",
        description: "Your review has been successfully updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update review: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const response = await apiRequest(
        "DELETE",
        `/api/marketplace/reviews/${reviewId}`
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Review deleted",
        description: "Your review has been successfully deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete review: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    reviews,
    reviewCount: reviews?.length || 0,
    averageRating,
    isLoading,
    error,
    hasUserReviewed,
    getUserReview,
    createReviewMutation,
    updateReviewMutation,
    deleteReviewMutation,
  };
}