import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CropYieldPrediction } from "@shared/schema";

export function useCropPredictions() {
  const { toast } = useToast();

  // Fetch predictions for a specific crop
  const fetchPredictionsForCrop = (cropId: number | undefined) => {
    return useQuery<CropYieldPrediction[]>({
      queryKey: ["/api/crops", cropId, "predictions"],
      enabled: !!cropId, // Only run the query if cropId is defined
      queryFn: async () => {
        if (!cropId) return [];
        const res = await apiRequest("GET", `/api/crops/${cropId}/predictions`);
        return res.json();
      },
    });
  };

  // Create a prediction manually
  const createPredictionMutation = useMutation({
    mutationFn: async ({ cropId, data }: { cropId: number; data: any }) => {
      const res = await apiRequest("POST", `/api/crops/${cropId}/predictions`, data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Prediction created",
        description: "Your crop yield prediction has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/crops", variables.cropId, "predictions"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create prediction",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate a prediction using AI
  const generateAIPredictionMutation = useMutation({
    mutationFn: async ({ cropId, additionalData }: { cropId: number; additionalData?: any }) => {
      const res = await apiRequest("POST", `/api/crops/${cropId}/predictions/generate`, additionalData || {});
      return res.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "AI Prediction generated",
        description: "An AI-powered yield prediction has been generated for your crop",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/crops", variables.cropId, "predictions"] });
      return data;
    },
    onError: (error) => {
      toast({
        title: "Failed to generate AI prediction",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    fetchPredictionsForCrop,
    createPredictionMutation,
    generateAIPredictionMutation,
  };
}