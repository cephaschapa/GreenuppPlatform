import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function ProfessionalEmailTestPanel() {
  const [email, setEmail] = useState("");
  const [emailType, setEmailType] = useState("welcome");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const emailTypes = [
    {
      value: "welcome",
      label: "🌱 Welcome Email",
      description: "New user welcome message",
    },
    {
      value: "verification",
      label: "✉️ Email Verification",
      description: "Account verification email",
    },
    {
      value: "password_reset",
      label: "🔑 Password Reset",
      description: "Password reset instructions",
    },
    {
      value: "security_alert",
      label: "🔐 Security Alert",
      description: "New device login notification",
    },
    {
      value: "demo",
      label: "✨ Template Demo",
      description: "Showcase all features",
    },
  ];

  const handleSendEmail = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest(
        "POST",
        "/api/test-professional-email",
        {
          email,
          type: emailType,
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Email Sent Successfully! 🎉",
          description: result.message,
        });
        setEmail(""); // Clear the email field after successful send
      } else {
        throw new Error(result.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending professional email:", error);
      toast({
        title: "Failed to Send Email",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedType = emailTypes.find((type) => type.value === emailType);

  return (
    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Sparkles className="h-5 w-5" />
          Professional Email Templates
        </CardTitle>
        <CardDescription>
          Test our new professional email templates with branding, social links,
          and elegant design
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prof-email">Email Address</Label>
          <Input
            id="prof-email"
            type="email"
            placeholder="Enter email address to test"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-green-200 focus:border-green-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-type">Email Template Type</Label>
          <Select value={emailType} onValueChange={setEmailType}>
            <SelectTrigger className="border-green-200 focus:border-green-400">
              <SelectValue placeholder="Select email type" />
            </SelectTrigger>
            <SelectContent>
              {emailTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{type.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {type.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedType && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-1">
              {selectedType.label}
            </h4>
            <p className="text-sm text-green-700">{selectedType.description}</p>
          </div>
        )}

        <Button
          onClick={handleSendEmail}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Professional Email...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Send Professional Email
            </>
          )}
        </Button>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm">
          <h4 className="font-medium text-blue-800 mb-1">✨ New Features</h4>
          <ul className="text-blue-700 space-y-1 text-xs">
            <li>• Professional header with GreenUpp branding</li>
            <li>• Responsive design for all devices</li>
            <li>
              • Social media links (Twitter, LinkedIn, Instagram, Facebook)
            </li>
            <li>• Complete contact information in footer</li>
            <li>• Modern gradient design with Inter font</li>
            <li>• Elegant call-to-action buttons with hover effects</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
