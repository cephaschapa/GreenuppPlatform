import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, Redirect } from "wouter";
import { Helmet } from "react-helmet-async";
import EmailTestPanel from "@/components/EmailTestPanel";
import ProfessionalEmailTestPanel from "@/components/ProfessionalEmailTestPanel";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, KeyRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Login validation schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function EmailNotificationTestPage() {
  const { user, isLoading, loginMutation, refetchUser } = useAuth();
  const [isRefetching, setIsRefetching] = useState(false);

  // Create form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: LoginFormValues) => {
    await loginMutation.mutateAsync(values);
    // After login attempt, force a refetch to ensure we have the latest user data
    setIsRefetching(true);
    await refetchUser();
    setIsRefetching(false);
  };

  // Show loading state
  if (isLoading || isRefetching) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not logged in, show login form instead of redirecting
  if (!user) {
    return (
      <div className="container flex h-screen items-center justify-center py-10">
        <Helmet>
          <title>Email Notification Test Login | GreenUpp</title>
        </Helmet>

        <Card className="mx-auto w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Login Required</CardTitle>
            <CardDescription>
              You need to be logged in to test email notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-10"
                            placeholder="name@example.com"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-10"
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
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
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground mt-2">
              Don't have an account?{" "}
              <Link
                href="/auth"
                className="text-primary underline-offset-4 hover:underline"
              >
                Register here
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-5xl">
      <Helmet>
        <title>Email Notification Test | GreenUpp</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Email Notification Test
        </h1>
        <p className="text-muted-foreground mt-2">
          Test the email notification system for GreenUpp's Green Socials
          feature
        </p>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <EmailTestPanel />
          <ProfessionalEmailTestPanel />
        </div>

        <div className="space-y-6">
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-2">
              About Email Notifications
            </h3>
            <p className="mb-4">
              GreenUpp sends email notifications for important social activities
              to help users stay connected even when they're not actively using
              the platform.
            </p>
            <h4 className="font-medium mt-4 mb-2">Notification Types:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Comments on your posts</li>
              <li>Replies to your comments</li>
              <li>Likes on your content</li>
              <li>New followers</li>
              <li>Shares of your posts</li>
              <li>Saves of your posts</li>
              <li>Mentions in posts and comments</li>
            </ul>
          </div>

          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-2">User Settings</h3>
            <p>
              Users can customize their notification preferences in their
              account settings. They can choose which types of notifications
              they want to receive via email.
            </p>
          </div>

          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-2">How It Works</h3>
            <p>
              When an activity occurs, GreenUpp first creates an in-app
              notification. If email notifications are enabled, it also sends an
              email with details about the activity and a link to view it in the
              app.
            </p>
            <p className="mt-2">
              All emails include unsubscribe links so users can easily opt out
              if they wish.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
