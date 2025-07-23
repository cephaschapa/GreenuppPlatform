import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const steps = [
  {
    number: 1,
    title: "Create Your Account",
    description:
      "Sign up and create your farm profile with basic information about your operation.",
    icon: "fas fa-user-plus",
    time: "1 minute",
    color: "from-blue-500 to-indigo-600",
  },
  {
    number: 2,
    title: "Map Your First Field",
    description:
      "Import existing field boundaries or easily draw them on our interactive map.",
    icon: "fas fa-map-marked-alt",
    time: "2 minutes",
    color: "from-green-500 to-emerald-600",
  },
  {
    number: 3,
    title: "Add Your Crops",
    description:
      "Enter current and planned crops to receive customized recommendations.",
    icon: "fas fa-seedling",
    time: "2 minutes",
    color: "from-amber-500 to-orange-600",
  },
  {
    number: 4,
    title: "Get AI Recommendations",
    description:
      "Receive instant AI-powered insights tailored to your specific farming conditions.",
    icon: "fas fa-robot",
    time: "Instant",
    color: "from-purple-500 to-violet-600",
  },
];

const demoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  organization: z.string().optional(),
  message: z.string().min(5, "Please enter a message"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});
type DemoFormData = z.infer<typeof demoSchema>;

const GettingStartedSteps = () => {
  const { toast } = useToast ? useToast() : { toast: () => {} };
  const [isSubmitted, setIsSubmitted] = useState(false);
  const form = useForm<DemoFormData>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      organization: "",
      message: "",
      agreeToTerms: false,
    },
  });
  const demoMutation = useMutation({
    mutationFn: async (data: DemoFormData) => {
      const response = await fetch("/api/demo-request/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to submit demo request");
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Request Submitted!",
        description: "We'll be in touch soon to schedule your demo.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });
  const onSubmit = (data: DemoFormData) => {
    demoMutation.mutate(data);
  };
  return (
    <section className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-wider mb-3">
            QUICK SETUP
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-space mb-4">
            Get Started in <span className="text-primary">Minutes</span>
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-sm md:text-base">
            Greenupp is designed for busy farmers. Our streamlined onboarding
            process gets you up and running with minimal effort.
          </p>
        </motion.div>

        {/* Timeline steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line */}
          <div className="absolute left-[15px] md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/80 to-primary/20 transform md:-translate-x-1/2 z-0"></div>

          {/* Steps */}
          <div className="space-y-12 md:space-y-0 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className={`md:grid md:grid-cols-2 md:gap-8 items-center ${
                  index % 2 === 0 ? "" : "md:rtl"
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {/* Step number and content */}
                <div
                  className={`flex md:block ${
                    index % 2 === 0 ? "" : "md:text-right ltr"
                  }`}
                >
                  <div className="relative flex items-center mb-4 md:mb-0">
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-r ${step.color} text-white flex items-center justify-center text-sm font-bold z-20 mr-4 md:mr-0 md:mb-0 md:mx-auto shadow-lg shadow-primary/20`}
                    >
                      {step.number}
                    </div>
                    <h3 className="text-xl font-bold md:hidden">
                      {step.title}
                    </h3>
                  </div>

                  <div className="hidden md:block pt-10">
                    <h3 className="text-xl md:text-2xl font-bold mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">{step.description}</p>
                    <div className="mt-3 inline-flex items-center bg-muted/50 rounded-full px-3 py-1">
                      <i className="fas fa-clock text-primary mr-2 text-xs"></i>
                      <span className="text-sm">{step.time}</span>
                    </div>
                  </div>
                </div>

                {/* Visual element */}
                <div
                  className={`pl-12 md:pl-0 ${index % 2 === 0 ? "md:rtl" : ""}`}
                >
                  <div className="bg-card border border-primary/20 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="md:hidden mb-4">
                      <p className="text-muted-foreground">
                        {step.description}
                      </p>
                      <div className="mt-3 inline-flex items-center bg-muted/50 rounded-full px-3 py-1">
                        <i className="fas fa-clock text-primary mr-2 text-xs"></i>
                        <span className="text-sm">{step.time}</span>
                      </div>
                    </div>

                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-4 text-white md:mx-auto`}
                    >
                      <i className={`${step.icon} text-2xl`}></i>
                    </div>

                    <div className="hidden md:block">
                      <div className="h-4 bg-muted/50 rounded-full w-4/5 mx-auto mb-2"></div>
                      <div className="h-4 bg-muted/50 rounded-full w-3/5 mx-auto mb-2"></div>
                      <div className="h-4 bg-muted/50 rounded-full w-2/3 mx-auto"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our guided setup process walks you through each step with clear
            instructions. No technical expertise required.
          </p>
          {/* Request Demo Form */}
          <div className="mt-12 max-w-xl mx-auto text-left">
            <h3 className="text-xl font-bold mb-4 text-center">
              📞🚜 Request a Demo
            </h3>
            {isSubmitted ? (
              <div className="bg-green-100 dark:bg-green-900 rounded-lg p-6 text-center">
                <p className="text-green-800 dark:text-green-200 text-lg font-semibold mb-2">
                  Thank you for your interest! 🙏
                </p>
                <p className="text-green-700 dark:text-green-300">
                  We'll be in touch soon to schedule your demo.
                </p>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@email.com"
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
                        <FormLabel>Phone (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Phone Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Organization" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your needs or questions..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="mb-0">
                            I agree to the terms and conditions
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={demoMutation.isPending}
                  >
                    {demoMutation.isPending
                      ? "Submitting..."
                      : "🚀 Request Demo"}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GettingStartedSteps;
