import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Ruler, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

const farmProfileSchema = z.object({
  farmName: z.string().min(2, "Farm name must be at least 2 characters"),
  farmSize: z.string().min(1, "Please specify your farm size"),
  farmLocation: z.string().min(5, "Please provide a detailed location"),
  farmingExperience: z.string().min(1, "Please select your experience level"),
  primaryCrops: z.string().min(2, "Please specify your main crops"),
  contactPhone: z.string().optional(),
  farmingGoals: z.string().optional(),
});

type FarmProfileFormData = z.infer<typeof farmProfileSchema>;

interface FarmProfileStepProps {
  onSubmit: (data: FarmProfileFormData) => void;
  initialData?: Partial<FarmProfileFormData>;
  isLoading?: boolean;
}

const experienceLevels = [
  { value: "beginner", label: "Beginner (0-2 years)" },
  { value: "intermediate", label: "Intermediate (3-5 years)" },
  { value: "experienced", label: "Experienced (6-10 years)" },
  { value: "expert", label: "Expert (10+ years)" },
];

const zambianProvinces = [
  "Central Province",
  "Copperbelt Province",
  "Eastern Province",
  "Luapula Province",
  "Lusaka Province",
  "Muchinga Province",
  "Northern Province",
  "North-Western Province",
  "Southern Province",
  "Western Province",
];

export function FarmProfileStep({
  onSubmit,
  initialData,
  isLoading,
}: FarmProfileStepProps) {
  const form = useForm<FarmProfileFormData>({
    resolver: zodResolver(farmProfileSchema),
    defaultValues: {
      farmName: initialData?.farmName || "",
      farmSize: initialData?.farmSize || "",
      farmLocation: initialData?.farmLocation || "",
      farmingExperience: initialData?.farmingExperience || "",
      primaryCrops: initialData?.primaryCrops || "",
      contactPhone: initialData?.contactPhone || "",
      farmingGoals: initialData?.farmingGoals || "",
    },
  });

  const handleSubmit = (data: FarmProfileFormData) => {
    onSubmit(data);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
          <Leaf className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold">Tell us about your farm</h3>
        <p className="text-muted-foreground">
          This helps us provide personalized recommendations and insights
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Farm Name */}
          <FormField
            control={form.control}
            name="farmName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Leaf className="h-4 w-4" />
                  Farm Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Green Valley Farm" {...field} />
                </FormControl>
                <FormDescription>What do you call your farm?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Farm Size */}
          <FormField
            control={form.control}
            name="farmSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Farm Size
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 2.5 hectares or 5 acres"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  How large is your farming area?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location */}
          <FormField
            control={form.control}
            name="farmLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Farm Location
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Chongwe District, Lusaka Province"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Include district and province for better weather data
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Farming Experience */}
          <FormField
            control={form.control}
            name="farmingExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Farming Experience</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  This helps us tailor our recommendations
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Primary Crops */}
          <FormField
            control={form.control}
            name="primaryCrops"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Crops</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Maize, Tomatoes, Cabbage"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  List the main crops you grow (separate with commas)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact Phone */}
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., +260 97 123 4567"
                    type="tel"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Phone number for farm-related communications
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Farming Goals */}
          <FormField
            control={form.control}
            name="farmingGoals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Farming Goals (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Increase yield by 20%, reduce pest damage, improve soil health..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  What are you hoping to achieve with your farming?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save & Continue"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
