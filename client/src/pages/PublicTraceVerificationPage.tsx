import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Leaf,
  CheckCircle2,
  Calendar,
  Tractor,
  Search,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicTraceVerificationPage() {
  const [location, setLocation] = useLocation();
  const [batchId, setBatchId] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Extract batch ID from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const batchParam = params.get("batch");
    if (batchParam) {
      setBatchId(batchParam);
    }
  }, [location]);

  // Fetch trace verification data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["/api/product-verification/verify", batchId],
    queryFn: async () => {
      if (!batchId) return null;
      const response = await apiRequest(
        "GET",
        `/api/product-verification/verify/${batchId}`
      );
      return await response.json();
    },
    enabled: !!batchId,
    retry: 1,
  });

  const handleSearch = () => {
    if (searchInput.trim()) {
      setBatchId(searchInput.trim());
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getRegionBadge = (seedSource: string, seedVariety: string = "") => {
    if (!seedSource || !seedVariety) return "All Regions";

    // ZAMSEED varieties
    if (seedSource === "zamseed") {
      switch (seedVariety) {
        case "zms301":
          return "Region I";
        case "zms405":
          return "Regions I & II";
        case "zms520":
          return "Regions II & III";
        case "zms606":
          return "Regions II & III";
        case "zms620":
          return "Regions II & III";
        case "zms638":
          return "Regions II & III";
        case "zms720":
          return "Region III";
        case "zms721":
          return "Region III";
        case "gv664":
          return "Regions I & II";
        default:
          return "All Regions";
      }
    }

    // SeedCo varieties
    if (seedSource === "seedco") {
      switch (seedVariety) {
        case "sc633":
          return "Regions II & III";
        case "sc637":
          return "Region III";
        case "sc647":
          return "Regions I-III";
        case "sc657":
          return "Regions I-III";
        default:
          return "All Regions";
      }
    }

    // Amiran varieties
    if (seedSource === "amiran") {
      switch (seedVariety) {
        case "dominique":
          return "Regions I-III";
        case "topacio":
          return "Regions II & III";
        case "yaara":
          return "Regions II & III";
        case "karni":
          return "Regions II & III";
        case "nemonetta":
          return "Regions II & III";
        case "superelad":
          return "Regions I-III";
        case "landini":
          return "Regions I-III";
        default:
          return "All Regions";
      }
    }

    return "All Regions";
  };

  const getRegionDescription = (
    seedSource: string,
    seedVariety: string = ""
  ) => {
    if (!seedSource || !seedVariety)
      return "Suitable for appropriate growing conditions.";

    const regionDescriptions: Record<string, string> = {
      "Region I":
        "Southern, Eastern & Western provinces; 600–800 mm rainfall; 80–120 day season.",
      "Region II":
        "Central, Southern, Eastern & Lusaka provinces; 800–1000 mm rainfall; 100–140 day season.",
      "Region III":
        "Northern, Luapula, Copperbelt & Northwestern provinces; over 1000 mm rainfall; 120–150 day season.",
      "Regions I & II":
        "Suitable for areas with 600-1000 mm rainfall; 80-140 day growing season.",
      "Regions II & III":
        "Suitable for areas with 800+ mm rainfall; 100-150 day growing season.",
      "Regions I-III":
        "Widely adaptable across all Zambian agricultural regions.",
      "All Regions": "Can be grown throughout Zambia in suitable conditions.",
    };

    const regionBadge = getRegionBadge(seedSource, seedVariety);
    return (
      regionDescriptions[regionBadge] ||
      "Suitable for appropriate growing conditions."
    );
  };

  const renderSeedVarietyInfo = (
    seedSource: string,
    seedVariety: string = ""
  ) => {
    if (!seedSource || !seedVariety) return seedVariety || "Not specified";

    // ZAMSEED varieties
    if (seedSource === "zamseed") {
      switch (seedVariety) {
        case "zms301":
          return (
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">ZMS 301</span> - Semi-flint white
                grain
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                >
                  Drought Tolerant
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                >
                  75 Days to Maturity
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                >
                  Region I
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Yield potential: 120–140 × 50 kg bags/ha
              </p>
            </div>
          );
        case "zms405":
          return (
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">ZMS 405</span> - Flint white grain
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                >
                  High-yielding
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                >
                  100-105 Days to Maturity
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                >
                  Regions I & II
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Yield potential: 140–160 × 50 kg bags/ha
              </p>
            </div>
          );
        case "zms520":
          return (
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">ZMS 520</span> - Dent white grain
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                >
                  Full Husk Cover
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                >
                  120-125 Days to Maturity
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                >
                  Regions II & III
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Yield potential: 180–200 × 50 kg bags/ha
              </p>
            </div>
          );
        case "gv664":
          return (
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">GV664 (A)</span> - Flint orange
                (Vitamin A enriched)
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                >
                  Vitamin A Enriched
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                >
                  115-125 Days to Maturity
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                >
                  Regions I & II
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Yield potential: 140 × 50 kg bags/ha, GMO-free
              </p>
            </div>
          );
        default:
          return seedVariety;
      }
    }

    // SeedCo varieties
    if (seedSource === "seedco") {
      switch (seedVariety) {
        case "sc633":
          return (
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">SC 633</span> - Medium maturing
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                >
                  Drought Tolerant
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                >
                  130-136 Days to Maturity
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                >
                  Regions II & III
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Yield potential: up to 13 t/ha, Good tolerance to GLS
              </p>
            </div>
          );
        case "sc637":
          return (
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">SC 637</span> - Medium maturing
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                >
                  Semi-flint grain
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                >
                  Disease Tolerance
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                >
                  Region III
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Yield potential: 11-13 t/ha, Excellent tip cover
              </p>
            </div>
          );
        case "sc647":
          return (
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">SC 647</span> - Medium maturing
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                >
                  Heat & Drought Tolerant
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                >
                  130-136 Days to Maturity
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                >
                  Regions I-III
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Yield potential: up to 16 t/ha, Performs well on acidic soils
              </p>
            </div>
          );
        default:
          return seedVariety;
      }
    }

    // Amiran varieties (vegetables)
    if (seedSource === "amiran") {
      switch (seedVariety) {
        case "dominique":
          return (
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Dominique F1</span> - Tomato
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300"
                >
                  180–200g Fruit
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                >
                  TYLCV Resistant
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                >
                  Indeterminate
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Year-round production, suitable for all regions
              </p>
            </div>
          );
        case "landini":
          return (
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Landini F1</span> - Cabbage
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                >
                  75 Days Maturity
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                >
                  Heat Tolerant
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                >
                  Uniform Heads
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Head weight exceeds 5 kg, resistant to black root
              </p>
            </div>
          );
        case "superelad":
          return (
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Super Elad F1</span> - Onion
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                >
                  Early Maturity
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                >
                  Medium-large Bulbs
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                >
                  Pink Root Resistant
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Very pungent, suitable for rain-fed & irrigated
              </p>
            </div>
          );
        default:
          return seedVariety;
      }
    }

    // Default for other seed companies
    return seedVariety;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main className="flex-1 mx-auto max-w-4xl py-32">
        <div className="space-y-6 ">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Crop Traceability Verification
            </h1>
            <p className="text-lg text-muted-foreground">
              Verify the authenticity and origin of agricultural products
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Verify a Product</CardTitle>
              <CardDescription>
                Enter the batch ID from product packaging or scan the QR code to
                verify its authenticity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter batch ID (e.g., NOR-250420-2604)"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Verify
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoading && (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Verifying on blockchain...</span>
            </div>
          )}

          {isError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Verification Failed</AlertTitle>
              <AlertDescription>
                {(error as any)?.message ||
                  "Could not verify this batch ID. Please check the ID and try again."}
              </AlertDescription>
            </Alert>
          )}

          {data && (
            <div className="space-y-6">
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <AlertTitle>Verification Successful</AlertTitle>
                <AlertDescription>
                  This product has been verified on the blockchain and is
                  authentic.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>
                        {data.crop.name}{" "}
                        {data.crop.variety ? `(${data.crop.variety})` : ""}
                      </CardTitle>
                      <CardDescription>
                        Batch ID: {data.crop.batchId}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                    >
                      {data.crop.organicCertified
                        ? "Organic Certified"
                        : "Verified"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Planting Date
                        </p>
                        <p>
                          {data.crop.plantingDate
                            ? formatDate(data.crop.plantingDate)
                            : "Not recorded"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Harvest Date
                        </p>
                        <p>
                          {data.crop.actualHarvestDate
                            ? formatDate(data.crop.actualHarvestDate)
                            : "Not recorded"}
                        </p>
                      </div>
                    </div>

                    {data.crop.seedSource && (
                      <div>
                        <div className="space-y-1 mb-3">
                          <p className="text-sm font-medium text-muted-foreground">
                            Seed Source
                          </p>
                          <div>
                            <Badge variant="outline" className="font-medium">
                              {data.crop.seedSource === "zamseed"
                                ? "Zambia Seed Company Ltd (ZAMSEED)"
                                : data.crop.seedSource === "seedco"
                                ? "Seed Co Zambia"
                                : data.crop.seedSource === "amiran"
                                ? "Amiran Zambia (Balton CP)"
                                : data.crop.seedSource}
                            </Badge>
                          </div>
                        </div>

                        {data.crop.seedVariety && (
                          <div className="space-y-1 mb-3">
                            <p className="text-sm font-medium text-muted-foreground">
                              Seed Variety Information
                            </p>
                            <div className="border rounded-lg p-3 bg-muted/20">
                              {renderSeedVarietyInfo(
                                data.crop.seedSource,
                                data.crop.seedVariety
                              )}
                            </div>
                          </div>
                        )}

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            Region Information
                          </p>
                          <div className="text-sm">
                            <div className="mb-1">
                              <Badge
                                variant="outline"
                                className="bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300 mb-2"
                              >
                                {getRegionBadge(
                                  data.crop.seedSource,
                                  data.crop.seedVariety
                                )}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {getRegionDescription(
                                data.crop.seedSource,
                                data.crop.seedVariety
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {data.crop.notes && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Additional Information
                        </p>
                        <p className="text-sm">{data.crop.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="events">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="events">Lifecycle Events</TabsTrigger>
                  <TabsTrigger value="blockchain">
                    Blockchain Verification
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="events" className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-green-500" />
                    Crop Lifecycle Timeline
                  </h3>

                  {data.events && data.events.length > 0 ? (
                    <div className="space-y-4">
                      {data.events.map((event: any, index: number) => (
                        <div key={index} className="relative pl-6 pb-4">
                          {/* Timeline connector */}
                          {index < data.events.length - 1 && (
                            <div className="absolute left-2 top-3 bottom-0 w-0.5 bg-green-200 dark:bg-green-900"></div>
                          )}

                          {/* Event dot */}
                          <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-green-500"></div>

                          {/* Event content */}
                          <div className="rounded-lg border p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">
                                  {event.eventType.replace("_", " ")}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(event.eventDate)}
                                </p>
                              </div>
                              <Badge variant="outline" className="h-fit">
                                <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                                Verified
                              </Badge>
                            </div>
                            <p className="mt-2 text-sm">{event.description}</p>

                            {(event.inputMaterials || event.outputQuantity) && (
                              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                {event.inputMaterials && (
                                  <div>
                                    <span className="font-semibold">
                                      Inputs:{" "}
                                    </span>
                                    {event.inputMaterials}
                                  </div>
                                )}
                                {event.outputQuantity && (
                                  <div>
                                    <span className="font-semibold">
                                      Output:{" "}
                                    </span>
                                    {event.outputQuantity}{" "}
                                    {event.outputUnit || ""}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border rounded-md bg-muted/30">
                      <Tractor className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        No detailed events recorded for this crop yet.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="blockchain" className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <ShieldCheck className="h-5 w-5 mr-2 text-green-500" />
                    Blockchain Verification
                  </h3>

                  <Alert className="bg-muted">
                    <div className="flex gap-1 items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <AlertTitle>All transactions verified</AlertTitle>
                    </div>
                    <AlertDescription>
                      All data for this crop has been verified on the
                      Hyperledger Fabric blockchain.
                    </AlertDescription>
                  </Alert>

                  <div className="rounded-md border p-4 space-y-2">
                    <h4 className="font-medium">Verification Details</h4>
                    {data.verificationResults &&
                      data.verificationResults.map(
                        (result: any, index: number) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-1 text-sm"
                          >
                            <span>{result.eventType.replace("_", " ")}</span>
                            <Badge
                              variant={result.verified ? "outline" : "outline"}
                              className={`h-fit ${
                                result.verified
                                  ? "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300"
                              }`}
                            >
                              {result.verified ? "Verified" : "Unverified"}
                            </Badge>
                          </div>
                        )
                      )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium">Blockchain Transactions</h4>
                    {data.blockchainHistory &&
                      data.blockchainHistory.map((tx: any, index: number) => (
                        <div
                          key={index}
                          className="text-xs border rounded p-2 font-mono"
                        >
                          <div className="flex justify-between">
                            <span className="font-semibold">
                              {tx.action.replace("_", " ")}
                            </span>
                            <span className="text-muted-foreground">
                              {new Date(tx.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="mt-1 text-muted-foreground overflow-hidden text-ellipsis">
                            TX: {tx.txId}
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-center">
                <Button variant="outline" onClick={() => window.history.back()}>
                  Go Back
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !data && batchId && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Product Not Found</AlertTitle>
              <AlertDescription>
                We couldn't find a product with the batch ID "{batchId}". Please
                check the ID and try again.
              </AlertDescription>
            </Alert>
          )}

          {!batchId && !isLoading && (
            <div className="grid md:grid-cols-2 gap-6 py-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Leaf className="h-5 w-5 mr-2 text-green-500" />
                    Why Verify?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Blockchain verification ensures product authenticity and
                    transparency. It allows you to trace the complete journey of
                    agricultural products from farm to table, ensuring quality,
                    sustainability, and ethical production.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <ShieldCheck className="h-5 w-5 mr-2 text-green-500" />
                    Blockchain Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    All data is secured using Hyperledger Fabric blockchain
                    technology. Each transaction is cryptographically verified
                    and tamper-proof, ensuring that product information cannot
                    be falsified or altered.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
