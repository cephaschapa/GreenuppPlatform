import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle2,
  Users,
  Leaf,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Mail,
  User,
  Building,
  MapPin,
  Phone,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const waitlistSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  organization: z.string().optional(),
  userType: z.enum(["farmer", "buyer", "supplier", "distributor", "other"]),
  location: z.string().min(2, "Please enter your location"),
  farmSize: z.string().optional(),
  primaryCrops: z.string().optional(),
  experience: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  interests: z.array(z.string()).min(1, "Please select at least one interest"),
  additionalInfo: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
  subscribeUpdates: z.boolean().default(true),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

const features = [
  {
    icon: Leaf,
    title: "Smart Crop Management",
    description: "AI-powered insights for optimal crop planning and monitoring",
  },
  {
    icon: Shield,
    title: "Blockchain Traceability",
    description: "Transparent supply chain from farm to consumer",
  },
  {
    icon: Globe,
    title: "Global Marketplace",
    description: "Connect with buyers and suppliers worldwide",
  },
  {
    icon: Zap,
    title: "Real-time Analytics",
    description: "Data-driven decisions for maximum yield and profit",
  },
];

const interestOptions = [
  { id: "crop-management", label: "Crop Management & Planning" },
  { id: "marketplace", label: "Marketplace Trading" },
  { id: "traceability", label: "Blockchain Traceability" },
  { id: "analytics", label: "Farm Analytics & Reports" },
  { id: "weather", label: "Weather & Climate Tools" },
  { id: "finance", label: "Financial Management" },
  { id: "social", label: "Farming Community & Social Features" },
  { id: "mobile", label: "Mobile App Features" },
];

export default function TestingWaitlistPage() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const form = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      organization: "",
      userType: "farmer",
      location: "",
      farmSize: "",
      primaryCrops: "",
      experience: "intermediate",
      interests: [],
      additionalInfo: "",
      agreeToTerms: false,
      subscribeUpdates: true,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: WaitlistFormData) => {
      const response = await apiRequest("POST", "/api/waitlist/register", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Registration Successful!",
        description:
          "You've been added to our testing waitlist. We'll be in touch soon!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WaitlistFormData) => {
    registerMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <Navbar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <main className="container max-w-4xl mx-auto py-16">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Welcome to the GreenUpp Family! 🌱
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Thank you for joining our testing waitlist. We're excited to have
              you as part of our journey to revolutionize agriculture
              technology.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-md mx-auto">
              <h3 className="font-semibold text-lg mb-3">What's Next?</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>📧 You'll receive a confirmation email shortly</p>
                <p>🚀 We'll notify you when testing begins</p>
                <p>🎁 Early access to all premium features</p>
                <p>🤝 Direct line to our development team</p>
              </div>
            </div>
            <Button
              onClick={() => (window.location.href = "/")}
              className="mt-6"
            >
              Return to Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main className="container max-w-6xl mx-auto py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge
            variant="outline"
            className="mb-4 bg-green-100 text-green-800 border-green-300"
          >
            <Users className="w-4 h-4 mr-1" />
            Join the Testing Program
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Be First to Experience the Future of Agriculture
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join our exclusive testing program and help shape the next
            generation of agricultural technology. Get early access to
            innovative features and direct input into product development.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Registration Form */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">
              Join the Testing Waitlist
            </CardTitle>
            <CardDescription>
              Fill out the form below to register for early access to GreenUpp's
              revolutionary agricultural platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Professional Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="userType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>I am a *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="farmer">
                                Farmer/Grower
                              </SelectItem>
                              <SelectItem value="buyer">
                                Buyer/Retailer
                              </SelectItem>
                              <SelectItem value="supplier">
                                Supplier/Vendor
                              </SelectItem>
                              <SelectItem value="distributor">
                                Distributor
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
                      name="organization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization/Company</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Farm name or company"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location *</FormLabel>
                          <FormControl>
                            <Input placeholder="City, Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Level *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select experience level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">
                                Beginner (0-2 years)
                              </SelectItem>
                              <SelectItem value="intermediate">
                                Intermediate (3-5 years)
                              </SelectItem>
                              <SelectItem value="advanced">
                                Advanced (6-10 years)
                              </SelectItem>
                              <SelectItem value="expert">
                                Expert (10+ years)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Agricultural Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Leaf className="w-5 h-5" />
                    Agricultural Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="farmSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Farm Size</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., 10 hectares, 25 acres"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            If applicable, specify size and unit
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="primaryCrops"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Crops</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Maize, Tomatoes, Coffee"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Main crops you grow or are interested in
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="interests"
                    render={() => (
                      <FormItem>
                        <FormLabel>
                          What features are you most interested in? *
                        </FormLabel>
                        <FormDescription>
                          Select all that apply - this helps us prioritize
                          development
                        </FormDescription>
                        <div className="grid md:grid-cols-2 gap-3">
                          {interestOptions.map((option) => (
                            <FormField
                              key={option.id}
                              control={form.control}
                              name="interests"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={option.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          option.id
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                option.id,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== option.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Additional Information */}
                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Information</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your specific needs, challenges, or what you're hoping to achieve with GreenUpp..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional: Share any specific challenges or requirements
                      </FormDescription>
                    </FormItem>
                  )}
                />

                {/* Agreements */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the terms and conditions *
                          </FormLabel>
                          <FormDescription>
                            By joining the testing program, you agree to provide
                            feedback and understand this is pre-release
                            software.
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subscribeUpdates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Subscribe to product updates and news
                          </FormLabel>
                          <FormDescription>
                            Get notified about new features, testing phases, and
                            platform updates.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full md:w-auto"
                    size="lg"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      "Registering..."
                    ) : (
                      <>
                        Join the Waitlist
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                    We respect your privacy and will never share your
                    information with third parties.
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
