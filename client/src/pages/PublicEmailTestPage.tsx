import React, { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function PublicEmailTestPage() {
  const [email, setEmail] = useState('');
  const [activityType, setActivityType] = useState('post_comment');
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  // Activity types for social notifications
  const activityTypes = [
    { value: 'post_comment', label: 'Post Comment' },
    { value: 'comment_reply', label: 'Comment Reply' },
    { value: 'post_like', label: 'Post Like' },
    { value: 'comment_like', label: 'Comment Like' },
    { value: 'new_follower', label: 'New Follower' },
    { value: 'post_share', label: 'Post Share' },
    { value: 'post_save', label: 'Post Save' },
    { value: 'post_mention', label: 'Post Mention' },
    { value: 'comment_mention', label: 'Comment Mention' }
  ];

  // Send a regular email
  const sendTestEmail = async () => {
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter an email address',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setResultMessage('');
    
    try {
      const response = await apiRequest('POST', '/api/test/test-email', { email });
      const data = await response.json();
      
      if (data.success) {
        setResultMessage(`Email sent successfully to ${email}`);
        toast({
          title: 'Success',
          description: data.message,
        });
      } else {
        setResultMessage(`Failed to send email: ${data.message || 'Unknown error'}`);
        toast({
          title: 'Error',
          description: data.message || 'Failed to send email',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      setResultMessage(`Error sending email: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: 'Error',
        description: 'Failed to send email',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Send a social notification email
  const sendSocialNotification = async () => {
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter an email address',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setResultMessage('');
    
    try {
      const response = await apiRequest('POST', '/api/test/test-social-notification', { 
        email, 
        activityType 
      });
      const data = await response.json();
      
      if (data.success) {
        setResultMessage(`Social notification email for "${activityType}" sent successfully to ${email}`);
        toast({
          title: 'Success',
          description: data.message,
        });
      } else {
        setResultMessage(`Failed to send notification: ${data.message || 'Unknown error'}`);
        toast({
          title: 'Error',
          description: data.message || 'Failed to send notification',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error sending social notification:', error);
      setResultMessage(`Error sending notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center">GreenUpp Email Testing</h1>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
        Public email test utility - no authentication required
      </p>

      <Tabs defaultValue="standard" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="standard">Standard Email</TabsTrigger>
          <TabsTrigger value="social">Social Notification Email</TabsTrigger>
        </TabsList>

        <TabsContent value="standard">
          <Card>
            <CardHeader>
              <CardTitle>Test Standard Email</CardTitle>
              <CardDescription>
                Send a test email to verify the email delivery system is working correctly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
              <Button 
                onClick={sendTestEmail} 
                disabled={loading}
                className="w-full"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Test Email
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Test Social Notification Email</CardTitle>
              <CardDescription>
                Send a social notification email to test the Green Socials notification system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="notif-email">Email Address</Label>
                  <Input
                    id="notif-email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="activity-type">Activity Type</Label>
                  <Select value={activityType} onValueChange={setActivityType}>
                    <SelectTrigger id="activity-type">
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
              <Button 
                onClick={sendSocialNotification} 
                disabled={loading}
                className="w-full"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Social Notification Email
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {resultMessage && (
        <div className={`mt-6 p-4 rounded-md ${resultMessage.includes('Error') || resultMessage.includes('Failed') ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200' : 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200'}`}>
          <p className="font-medium">{resultMessage}</p>
        </div>
      )}

      <div className="mt-12 p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
        <h3 className="text-lg font-semibold mb-2">About This Tool</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This tool allows you to test the GreenUpp email notification system without needing to be logged in.
          You can send both standard test emails and social activity notification emails.
        </p>
        <h4 className="font-medium mb-1">How it works:</h4>
        <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>Enter your email address to receive the test messages</li>
          <li>For social notifications, select the type of activity to simulate</li>
          <li>The system will generate appropriate test content based on the selected activity</li>
          <li>All emails include a timestamp and are clearly marked as test messages</li>
        </ul>
      </div>
    </div>
  );
}