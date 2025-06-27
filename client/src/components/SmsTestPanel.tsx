import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, MessageSquare, Send, Users } from "lucide-react";

export default function SmsTestPanel() {
  const [isTestingSms, setIsTestingSms] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("🌱 Test SMS from Greenupp platform!");
  const [title, setTitle] = useState("Test Alert");
  const [broadcastMessage, setBroadcastMessage] = useState(
    "🌱 Broadcast test from Greenupp platform!"
  );
  const [broadcastTitle, setBroadcastTitle] = useState("Broadcast Alert");
  const { toast } = useToast();

  const handleSmsTest = async () => {
    if (!phone || !message) {
      toast({
        title: "Missing Information",
        description: "Please enter both phone number and message",
        variant: "destructive",
      });
      return;
    }

    setIsTestingSms(true);
    try {
      const response = await apiRequest("POST", "/api/test-sms", {
        phone,
        message,
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: "SMS Test Successful",
          description: data.message,
          variant: "default",
        });
      } else {
        toast({
          title: "SMS Test Failed",
          description: data.message || "Failed to send test SMS",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error testing SMS:", error);
      toast({
        title: "SMS Test Failed",
        description: "An error occurred while testing SMS functionality",
        variant: "destructive",
      });
    } finally {
      setIsTestingSms(false);
    }
  };

  const handleBroadcastSms = async () => {
    if (!broadcastTitle || !broadcastMessage) {
      toast({
        title: "Missing Information",
        description: "Please enter both title and message for broadcast",
        variant: "destructive",
      });
      return;
    }

    setIsBroadcasting(true);
    try {
      const response = await apiRequest("POST", "/api/broadcast-sms", {
        title: broadcastTitle,
        message: broadcastMessage,
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: "SMS Broadcast Successful",
          description: `${data.message} - ${data.sent} sent, ${data.failed} failed`,
          variant: "default",
        });

        // Show detailed results if there are any
        if (data.results && data.results.length > 0) {
          console.log("Broadcast results:", data.results);
        }
      } else {
        toast({
          title: "SMS Broadcast Failed",
          description: data.message || "Failed to broadcast SMS",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error broadcasting SMS:", error);
      toast({
        title: "SMS Broadcast Failed",
        description: "An error occurred while broadcasting SMS",
        variant: "destructive",
      });
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Test Panel
          </CardTitle>
          <CardDescription>
            Test SMS functionality and broadcast messages to users with SMS
            enabled
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Individual SMS Test */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Individual SMS Test</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Include country code (e.g., +1 for US)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your test message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <Button
              onClick={handleSmsTest}
              disabled={isTestingSms || !phone || !message}
              className="gap-2"
            >
              {isTestingSms ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Test SMS
                </>
              )}
            </Button>
          </div>

          <div className="border-t pt-6">
            {/* SMS Broadcast */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Users className="h-5 w-5" />
                SMS Broadcast
              </h3>
              <p className="text-sm text-muted-foreground">
                Send SMS to all users who have SMS notifications enabled
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="broadcast-title">Title</Label>
                  <Input
                    id="broadcast-title"
                    placeholder="Alert Title"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="broadcast-message">Message</Label>
                  <Textarea
                    id="broadcast-message"
                    placeholder="Enter broadcast message..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <Button
                onClick={handleBroadcastSms}
                disabled={
                  isBroadcasting || !broadcastTitle || !broadcastMessage
                }
                className="gap-2"
                variant="destructive"
              >
                {isBroadcasting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Broadcast SMS
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg border p-4 bg-muted/30">
            <h4 className="font-medium mb-2">Instructions</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Individual SMS Test: Send to a specific phone number</li>
              <li>• SMS Broadcast: Send to all users with SMS enabled</li>
              <li>
                • Make sure users have enabled SMS notifications in their
                settings
              </li>
              <li>
                • Phone numbers should include country code (e.g., +1 for US)
              </li>
              <li>• Check Twilio console for delivery status</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
