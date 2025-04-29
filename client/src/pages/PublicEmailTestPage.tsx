import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Separator } from '@/components/ui/separator';
import { Loader2, Mail, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '@/lib/queryClient';

// Type for social activity
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

// Form validation schema
const emailTestSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  activityType: z.string().optional(),
});

type EmailTestFormValues = z.infer<typeof emailTestSchema>;

export default function PublicEmailTestPage() {
  const [isSendingBasic, setIsSendingBasic] = useState(false);
  const [isSendingSocial, setIsSendingSocial] = useState(false);
  
  // Create form
  const form = useForm<EmailTestFormValues>({
    resolver: zodResolver(emailTestSchema),
    defaultValues: {
      email: '',
      activityType: 'post_comment',
    },
  });

  // Handle basic email test
  const handleBasicEmailTest = async (values: EmailTestFormValues) => {
    setIsSendingBasic(true);
    try {
      console.log('Sending basic test email request to:', values.email);
      const response = await apiRequest('POST', '/api/test/test-email', { email: values.email });
      console.log('Test email response:', response);
      const data = await response.json();
      console.log('Test email data:', data);
      
      if (data.success) {
        toast({
          title: 'Email Test Successful',
          description: data.message || `Test email sent to ${values.email}`,
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
      setIsSendingBasic(false);
    }
  };

  // Handle social notification test
  const handleSocialNotificationTest = async (values: EmailTestFormValues) => {
    setIsSendingSocial(true);
    try {
      console.log('Sending social notification test request:', { 
        email: values.email, 
        activityType: values.activityType 
      });
      
      const response = await apiRequest('POST', '/api/test/test-social-notification', { 
        email: values.email,
        activityType: values.activityType 
      });
      
      console.log('Social notification test response:', response);
      const data = await response.json();
      console.log('Social notification test data:', data);
      
      if (data.success) {
        toast({
          title: 'Notification Email Test Successful',
          description: data.message || `Test notification email sent to ${values.email}`,
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
      setIsSendingSocial(false);
    }
  };

  return (
    <div className="container py-6 max-w-5xl">
      <Helmet>
        <title>Email System Test | GreenUpp</title>
      </Helmet>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Email System Test</h1>
        <p className="text-muted-foreground mt-2">
          Test the email notification system for GreenUpp
        </p>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Form {...form}>
            <form className="space-y-6">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Email Test Panel</CardTitle>
                  <CardDescription>
                    Test email notifications for Green Socials
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              className="pl-10"
                              placeholder="you@example.com"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Email Test</h3>
                    <p className="text-sm text-muted-foreground">
                      Send a basic test email to verify SendGrid integration
                    </p>
                    <Button 
                      onClick={() => handleBasicEmailTest(form.getValues())} 
                      disabled={isSendingBasic || !form.formState.isValid}
                      className="w-full"
                    >
                      {isSendingBasic ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Test Email
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Social Notification Test</h3>
                    <p className="text-sm text-muted-foreground">
                      Test Green Socials activity notification emails
                    </p>
                    <FormField
                      control={form.control}
                      name="activityType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Activity Type</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                            disabled={isSendingSocial}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select activity type" />
                              </SelectTrigger>
                            </FormControl>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      onClick={() => handleSocialNotificationTest(form.getValues())}
                      disabled={isSendingSocial || !form.formState.isValid}
                      className="w-full"
                    >
                      {isSendingSocial ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Notification Test
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">
                    Enter your email address to receive test emails. No account required.
                  </p>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>

        <div className="space-y-6">
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-2">About Email Testing</h3>
            <p className="mb-4">
              This page allows you to test GreenUpp's email notification system without requiring an account.
              Just enter your email address and select the type of notification you want to test.
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
            <h3 className="text-lg font-medium mb-2">How It Works</h3>
            <p>
              When you send a test email, GreenUpp will generate a sample notification based on the selected activity type
              and send it to your email address. This allows you to see how notifications appear in your email client.
            </p>
            <p className="mt-2">
              All emails include unsubscribe links so recipients can easily opt out if they wish.
            </p>
          </div>

          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Email Security</h3>
            <p>
              Your email address will only be used for the test you request and will not be stored or used for any other purpose.
              No account creation is required to use this test feature.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}