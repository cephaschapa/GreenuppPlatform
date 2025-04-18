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
  CardFooter,
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
    queryKey: ["/trace", batchId],
    queryFn: async () => {
      if (!batchId) return null;
      const response = await apiRequest("GET", `/trace/${batchId}`);
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
                  placeholder="Enter batch ID (e.g., batch_1a2b3c4d5e6f)"
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
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Seed Source
                        </p>
                        <p>{data.crop.seedSource}</p>
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
                              className={`h-fit ${result.verified ? "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300"}`}
                            >
                              {result.verified ? "Verified" : "Unverified"}
                            </Badge>
                          </div>
                        ),
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
