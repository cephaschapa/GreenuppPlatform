import { useState } from "react";
import { useCropPredictions } from "@/hooks/use-crop-predictions";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Helper to format a date or return placeholder
const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return "N/A";
  return format(new Date(date), "PPP");
};

export function CropPredictions({ crops }: { crops: any[] }) {
  const [selectedCropId, setSelectedCropId] = useState<number | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  
  // Fetch predictions for the selected crop
  const { data: predictions, isLoading, error } = 
    useCropPredictions().fetchPredictionsForCrop(
      selectedCropId ? selectedCropId : 0
    );
  
  // Mutations for generating predictions
  const { generateAIPredictionMutation } = useCropPredictions();
  
  // Handler for generating a new AI prediction
  const handleGeneratePrediction = () => {
    if (!selectedCropId) return;
    
    generateAIPredictionMutation.mutate(
      { cropId: selectedCropId },
      {
        onSuccess: () => {
          setShowGenerateDialog(false);
        }
      }
    );
  };
  
  // Get the selected crop data
  const selectedCrop = crops.find(crop => crop.id === selectedCropId);
  
  // Format prediction confidence as a percentage with color coding
  const formatConfidence = (confidenceLevel: string | null) => {
    if (!confidenceLevel) return <Badge>Unknown</Badge>;
    
    // Parse from string like "75%" to number 0.75
    const confidenceValue = parseFloat(confidenceLevel.replace('%', '')) / 100;
    const percent = (confidenceValue * 100).toFixed(1);
    let color = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    
    if (confidenceValue < 0.5) {
      color = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    } else if (confidenceValue < 0.8) {
      color = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
    
    return (
      <Badge className={color}>
        {confidenceLevel}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Crop Yield Predictions</h2>
          <p className="text-muted-foreground">
            AI-powered predictions to help you plan your harvest
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select 
            value={selectedCropId?.toString()} 
            onValueChange={(value) => setSelectedCropId(Number(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a crop" />
            </SelectTrigger>
            <SelectContent>
              {crops.map((crop) => (
                <SelectItem key={crop.id} value={crop.id.toString()}>
                  {crop.name} ({crop.variety})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="default" 
                className="gap-2"
                disabled={!selectedCropId}
              >
                <Sparkles className="h-4 w-4" />
                Generate Prediction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Generate AI Prediction</DialogTitle>
                <DialogDescription>
                  Our AI will analyze your crop data and generate a yield prediction based on historical data, current conditions, and agricultural best practices.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <h4 className="font-medium mb-2">Crop Information:</h4>
                {selectedCrop && (
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedCrop.name}</p>
                    <p><span className="font-medium">Variety:</span> {selectedCrop.variety}</p>
                    <p><span className="font-medium">Planting Date:</span> {formatDate(selectedCrop.plantingDate)}</p>
                    <p><span className="font-medium">Field Size:</span> {selectedCrop.fieldSize} {selectedCrop.sizeUnit}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={handleGeneratePrediction}
                  disabled={generateAIPredictionMutation.isPending}
                >
                  {generateAIPredictionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Prediction"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {!selectedCropId ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Select a crop to view or generate predictions</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error loading predictions</AlertTitle>
          <AlertDescription>
            There was a problem loading predictions. Please try again.
          </AlertDescription>
        </Alert>
      ) : !predictions || predictions.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">No predictions found for this crop</p>
            <Button 
              onClick={() => setShowGenerateDialog(true)}
              variant="outline"
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generate Your First Prediction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Yield Predictions for {selectedCrop?.name} ({selectedCrop?.variety})</CardTitle>
            <CardDescription>
              View AI-generated yield predictions and their confidence levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Predicted Yield</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Factors Considered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictions.map((prediction) => (
                  <TableRow key={prediction.id}>
                    <TableCell>{formatDate(prediction.createdAt)}</TableCell>
                    <TableCell className="font-medium">
                      {prediction.predictedYield} {prediction.yieldUnit}
                    </TableCell>
                    <TableCell>
                      {formatConfidence(prediction.confidenceLevel)}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm">
                              View Factors
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <div className="space-y-2 p-2">
                              {prediction.factorsConsidered && typeof prediction.factorsConsidered === 'string'
                                ? prediction.factorsConsidered.split(',').map((factor: string, i: number) => (
                                    <p key={i} className="text-sm">• {factor.trim()}</p>
                                  ))
                                : prediction.factorsConsidered && typeof prediction.factorsConsidered === 'object'
                                  ? Object.entries(prediction.factorsConsidered).map(([key, value], i) => (
                                      <p key={i} className="text-sm">• {key}: {value}</p>
                                    ))
                                  : <p className="text-sm">No factors recorded</p>
                              }
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}