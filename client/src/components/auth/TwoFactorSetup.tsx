import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Download, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TwoFactorSetupProps {
  onSetupComplete: () => void;
  onCancel: () => void;
}

export function TwoFactorSetup({
  onSetupComplete,
  onCancel,
}: TwoFactorSetupProps) {
  const [step, setStep] = useState<"setup" | "verify">("setup");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generate2FA = async () => {
    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/auth/2fa/setup");
      const data = await response.json();

      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setStep("verify");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate 2FA setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const enable2FA = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Error",
        description:
          "Please enter the verification code from your authenticator app.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/2fa/enable", {
        secret,
        backupCodes,
        token: verificationCode,
      });

      toast({
        title: "Success",
        description: "Two-factor authentication has been enabled successfully!",
      });

      onSetupComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Backup codes copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join("\n");
    const blob = new Blob([codesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "greenupp-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Backup codes downloaded successfully",
    });
  };

  const regenerateBackupCodes = async () => {
    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/auth/2fa/setup");
      const data = await response.json();

      setBackupCodes(data.backupCodes);
      toast({
        title: "Regenerated",
        description: "New backup codes generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate backup codes",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (step === "setup") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Set Up Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enhance your account security with 2FA using an authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Two-factor authentication adds an extra layer of security to your
              account. You'll need to enter a code from your authenticator app
              in addition to your password.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              onClick={generate2FA}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate QR Code"
              )}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete 2FA Setup</CardTitle>
        <CardDescription>
          Scan the QR code and verify your setup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code */}
        <div className="text-center">
          <Label className="text-sm font-medium mb-2 block">Scan QR Code</Label>
          {qrCode && (
            <div className="inline-block p-4 bg-white rounded-lg border">
              <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Use Google Authenticator, Authy, or any TOTP app
          </p>
        </div>

        {/* Manual Entry */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Manual Entry</Label>
          <div className="flex gap-2">
            <Input value={secret} readOnly className="font-mono text-xs" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(secret)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Use this code if QR scanning doesn't work
          </p>
        </div>

        {/* Backup Codes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Backup Codes</Label>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBackupCodes(!showBackupCodes)}
              >
                {showBackupCodes ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={regenerateBackupCodes}
                disabled={isGenerating}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          {showBackupCodes ? (
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="font-mono text-xs"
                >
                  {code}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="h-20 bg-muted rounded-md flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Click eye icon to view codes
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-1">
            Save these codes in a secure location. You can use them to access
            your account if you lose your device.
          </p>
        </div>

        {/* Verification */}
        <div>
          <Label
            htmlFor="verification-code"
            className="text-sm font-medium mb-2 block"
          >
            Verification Code
          </Label>
          <Input
            id="verification-code"
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
            className="text-center text-lg font-mono"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={enable2FA}
            disabled={isLoading || !verificationCode.trim()}
            className="flex-1"
          >
            {isLoading ? "Enabling..." : "Enable 2FA"}
          </Button>
          <Button variant="outline" onClick={() => setStep("setup")}>
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
