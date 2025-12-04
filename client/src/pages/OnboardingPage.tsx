import React, { useState, useEffect } from "react";
import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { FarmProfileStep } from "@/components/onboarding/farmer/FarmProfileStep";
import { PreferencesStep } from "@/components/onboarding/farmer/PreferencesStep";
import { BuyerPreferencesStep } from "@/components/onboarding/buyer/BuyerPreferencesStep";
import { MerchantSetupStep } from "@/components/onboarding/seller/MerchantSetupStep";
import { CompletionStep } from "@/components/onboarding/CompletionStep";
import { apiRequest } from "@/lib/queryClient";
import { UserRoleType } from "@shared/schema";

interface OnboardingData {
  farmProfile?: any;
  preferences?: any;
  merchantSetup?: any;
  completed?: boolean;
}

export default function OnboardingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});

  // Check if user needs onboarding
  const { data: onboardingStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/user/onboarding-status"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/user/onboarding-status");
        if (!response.ok) {
          throw new Error("Failed to fetch onboarding status");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching onboarding status:", error);
        return { completed: false, step: 1 };
      }
    },
    enabled: !!user?.id,
  });

  // Save onboarding progress
  const saveProgressMutation = useMutation({
    mutationFn: async (data: { step: number; data: any }) => {
      const response = await apiRequest(
        "POST",
        "/api/user/onboarding-progress",
        data
      );
      return await response.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving progress",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  console.log("onboardingStatus", onboardingStatus, user);

  // Complete onboarding
  const completeOnboardingMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      console.log("🚀 Completing onboarding with data:", data);
      const response = await apiRequest(
        "POST",
        "/api/user/complete-onboarding",
        data
      );
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate all relevant queries to refresh the cache
      queryClient.invalidateQueries({
        queryKey: ["/api/user/onboarding-status"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/user"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/farmer-profile"],
      });

      toast({
        title: "🎉 Welcome to GreenUpp!",
        description: "Your account is now fully set up. Let's get started!",
        duration: 5000,
      });

      // Navigate to appropriate dashboard
      const dashboardUrl =
        user?.role === "farmer"
          ? `/farmer/${user.id}/dashboard`
          : user?.role === "buyer"
          ? `/buyer/${user.id}/dashboard`
          : user?.role === "supplier"
          ? `/seller/${user.id}/dashboard`
          : "/dashboard";

      navigate(dashboardUrl);
    },
    onError: (error: Error) => {
      toast({
        title: "Error completing onboarding",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Redirect if user is not logged in
  if (!authLoading && !user) {
    return <Redirect to="/auth" />;
  }

  // Redirect if onboarding is already completed

  // Set initial step and data from saved progress
  useEffect(() => {
    if (onboardingStatus?.step && currentStep === 1) {
      setCurrentStep(onboardingStatus.step);
    }

    // Load saved onboarding data if it exists
    if (
      onboardingStatus?.data &&
      Object.keys(onboardingStatus.data).length > 0
    ) {
      console.log("📂 Loading saved onboarding data:", onboardingStatus.data);
      setOnboardingData(onboardingStatus.data);

      // Show a toast to let the user know their progress was restored
      if (onboardingStatus.step > 1) {
        toast({
          title: "Welcome back!",
          description: "Your onboarding progress has been restored.",
          duration: 3000,
        });
      }
    }
  }, [onboardingStatus, currentStep]);

  if (authLoading || statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const userRole = user?.role as UserRoleType;
  const totalSteps = getTotalSteps(userRole);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      // Save progress
      saveProgressMutation.mutate({
        step: nextStep,
        data: onboardingData,
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepSubmit = (stepData: any) => {
    const updatedData: OnboardingData = { ...onboardingData };

    switch (currentStep) {
      case 2:
        if (userRole === "farmer") {
          updatedData.farmProfile = stepData;
        } else if (userRole === "supplier") {
          updatedData.merchantSetup = stepData;
        } else {
          updatedData.preferences = stepData;
        }
        break;
      case 3:
        updatedData.preferences = stepData;
        break;
      default:
        break;
    }

    console.log("📝 Step data submitted:", {
      currentStep,
      stepData,
      updatedData,
    });
    setOnboardingData(updatedData);

    if (currentStep < totalSteps) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      saveProgressMutation.mutate({
        step: nextStep,
        data: updatedData,
      });
    }
  };

  const handleComplete = (finalStepData?: any) => {
    let dataToSubmit: OnboardingData = { ...onboardingData };

    // If final step data is provided, include it
    if (finalStepData) {
      if (userRole === "farmer" && currentStep === 3) {
        dataToSubmit.preferences = finalStepData;
      } else if (
        (userRole === "buyer" || userRole === "supplier") &&
        currentStep === 2
      ) {
        dataToSubmit.preferences = finalStepData;
      }
    }

    console.log("🏁 Completing onboarding with final data:", dataToSubmit);
    // Strip farmer-specific fields if user is not a farmer
    if (userRole !== "farmer") {
      delete dataToSubmit.farmProfile;
    }
    if (userRole !== "supplier") {
      delete dataToSubmit.merchantSetup;
    }
    completeOnboardingMutation.mutate(dataToSubmit);
  };

  // Redirect to dashboard if onboarding is completed
  if (onboardingStatus?.completed) {
    const dashboardUrl =
      user?.role === "farmer"
        ? `/farmer/${user.id}/dashboard`
        : user?.role === "buyer"
        ? `/buyer/${user.id}/dashboard`
        : user?.role === "supplier"
        ? `/seller/${user.id}/dashboard`
        : "/dashboard";
    return <Redirect to={dashboardUrl} />;
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <WelcomeStep
            userRole={userRole}
            firstName={user?.firstName || ""}
            onContinue={handleNext}
          />
        );

      case 2:
        if (userRole === "farmer") {
          return (
            <FarmProfileStep
              onSubmit={handleStepSubmit}
              initialData={onboardingData.farmProfile}
              isLoading={saveProgressMutation.isPending}
            />
          );
        } else if (userRole === "buyer") {
          return (
            <BuyerPreferencesStep
              onSubmit={(stepData) => {
                // For buyers, this is the final step - complete onboarding
                const updatedData = {
                  ...onboardingData,
                  preferences: stepData,
                };
                console.log("🎯 Final buyer step data:", {
                  stepData,
                  updatedData,
                });
                setOnboardingData(updatedData);
                completeOnboardingMutation.mutate(updatedData);
              }}
              initialData={onboardingData.preferences}
              isLoading={completeOnboardingMutation.isPending}
            />
          );
        } else if (userRole === "supplier") {
          return (
            <MerchantSetupStep
              onSubmit={handleStepSubmit}
              initialData={onboardingData.merchantSetup}
              isLoading={saveProgressMutation.isPending}
            />
          );
        }
        // Fallback for other roles
        return (
          <PreferencesStep
            onSubmit={(stepData) => {
              const updatedData = { ...onboardingData, preferences: stepData };
              setOnboardingData(updatedData);
              completeOnboardingMutation.mutate(updatedData);
            }}
            initialData={onboardingData.preferences}
            isLoading={completeOnboardingMutation.isPending}
          />
        );

      case 3:
        if (userRole === "farmer") {
          return (
            <PreferencesStep
              onSubmit={(stepData) => {
                // For the final step before completion, save data and complete onboarding
                const updatedData = {
                  ...onboardingData,
                  preferences: stepData,
                };
                console.log("🎯 Final farmer step data:", {
                  stepData,
                  updatedData,
                });
                setOnboardingData(updatedData);
                completeOnboardingMutation.mutate(updatedData);
              }}
              initialData={onboardingData.preferences}
              isLoading={completeOnboardingMutation.isPending}
            />
          );
        } else if (userRole === "supplier") {
          return (
            <PreferencesStep
              onSubmit={(stepData) => {
                // For sellers, this is the final step - complete onboarding with merchant setup
                const updatedData = {
                  ...onboardingData,
                  preferences: stepData,
                };
                console.log("🎯 Final seller step data:", {
                  stepData,
                  updatedData,
                });
                setOnboardingData(updatedData);
                completeOnboardingMutation.mutate(updatedData);
              }}
              initialData={onboardingData.preferences}
              isLoading={completeOnboardingMutation.isPending}
            />
          );
        }
        // For other roles, this is completion
        return (
          <CompletionStep
            userRole={userRole}
            firstName={user?.firstName || ""}
            onComplete={handleComplete}
            isLoading={completeOnboardingMutation.isPending}
          />
        );

      case 4:
        return (
          <CompletionStep
            userRole={userRole}
            firstName={user?.firstName || ""}
            onComplete={handleComplete}
            isLoading={completeOnboardingMutation.isPending}
          />
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Welcome to GreenUpp";
      case 2:
        if (userRole === "farmer") return "Farm Profile";
        if (userRole === "supplier") return "Merchant Setup";
        return "Preferences";
      case 3:
        if (userRole === "farmer") return "Preferences";
        if (userRole === "supplier") return "Preferences";
        return "You're All Set!";
      case 4:
        return "You're All Set!";
      default:
        return "Onboarding";
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return "Let's get you started on your journey";
      case 2:
        if (userRole === "farmer")
          return "Tell us about your farming operation";
        if (userRole === "supplier")
          return "Set up your merchant account for selling";
        return "Customize your experience";
      case 3:
        if (userRole === "farmer") return "Customize your experience";
        if (userRole === "supplier") return "Customize your selling experience";
        return "Ready to explore GreenUpp";
      case 4:
        return "Ready to explore GreenUpp";
      default:
        return "";
    }
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      title={getStepTitle()}
      subtitle={getStepSubtitle()}
      onNext={undefined}
      onPrevious={currentStep > 1 ? handlePrevious : undefined}
      showSkip={currentStep > 1 && currentStep < totalSteps}
      onSkip={() => setCurrentStep(totalSteps)}
      isLoading={
        saveProgressMutation.isPending || completeOnboardingMutation.isPending
      }
    >
      {renderCurrentStep()}
    </OnboardingLayout>
  );
}

function getTotalSteps(userRole: UserRoleType): number {
  switch (userRole) {
    case "farmer":
      return 4; // Welcome -> Farm Profile -> Preferences -> Completion
    case "buyer":
    case "supplier":
      return 3; // Welcome -> Preferences -> Completion
    default:
      return 3;
  }
}
