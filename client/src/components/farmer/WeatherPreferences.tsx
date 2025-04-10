import { useState, useEffect } from "react";
import { useWeatherPreferences } from "@/hooks/use-weather-preferences";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWeatherPreferencesSchema } from "@shared/schema";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, X, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Weather preference form schema with validation
const preferencesSchema = insertWeatherPreferencesSchema.extend({
  // Make sure we properly handle array typing to match our schema
  locations: z.array(z.string()).min(1, "Add at least one location"),
  alertsEnabled: z.boolean().default(true),
  temperatureUnit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
});

export function WeatherPreferences() {
  const [newLocation, setNewLocation] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const { preferences, isLoading, createPreferencesMutation, updatePreferencesMutation } = useWeatherPreferences();
  const { toast } = useToast();

  // Form setup with defaults from existing preferences
  const form = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      locations: preferences?.locations || [],
      alertsEnabled: preferences?.alertsEnabled ?? true,
      temperatureUnit: (preferences?.temperatureUnit as "celsius" | "fahrenheit") || "celsius",
    },
  });

  // Update form values when preferences data is loaded
  useEffect(() => {
    if (preferences) {
      form.reset({
        locations: preferences.locations || [],
        alertsEnabled: preferences.alertsEnabled ?? true,
        temperatureUnit: (preferences.temperatureUnit as "celsius" | "fahrenheit") || "celsius",
      });
    }
  }, [preferences, form]);

  // Handle adding a new location
  const handleAddLocation = () => {
    if (!newLocation.trim()) return;
    
    const currentLocations = form.getValues("locations") || [];
    form.setValue("locations", [...currentLocations, newLocation.trim()]);
    setNewLocation("");
  };

  // Handle removing a location
  const handleRemoveLocation = (index: number) => {
    const currentLocations = form.getValues("locations") || [];
    form.setValue(
      "locations",
      currentLocations.filter((_, i) => i !== index)
    );
  };
  
  // Auto-detect user's location
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location detection failed",
        description: "Geolocation is not supported by your browser",
        variant: "destructive"
      });
      return;
    }
    
    setIsDetectingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Use reverse geocoding to get city name from coordinates
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${process.env.OPENWEATHER_API_KEY || process.env.VITE_OPENWEATHER_API_KEY}`,
            { method: "GET" }
          );
          
          if (!response.ok) {
            throw new Error("Failed to fetch location data");
          }
          
          const data = await response.json();
          
          if (data && data.length > 0) {
            const locationName = data[0].name;
            const currentLocations = form.getValues("locations") || [];
            
            // Only add if not already in the list
            if (!currentLocations.includes(locationName)) {
              form.setValue("locations", [...currentLocations, locationName]);
              toast({
                title: "Location detected",
                description: `${locationName} has been added to your locations`,
              });
            } else {
              toast({
                title: "Location already exists",
                description: `${locationName} is already in your locations`,
              });
            }
          } else {
            throw new Error("Location not found");
          }
        } catch (error) {
          console.error("Error detecting location:", error);
          toast({
            title: "Location detection failed",
            description: "Unable to determine your current location. Please add it manually.",
            variant: "destructive"
          });
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsDetectingLocation(false);
        toast({
          title: "Location detection failed",
          description: "Please allow location access or enter your location manually",
          variant: "destructive"
        });
      }
    );
  };

  // Handle form submission
  const onSubmit = (values: z.infer<typeof preferencesSchema>) => {
    // Log form values to help debugging
    console.log('Form values being submitted:', values);
    
    // Map the form values to match the schema expected by the server
    const serverData = {
      locations: values.locations,
      alertsEnabled: values.alertsEnabled,
      temperatureUnit: values.temperatureUnit
    };
    
    console.log('Mapped server data:', serverData);
    console.log('Using mutation:', preferences ? 'update' : 'create');
    
    if (preferences) {
      updatePreferencesMutation.mutate(serverData);
    } else {
      createPreferencesMutation.mutate(serverData);
    }
    
    // Add a click event to the submit button for debugging
    console.log('Form submitted');
  };

  // Check if mutation is in progress
  const isMutating = createPreferencesMutation.isPending || updatePreferencesMutation.isPending;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Weather Preferences</CardTitle>
        <CardDescription>
          Configure your weather settings and locations of interest
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="temperatureUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select temperature unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="celsius">Celsius (°C)</SelectItem>
                        <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose your preferred temperature measurement unit
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alertsEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Weather Alerts</FormLabel>
                      <FormDescription>
                        Receive notifications about significant weather changes
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="locations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Locations</FormLabel>
                    <FormDescription>
                      Add locations you want to track weather for
                    </FormDescription>
                    
                    <div className="flex flex-col space-y-2">
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Add a location (city, region)"
                            value={newLocation}
                            onChange={(e) => setNewLocation(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            onClick={handleAddLocation}
                            size="icon"
                            variant="outline"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Auto-detect location button */}
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={detectCurrentLocation}
                          disabled={isDetectingLocation}
                        >
                          {isDetectingLocation ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <MapPin className="mr-2 h-4 w-4" />
                          )}
                          {isDetectingLocation ? "Detecting Location..." : "Auto-Detect My Location"}
                        </Button>
                      </div>
                      
                      <div className="flex flex-col space-y-2 mt-2">
                        {field.value?.length ? (
                          field.value.map((location, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-muted rounded-md"
                            >
                              <span className="text-sm">{location}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveLocation(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground p-2">
                            No locations added yet
                          </p>
                        )}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isMutating} className="w-full">
                {isMutating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {preferences ? "Update Preferences" : "Save Preferences"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}