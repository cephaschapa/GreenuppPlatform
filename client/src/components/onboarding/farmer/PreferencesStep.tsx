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
import {
  Bell,
  Cloud,
  Smartphone,
  Mail,
  MessageSquare,
  Languages,
  Globe,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const preferencesSchema = z.object({
  weatherAlerts: z.boolean().default(true),
  taskReminders: z.boolean().default(true),
  marketUpdates: z.boolean().default(true),
  expertTips: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  pushNotifications: z.boolean().default(true),
  language: z.string().default("en"),
  weatherUnits: z.string().default("metric"),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

interface PreferencesStepProps {
  onSubmit: (data: PreferencesFormData) => void;
  initialData?: Partial<PreferencesFormData>;
  isLoading?: boolean;
}

const languages = [
  { value: "en", label: "English" },
  { value: "bem", label: "Bemba" },
  { value: "ny", label: "Nyanja" },
  { value: "toi", label: "Tonga" },
];

const weatherUnits = [
  { value: "metric", label: "Metric (°C, km/h, mm)" },
  { value: "imperial", label: "Imperial (°F, mph, inches)" },
];

export function PreferencesStep({
  onSubmit,
  initialData,
  isLoading,
}: PreferencesStepProps) {
  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      weatherAlerts: initialData?.weatherAlerts ?? true,
      taskReminders: initialData?.taskReminders ?? true,
      marketUpdates: initialData?.marketUpdates ?? true,
      expertTips: initialData?.expertTips ?? true,
      emailNotifications: initialData?.emailNotifications ?? true,
      smsNotifications: initialData?.smsNotifications ?? false,
      pushNotifications: initialData?.pushNotifications ?? true,
      language: initialData?.language ?? "en",
      weatherUnits: initialData?.weatherUnits ?? "metric",
    },
  });

  const handleSubmit = (data: PreferencesFormData) => {
    onSubmit(data);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          <Bell className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold">Customize your experience</h3>
        <p className="text-muted-foreground">
          Set up notifications and preferences to get the most out of GreenUpp
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="weatherAlerts"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2">
                        <Cloud className="h-4 w-4" />
                        Weather Alerts
                      </FormLabel>
                      <FormDescription>
                        Get notified about important weather changes
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
                name="taskReminders"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <FormLabel>Task Reminders</FormLabel>
                      <FormDescription>
                        Reminders for planting, harvesting, and other tasks
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
                name="marketUpdates"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <FormLabel>Market Updates</FormLabel>
                      <FormDescription>
                        Price changes and market opportunities
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
                name="expertTips"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <FormLabel>Expert Tips</FormLabel>
                      <FormDescription>
                        Agricultural advice and best practices
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

          {/* Delivery Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" />
                How would you like to receive notifications?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="pushNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Push Notifications
                      </FormLabel>
                      <FormDescription>
                        Instant notifications on your device
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
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Notifications
                      </FormLabel>
                      <FormDescription>
                        Daily summaries and important updates
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
                        Critical alerts via text message
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

          {/* Language & Regional Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4" />
                Language & Regional Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      Preferred Language
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose your preferred language for the app
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weatherUnits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Cloud className="h-4 w-4" />
                      Weather Units
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select weather units" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {weatherUnits.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose your preferred units for weather data
                    </FormDescription>
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

