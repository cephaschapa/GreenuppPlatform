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
import { Loader2, Plus, X } from "lucide-react";

// Weather preference form schema
const preferencesSchema = insertWeatherPreferencesSchema.extend({
  locations: z.array(z.string()).min(1, "Add at least one location"),
});

export function WeatherPreferences() {
  const [newLocation, setNewLocation] = useState("");
  const { preferences, isLoading, createPreferencesMutation, updatePreferencesMutation } = useWeatherPreferences();

  // Form setup with defaults from existing preferences
  const form = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      locations: preferences?.locations || [],
      alertsEnabled: preferences?.alertsEnabled ?? true,
      temperatureUnit: preferences?.temperatureUnit || "celsius",
    },
  });

  // Update form values when preferences data is loaded
  useEffect(() => {
    if (preferences) {
      form.reset({
        locations: preferences.locations || [],
        alertsEnabled: preferences.alertsEnabled ?? true,
        temperatureUnit: preferences.temperatureUnit || "celsius",
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

  // Handle form submission
  const onSubmit = (values: z.infer<typeof preferencesSchema>) => {
    if (preferences) {
      updatePreferencesMutation.mutate(values);
    } else {
      createPreferencesMutation.mutate(values);
    }
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