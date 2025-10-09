import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { registerUserSchema, loginUserSchema } from "@shared/schema";
import { z } from "zod";
import { Redirect, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import greenuppLogo from "@/assets/greenupp-full-logo.png";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { TwoFactorVerification } from "@/components/auth/TwoFactorVerification";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useRoleNavigation } from "@/hooks/use-role-navigation";
import { RegistrationSuccessDialog } from "@/components/auth/RegistrationSuccessDialog";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const { getDashboardUrl, getMarketplaceUrl } = useRoleNavigation();
  const [checked, setChecked] = useState(false);
  const isAppSubdomain = window.location.hostname.startsWith("app.");

  useEffect(() => {
    // Only set checked to true after initial auth check is complete
    if (!isLoading) {
      setChecked(true);
    }
  }, [isLoading]);

  // Show loader while authentication state is loading
  if (isLoading || !checked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">
          Loading authentication...
        </p>
      </div>
    );
  }

  // If the user is already logged in and we've completed initial loading, redirect based on their role
  if (checked && user && !isLoading) {
    // Redirect admin users to /admin
    if (user.role === "admin") {
      return <Redirect to="/admin" />;
    }

    // Use role-based routing for all user types
    if (
      user.role === "buyer" ||
      user.role === "supplier" ||
      user.role === "seller"
    ) {
      return <Redirect to={getMarketplaceUrl()} />;
    } else {
      return <Redirect to={getDashboardUrl()} />;
    }
  }

  return (
    <div className="flex min-h-screen bg-green-50 dark:bg-black">
      {/* Form section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-10">
        <div className="max-w-md w-full">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <img src={greenuppLogo} alt="Greenupp Logo" className="h-12" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Join the future of sustainable farming
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm />
            </TabsContent>

            <TabsContent value="register">
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hero section */}
      <div className="hidden md:block md:w-1/2 bg-green-900 dark:bg-green-800 text-white">
        <div className="h-full flex flex-col justify-center p-10">
          <h2 className="text-4xl font-bold mb-6 font-space">
            Transform Your Farming Operations with AI-Powered Insights
          </h2>
          <p className="text-xl mb-8">
            Greenupp is a revolutionary platform that brings together the latest
            in AI, IoT, and blockchain technologies to help farmers optimize
            yields, reduce costs, and farm more sustainably.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center mr-3 mt-1">
                <span className="text-sm font-bold">✓</span>
              </div>
              <p>Real-time crop monitoring and smart analytics</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center mr-3 mt-1">
                <span className="text-sm font-bold">✓</span>
              </div>
              <p>Precision agriculture with IoT integration</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center mr-3 mt-1">
                <span className="text-sm font-bold">✓</span>
              </div>
              <p>Direct marketplace access for farmers and buyers</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center mr-3 mt-1">
                <span className="text-sm font-bold">✓</span>
              </div>
              <p>Blockchain-verified supply chain transparency</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { loginMutation, refetchUser, resendVerificationMutation } = useAuth();
  const [requires2FA, setRequires2FA] = useState(false);
  const [requiresEmailVerification, setRequiresEmailVerification] =
    useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string>("");
  const [accountLocked, setAccountLocked] = useState(false);
  const [lockRemaining, setLockRemaining] = useState<number | null>(null);
  const [pendingCredentials, setPendingCredentials] = useState<{
    email: string;
    password: string;
    rememberMe?: boolean;
  } | null>(null);
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginUserSchema>>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  function onSubmit(values: z.infer<typeof loginUserSchema>) {
    setPendingCredentials({
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe || false,
    });

    // First, try to login normally
    loginMutation.mutate(values, {
      onSuccess: async () => {
        // console.log("Login successful, explicitly refetching user data");
        await refetchUser();
      },
      onError: async (error: any) => {
        // Check if account is locked
        if (error?.response?.data?.accountLocked) {
          setAccountLocked(true);
          setLockRemaining(error?.response?.data?.remainingTime);
          toast({
            title: "Account Locked",
            description:
              error?.response?.data?.message ||
              "Account temporarily locked due to too many failed login attempts",
            variant: "destructive",
          });
        }
        // Check if email verification is required
        else if (error?.response?.data?.requiresEmailVerification) {
          setRequiresEmailVerification(true);
          setUnverifiedEmail(error?.response?.data?.email || values.email);
          toast({
            title: "Email Verification Required",
            description:
              error?.response?.data?.message ||
              "Please verify your email address before logging in",
            variant: "destructive",
          });
        }
        // Check if 2FA is required
        else if (error?.response?.data?.requires2FA) {
          setRequires2FA(true);
        } else {
          toast({
            title: "Login Failed",
            description:
              error?.response?.data?.message ||
              error.message ||
              "Invalid credentials",
            variant: "destructive",
          });
        }
      },
    });
  }

  const handle2FAVerification = async (token: string) => {
    if (!pendingCredentials) return;

    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        ...pendingCredentials,
        twoFactorToken: token,
      });

      if (response.ok) {
        await refetchUser();
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "2FA verification failed");
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleBackupCode = async (backupCode: string) => {
    if (!pendingCredentials) return;

    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        ...pendingCredentials,
        backupCode,
      });

      if (response.ok) {
        await refetchUser();
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Backup code verification failed");
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid backup code",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleOAuthLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  const handleCancel2FA = () => {
    setRequires2FA(false);
    setPendingCredentials(null);
  };

  if (accountLocked) {
    const remainingMinutes = lockRemaining ? Math.ceil(lockRemaining / 60) : 15;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-space text-red-600">
            Account Temporarily Locked
          </CardTitle>
          <CardDescription>
            Too many failed login attempts detected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m0 0v2m0-2h2m-2 0H10m0-6V9a6 6 0 1 1 12 0v4m-6 6V9a6 6 0 0 0-12 0v4"
                />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Your account has been temporarily locked due to multiple failed
              login attempts.
            </p>
            <p className="text-sm font-medium mb-4">
              Please try again in approximately{" "}
              <strong>{remainingMinutes} minutes</strong>.
            </p>
            <p className="text-xs text-muted-foreground">
              If you continue to have trouble accessing your account, please
              contact support.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setAccountLocked(false);
                setLockRemaining(null);
              }}
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (requiresEmailVerification) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-space">
            Email Verification Required
          </CardTitle>
          <CardDescription>
            Please verify your email address before logging in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              We sent a verification email to <strong>{unverifiedEmail}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Click the link in the email to verify your account, then return
              here to log in.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => resendVerificationMutation.mutate(unverifiedEmail)}
              disabled={resendVerificationMutation.isPending}
            >
              {resendVerificationMutation.isPending
                ? "Sending..."
                : "Resend Verification Email"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setRequiresEmailVerification(false);
                setUnverifiedEmail("");
              }}
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (requires2FA) {
    return (
      <TwoFactorVerification
        onVerify={handle2FAVerification}
        onUseBackupCode={handleBackupCode}
        onCancel={handleCancel2FA}
        isLoading={loginMutation.isPending}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-space">Login to your account</CardTitle>
        <CardDescription>
          Enter your credentials to access your Greenupp dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...loginForm}>
          <form
            onSubmit={loginForm.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email or Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="yourname@example.com or username"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={loginForm.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    Remember me for 30 days
                  </FormLabel>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </Form>

        {/* OAuth Buttons */}
        <div className="mt-6">
          <OAuthButtons
            onGoogleClick={() => handleOAuthLogin("google")}
            onFacebookClick={() => handleOAuthLogin("facebook")}
            isLoading={loginMutation.isPending}
            mode="login"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          Forgot your password?{" "}
          <Link
            href="/forgot-password"
            className="text-green-600 hover:text-green-800"
          >
            Reset it here
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

function RegisterForm() {
  const { registerMutation, refetchUser } = useAuth();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [registeredFirstName, setRegisteredFirstName] = useState("");

  const registerForm = useForm<z.infer<typeof registerUserSchema>>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      role: "farmer",
      terms: false,
    },
  });

  function onSubmit(values: z.infer<typeof registerUserSchema>) {
    registerMutation.mutate(values, {
      onSuccess: async (response: any) => {
        // Save registration details for success dialog
        setRegisteredEmail(values.email);
        setRegisteredFirstName(values.firstName || "");
        
        // Show success dialog
        setShowSuccessDialog(true);
        
        // console.log("Registration successful, explicitly refetching user data");
        // Force refetch user data after registration to ensure session is properly recognized
        await refetchUser();
      },
    });
  }

  const handleOAuthLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  const handleOAuthRegister = (provider: string) => {
    // For registration, we'll use the same OAuth flow but with a registration flag
    window.location.href = `/api/auth/${provider}?mode=register`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-space">Create an account</CardTitle>
        <CardDescription>
          Sign up to start using Greenupp's smart farming tools
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...registerForm}>
          <form
            onSubmit={registerForm.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={registerForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={registerForm.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="johndoe"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={registerForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john@example.com"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={registerForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>At least 8 characters</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={registerForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={registerForm.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="farmer">Farmer</SelectItem>
                      <SelectItem value="supplier">Supplier</SelectItem>
                      <SelectItem value="buyer">Buyer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the account type that best fits your needs
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={registerForm.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      I agree to the{" "}
                      <a
                        href="#"
                        className="text-green-600 hover:text-green-800"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="text-green-600 hover:text-green-800"
                      >
                        Privacy Policy
                      </a>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </Form>

        {/* OAuth Buttons */}
        <div className="mt-6">
          <OAuthButtons
            onGoogleClick={() => handleOAuthRegister("google")}
            onFacebookClick={() => handleOAuthRegister("facebook")}
            isLoading={registerMutation.isPending}
            mode="register"
          />
        </div>
      </CardContent>

      {/* Success Dialog */}
      <RegistrationSuccessDialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        email={registeredEmail}
        firstName={registeredFirstName}
      />
    </Card>
  );
}
