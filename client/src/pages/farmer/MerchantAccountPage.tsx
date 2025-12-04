import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
  Phone,
  MapPin,
  Building,
  User,
  Banknote,
  Smartphone,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Merchant account schema
const merchantAccountSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  businessType: z.enum(["individual", "business", "cooperative"]),
  businessRegistrationNumber: z.string().optional(),
  taxId: z.string().optional(),

  // Contact Information
  contactPhone: z.string().min(10, "Valid phone number is required"),
  contactEmail: z.string().email("Valid email is required"),
  businessAddress: z.string().min(10, "Business address is required"),

  // Banking Information
  bankName: z.string().min(2, "Bank name is required"),
  accountNumber: z.string().min(8, "Valid account number is required"),
  accountHolderName: z.string().min(2, "Account holder name is required"),
  branchCode: z.string().optional(),

  // Mobile Money (Primary in Zambia)
  mobileMoneyProvider: z.enum(["mtn", "airtel", "zamtel", "none"]).optional(),
  mobileMoneyNumber: z.string().optional(),

  // Verification Documents
  nationalIdNumber: z.string().min(8, "National ID is required"),

  // Terms and Conditions
  acceptedTerms: z
    .boolean()
    .refine((val) => val === true, "You must accept the terms"),
  acceptedFees: z
    .boolean()
    .refine((val) => val === true, "You must accept the fee structure"),
});

type MerchantAccountForm = z.infer<typeof merchantAccountSchema>;

interface MerchantAccount {
  id: number;
  userId: number;
  status: "pending" | "approved" | "rejected" | "suspended";
  businessName: string;
  businessType: string;
  contactPhone: string;
  contactEmail: string;
  bankName: string;
  accountNumber: string;
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
  verificationStatus: "pending" | "verified" | "rejected";
  createdAt: string;
  approvedAt?: string;
  monthlyEarnings: number;
  totalEarnings: number;
  pendingPayouts: number;
}

export default function MerchantAccountPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch merchant account data
  const {
    data: merchantAccount,
    isLoading,
    refetch,
  } = useQuery<MerchantAccount>({
    queryKey: ["/api/merchant-account"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/merchant-account");
      return await response.json();
    },
  });

  // Create merchant account mutation
  const createAccountMutation = useMutation({
    mutationFn: async (data: MerchantAccountForm) => {
      const response = await apiRequest("POST", "/api/merchant-account", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Merchant Account Created",
        description: "Your merchant account has been submitted for review.",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create merchant account",
        variant: "destructive",
      });
    },
  });

  // Update merchant account mutation
  const updateAccountMutation = useMutation({
    mutationFn: async (data: Partial<MerchantAccountForm>) => {
      const response = await apiRequest("PUT", "/api/merchant-account", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Updated",
        description: "Your merchant account has been updated.",
      });
      refetch();
    },
  });

  const form = useForm<MerchantAccountForm>({
    resolver: zodResolver(merchantAccountSchema),
    defaultValues: {
      businessType: "individual",
      mobileMoneyProvider: "mtn",
      acceptedTerms: false,
      acceptedFees: false,
    },
  });

  const onSubmit = (data: MerchantAccountForm) => {
    if (merchantAccount) {
      updateAccountMutation.mutate(data);
    } else {
      createAccountMutation.mutate(data);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            Pending Review
          </Badge>
        );
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "suspended":
        return <Badge className="bg-gray-100 text-gray-800">Suspended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout
        title="Merchant Account"
        description="Manage your selling account"
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Merchant Account"
      description="Set up your merchant account to start selling"
    >
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="setup">Account Setup</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {merchantAccount ? (
            <>
              {/* Account Status */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Merchant Account Status
                    </CardTitle>
                    {getStatusBadge(merchantAccount.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Business Name
                      </Label>
                      <p className="font-medium">
                        {merchantAccount.businessName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Business Type
                      </Label>
                      <p className="font-medium capitalize">
                        {merchantAccount.businessType}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Contact Phone
                      </Label>
                      <p className="font-medium">
                        {merchantAccount.contactPhone}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Verification Status
                      </Label>
                      <p className="font-medium capitalize">
                        {merchantAccount.verificationStatus}
                      </p>
                    </div>
                  </div>

                  {merchantAccount.status === "pending" && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your merchant account is under review. This typically
                        takes 1-3 business days. You'll receive an email
                        notification once approved.
                      </AlertDescription>
                    </Alert>
                  )}

                  {merchantAccount.status === "approved" && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Your merchant account is approved! You can now sell
                        products and receive payments.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Earnings Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      This Month
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      K{merchantAccount.monthlyEarnings.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Earnings
                    </CardTitle>
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      K{merchantAccount.totalEarnings.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      All time earnings
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pending Payouts
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      K{merchantAccount.pendingPayouts.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Processing for payout
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Set Up Your Merchant Account</CardTitle>
                <CardDescription>
                  Create a merchant account to start selling your products and
                  receive payments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setActiveTab("setup")}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Merchant Account Setup</CardTitle>
              <CardDescription>
                Provide your business and banking information to start selling.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Business Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Business Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your farm or business name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="businessType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select business type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="individual">
                                  Individual Farmer
                                </SelectItem>
                                <SelectItem value="business">
                                  Registered Business
                                </SelectItem>
                                <SelectItem value="cooperative">
                                  Cooperative
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+260 XXX XXX XXX"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="your@email.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="businessAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Full business address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Banking Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Banking Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your bank" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="zanaco">
                                  Zanaco Bank
                                </SelectItem>
                                <SelectItem value="stanbic">
                                  Stanbic Bank
                                </SelectItem>
                                <SelectItem value="fbn">FBN Bank</SelectItem>
                                <SelectItem value="standard">
                                  Standard Chartered
                                </SelectItem>
                                <SelectItem value="absa">Absa Bank</SelectItem>
                                <SelectItem value="access">
                                  Access Bank
                                </SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your bank account number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="accountHolderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Holder Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Name as it appears on bank account"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Mobile Money */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Mobile Money (Optional)
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Add mobile money for faster payouts
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="mobileMoneyProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile Money Provider</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="mtn">MTN MoMo</SelectItem>
                                <SelectItem value="airtel">
                                  Airtel Money
                                </SelectItem>
                                <SelectItem value="zamtel">
                                  Zamtel Kwacha
                                </SelectItem>
                                <SelectItem value="none">None</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="mobileMoneyNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile Money Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+260 XXX XXX XXX"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Verification */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Verification</h3>
                    <FormField
                      control={form.control}
                      name="nationalIdNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>National ID Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your National ID number"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Required for identity verification
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Terms and Conditions */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="acceptedTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I accept the Terms and Conditions
                            </FormLabel>
                            <FormDescription>
                              By checking this, you agree to our merchant terms
                              and conditions.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="acceptedFees"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I accept the fee structure (3.5% + K2 per
                              transaction)
                            </FormLabel>
                            <FormDescription>
                              Standard processing fees apply to all
                              transactions.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      createAccountMutation.isPending ||
                      updateAccountMutation.isPending
                    }
                  >
                    {createAccountMutation.isPending ||
                    updateAccountMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {merchantAccount
                          ? "Updating..."
                          : "Creating Account..."}
                      </>
                    ) : merchantAccount ? (
                      "Update Account"
                    ) : (
                      "Create Merchant Account"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>
                Track your earnings and payout history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No payout history yet</p>
                <p className="text-sm">
                  Payouts are processed weekly on Fridays
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

