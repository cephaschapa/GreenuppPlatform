import { useState } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OfflineStatusPanel } from "@/components/OfflineStatusPanel";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BellRing, Smartphone, ShieldCheck, Moon, Network } from "lucide-react";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [pushNotifications, setPushNotifications] = useState(localStorage.getItem('pushNotifications') === 'true');
  
  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    localStorage.setItem('theme', enabled ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', enabled);
  };
  
  const handlePushNotificationsToggle = (enabled: boolean) => {
    setPushNotifications(enabled);
    localStorage.setItem('pushNotifications', enabled.toString());
    
    if (enabled && "Notification" in window) {
      Notification.requestPermission();
    }
  };
  
  return (
    <DashboardLayout title="Settings" description="Manage your app settings and preferences">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="offline">Offline Mode</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Moon className="h-4 w-4" />
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={handleDarkModeToggle}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BellRing className="h-4 w-4" />
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                </div>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={handlePushNotificationsToggle}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="offline" className="space-y-4">
          <OfflineStatusPanel />
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage security and privacy options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-4 w-4" />
                  <Label htmlFor="biometric">Biometric Authentication</Label>
                </div>
                <Switch
                  id="biometric"
                  disabled
                />
              </div>
              <p className="text-sm text-gray-500">Biometric authentication will be available in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}