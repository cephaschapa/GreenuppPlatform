import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FarmerProfile, Field, Crop, CropActivity } from "@shared/schema";
import { Loader2, Cloud, Droplets, Thermometer, Wind, Calendar, AlertCircle, PlusCircle, TractorIcon, Trash2, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { queryClient } from "@/lib/queryClient";
import CropCalendar from "../CropCalendar";
import { CropActivityManager } from "../CropActivityManager";
import { CropDateManager } from "../CropDateManager";

export function FarmerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Fetch farmer profile
  const { data: farmerProfile, isLoading: profileLoading } = useQuery<FarmerProfile>({
    queryKey: ['/api/farmer-profile'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/farmer-profile');
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
    }
  });
  
  // Fetch fields
  const { data: fields, isLoading: fieldsLoading } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/fields');
        if (!response.ok) {
          throw new Error("Failed to fetch fields");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching fields:", error);
        return [];
      }
    },
    enabled: !!farmerProfile
  });
  
  // Fetch crops
  const { data: crops, isLoading: cropsLoading } = useQuery<Crop[]>({
    queryKey: ['/api/crops'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/crops');
        if (!response.ok) {
          throw new Error("Failed to fetch crops");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching crops:", error);
        return [];
      }
    },
    enabled: !!farmerProfile
  });

  // Function to fetch weather data
  const fetchWeatherData = async () => {
    if (!farmerProfile?.farmLocation) return;
    
    setLoadingWeather(true);
    try {
      // Call our weather API endpoint
      const response = await fetch(`/api/weather?location=${encodeURIComponent(farmerProfile.farmLocation)}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }
      
      const data = await response.json();
      setWeatherData(data);
      
      toast({
        title: "Weather data updated",
        description: "Showing forecast for " + farmerProfile.farmLocation
      });
    } catch (error) {
      console.error("Error fetching weather:", error);
      toast({
        title: "Failed to load weather data",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    if (farmerProfile?.farmLocation) {
      fetchWeatherData();
    }
  }, [farmerProfile]);

  // Handle missing profile
  if (!profileLoading && !farmerProfile) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-white font-space">Complete Your Profile</CardTitle>
            <CardDescription className="text-gray-400">Set up your farm details to access all features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex flex-col items-center justify-center border border-dashed border-primary/40 rounded-md p-6">
              <p className="text-gray-300 text-center mb-4">
                You need to complete your farmer profile to unlock all dashboard features
              </p>
              <Link href="/profile-creation">
                <Button variant="default">
                  Complete Farm Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Field management mutations
  const createFieldMutation = useMutation({
    mutationFn: async (fieldData: any) => {
      const response = await fetch('/api/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fieldData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create field");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Field created successfully",
        description: "Your new field has been added"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/fields'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create field",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const deleteFieldMutation = useMutation({
    mutationFn: async (fieldId: number) => {
      const response = await fetch(`/api/fields/${fieldId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete field");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Field deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/fields'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete field",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Crop management mutations
  const createCropMutation = useMutation({
    mutationFn: async (cropData: any) => {
      const response = await fetch('/api/crops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cropData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create crop");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Crop created successfully",
        description: "Your new crop has been added"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crops'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create crop",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const deleteCropMutation = useMutation({
    mutationFn: async (cropId: number) => {
      const response = await fetch(`/api/crops/${cropId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete crop");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Crop deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crops'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete crop",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Dialog state for field and crop creation
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldSize, setNewFieldSize] = useState("");
  const [newFieldLocation, setNewFieldLocation] = useState("");
  const [newFieldSoilType, setNewFieldSoilType] = useState("");
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  
  const [newCropName, setNewCropName] = useState("");
  const [newCropVariety, setNewCropVariety] = useState("");
  const [newCropFieldId, setNewCropFieldId] = useState<number | null>(null);
  const [newCropStatus, setNewCropStatus] = useState("planning");
  const [isAddCropDialogOpen, setIsAddCropDialogOpen] = useState(false);
  
  // State for crop activity management
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [isActivityManagerOpen, setIsActivityManagerOpen] = useState(false);
  const [isDateManagerOpen, setIsDateManagerOpen] = useState(false);
  
  // Fetch crop activities
  const { data: cropActivities, isLoading: activitiesLoading } = useQuery<CropActivity[]>({
    queryKey: ['/api/crop-activities'],
    queryFn: async () => {
      if (!crops || crops.length === 0) return [];
      
      // In a real app, we would fetch all activities at once
      // For now, we'll fetch activities for each crop and combine them
      const allActivities: CropActivity[] = [];
      
      for (const crop of crops) {
        try {
          const response = await fetch(`/api/crops/${crop.id}/activities`);
          if (response.ok) {
            const cropActivities = await response.json();
            allActivities.push(...cropActivities);
          }
        } catch (error) {
          console.error(`Error fetching activities for crop ${crop.id}:`, error);
        }
      }
      
      return allActivities;
    },
    enabled: !!crops && crops.length > 0
  });
  
  // Handle field creation
  const handleAddField = () => {
    if (!newFieldName || !newFieldSize) {
      toast({
        title: "Missing information",
        description: "Field name and size are required",
        variant: "destructive"
      });
      return;
    }
    
    createFieldMutation.mutate({
      name: newFieldName,
      size: newFieldSize,
      location: newFieldLocation,
      soilType: newFieldSoilType,
      userId: user?.id as number
    });
    
    // Reset form
    setNewFieldName("");
    setNewFieldSize("");
    setNewFieldLocation("");
    setNewFieldSoilType("");
    setIsAddFieldDialogOpen(false);
  };
  
  // Handle crop creation
  const handleAddCrop = () => {
    if (!newCropName || !newCropFieldId) {
      toast({
        title: "Missing information",
        description: "Crop name and field are required",
        variant: "destructive"
      });
      return;
    }
    
    createCropMutation.mutate({
      name: newCropName,
      variety: newCropVariety,
      fieldId: newCropFieldId,
      status: newCropStatus,
      userId: user?.id as number
    });
    
    // Reset form
    setNewCropName("");
    setNewCropVariety("");
    setNewCropFieldId(null);
    setNewCropStatus("planning");
    setIsAddCropDialogOpen(false);
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Top cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium text-white font-space flex justify-between items-center">
              <span>Field & Crop Management</span>
              <Badge variant="outline" className="ml-2 bg-primary/20">
                {crops?.length || 0} Crops
              </Badge>
            </CardTitle>
            <CardDescription className="text-gray-400">Manage your fields and crops</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 overflow-auto border border-dashed border-primary/40 rounded-md p-2">
              {fieldsLoading || cropsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : fields && fields.length > 0 ? (
                <div className="space-y-2">
                  {fields.map(field => (
                    <div key={field.id} className="flex justify-between items-center p-2 bg-secondary/50 rounded-md">
                      <div>
                        <div className="font-medium text-primary">{field.name}</div>
                        <div className="text-xs text-gray-400">{field.size} hectares</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-green-900/20 hover:bg-green-900/30">
                          {crops?.filter(crop => crop.fieldId === field.id).length || 0} crops
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-gray-500 text-sm text-center">No fields added yet</p>
                  <p className="text-gray-500 text-xs mt-1 text-center">Add fields to start managing your crops</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Dialog open={isAddFieldDialogOpen} onOpenChange={setIsAddFieldDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 border-primary text-primary hover:bg-primary hover:text-secondary">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-secondary border-primary/20 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Field</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Enter the details of your new field
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">Field Name*</label>
                    <input
                      type="text"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary border border-primary/20 rounded-md text-white"
                      placeholder="South Plot"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">Size (hectares)*</label>
                    <input
                      type="text"
                      value={newFieldSize}
                      onChange={(e) => setNewFieldSize(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary border border-primary/20 rounded-md text-white"
                      placeholder="5.2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">Location</label>
                    <input
                      type="text"
                      value={newFieldLocation}
                      onChange={(e) => setNewFieldLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary border border-primary/20 rounded-md text-white"
                      placeholder="Field location or coordinates"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">Soil Type</label>
                    <input
                      type="text"
                      value={newFieldSoilType}
                      onChange={(e) => setNewFieldSoilType(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary border border-primary/20 rounded-md text-white"
                      placeholder="Clay, Loam, etc."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddFieldDialogOpen(false)} 
                    className="border-gray-500 text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddField}
                    disabled={createFieldMutation.isPending}
                  >
                    {createFieldMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Field"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isAddCropDialogOpen} onOpenChange={setIsAddCropDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="default" 
                  className="flex-1" 
                  disabled={!fields || fields.length === 0}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Crop
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-secondary border-primary/20 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Crop</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Enter the details of your new crop
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">Crop Name*</label>
                    <input
                      type="text"
                      value={newCropName}
                      onChange={(e) => setNewCropName(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary border border-primary/20 rounded-md text-white"
                      placeholder="Maize"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">Variety</label>
                    <input
                      type="text"
                      value={newCropVariety}
                      onChange={(e) => setNewCropVariety(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary border border-primary/20 rounded-md text-white"
                      placeholder="SC701"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">Field*</label>
                    <select
                      value={newCropFieldId || ""}
                      onChange={(e) => setNewCropFieldId(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-secondary border border-primary/20 rounded-md text-white"
                    >
                      <option value="">Select a field</option>
                      {fields?.map(field => (
                        <option key={field.id} value={field.id}>{field.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">Status</label>
                    <select
                      value={newCropStatus}
                      onChange={(e) => setNewCropStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-secondary border border-primary/20 rounded-md text-white"
                    >
                      <option value="planning">Planning</option>
                      <option value="planted">Planted</option>
                      <option value="growing">Growing</option>
                      <option value="harvesting">Harvesting</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddCropDialogOpen(false)} 
                    className="border-gray-500 text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddCrop}
                    disabled={createCropMutation.isPending}
                  >
                    {createCropMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Crop"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>

        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium text-white font-space">Weather Forecast</CardTitle>
            <CardDescription className="text-gray-400">
              {farmerProfile?.farmLocation || "Set your farm location"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex flex-col items-center justify-center border border-dashed border-primary/40 rounded-md">
              {loadingWeather ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : weatherData ? (
                <div className="flex flex-col items-center w-full">
                  <div className="flex items-center justify-between w-full px-4">
                    <div className="flex items-center">
                      <Thermometer className="h-5 w-5 text-orange-400 mr-2" />
                      <span>{weatherData.current.temp}°C</span>
                    </div>
                    <div className="flex items-center">
                      <Droplets className="h-5 w-5 text-blue-400 mr-2" />
                      <span>{weatherData.current.humidity}%</span>
                    </div>
                    <div className="flex items-center">
                      <Wind className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{weatherData.current.wind_speed} km/h</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-center">
                    {weatherData.current.weather[0].description}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Cloud className="h-8 w-8 text-gray-500 mb-2" />
                  <p className="text-gray-500 text-sm">Update location for weather</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full border-primary text-primary hover:bg-primary hover:text-secondary"
              onClick={fetchWeatherData}
              disabled={loadingWeather || !farmerProfile?.farmLocation}
            >
              {loadingWeather ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Refresh Weather"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium text-white font-space">Farm Analytics</CardTitle>
            <CardDescription className="text-gray-400">Key farm metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex flex-col items-center justify-center border border-dashed border-primary/40 rounded-md p-4">
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400">Farm Size</span>
                  <span className="text-lg font-medium text-primary">{farmerProfile?.farmSize || "N/A"}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400">Farm Type</span>
                  <span className="text-lg font-medium text-primary">
                    {farmerProfile?.farmType ? 
                      farmerProfile.farmType.charAt(0).toUpperCase() + farmerProfile.farmType.slice(1) : 
                      "N/A"}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400">Established</span>
                  <span className="text-lg font-medium text-primary">{farmerProfile?.establishedYear || "N/A"}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400">Crops</span>
                  <span className="text-lg font-medium text-primary">{farmerProfile?.mainCrops?.length || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-secondary">
              View Detailed Analytics
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Detailed Crop Management View */}
      <Card className="bg-secondary/30 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-white font-space">Detailed Crop Management</CardTitle>
          <CardDescription className="text-gray-400">View and manage all your crops</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all-crops" className="mb-4">
            <TabsList className="bg-secondary/50 border border-primary/20">
              <TabsTrigger value="all-crops" className="data-[state=active]:bg-primary data-[state=active]:text-secondary">
                All Crops
              </TabsTrigger>
              <TabsTrigger value="by-field" className="data-[state=active]:bg-primary data-[state=active]:text-secondary">
                By Field
              </TabsTrigger>
              <TabsTrigger value="by-status" className="data-[state=active]:bg-primary data-[state=active]:text-secondary">
                By Status
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all-crops" className="mt-4">
              {cropsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : crops && crops.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {crops.map(crop => {
                    const field = fields?.find(f => f.id === crop.fieldId);
                    return (
                      <div 
                        key={crop.id} 
                        className="p-4 bg-secondary/50 border border-primary/20 rounded-md hover:border-primary/40 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-white font-medium text-lg">{crop.name}</h3>
                            {crop.variety && (
                              <p className="text-gray-400 text-sm">Variety: {crop.variety}</p>
                            )}
                          </div>
                          <Badge 
                            className={`
                              ${crop.status === 'growing' ? 'bg-blue-900/40 text-blue-300' : ''}
                              ${crop.status === 'planted' ? 'bg-green-900/40 text-green-300' : ''}
                              ${crop.status === 'harvesting' ? 'bg-yellow-900/40 text-yellow-300' : ''}
                              ${crop.status === 'completed' ? 'bg-purple-900/40 text-purple-300' : ''}
                              ${crop.status === 'planning' ? 'bg-gray-900/40 text-gray-300' : ''}
                              ${crop.status === 'failed' ? 'bg-red-900/40 text-red-300' : ''}
                            `}
                          >
                            {crop.status.charAt(0).toUpperCase() + crop.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center text-gray-400 text-sm mb-3">
                          <TractorIcon className="h-4 w-4 mr-1 text-primary/70" />
                          <span>Field: {field?.name || 'Unknown'}</span>
                        </div>
                        
                        {crop.plantingDate && (
                          <div className="flex items-center text-gray-400 text-sm mb-3">
                            <Calendar className="h-4 w-4 mr-1 text-primary/70" />
                            <span>Planted: {new Date(crop.plantingDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-end mt-2 space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-primary/50 text-primary hover:bg-primary/20"
                            onClick={() => {
                              setSelectedCrop(crop);
                              setIsActivityManagerOpen(true);
                            }}
                          >
                            <CalendarDays className="h-4 w-4 mr-1" />
                            Activities
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-red-700/50 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this crop?")) {
                                deleteCropMutation.mutate(crop.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 border border-dashed border-primary/40 rounded-md p-6">
                  <AlertCircle className="h-12 w-12 text-primary/50 mb-4" />
                  <p className="text-gray-300 text-center">No crops have been added yet</p>
                  <p className="text-gray-500 text-sm mt-2 text-center">
                    Start by adding fields, then you can add crops to those fields
                  </p>
                  <Button 
                    variant="default" 
                    className="mt-4" 
                    onClick={() => setIsAddCropDialogOpen(true)}
                    disabled={!fields || fields.length === 0}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Your First Crop
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="by-field" className="mt-4">
              {fieldsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : fields && fields.length > 0 ? (
                <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                  {fields.map(field => {
                    const fieldCrops = crops?.filter(c => c.fieldId === field.id) || [];
                    return (
                      <div key={field.id} className="border border-primary/20 rounded-md overflow-hidden">
                        <div className="bg-primary/20 p-3 flex justify-between items-center">
                          <div>
                            <h3 className="text-white font-medium">{field.name}</h3>
                            <p className="text-gray-400 text-xs">{field.size} hectares</p>
                          </div>
                          <Badge variant="outline" className="bg-green-900/20 hover:bg-green-900/30">
                            {fieldCrops.length} crops
                          </Badge>
                        </div>
                        
                        {fieldCrops.length > 0 ? (
                          <div className="px-3 py-2 divide-y divide-primary/10">
                            {fieldCrops.map(crop => (
                              <div key={crop.id} className="py-2 flex justify-between items-center">
                                <div>
                                  <p className="text-white">{crop.name}</p>
                                  {crop.variety && <p className="text-gray-400 text-xs">Variety: {crop.variety}</p>}
                                </div>
                                <Badge 
                                  className={`
                                    ${crop.status === 'growing' ? 'bg-blue-900/40 text-blue-300' : ''}
                                    ${crop.status === 'planted' ? 'bg-green-900/40 text-green-300' : ''}
                                    ${crop.status === 'harvesting' ? 'bg-yellow-900/40 text-yellow-300' : ''}
                                    ${crop.status === 'completed' ? 'bg-purple-900/40 text-purple-300' : ''}
                                    ${crop.status === 'planning' ? 'bg-gray-900/40 text-gray-300' : ''}
                                    ${crop.status === 'failed' ? 'bg-red-900/40 text-red-300' : ''}
                                  `}
                                >
                                  {crop.status.charAt(0).toUpperCase() + crop.status.slice(1)}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-400">
                            <p>No crops in this field</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => {
                                setNewCropFieldId(field.id);
                                setIsAddCropDialogOpen(true);
                              }}
                            >
                              <PlusCircle className="h-4 w-4 mr-1" />
                              Add Crop
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 border border-dashed border-primary/40 rounded-md p-6">
                  <AlertCircle className="h-12 w-12 text-primary/50 mb-4" />
                  <p className="text-gray-300 text-center">No fields have been added yet</p>
                  <Button 
                    variant="default" 
                    className="mt-4" 
                    onClick={() => setIsAddFieldDialogOpen(true)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Your First Field
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="by-status" className="mt-4">
              {cropsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : crops && crops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                  <div className="border border-primary/20 rounded-md overflow-hidden">
                    <div className="bg-green-900/30 p-2 text-center">
                      <h3 className="text-white font-medium">Growing & Planted</h3>
                    </div>
                    <div className="p-2 space-y-2">
                      {crops.filter(c => c.status === 'growing' || c.status === 'planted').length > 0 ? (
                        crops
                          .filter(c => c.status === 'growing' || c.status === 'planted')
                          .map(crop => {
                            const field = fields?.find(f => f.id === crop.fieldId);
                            return (
                              <div key={crop.id} className="p-2 bg-secondary/50 rounded-md">
                                <div className="flex justify-between">
                                  <span className="text-white">{crop.name}</span>
                                  <Badge 
                                    className={crop.status === 'growing' ? 
                                      'bg-blue-900/40 text-blue-300' : 
                                      'bg-green-900/40 text-green-300'
                                    }
                                  >
                                    {crop.status.charAt(0).toUpperCase() + crop.status.slice(1)}
                                  </Badge>
                                </div>
                                <div className="text-gray-400 text-xs">Field: {field?.name || 'Unknown'}</div>
                              </div>
                            );
                          })
                      ) : (
                        <div className="py-8 text-center text-gray-400">
                          <p>No active growing crops</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border border-primary/20 rounded-md overflow-hidden">
                    <div className="bg-yellow-900/30 p-2 text-center">
                      <h3 className="text-white font-medium">Harvesting & Completed</h3>
                    </div>
                    <div className="p-2 space-y-2">
                      {crops.filter(c => c.status === 'harvesting' || c.status === 'completed').length > 0 ? (
                        crops
                          .filter(c => c.status === 'harvesting' || c.status === 'completed')
                          .map(crop => {
                            const field = fields?.find(f => f.id === crop.fieldId);
                            return (
                              <div key={crop.id} className="p-2 bg-secondary/50 rounded-md">
                                <div className="flex justify-between">
                                  <span className="text-white">{crop.name}</span>
                                  <Badge 
                                    className={crop.status === 'harvesting' ? 
                                      'bg-yellow-900/40 text-yellow-300' : 
                                      'bg-purple-900/40 text-purple-300'
                                    }
                                  >
                                    {crop.status.charAt(0).toUpperCase() + crop.status.slice(1)}
                                  </Badge>
                                </div>
                                <div className="text-gray-400 text-xs">Field: {field?.name || 'Unknown'}</div>
                              </div>
                            );
                          })
                      ) : (
                        <div className="py-8 text-center text-gray-400">
                          <p>No harvesting or completed crops</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border border-primary/20 rounded-md overflow-hidden">
                    <div className="bg-gray-900/30 p-2 text-center">
                      <h3 className="text-white font-medium">Planning</h3>
                    </div>
                    <div className="p-2 space-y-2">
                      {crops.filter(c => c.status === 'planning').length > 0 ? (
                        crops
                          .filter(c => c.status === 'planning')
                          .map(crop => {
                            const field = fields?.find(f => f.id === crop.fieldId);
                            return (
                              <div key={crop.id} className="p-2 bg-secondary/50 rounded-md">
                                <div className="flex justify-between">
                                  <span className="text-white">{crop.name}</span>
                                  <Badge className="bg-gray-900/40 text-gray-300">
                                    Planning
                                  </Badge>
                                </div>
                                <div className="text-gray-400 text-xs">Field: {field?.name || 'Unknown'}</div>
                              </div>
                            );
                          })
                      ) : (
                        <div className="py-8 text-center text-gray-400">
                          <p>No crops in planning stage</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border border-primary/20 rounded-md overflow-hidden">
                    <div className="bg-red-900/30 p-2 text-center">
                      <h3 className="text-white font-medium">Failed</h3>
                    </div>
                    <div className="p-2 space-y-2">
                      {crops.filter(c => c.status === 'failed').length > 0 ? (
                        crops
                          .filter(c => c.status === 'failed')
                          .map(crop => {
                            const field = fields?.find(f => f.id === crop.fieldId);
                            return (
                              <div key={crop.id} className="p-2 bg-secondary/50 rounded-md">
                                <div className="flex justify-between">
                                  <span className="text-white">{crop.name}</span>
                                  <Badge className="bg-red-900/40 text-red-300">
                                    Failed
                                  </Badge>
                                </div>
                                <div className="text-gray-400 text-xs">Field: {field?.name || 'Unknown'}</div>
                              </div>
                            );
                          })
                      ) : (
                        <div className="py-8 text-center text-gray-400">
                          <p>No failed crops</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 border border-dashed border-primary/40 rounded-md p-6">
                  <AlertCircle className="h-12 w-12 text-primary/50 mb-4" />
                  <p className="text-gray-300 text-center">No crops have been added yet</p>
                  <p className="text-gray-500 text-sm mt-2 text-center">
                    Add fields and crops to track their status
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Middle row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-white font-space">Crop Calendar</CardTitle>
            <CardDescription className="text-gray-400">Planting and activity schedule</CardDescription>
          </CardHeader>
          <CardContent>
            {cropsLoading || activitiesLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : crops && crops.length > 0 ? (
              <div className="crop-calendar-container">
                <CropCalendar 
                  crops={crops || []} 
                  activities={cropActivities || []} 
                  onEventClick={(info) => {
                    if (info.event.extendedProps.type === 'activity') {
                      // Handle click on activity
                      const cropId = info.event.extendedProps.activity.cropId;
                      const relatedCrop = crops.find(c => c.id === cropId);
                      if (relatedCrop) {
                        setSelectedCrop(relatedCrop);
                        setIsActivityManagerOpen(true);
                      }
                    } else if (
                      info.event.extendedProps.type === 'planting' || 
                      info.event.extendedProps.type === 'harvest'
                    ) {
                      // Handle click on planting or harvest date
                      const crop = info.event.extendedProps.crop;
                      setSelectedCrop(crop);
                      setIsDateManagerOpen(true);
                    }
                  }}
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-green-900/20">
                    🌱 Planting
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-900/20">
                    🌾 Harvesting
                  </Badge>
                  <Badge variant="outline" className="bg-blue-900/20">
                    💧 Irrigation
                  </Badge>
                  <Badge variant="outline" className="bg-red-900/20">
                    🐞 Pest Control
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-primary/40 rounded-md p-6">
                <div className="text-center mb-4">
                  <p className="text-gray-300">Add crops to view your planting calendar</p>
                  <p className="text-gray-500 text-sm mt-2">Your crop planting dates and activities will appear here</p>
                </div>
                <Button 
                  variant="default" 
                  onClick={() => setIsAddCropDialogOpen(true)}
                  disabled={!fields || fields.length === 0}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Your First Crop
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-white font-space">Marketplace</CardTitle>
            <CardDescription className="text-gray-400">Buy supplies and sell produce</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col border border-dashed border-primary/40 rounded-md p-4">
                <h3 className="text-green-500 font-medium mb-2">Sell Produce</h3>
                <p className="text-gray-400 text-sm mb-4">List your harvest for buyers</p>
                <Button variant="outline" size="sm" className="mt-auto">
                  Create Listing
                </Button>
              </div>
              <div className="flex flex-col border border-dashed border-primary/40 rounded-md p-4">
                <h3 className="text-blue-500 font-medium mb-2">Buy Supplies</h3>
                <p className="text-gray-400 text-sm mb-4">Purchase seeds, tools and more</p>
                <Button variant="outline" size="sm" className="mt-auto">
                  Browse Supplies
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights card */}
      <Card className="bg-secondary/30 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-white font-space">AI-Powered Insights</CardTitle>
          <CardDescription className="text-gray-400">Smart recommendations based on your farm data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex flex-col items-center justify-center border border-dashed border-primary/40 rounded-md p-6 bg-gradient-to-br from-green-950/50 to-black/50">
            {farmerProfile ? (
              <div className="text-center">
                <h3 className="text-primary font-medium mb-3">Recommendations for {farmerProfile.farmName}</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    Optimal planting time for {farmerProfile.mainCrops?.[0] || "your crops"} approaching
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    Consider soil testing based on your farm type
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    Weather trends suggest adjusting irrigation schedules
                  </li>
                </ul>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-300 mb-4">Complete your farm profile to unlock AI insights</p>
                <Link href="/profile-creation">
                  <Button variant="default">
                    Complete Farm Setup
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Management Dialogs */}
      <Dialog open={isActivityManagerOpen} onOpenChange={setIsActivityManagerOpen}>
        <DialogContent className="bg-secondary border-primary/20 text-white max-w-4xl">
          <CropActivityManager 
            crop={selectedCrop} 
            onClose={() => setIsActivityManagerOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDateManagerOpen} onOpenChange={setIsDateManagerOpen}>
        <DialogContent className="bg-secondary border-primary/20 text-white max-w-3xl">
          {selectedCrop && (
            <CropDateManager 
              crop={selectedCrop} 
              onClose={() => setIsDateManagerOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}