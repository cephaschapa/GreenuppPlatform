import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Bell, Megaphone, Calendar, Mail, AlertTriangle, MessageSquare, BadgeInfo } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface NotificationSettingsProps {
  userId: number;
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch notification settings
  const { 
    data: settings, 
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/notifications/settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/notifications/settings');
      return await response.json();
    },
    retry: 1
  });
  
  // State for optimistic updates
  const [emailFrequency, setEmailFrequency] = useState<string>(settings?.emailFrequency || 'instant');
  
  // Mutation to update notification settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: any) => {
      const response = await apiRequest('PATCH', '/api/notifications/settings', updatedSettings);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update settings",
        description: error.message || "An error occurred while saving your preferences.",
        variant: "destructive"
      });
    }
  });
  
  // Handle toggle changes
  const handleToggleChange = (setting: string, checked: boolean) => {
    updateSettingsMutation.mutate({ [setting]: checked });
  };
  
  // Handle email frequency change
  const handleEmailFrequencyChange = (value: string) => {
    setEmailFrequency(value);
    updateSettingsMutation.mutate({ emailFrequency: value });
  };
  
  // Test email function
  const sendTestEmail = async () => {
    try {
      const response = await apiRequest('POST', '/api/notifications/test-email', {
        email: undefined // use the user's email on file
      });
      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Test email sent",
          description: "Check your inbox to confirm you received the test email.",
        });
      } else {
        throw new Error(result.message || "Failed to send test email");
      }
    } catch (error: any) {
      toast({
        title: "Failed to send test email",
        description: error.message || "An error occurred while sending the test email.",
        variant: "destructive"
      });
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-7 w-[250px]" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-[300px]" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            There was an error loading your notification settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/notifications/settings'] })}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Control how and when you receive notifications from Greenupp.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Channels */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notification Channels</h3>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="emailEnabled" className="text-sm">Email Notifications</Label>
              </div>
              <Switch 
                id="emailEnabled" 
                checked={settings?.emailEnabled || false}
                onCheckedChange={(checked) => handleToggleChange('emailEnabled', checked)}
                disabled={updateSettingsMutation.isPending}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="pushEnabled" className="text-sm">Push Notifications</Label>
              </div>
              <Switch 
                id="pushEnabled" 
                checked={settings?.pushEnabled || false}
                onCheckedChange={(checked) => handleToggleChange('pushEnabled', checked)}
                disabled={updateSettingsMutation.isPending}
              />
            </div>
          </div>
        </div>
        
        {/* Notification Types */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notification Types</h3>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <Label htmlFor="weatherAlerts" className="text-sm">Weather Alerts</Label>
              </div>
              <Switch 
                id="weatherAlerts" 
                checked={settings?.weatherAlerts || false}
                onCheckedChange={(checked) => handleToggleChange('weatherAlerts', checked)}
                disabled={updateSettingsMutation.isPending}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <Label htmlFor="taskReminders" className="text-sm">Task Reminders</Label>
              </div>
              <Switch 
                id="taskReminders" 
                checked={settings?.taskReminders || false}
                onCheckedChange={(checked) => handleToggleChange('taskReminders', checked)}
                disabled={updateSettingsMutation.isPending}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Megaphone className="h-4 w-4 text-green-500" />
                <Label htmlFor="marketPriceAlerts" className="text-sm">Market Price Alerts</Label>
              </div>
              <Switch 
                id="marketPriceAlerts" 
                checked={settings?.marketPriceAlerts || false}
                onCheckedChange={(checked) => handleToggleChange('marketPriceAlerts', checked)}
                disabled={updateSettingsMutation.isPending}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-purple-500" />
                <Label htmlFor="messageNotifications" className="text-sm">Message Notifications</Label>
              </div>
              <Switch 
                id="messageNotifications" 
                checked={settings?.messageNotifications || false}
                onCheckedChange={(checked) => handleToggleChange('messageNotifications', checked)}
                disabled={updateSettingsMutation.isPending}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BadgeInfo className="h-4 w-4 text-gray-500" />
                <Label htmlFor="systemNotifications" className="text-sm">System Notifications</Label>
              </div>
              <Switch 
                id="systemNotifications" 
                checked={settings?.systemNotifications || false}
                onCheckedChange={(checked) => handleToggleChange('systemNotifications', checked)}
                disabled={updateSettingsMutation.isPending}
              />
            </div>
          </div>
        </div>
        
        {/* Email Digest Settings */}
        {settings?.emailEnabled && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Email Frequency</h3>
            <div className="grid gap-2">
              <Label htmlFor="emailFrequency" className="text-sm">How often should we send email notifications?</Label>
              <Select 
                value={emailFrequency}
                onValueChange={handleEmailFrequencyChange}
                disabled={updateSettingsMutation.isPending}
              >
                <SelectTrigger id="emailFrequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant (As they happen)</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Digest</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {emailFrequency === 'instant' 
                  ? 'You will receive an email for each notification as it happens.' 
                  : `You will receive a daily${emailFrequency === 'weekly' ? ' weekly' : ''} summary of all your notifications.`}
              </p>
            </div>
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={sendTestEmail}
                disabled={updateSettingsMutation.isPending}
              >
                Send Test Email
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}