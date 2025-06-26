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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Key, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TwoFactorVerificationProps {
  onVerify: (token: string) => Promise<void>;
  onUseBackupCode: (backupCode: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TwoFactorVerification({
  onVerify,
  onUseBackupCode,
  onCancel,
  isLoading = false,
}: TwoFactorVerificationProps) {
  const [mode, setMode] = useState<"totp" | "backup">("totp");
  const [totpCode, setTotpCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleTOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode.trim() || totpCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description:
          "Please enter a valid 6-digit code from your authenticator app.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onVerify(totpCode);
    } catch (error) {
      setTotpCode("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackupCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupCode.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid backup code.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onUseBackupCode(backupCode);
    } catch (error) {
      setBackupCode("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (value: string, type: "totp" | "backup") => {
    if (type === "totp") {
      // Only allow digits and limit to 6 characters
      const digitsOnly = value.replace(/\D/g, "");
      setTotpCode(digitsOnly.slice(0, 6));
    } else {
      setBackupCode(value);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter your verification code to continue
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            For your security, please complete two-factor authentication to
            access your account.
          </AlertDescription>
        </Alert>

        {/* Mode Toggle */}
        <div className="flex rounded-lg border p-1">
          <button
            type="button"
            onClick={() => setMode("totp")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              mode === "totp"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield className="h-4 w-4 mr-2 inline" />
            Authenticator App
          </button>
          <button
            type="button"
            onClick={() => setMode("backup")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              mode === "backup"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Key className="h-4 w-4 mr-2 inline" />
            Backup Code
          </button>
        </div>

        {mode === "totp" ? (
          <form onSubmit={handleTOTPSubmit} className="space-y-4">
            <div>
              <Label htmlFor="totp-code" className="text-sm font-medium">
                6-Digit Code
              </Label>
              <Input
                id="totp-code"
                type="text"
                placeholder="000000"
                value={totpCode}
                onChange={(e) => handleInputChange(e.target.value, "totp")}
                className="text-center text-lg font-mono tracking-widest"
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || isLoading || totpCode.length !== 6}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleBackupCodeSubmit} className="space-y-4">
            <div>
              <Label htmlFor="backup-code" className="text-sm font-medium">
                Backup Code
              </Label>
              <Input
                id="backup-code"
                type="text"
                placeholder="Enter your backup code"
                value={backupCode}
                onChange={(e) => handleInputChange(e.target.value, "backup")}
                className="font-mono"
                autoComplete="off"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use one of your backup codes if you can't access your
                authenticator app
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || isLoading || !backupCode.trim()}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Use Backup Code"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Don't have access to your authenticator app?{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "totp" ? "backup" : "totp")}
              className="text-primary hover:underline"
            >
              {mode === "totp" ? "Use a backup code" : "Use authenticator app"}
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
