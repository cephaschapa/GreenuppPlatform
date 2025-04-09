import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWeatherPreferences } from "@/hooks/use-weather-preferences";
import { format } from "date-fns";
import { PlantingRecommendation } from "@shared/schema";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarIcon, Sparkles, Plus, Info } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function PlantingRecommendations() {
  const { toast } = useToast();
  const { preferences, isLoading: prefsLoading } = useWeatherPreferences();
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [selectedCropType, setSelectedCropType] = useState<string>("");
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  
  // Form state for recommendation generation
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [soilType, setSoilType] = useState<string>("");
  const [fieldSize, setFieldSize] = useState<string>("");
  
  // Common crop types
  const cropTypes = [
    "Wheat", "Corn", "Rice", "Soybeans", "Barley", 
    "Oats", "Potatoes", "Tomatoes", "Lettuce", "Carrots",
    "Onions", "Cabbage", "Apples", "Grapes", "Strawberries"
  ];

  // Set first location as active when preferences load
  useEffect(() => {
    if (preferences?.locations && preferences.locations.length > 0 && !activeLocation) {
      setActiveLocation(preferences.locations[0]);
    }
  }, [preferences, activeLocation]);

  // Get planting recommendations for the active location and selected crop type
  const {
    data: recommendations,
    isLoading,
    error,
    refetch,
  } = useQuery<PlantingRecommendation[]>({
    queryKey: ["/api/planting-recommendations", activeLocation, selectedCropType],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (activeLocation) queryParams.append("location", activeLocation);
      if (selectedCropType) queryParams.append("cropType", selectedCropType);
      
      const res = await apiRequest(
        "GET", 
        `/api/planting-recommendations?${queryParams.toString()}`
      );
      return res.json();
    },
    enabled: !!activeLocation, // Only fetch if location is selected
    staleTime: 60000 * 15, // 15 minutes
  });

  // Generate a new planting recommendation
  const generateRecommendationMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/planting-recommendations", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Planting recommendation generated",
        description: "AI-powered planting recommendation has been created successfully",
      });
      setShowGenerateDialog(false);
      // Invalidate the query to refetch recommendations
      queryClient.invalidateQueries({ 
        queryKey: ["/api/planting-recommendations", activeLocation, selectedCropType] 
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate recommendation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission to generate a new recommendation
  const handleGenerateRecommendation = () => {
    if (!activeLocation || !selectedCropType || !startDate || !endDate) {
      toast({
        title: "Missing information",
        description: "Please provide location, crop type, and date range",
        variant: "destructive",
      });
      return;
    }

    generateRecommendationMutation.mutate({
      location: activeLocation,
      cropType: selectedCropType,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      soilType,
      fieldSize
    });
  };

  // Format date for display
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "Not available";
    return format(new Date(date), "MMM d, yyyy");
  };

  // Format confidence as percentage with color coding
  const formatConfidence = (confidenceLevel: string | null) => {
    if (!confidenceLevel) return <Badge variant="outline">Unknown</Badge>;
    
    const confidence = parseFloat(confidenceLevel);
    
    if (confidence >= 0.8) {
      return <Badge className="bg-green-600">High ({Math.round(confidence * 100)}%)</Badge>;
    } else if (confidence >= 0.5) {
      return <Badge className="bg-yellow-600">Medium ({Math.round(confidence * 100)}%)</Badge>;
    } else {
      return <Badge className="bg-red-600">Low ({Math.round(confidence * 100)}%)</Badge>;
    }
  };

  // Display factors considered in the recommendation
  const displayFactors = (factors: Record<string, any> | null) => {
    if (!factors) return "No factors recorded";
    
    return (
      <div className="text-sm space-y-1">
        {Object.entries(factors).map(([key, value]) => (
          <div key={key}>
            <span className="font-medium">{key}:</span> {value}
          </div>
        ))}
      </div>
    );
  };

  // Reset form state when dialog is closed
  const resetForm = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSoilType("");
    setFieldSize("");
  };

  return (
    <div className="space-y-6">
      {/* Location selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Planting Recommendations</CardTitle>
          <CardDescription>
            AI-powered recommendations based on historical weather data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="location">Select Location</Label>
              <Select
                value={activeLocation || ""}
                onValueChange={setActiveLocation}
                disabled={prefsLoading || !preferences?.locations?.length}
              >
                <SelectTrigger id="location" className="w-full">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {preferences?.locations?.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!preferences?.locations?.length && !prefsLoading && (
                <p className="text-xs text-muted-foreground mt-1">
                  No locations added. Visit the Weather page to add locations.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="cropType">Select Crop Type</Label>
              <Select
                value={selectedCropType}
                onValueChange={setSelectedCropType}
                disabled={!activeLocation}
              >
                <SelectTrigger id="cropType" className="w-full">
                  <SelectValue placeholder="Select a crop type" />
                </SelectTrigger>
                <SelectContent>
                  {cropTypes.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCropType("");
              refetch();
            }}
            disabled={!activeLocation}
          >
            Reset Filters
          </Button>
          <Dialog
            open={showGenerateDialog}
            onOpenChange={(open) => {
              setShowGenerateDialog(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button 
                className="gap-2" 
                disabled={!activeLocation}
                onClick={() => setShowGenerateDialog(true)}
              >
                <Sparkles className="h-4 w-4" />
                Generate New Recommendation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Generate Planting Recommendation</DialogTitle>
                <DialogDescription>
                  Our AI will analyze historical weather data to recommend optimal planting times
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="col-span-1">
                    Location
                  </Label>
                  <div className="col-span-3">
                    <Input 
                      id="location" 
                      value={activeLocation || ""} 
                      disabled 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cropType" className="col-span-1">
                    Crop Type
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={selectedCropType}
                      onValueChange={setSelectedCropType}
                    >
                      <SelectTrigger id="cropType" className="w-full">
                        <SelectValue placeholder="Select a crop type" />
                      </SelectTrigger>
                      <SelectContent>
                        {cropTypes.map((crop) => (
                          <SelectItem key={crop} value={crop}>
                            {crop}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="col-span-1">
                    Start Date
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="col-span-1">
                    End Date
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          disabled={(date) => startDate ? date < startDate : false}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="soilType" className="col-span-1">
                    Soil Type
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="soilType"
                      placeholder="e.g., clay, loam, sandy (optional)"
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fieldSize" className="col-span-1">
                    Field Size
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="fieldSize"
                      placeholder="e.g., 5 hectares (optional)"
                      value={fieldSize}
                      onChange={(e) => setFieldSize(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleGenerateRecommendation}
                  disabled={
                    generateRecommendationMutation.isPending || 
                    !selectedCropType || 
                    !startDate || 
                    !endDate
                  }
                >
                  {generateRecommendationMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Recommendation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      {/* Recommendations display */}
      {!activeLocation ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Select a location to view planting recommendations
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error loading recommendations</AlertTitle>
          <AlertDescription>
            There was a problem loading recommendations. Please try again.
          </AlertDescription>
        </Alert>
      ) : !recommendations || recommendations.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground mb-4">
              No planting recommendations found for {activeLocation}
              {selectedCropType && ` and ${selectedCropType}`}
            </p>
            <Button
              onClick={() => setShowGenerateDialog(true)}
              variant="outline"
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generate Your First Recommendation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Planting Recommendations for {activeLocation}
              {selectedCropType && ` - ${selectedCropType}`}
            </CardTitle>
            <CardDescription>
              AI-generated optimal planting windows based on historical weather data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crop Type</TableHead>
                  <TableHead>Recommended Window</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Factors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recommendations.map((recommendation) => (
                  <TableRow key={recommendation.id}>
                    <TableCell className="font-medium">
                      {recommendation.cropType}
                    </TableCell>
                    <TableCell>
                      {recommendation.recommendedStartDate 
                        ? `${formatDate(recommendation.recommendedStartDate)} to ${formatDate(recommendation.recommendedEndDate)}`
                        : "Not available"
                      }
                    </TableCell>
                    <TableCell>
                      {formatConfidence(recommendation.confidenceLevel?.toString() || null)}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Info className="h-4 w-4" />
                              Details
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm p-4">
                            <div className="space-y-2">
                              <h4 className="font-semibold">Factors Considered</h4>
                              {displayFactors(recommendation.reasonsConsidered)}
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