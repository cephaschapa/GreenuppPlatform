import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import { Helmet } from 'react-helmet-async';
import EmailTestPanel from '@/components/EmailTestPanel';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

export default function EmailNotificationTestPage() {
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to auth page if not logged in
  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="container py-6 max-w-5xl">
      <Helmet>
        <title>Email Notification Test | GreenUpp</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Email Notification Test</h1>
        <p className="text-muted-foreground mt-2">
          Test the email notification system for GreenUpp's Green Socials feature
        </p>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <EmailTestPanel />
        </div>

        <div className="space-y-6">
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-2">About Email Notifications</h3>
            <p className="mb-4">
              GreenUpp sends email notifications for important social activities to help users stay connected even when they're not actively using the platform.
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
              Users can customize their notification preferences in their account settings. They can choose which types of notifications they want to receive via email.
            </p>
          </div>

          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-2">How It Works</h3>
            <p>
              When an activity occurs, GreenUpp first creates an in-app notification. If email notifications are enabled, it also sends an email with details about the activity and a link to view it in the app.
            </p>
            <p className="mt-2">
              All emails include unsubscribe links so users can easily opt out if they wish.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}