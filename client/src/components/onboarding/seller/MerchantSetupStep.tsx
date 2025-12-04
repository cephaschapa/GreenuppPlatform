import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Building,
  CreditCard,
  Phone,
  MapPin,
  User,
  Smartphone,
  Loader2,
} from "lucide-react";

// Merchant setup schema for onboarding
const merchantSetupSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  businessType: z.enum(["individual", "business", "cooperative"]),
  businessRegistrationNumber: z.string().optional(),

  // Contact Information
  contactPhone: z.string().min(10, "Valid phone number is required"),
  contactEmail: z.string().email("Valid email is required"),
  businessAddress: z.string().min(10, "Business address is required"),

  // Banking Information
  bankName: z.string().min(2, "Bank name is required"),
  accountNumber: z.string().min(8, "Valid account number is required"),
  accountHolderName: z.string().min(2, "Account holder name is required"),

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

export type MerchantSetupForm = z.infer<typeof merchantSetupSchema>;

interface MerchantSetupStepProps {
  onSubmit: (data: MerchantSetupForm) => void;
  initialData?: Partial<MerchantSetupForm>;
  isLoading?: boolean;
}

export function MerchantSetupStep({
  onSubmit,
  initialData,
  isLoading = false,
}: MerchantSetupStepProps) {
  const form = useForm<MerchantSetupForm>({
    resolver: zodResolver(merchantSetupSchema),
    defaultValues: {
      businessType: "individual",
      mobileMoneyProvider: "mtn",
      acceptedTerms: false,
      acceptedFees: false,
      ...initialData,
    },
  });

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Building className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">Set Up Your Merchant Account</h2>
        <p className="text-muted-foreground">
          Provide your business and payment information to start selling on
          GreenUpp
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Business Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-medium">
              <Building className="h-5 w-5" />
              Business Information
            </div>

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
                        <SelectItem value="cooperative">Cooperative</SelectItem>
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
                      <Input placeholder="+260 XXX XXX XXX" {...field} />
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
                    <Textarea
                      placeholder="Full business address including city and postal code"
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
            <div className="flex items-center gap-2 text-lg font-medium">
              <CreditCard className="h-5 w-5" />
              Banking Information
            </div>

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
                        <SelectItem value="zanaco">Zanaco Bank</SelectItem>
                        <SelectItem value="stanbic">Stanbic Bank</SelectItem>
                        <SelectItem value="fbn">FBN Bank</SelectItem>
                        <SelectItem value="standard">
                          Standard Chartered
                        </SelectItem>
                        <SelectItem value="absa">Absa Bank</SelectItem>
                        <SelectItem value="access">Access Bank</SelectItem>
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
            <div className="flex items-center gap-2 text-lg font-medium">
              <Smartphone className="h-5 w-5" />
              Mobile Money (Recommended)
            </div>
            <p className="text-sm text-muted-foreground">
              Mobile money enables faster payouts and is preferred by most
              Zambian users
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
                        <SelectItem value="airtel">Airtel Money</SelectItem>
                        <SelectItem value="zamtel">Zamtel Kwacha</SelectItem>
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
                      <Input placeholder="+260 XXX XXX XXX" {...field} />
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
            <div className="flex items-center gap-2 text-lg font-medium">
              <User className="h-5 w-5" />
              Identity Verification
            </div>

            <FormField
              control={form.control}
              name="nationalIdNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>National ID Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Your National ID number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Required for identity verification and compliance
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
                    <FormLabel>I accept the Terms and Conditions</FormLabel>
                    <FormDescription>
                      By checking this, you agree to our merchant terms and
                      conditions.
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
                      I accept the fee structure (3.5% + K2 per transaction)
                    </FormLabel>
                    <FormDescription>
                      Standard processing fees apply to all transactions.
                      Payouts are processed weekly.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting Up Merchant Account...
              </>
            ) : (
              "Complete Merchant Setup"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

