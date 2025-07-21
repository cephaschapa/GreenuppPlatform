import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface AdminLoginData {
  email: string;
  password: string;
  adminCode?: string;
}

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<AdminLoginData>({
    email: "",
    password: "",
    adminCode: "",
  });

  const loginMutation = useMutation({
    mutationFn: async (data: AdminLoginData) => {
      const response = await apiRequest("POST", "/api/admin/auth/login", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Admin login failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Admin Access Granted",
        description: `Welcome back, ${data.user?.username || "Administrator"}`,
        duration: 3000,
      });
      // Redirect to admin dashboard
      setLocation("/admin");
      // Refresh the page to update auth state
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Access Denied",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(formData);
  };

  const handleInputChange =
    (field: keyof AdminLoginData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-red-50 dark:from-red-950/20 dark:via-background dark:to-red-950/20 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-red-900 dark:text-red-100">
              GreenUpp Admin
            </h1>
            <p className="text-sm text-red-700 dark:text-red-300">
              Administrative Access Portal
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Security Notice */}
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Restricted Access:</strong> This portal is for authorized
              administrators only. All login attempts are monitored and logged.
            </AlertDescription>
          </Alert>

          {/* Login Form */}
          <Card className="border-red-200 dark:border-red-800 shadow-lg">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto p-4 bg-red-100 dark:bg-red-900/20 rounded-full w-fit">
                <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-900 dark:text-red-100">
                Admin Login
              </CardTitle>
              <p className="text-muted-foreground">
                Enter your administrator credentials to access the control panel
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Administrator Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@greenupp.com"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    className="h-12"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange("password")}
                      className="h-12 pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Admin Code Field (Optional for extra security) */}
                <div className="space-y-2">
                  <Label htmlFor="adminCode" className="text-sm font-medium">
                    Admin Access Code{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="adminCode"
                    type="text"
                    placeholder="Enter admin access code"
                    value={formData.adminCode}
                    onChange={handleInputChange("adminCode")}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Additional security layer for high-privilege access
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Access Admin Panel
                    </>
                  )}
                </Button>

                {/* Login Status */}
                {loginMutation.isError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {loginMutation.error?.message ||
                        "Access denied. Please check your credentials."}
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Security Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-card border rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Secure Authentication</p>
              <p className="text-xs text-muted-foreground">
                End-to-end encrypted
              </p>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Access Monitoring</p>
              <p className="text-xs text-muted-foreground">
                All attempts logged
              </p>
            </div>
          </div>

          {/* Back to Public Site */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back to GreenUpp Platform
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-xs text-muted-foreground border-t">
        <p>
          © 2024 GreenUpp Platform • Administrator Portal • Unauthorized access
          is prohibited
        </p>
      </div>
    </div>
  );
}
