import { ReactNode, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useRoleNavigation } from "@/hooks/use-role-navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  MerchantSetupStep,
  type MerchantSetupForm,
} from "@/components/onboarding/seller/MerchantSetupStep";

interface MerchantGuardProps {
  children: ReactNode;
  requireApproved?: boolean; // If true, requires approved status, not just setup
}

interface MerchantAccount {
  id: number;
  status: "pending" | "approved" | "rejected" | "suspended";
  verificationStatus: "pending" | "verified" | "rejected";
  businessName: string;
  createdAt: string;
}

export function MerchantGuard({
  children,
  requireApproved = false,
}: MerchantGuardProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { getUrl } = useRoleNavigation();

  // Only apply merchant guard to suppliers (sellers)
  const shouldCheckMerchant = user?.role === "supplier";

  // Fetch merchant account status
  const {
    data: merchantAccount,
    isLoading: merchantLoading,
    error,
  } = useQuery<MerchantAccount>({
    queryKey: ["/api/merchant-account"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/merchant-account");
      return await response.json();
    },
    enabled: shouldCheckMerchant && !!user,
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 (no merchant account)
      if (error?.status === 404) return false;
      return failureCount < 3;
    },
  });

  // Show loading state
  if (authLoading || (shouldCheckMerchant && merchantLoading)) {
    return (
      <DashboardLayout title="Loading..." description="Checking account status">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // If not a supplier, render children normally
  if (!shouldCheckMerchant) {
    return <>{children}</>;
  }

  // If no merchant account exists (404 error), show setup required
  if (error?.status === 404 || !merchantAccount) {
    return (
      <DashboardLayout
        title="Merchant Account Required"
        description="Complete your merchant setup to start selling"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl">
                Merchant Account Setup Required
              </CardTitle>
              <CardDescription>
                To start selling on GreenUpp marketplace, you need to set up
                your merchant account with business and payment information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!showSetupForm ? (
                <>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This is required for all sellers to ensure secure
                      transactions and proper payment processing.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <h3 className="font-medium">What you'll need:</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Business information (name, type, address)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Banking details (account number, bank name)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Mobile money account (optional but recommended)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        National ID for verification
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      className="flex-1"
                      onClick={() => setShowSetupForm(true)}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Start Setup
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    <Button variant="outline" asChild>
                      <a href={getUrl("dashboard")}>Back to Dashboard</a>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <MerchantSetupStep
                    onSubmit={handleMerchantSetupSubmit}
                    isLoading={createMerchantAccountMutation.isPending}
                  />
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => setShowSetupForm(false)}
                      disabled={createMerchantAccountMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // If merchant account exists but approval is required and not approved
  if (requireApproved && merchantAccount.status !== "approved") {
    const getStatusMessage = () => {
      switch (merchantAccount.status) {
        case "pending":
          return {
            title: "Merchant Account Under Review",
            description:
              "Your merchant account is being reviewed. This typically takes 1-3 business days.",
            icon: <AlertCircle className="h-6 w-6 text-yellow-600" />,
            bgColor: "bg-yellow-100",
          };
        case "rejected":
          return {
            title: "Merchant Account Rejected",
            description:
              "Your merchant account application was rejected. Please update your information and resubmit.",
            icon: <AlertCircle className="h-6 w-6 text-red-600" />,
            bgColor: "bg-red-100",
          };
        case "suspended":
          return {
            title: "Merchant Account Suspended",
            description:
              "Your merchant account has been suspended. Please contact support for assistance.",
            icon: <AlertCircle className="h-6 w-6 text-red-600" />,
            bgColor: "bg-red-100",
          };
        default:
          return {
            title: "Merchant Account Issue",
            description: "There's an issue with your merchant account status.",
            icon: <AlertCircle className="h-6 w-6 text-gray-600" />,
            bgColor: "bg-gray-100",
          };
      }
    };

    const statusInfo = getStatusMessage();

    return (
      <DashboardLayout
        title="Merchant Account Status"
        description="Account approval required"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div
                className={`mx-auto w-12 h-12 ${statusInfo.bgColor} rounded-full flex items-center justify-center mb-4`}
              >
                {statusInfo.icon}
              </div>
              <CardTitle className="text-xl">{statusInfo.title}</CardTitle>
              <CardDescription>{statusInfo.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Business Name:
                    </span>
                    <p className="font-medium">
                      {merchantAccount.businessName}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium capitalize">
                      {merchantAccount.status}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Submitted:</span>
                    <p className="font-medium">
                      {new Date(merchantAccount.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Verification:</span>
                    <p className="font-medium capitalize">
                      {merchantAccount.verificationStatus}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {merchantAccount.status === "rejected" && (
                  <Button asChild className="flex-1">
                    <a href={getUrl("merchant-account")}>
                      <Building className="h-4 w-4 mr-2" />
                      Update Account Information
                    </a>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <a href={getUrl("dashboard")}>Back to Dashboard</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
}
