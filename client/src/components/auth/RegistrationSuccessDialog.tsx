import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Mail, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

interface RegistrationSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  email: string;
  firstName?: string;
}

export function RegistrationSuccessDialog({
  open,
  onClose,
  email,
  firstName,
}: RegistrationSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </motion.div>
          </div>
          
          <DialogTitle className="text-center text-2xl">
            🎉 Welcome to GreenUpp{firstName ? `, ${firstName}` : ""}!
          </DialogTitle>
          
          <DialogDescription className="text-center text-base">
            Your account has been created successfully
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Verification Card */}
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Verification Email Sent
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    We've sent a verification link to:
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {email}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                    Next Steps:
                  </p>
                  <ol className="text-xs text-green-700 dark:text-green-300 space-y-1 list-decimal list-inside">
                    <li>Check your email inbox</li>
                    <li>Click the verification link</li>
                    <li>Return here to log in</li>
                    <li>Start using GreenUpp!</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Note */}
          <p className="text-xs text-muted-foreground text-center">
            Didn't receive the email? Check your spam folder or contact support.
          </p>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            Got it! <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Also create a simpler inline success message component
export function RegistrationSuccessMessage({
  email,
  firstName,
  onResendEmail,
}: {
  email: string;
  firstName?: string;
  onResendEmail?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                🎉 Welcome{firstName ? `, ${firstName}` : ""}!
              </h3>
              <p className="text-green-700 dark:text-green-300">
                Your GreenUpp account has been created
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Verification Email Sent
                </p>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Check your inbox at <span className="font-semibold">{email}</span>
              </p>
            </div>

            <div className="pt-2">
              <Link href="/auth">
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600">
                  Go to Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {onResendEmail && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResendEmail}
                className="text-xs"
              >
                Didn't receive the email? Resend
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

