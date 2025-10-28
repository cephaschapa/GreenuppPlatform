import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import greenuppLogo from "@/assets/greenupp-full-logo.png";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  showSkip?: boolean;
  isNextDisabled?: boolean;
  isLoading?: boolean;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  title,
  subtitle,
  onNext,
  onPrevious,
  onSkip,
  nextLabel = "Continue",
  previousLabel = "Back",
  showSkip = false,
  isNextDisabled = false,
  isLoading = false,
}: OnboardingLayoutProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={greenuppLogo} alt="GreenUpp" className="h-12" />
          </div>
          <div className="max-w-md mx-auto">
            <Progress value={progressPercentage} className="mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-muted-foreground mt-2">{subtitle}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">{children}</CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <div>
              {currentStep > 1 && onPrevious && (
                <Button
                  variant="outline"
                  onClick={onPrevious}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {previousLabel}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {showSkip && onSkip && (
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  disabled={isLoading}
                  className="text-muted-foreground"
                >
                  Skip for now
                </Button>
              )}

              {onNext && (
                <Button
                  onClick={onNext}
                  disabled={isNextDisabled || isLoading}
                  className="flex items-center gap-2 min-w-[120px]"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  ) : (
                    <>
                      {nextLabel}
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

