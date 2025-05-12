import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { registerUserSchema, loginUserSchema } from "@shared/schema";
import { z } from "zod";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import greenuppLogo from "@/assets/greenupp-full-logo.png";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [checked, setChecked] = useState(false);
  const isAppSubdomain = window.location.hostname.startsWith('app.');

  useEffect(() => {
    // Only set checked to true after initial auth check is complete
    if (!isLoading) {
      setChecked(true);
    }
  }, [isLoading]);

  // If the user is already logged in and we've completed initial loading, redirect based on their role
  if (checked && user && !isLoading) {
    console.log('Auth page: User is logged in, redirecting to dashboard');
    
    // If we're on app subdomain, don't use /dashboard prefix
    if (isAppSubdomain) {
      if (user.role === 'buyer' || user.role === 'supplier') {
        return <Redirect to="/marketplace" />;
      } else {
        return <Redirect to="/" />;
      }
    } else {
      // On main domain, use /dashboard prefix
      if (user.role === 'buyer' || user.role === 'supplier') {
        return <Redirect to="/dashboard/marketplace" />;
      } else {
        return <Redirect to="/dashboard" />;
      }
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
            Greenupp is a revolutionary platform that brings together the latest in AI, IoT, and blockchain 
            technologies to help farmers optimize yields, reduce costs, and farm more sustainably.
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
  const { loginMutation, refetchUser } = useAuth();
  const loginForm = useForm<z.infer<typeof loginUserSchema>>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  function onSubmit(values: z.infer<typeof loginUserSchema>) {
    loginMutation.mutate(values, {
      onSuccess: async () => {
        console.log("Login successful, explicitly refetching user data");
        // Force refetch user data after login to ensure session is properly recognized
        await refetchUser();
      }
    });
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
          <form onSubmit={loginForm.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email or Username</FormLabel>
                  <FormControl>
                    <Input placeholder="yourname@example.com or username" {...field} value={field.value || ''} />
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
                    <Input type="password" placeholder="••••••••" {...field} value={field.value || ''} />
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
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          Forgot your password? <a href="#" className="text-green-600 hover:text-green-800">Reset it here</a>
        </p>
      </CardFooter>
    </Card>
  );
}

function RegisterForm() {
  const { registerMutation, refetchUser } = useAuth();
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
      onSuccess: async () => {
        console.log("Registration successful, explicitly refetching user data");
        // Force refetch user data after registration to ensure session is properly recognized
        await refetchUser();
      }
    });
  }

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
          <form onSubmit={registerForm.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={registerForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} value={field.value || ''} />
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
                      <Input placeholder="Doe" {...field} value={field.value || ''} />
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
                    <Input placeholder="johndoe" {...field} value={field.value || ''} />
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
                    <Input placeholder="john@example.com" {...field} value={field.value || ''} />
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
                    <Input type="password" placeholder="••••••••" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormDescription>
                    At least 8 characters
                  </FormDescription>
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
                    <Input type="password" placeholder="••••••••" {...field} value={field.value || ''} />
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
                      I agree to the <a href="#" className="text-green-600 hover:text-green-800">Terms of Service</a> and <a href="#" className="text-green-600 hover:text-green-800">Privacy Policy</a>
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
      </CardContent>
    </Card>
  );
}