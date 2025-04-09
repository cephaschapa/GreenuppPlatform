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

// Weather preference form schema with validation
const preferencesSchema = insertWeatherPreferencesSchema.extend({
  location: z.string().min(1, "Location is required"),
});

export function WeatherPreferences() {
  const { preferences, isLoading, error, createWeatherPreference, updateWeatherPreference, isCreating, isUpdating } = useWeatherPreferences();

  // Form setup with defaults from existing preferences
  const form = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      location: preferences?.location || "",
    },
  });

  // Update form values when preferences data is loaded
  useEffect(() => {
    if (preferences) {
      form.reset({
        location: preferences.location || "",
      });
    }
  }, [preferences, form]);

  // Handle form submission
  const onSubmit = (values: z.infer<typeof preferencesSchema>) => {
    // Log form values to help debugging
    console.log('Form values being submitted:', values);
    
    if (preferences) {
      updateWeatherPreference({
        id: preferences.id,
        location: values.location
      });
    } else {
      createWeatherPreference({
        location: values.location
      });
    }
    
    console.log('Form submitted');
  };

  // Check if mutation is in progress
  const isMutating = isCreating || isUpdating;

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
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormDescription>
                      Enter the location you want to track weather for
                    </FormDescription>
                    <FormControl>
                      <Input 
                        placeholder="Enter a location (city, region)"
                        {...field}
                      />
                    </FormControl>
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