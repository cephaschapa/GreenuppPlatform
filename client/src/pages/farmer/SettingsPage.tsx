import { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// import { OfflineStatusPanel } from "@/components/OfflineStatusPanel"; // Temporarily disabled
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BellRing, Smartphone, ShieldCheck, Moon, Network, Bell, BellOff } from "lucide-react";
import { 
  isPushNotificationSupported, 
  getSubscriptionStatus, 
  subscribeToPushNotifications, 
  unsubscribeFromPushNotifications,
  sendTestNotification
} from "@/lib/notifications";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [pushNotifications, setPushNotifications] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  
  const { toast } = useToast();
  
  // Check if push notifications are supported and get current status
  useEffect(() => {
    const supported = isPushNotificationSupported();
    setPushSupported(supported);
    
    if (supported) {
      getSubscriptionStatus().then(status => {
        setPushNotifications(status);
        localStorage.setItem('pushNotifications', status.toString());
      });
    }
  }, []);
  
  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    localStorage.setItem('theme', enabled ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', enabled);
  };
  
  const handlePushNotificationsToggle = async (enabled: boolean) => {
    if (!pushSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser.",
        variant: "destructive"
      });
      return;
    }
    
    if (enabled) {
      try {
        setIsSubscribing(true);
        
        // First request notification permission
        const permission = await Notification.requestPermission();
        
        if (permission !== 'granted') {
          toast({
            title: "Permission Denied",
            description: "Please enable notifications in your browser settings.",
            variant: "destructive"
          });
          setPushNotifications(false);
          localStorage.setItem('pushNotifications', 'false');
          setIsSubscribing(false);
          return;
        }
        
        // Then subscribe to push notifications
        const subscription = await subscribeToPushNotifications();
        
        if (subscription) {
          setPushNotifications(true);
          localStorage.setItem('pushNotifications', 'true');
          toast({
            title: "Notifications Enabled",
            description: "You will now receive important updates from Greenupp.",
          });
        } else {
          setPushNotifications(false);
          localStorage.setItem('pushNotifications', 'false');
          toast({
            title: "Subscription Failed",
            description: "Could not subscribe to push notifications.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error subscribing to push notifications:', error);
        toast({
          title: "Subscription Error",
          description: "An error occurred while subscribing to push notifications.",
          variant: "destructive"
        });
        setPushNotifications(false);
        localStorage.setItem('pushNotifications', 'false');
      } finally {
        setIsSubscribing(false);
      }
    } else {
      try {
        setIsUnsubscribing(true);
        const result = await unsubscribeFromPushNotifications();
        
        if (result) {
          setPushNotifications(false);
          localStorage.setItem('pushNotifications', 'false');
          toast({
            title: "Notifications Disabled",
            description: "You will no longer receive push notifications from Greenupp.",
          });
        } else {
          // Keep current state if unsubscribe failed
          toast({
            title: "Unsubscribe Failed",
            description: "Could not unsubscribe from push notifications.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error unsubscribing from push notifications:', error);
        toast({
          title: "Unsubscribe Error",
          description: "An error occurred while unsubscribing from push notifications.",
          variant: "destructive"
        });
      } finally {
        setIsUnsubscribing(false);
      }
    }
  };
  
  const handleTestNotification = async () => {
    if (!pushNotifications) {
      toast({
        title: "Not Subscribed",
        description: "Please enable push notifications first.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSendingTest(true);
      const result = await sendTestNotification();
      
      if (result) {
        toast({
          title: "Test Notification Sent",
          description: "A test notification has been dispatched to your device.",
        });
      } else {
        toast({
          title: "Test Failed",
          description: "Could not send test notification.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Test Error",
        description: "An error occurred while sending the test notification.",
        variant: "destructive"
      });
    } finally {
      setIsSendingTest(false);
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
                <div className="flex flex-col gap-1">
                  <div className="flex items-center space-x-2">
                    <BellRing className="h-4 w-4" />
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                  </div>
                  {!pushSupported && (
                    <p className="text-xs text-red-500 ml-6">Not supported in this browser</p>
                  )}
                  {pushSupported && pushNotifications && (
                    <p className="text-xs text-green-500 ml-6">
                      Notifications enabled for this device
                    </p>
                  )}
                </div>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={handlePushNotificationsToggle}
                  disabled={isSubscribing || isUnsubscribing || !pushSupported}
                />
              </div>
              
              <div className="border-t border-border pt-4 mt-2">
                <h4 className="text-sm font-medium mb-2">Notification preferences</h4>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="task-notifications" className="text-sm">Task reminders</Label>
                    </div>
                    <Switch
                      id="task-notifications"
                      checked={pushNotifications}
                      disabled={!pushNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="weather-notifications" className="text-sm">Weather alerts</Label>
                    </div>
                    <Switch
                      id="weather-notifications"
                      checked={pushNotifications}
                      disabled={!pushNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="crop-notifications" className="text-sm">Crop updates</Label>
                    </div>
                    <Switch
                      id="crop-notifications"
                      checked={pushNotifications}
                      disabled={!pushNotifications}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleTestNotification}
                disabled={isSendingTest || !pushNotifications}
              >
                {isSendingTest ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                    Sending test...
                  </>
                ) : (
                  <>
                    {pushNotifications ? <Bell className="mr-2 h-4 w-4" /> : <BellOff className="mr-2 h-4 w-4" />}
                    Send test notification
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="offline" className="space-y-4">
          {/* Offline status panel temporarily disabled */}
          <Card>
            <CardHeader>
              <CardTitle>Offline Mode</CardTitle>
              <CardDescription>
                Manage offline functionality and data storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Offline mode configuration is currently unavailable. The feature is being updated and will be available soon.</p>
            </CardContent>
          </Card>
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