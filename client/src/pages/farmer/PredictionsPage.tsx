import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CropPredictions } from "@/components/farmer/CropPredictions";
import { Loader2 } from "lucide-react";
import { Crop } from "@shared/schema";

export default function PredictionsPage() {
  // Fetch all crops for predictions
  const { data: crops, isLoading: cropsLoading } = useQuery<Crop[]>({
    queryKey: ['/api/crops'],
    queryFn: async () => {
      const response = await fetch('/api/crops');
      if (!response.ok) {
        throw new Error("Failed to fetch crops");
      }
      return await response.json();
    }
  });
  
  return (
    <DashboardLayout
      title="Crop Yield Predictions"
      description="AI-powered predictions to help you plan your harvest"
    >
      {cropsLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : !crops || crops.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No crops available for predictions.</p>
          <p className="text-sm">Add crops in the Fields & Crops section first.</p>
        </div>
      ) : (
        <CropPredictions crops={crops} />
      )}
    </DashboardLayout>
  );
}