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
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShoppingCart,
  Bell,
  Leaf,
  Apple,
  Carrot,
  Wheat,
  MapPin,
  Truck,
  Star,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const buyerPreferencesSchema = z.object({
  preferredCategories: z
    .array(z.string())
    .min(1, "Select at least one category"),
  maxDeliveryDistance: z.string().default("20"),
  priceAlerts: z.boolean().default(true),
  newProductAlerts: z.boolean().default(true),
  harvestAlerts: z.boolean().default(true),
  qualityPreference: z.string().default("organic"),
  deliveryPreference: z.string().default("pickup"),
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
});

type BuyerPreferencesFormData = z.infer<typeof buyerPreferencesSchema>;

interface BuyerPreferencesStepProps {
  onSubmit: (data: BuyerPreferencesFormData) => void;
  initialData?: Partial<BuyerPreferencesFormData>;
  isLoading?: boolean;
}

const productCategories = [
  { id: "vegetables", label: "Vegetables", icon: Carrot },
  { id: "fruits", label: "Fruits", icon: Apple },
  { id: "grains", label: "Grains & Cereals", icon: Wheat },
  { id: "herbs", label: "Herbs & Spices", icon: Leaf },
];

const deliveryDistances = [
  { value: "5", label: "Within 5 km" },
  { value: "10", label: "Within 10 km" },
  { value: "20", label: "Within 20 km" },
  { value: "50", label: "Within 50 km" },
  { value: "unlimited", label: "No limit" },
];

const qualityPreferences = [
  { value: "organic", label: "Organic preferred" },
  { value: "conventional", label: "Conventional is fine" },
  { value: "mixed", label: "Both organic and conventional" },
];

const deliveryPreferences = [
  { value: "pickup", label: "I'll pick up from farm" },
  { value: "delivery", label: "Delivery to my location" },
  { value: "both", label: "Either pickup or delivery" },
];

export function BuyerPreferencesStep({
  onSubmit,
  initialData,
  isLoading,
}: BuyerPreferencesStepProps) {
  const form = useForm<BuyerPreferencesFormData>({
    resolver: zodResolver(buyerPreferencesSchema),
    defaultValues: {
      preferredCategories: initialData?.preferredCategories || [],
      maxDeliveryDistance: initialData?.maxDeliveryDistance || "20",
      priceAlerts: initialData?.priceAlerts ?? true,
      newProductAlerts: initialData?.newProductAlerts ?? true,
      harvestAlerts: initialData?.harvestAlerts ?? true,
      qualityPreference: initialData?.qualityPreference || "organic",
      deliveryPreference: initialData?.deliveryPreference || "pickup",
      emailNotifications: initialData?.emailNotifications ?? true,
      smsNotifications: initialData?.smsNotifications ?? false,
    },
  });

  const handleSubmit = (data: BuyerPreferencesFormData) => {
    onSubmit(data);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          <ShoppingCart className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold">
          Customize your shopping experience
        </h3>
        <p className="text-muted-foreground">
          Tell us what you're looking for to get personalized recommendations
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Product Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Leaf className="h-4 w-4" />
                What are you interested in buying?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="preferredCategories"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-2 gap-4">
                      {productCategories.map((category) => {
                        const IconComponent = category.icon;
                        return (
                          <FormField
                            key={category.id}
                            control={form.control}
                            name="preferredCategories"
                            render={({ field }) => (
                              <FormItem
                                key={category.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(category.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            category.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== category.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="flex items-center gap-2 font-normal cursor-pointer">
                                  <IconComponent className="h-4 w-4" />
                                  {category.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        );
                      })}
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Shopping Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Shopping Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="maxDeliveryDistance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Distance</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="How far are you willing to travel?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {deliveryDistances.map((distance) => (
                          <SelectItem
                            key={distance.value}
                            value={distance.value}
                          >
                            {distance.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Maximum distance from farmers you'd like to buy from
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="qualityPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Quality Preference
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="What type of produce do you prefer?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {qualityPreferences.map((pref) => (
                          <SelectItem key={pref.value} value={pref.value}>
                            {pref.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Delivery Preference
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="How would you like to get your produce?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {deliveryPreferences.map((pref) => (
                          <SelectItem key={pref.value} value={pref.value}>
                            {pref.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" />
                Stay Updated
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="priceAlerts"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <FormLabel>Price Alerts</FormLabel>
                      <FormDescription>
                        Get notified about price drops and special offers
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
                name="newProductAlerts"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <FormLabel>New Product Alerts</FormLabel>
                      <FormDescription>
                        Be the first to know about new products from your
                        favorite farmers
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
                name="harvestAlerts"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <FormLabel>Harvest Alerts</FormLabel>
                      <FormDescription>
                        Get notified when fresh produce is ready for harvest
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
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <FormLabel>Email Notifications</FormLabel>
                      <FormDescription>
                        Receive updates via email
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
                name="smsNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <FormLabel>SMS Notifications</FormLabel>
                      <FormDescription>
                        Receive urgent updates via text message
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
            </CardContent>
          </Card>

          {/* Hidden submit button */}
          <button type="submit" className="hidden" disabled={isLoading} />
        </form>
      </Form>
    </div>
  );
}

