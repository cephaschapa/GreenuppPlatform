import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Trash2,
  Plus,
  Settings,
  Key,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { DeviceManager } from "@/components/auth/DeviceManager";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

interface OAuthProvider {
  id: number;
  provider: string;
  providerEmail: string;
  providerName: string;
  providerPicture?: string;
  isPrimary: boolean;
  createdAt: string;
}

interface SecurityStatus {
  twoFactorEnabled: boolean;
  oauthProviders: OAuthProvider[];
  activeDevices: number;
  lastLoginAt: string;
  lastLoginLocation: string;
}

export default function SecuritySettings() {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showOAuthSetup, setShowOAuthSetup] = useState(false);
  const { toast } = useToast();

  const fetchSecurityStatus = async () => {
    try {
      // Fetch 2FA status
      const twoFactorResponse = await apiRequest("GET", "/api/auth/2fa/status");
      const twoFactorData = await twoFactorResponse.json();

      // Fetch OAuth providers
      const oauthResponse = await apiRequest(
        "GET",
        "/api/auth/oauth/providers"
      );
      const oauthData = await oauthResponse.json();

      // Fetch device count
      const devicesResponse = await apiRequest("GET", "/api/auth/devices");
      const devicesData = await devicesResponse.json();

      setSecurityStatus({
        twoFactorEnabled: twoFactorData.isEnabled || false,
        oauthProviders: oauthData || [],
        activeDevices: devicesData.length || 0,
        lastLoginAt: new Date().toISOString(), // This would come from the API
        lastLoginLocation: "Unknown", // This would come from the API
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load security settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityStatus();
  }, []);

  const handle2FASetupComplete = () => {
    setShow2FASetup(false);
    fetchSecurityStatus();
    toast({
      title: "Success",
      description: "Two-factor authentication has been enabled successfully!",
    });
  };

  const handleDisable2FA = async () => {
    try {
      await apiRequest("POST", "/api/auth/2fa/disable", {
        password: "current-password", // This should be collected from user
      });

      setSecurityStatus((prev) =>
        prev ? { ...prev, twoFactorEnabled: false } : null
      );
      toast({
        title: "Success",
        description: "Two-factor authentication has been disabled",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable two-factor authentication",
        variant: "destructive",
      });
    }
  };

  const handleOAuthLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  const handleUnlinkOAuth = async (provider: string) => {
    try {
      await apiRequest("DELETE", `/api/auth/oauth/providers/${provider}`);
      fetchSecurityStatus();
      toast({
        title: "Success",
        description: `${provider} account unlinked successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to unlink ${provider} account`,
        variant: "destructive",
      });
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "google":
        return "🔍";
      case "facebook":
        return "📘";
      case "github":
        return "🐙";
      default:
        return "🔗";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (show2FASetup) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8">
          <TwoFactorSetup
            onSetupComplete={handle2FASetupComplete}
            onCancel={() => setShow2FASetup(false)}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Security Settings</h1>
          <p className="text-muted-foreground">
            Manage your account security, two-factor authentication, and
            connected devices
          </p>
        </div>

        {/* Security Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div
                  className={`p-2 rounded-full ${
                    securityStatus?.twoFactorEnabled
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {securityStatus?.twoFactorEnabled ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <ShieldX className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Two-Factor Auth</p>
                  <p className="text-sm text-muted-foreground">
                    {securityStatus?.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Connected Accounts</p>
                  <p className="text-sm text-muted-foreground">
                    {securityStatus?.oauthProviders.length || 0} linked
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                  <Monitor className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Active Devices</p>
                  <p className="text-sm text-muted-foreground">
                    {securityStatus?.activeDevices || 0} sessions
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Settings */}
        <Tabs defaultValue="2fa" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="2fa" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Two-Factor Auth
            </TabsTrigger>
            <TabsTrigger value="oauth" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Connected Accounts
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Device Management
            </TabsTrigger>
          </TabsList>

          {/* Two-Factor Authentication */}
          <TabsContent value="2fa" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account with 2FA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {securityStatus?.twoFactorEnabled ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">
                            Two-factor authentication is enabled
                          </p>
                          <p className="text-sm text-green-700">
                            Your account is protected with an additional
                            security layer
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        Active
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShow2FASetup(true)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Manage 2FA
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleDisable2FA}
                        className="text-destructive hover:text-destructive"
                      >
                        <ShieldX className="h-4 w-4 mr-2" />
                        Disable 2FA
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                      <div className="flex items-center gap-3">
                        <ShieldX className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-900">
                            Two-factor authentication is disabled
                          </p>
                          <p className="text-sm text-yellow-700">
                            Enable 2FA to add an extra layer of security to your
                            account
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800"
                      >
                        Inactive
                      </Badge>
                    </div>

                    <Button onClick={() => setShow2FASetup(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Enable Two-Factor Authentication
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* OAuth Providers */}
          <TabsContent value="oauth" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>
                  Manage your linked social media and third-party accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {securityStatus?.oauthProviders.length ? (
                  <div className="space-y-3">
                    {securityStatus.oauthProviders.map((provider) => (
                      <div
                        key={provider.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {getProviderIcon(provider.provider)}
                          </span>
                          <div>
                            <p className="font-medium capitalize">
                              {provider.provider}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {provider.providerEmail}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {provider.isPrimary && (
                            <Badge variant="secondary">Primary</Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnlinkOAuth(provider.provider)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Unlink
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No connected accounts yet
                    </p>
                  </div>
                )}

                <Separator />

                <div>
                  <h3 className="font-medium mb-3">Link New Account</h3>
                  <OAuthButtons
                    onGoogleClick={() => handleOAuthLogin("google")}
                    onFacebookClick={() => handleOAuthLogin("facebook")}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Device Management */}
          <TabsContent value="devices">
            <DeviceManager />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
