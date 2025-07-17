import React from "react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Shield,
  CheckCircle,
  Leaf,
  Award,
  TestTube,
  Scale,
  MapPin,
  Package,
  Calendar,
  TrendingUp,
  Factory,
  Users,
} from "lucide-react";

interface TrustDetailsFormProps {
  farmerProfile?: {
    farmName?: string;
    farmLocation?: string;
    farmSize?: string;
    farmType?: string;
    establishedYear?: number;
  };
}

export function TrustDetailsForm({ farmerProfile }: TrustDetailsFormProps) {
  const form = useFormContext();

  return (
    <div className="space-y-6">
      {/* Farm Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Factory className="h-5 w-5 mr-2" />
            Farm Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="farmName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter farm name"
                      {...field}
                      defaultValue={farmerProfile?.farmName || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    The name of your farm or agricultural business
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="farmLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Farm location"
                      {...field}
                      defaultValue={farmerProfile?.farmLocation || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="farmSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm Size</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 50 hectares"
                      {...field}
                      defaultValue={farmerProfile?.farmSize || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="farmType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select farm type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="organic">Organic</SelectItem>
                      <SelectItem value="conventional">Conventional</SelectItem>
                      <SelectItem value="mixed">Mixed Farming</SelectItem>
                      <SelectItem value="permaculture">Permaculture</SelectItem>
                      <SelectItem value="biodynamic">Biodynamic</SelectItem>
                      <SelectItem value="regenerative">Regenerative</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="farmEstablishedYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Established Year</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 2010"
                      {...field}
                      defaultValue={farmerProfile?.establishedYear || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Certifications and Quality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Award className="h-5 w-5 mr-2" />
            Certifications & Quality
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="organicCertified"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center">
                      <Leaf className="h-4 w-4 mr-2" />
                      Organic Certified
                    </FormLabel>
                    <FormDescription>
                      Product is certified organic
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fairTradeCertified"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center">
                      <Award className="h-4 w-4 mr-2" />
                      Fair Trade Certified
                    </FormLabel>
                    <FormDescription>
                      Product meets fair trade standards
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pesticideFree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center">
                      <TestTube className="h-4 w-4 mr-2" />
                      Pesticide Free
                    </FormLabel>
                    <FormDescription>
                      No pesticides used in production
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gmoFree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center">
                      <Scale className="h-4 w-4 mr-2" />
                      GMO Free
                    </FormLabel>
                    <FormDescription>
                      No genetically modified organisms
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="localSourced"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Locally Sourced
                    </FormLabel>
                    <FormDescription>
                      Product is sourced locally
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="organicCertificationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organic Certification ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Certification number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your organic certification number if applicable
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fairTradeCertificationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fair Trade Certification ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Certification number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your fair trade certification number if applicable
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Product Lifecycle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Calendar className="h-5 w-5 mr-2" />
            Product Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="harvestDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harvest Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    When was this product harvested?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    When does this product expire?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storageConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Storage Conditions</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cool, dry place" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transportMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transport Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transport method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="refrigerated">Refrigerated</SelectItem>
                      <SelectItem value="ambient">
                        Ambient Temperature
                      </SelectItem>
                      <SelectItem value="frozen">Frozen</SelectItem>
                      <SelectItem value="controlled">
                        Controlled Atmosphere
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="packagingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Packaging Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Plastic bags, boxes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="packagingMaterial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Packaging Material</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Recycled paper, biodegradable"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="packagingRecyclable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      Recyclable Packaging
                    </FormLabel>
                    <FormDescription>Packaging is recyclable</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sustainability Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <TrendingUp className="h-5 w-5 mr-2" />
            Sustainability Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="carbonFootprint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carbon Footprint (kg CO2)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 2.5"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Carbon footprint per unit in kg CO2 equivalent
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="waterUsage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Water Usage (liters)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 500"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Water usage per unit in liters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
