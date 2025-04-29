import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type ActivityType = 
  'post_comment' | 
  'comment_reply' | 
  'post_like' | 
  'comment_like' | 
  'new_follower' | 
  'post_share' | 
  'post_save' | 
  'post_mention' | 
  'comment_mention';

export default function EmailTestPanel() {
  const [isTestingSendgrid, setIsTestingSendgrid] = useState(false);
  const [isTestingSocial, setIsTestingSocial] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>('post_comment');

  const handleBasicEmailTest = async () => {
    setIsTestingSendgrid(true);
    try {
      const response = await apiRequest('POST', '/api/test/test-email');
      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Email Test Successful',
          description: data.message,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Email Test Failed',
          description: data.message || 'Failed to send test email',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error testing email:', error);
      toast({
        title: 'Email Test Failed',
        description: 'An error occurred while testing email functionality',
        variant: 'destructive',
      });
    } finally {
      setIsTestingSendgrid(false);
    }
  };

  const handleSocialNotificationTest = async () => {
    setIsTestingSocial(true);
    try {
      const response = await apiRequest('POST', '/api/test/test-social-notification', { activityType });
      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Notification Email Test Successful',
          description: data.message,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Notification Email Test Failed',
          description: data.message || 'Failed to send test notification email',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error testing notification email:', error);
      toast({
        title: 'Notification Email Test Failed',
        description: 'An error occurred while testing notification email functionality',
        variant: 'destructive',
      });
    } finally {
      setIsTestingSocial(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Email Notification Testing</CardTitle>
        <CardDescription>
          Test email notifications for Green Socials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Basic Email Test</h3>
          <p className="text-sm text-muted-foreground">
            Send a basic test email to verify SendGrid integration
          </p>
          <Button 
            onClick={handleBasicEmailTest} 
            disabled={isTestingSendgrid}
            className="mt-2"
          >
            {isTestingSendgrid ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Test Email'
            )}
          </Button>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Social Notification Test</h3>
          <p className="text-sm text-muted-foreground">
            Test Green Socials activity notification emails
          </p>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="activity-type">Activity Type</Label>
            <Select 
              value={activityType} 
              onValueChange={(value) => setActivityType(value as ActivityType)}
              disabled={isTestingSocial}
            >
              <SelectTrigger id="activity-type" className="w-full">
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="post_comment">Post Comment</SelectItem>
                <SelectItem value="comment_reply">Comment Reply</SelectItem>
                <SelectItem value="post_like">Post Like</SelectItem>
                <SelectItem value="comment_like">Comment Like</SelectItem>
                <SelectItem value="new_follower">New Follower</SelectItem>
                <SelectItem value="post_share">Post Share</SelectItem>
                <SelectItem value="post_save">Post Save</SelectItem>
                <SelectItem value="post_mention">Post Mention</SelectItem>
                <SelectItem value="comment_mention">Comment Mention</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleSocialNotificationTest}
            disabled={isTestingSocial} 
            className="mt-2"
          >
            {isTestingSocial ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Test Notification'
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Note: You must be logged in and have a valid email address to receive test emails.
        </p>
      </CardFooter>
    </Card>
  );
}