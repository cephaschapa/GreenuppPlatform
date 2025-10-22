/**
 * Product Verification Workflow Guide
 * Helps farmers understand how to use the traceability system
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sprout,
  QrCode,
  Download,
  Package,
  Store,
  CheckCircle2,
  X,
} from "lucide-react";
import { useState } from "react";

export function ProductVerificationGuide() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-full">
                <QrCode className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  New to Product Verification?
                </p>
                <p className="text-xs text-muted-foreground">
                  Learn how to use QR codes for traceability
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
              Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Product Verification Guide</CardTitle>
            <CardDescription>
              Follow these steps to enable traceability for your products
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Workflow Steps */}
        <div className="space-y-4">
          <WorkflowStep
            number={1}
            icon={<Sprout className="h-5 w-5" />}
            title="Create Your Crop"
            description="Register your crop in the system with all relevant details"
            details={[
              "Navigate to 'My Crops' page",
              "Click 'Add New Crop'",
              "Fill in crop name, variety, field, and planting date",
              "Save your crop",
            ]}
          />

          <WorkflowStep
            number={2}
            icon={<QrCode className="h-5 w-5" />}
            title="QR Code Auto-Generation"
            description="A unique QR code and batch ID are automatically created"
            details={[
              "QR code is generated when crop status changes to 'Planted'",
              "Each crop gets a unique batch ID",
              "QR code is stored in the system",
              "You can regenerate if needed",
            ]}
          />

          <WorkflowStep
            number={3}
            icon={<Download className="h-5 w-5" />}
            title="Download & Print"
            description="Get your QR code ready for physical products"
            details={[
              "Go to Product Verification page",
              "Find your crop in the list",
              "Click 'View QR Code'",
              "Download high-resolution image",
              "Print on labels or stickers (recommended: 2cm x 2cm minimum)",
            ]}
          />

          <WorkflowStep
            number={4}
            icon={<Package className="h-5 w-5" />}
            title="Attach to Packaging"
            description="Apply QR codes to your harvest"
            details={[
              "Attach QR labels to product packaging",
              "Place in visible, easily scannable location",
              "Ensure QR code is not damaged or obscured",
              "One QR code per batch/harvest",
            ]}
          />

          <WorkflowStep
            number={5}
            icon={<Store className="h-5 w-5" />}
            title="List on Marketplace"
            description="Connect your traceable products to sales"
            details={[
              "Create marketplace listing",
              "Link listing to your crop using batch ID",
              "Mention traceability in product description",
              "Buyers can verify authenticity",
            ]}
          />

          <WorkflowStep
            number={6}
            icon={<CheckCircle2 className="h-5 w-5" />}
            title="Consumers Verify"
            description="Buyers scan and verify your products"
            details={[
              "Consumers scan QR code with camera",
              "They see product origin, farmer info, and growing history",
              "Each scan is tracked for analytics",
              "Builds trust and premium value",
            ]}
          />
        </div>

        {/* FAQs */}
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-3">Frequently Asked Questions</h3>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-sm">
                When should I print my QR codes?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Print QR codes after harvest, before packaging for sale. This
                ensures the QR code has complete crop information including
                harvest date and final yield.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-sm">
                Can I use one QR code for multiple products?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                One QR code per batch/harvest is recommended. If you're selling
                from the same harvest, one QR code is fine. Different harvests
                should have different QR codes for accurate traceability.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-sm">
                What if my QR code gets damaged?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                You can regenerate and reprint QR codes anytime from the Product
                Verification page. The batch ID remains the same, so all
                traceability data is preserved.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-sm">
                How do I track how many people scanned my QR code?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Scan analytics are automatically tracked. Check the 'Analytics'
                tab in your crop details to see total scans, scan locations, and
                trends over time.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-sm">
                Does verification cost anything?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                No! QR code generation, traceability tracking, and consumer
                verification are completely free. It's a built-in feature to
                help you build trust with buyers.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Benefits Section */}
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">
            Benefits of Using Traceability
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>✅ Build consumer trust and brand reputation</li>
            <li>✅ Command premium prices for verified products</li>
            <li>✅ Stand out in the marketplace</li>
            <li>✅ Track product engagement and reach</li>
            <li>✅ Meet buyer requirements for transparency</li>
            <li>✅ Protect against counterfeit claims</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

interface WorkflowStepProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
}

function WorkflowStep({
  number,
  icon,
  title,
  description,
  details,
}: WorkflowStepProps) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm shrink-0">
          {number}
        </div>
        {number < 6 && <div className="w-0.5 h-full bg-border mt-2" />}
      </div>
      <div className="flex-1 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-primary">{icon}</div>
          <h4 className="font-semibold text-sm">{title}</h4>
        </div>
        <p className="text-xs text-muted-foreground mb-2">{description}</p>
        <ul className="text-xs text-muted-foreground space-y-1 ml-7">
          {details.map((detail, idx) => (
            <li key={idx}>• {detail}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
