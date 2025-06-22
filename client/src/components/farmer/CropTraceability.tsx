import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileCheck, ShieldCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Crop, CropTraceEvent } from "@shared/schema";

// Schema for adding a new trace event
const traceEventSchema = z.object({
  eventType: z.string().min(1, "Event type is required"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  inputMaterials: z.string().optional(),
  outputQuantity: z.string().optional(), // We'll parse this to number
  outputUnit: z.string().optional(),
});

type TraceEventFormValues = z.infer<typeof traceEventSchema>;

interface CropTraceabilityProps {
  cropId: number;
}

export default function CropTraceability({ cropId }: CropTraceabilityProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  // Fetch crop details
  const { data: crop, isLoading: isLoadingCrop } = useQuery<Crop>({
    queryKey: ["/api/crops", cropId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/crops/${cropId}`);
      return await response.json();
    },
  });

  // Fetch trace events
  const { data: events, isLoading: isLoadingEvents } = useQuery<
    CropTraceEvent[]
  >({
    queryKey: ["/api/croptrace", cropId, "trace", "events"],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/croptrace/crops/${cropId}/trace/events`
      );
      return await response.json();
    },
    enabled: !!cropId,
  });

  // Fetch trace history (includes blockchain data)
  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["/api/croptrace", cropId, "trace", "history"],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/croptrace/crops/${cropId}/trace/history`
      );
      return await response.json();
    },
    enabled: !!cropId,
  });

  // Mutation to initialize traceability
  const initializeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST",
        `/api/croptrace/crops/${cropId}/trace/initialize`,
        {
          name: crop?.name,
          variety: crop?.variety,
          status: crop?.status,
        }
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Traceability Initialized",
        description: "This crop is now tracked on the blockchain!",
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/crops", cropId] });
      queryClient.invalidateQueries({
        queryKey: ["/api/croptrace", cropId, "trace", "events"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/croptrace", cropId, "trace", "history"],
      });
    },
    onError: (error) => {
      toast({
        title: "Initialization Failed",
        description:
          "Could not initialize blockchain traceability. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to add a trace event
  const addEventMutation = useMutation({
    mutationFn: async (data: TraceEventFormValues) => {
      // Convert numeric string inputs to numbers
      const formattedData = {
        ...data,
        outputQuantity: data.outputQuantity
          ? parseFloat(data.outputQuantity)
          : undefined,
      };

      const response = await apiRequest(
        "POST",
        `/api/croptrace/crops/${cropId}/trace/events`,
        formattedData
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Event Recorded",
        description: "The event has been recorded on the blockchain!",
      });
      setIsAddEventOpen(false);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["/api/croptrace", cropId, "trace", "events"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/croptrace", cropId, "trace", "history"],
      });
    },
    onError: (error) => {
      toast({
        title: "Recording Failed",
        description: "Could not record the event. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form setup for adding events
  const form = useForm<TraceEventFormValues>({
    resolver: zodResolver(traceEventSchema),
    defaultValues: {
      eventType: "",
      description: "",
      inputMaterials: "",
      outputQuantity: "",
      outputUnit: "",
    },
  });

  // Function to handle form submission
  const onSubmit = (data: TraceEventFormValues) => {
    addEventMutation.mutate(data);
  };

  if (isLoadingCrop) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading crop details...</span>
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="p-4">
        <AlertTriangle className="h-6 w-6 text-yellow-500 mb-2" />
        <p>Crop not found. Please select a valid crop.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck className="mr-2 h-6 w-6 text-green-500" />
            Blockchain Traceability
          </CardTitle>
          <CardDescription>
            Track your crop's journey on the blockchain for enhanced
            transparency and trust
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">
                  {crop.name} {crop.variety ? `(${crop.variety})` : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {crop.status}
                </p>
              </div>
              <Badge
                variant={crop.batchId ? "secondary" : "outline"}
                className={
                  crop.batchId
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    : ""
                }
              >
                {crop.batchId ? "Blockchain Enabled" : "Not Tracked"}
              </Badge>
            </div>

            {crop.batchId ? (
              <div className="grid gap-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Batch ID:</p>
                    <p className="font-mono">{crop.batchId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Transaction ID:</p>
                    <p className="font-mono text-xs truncate">
                      {crop.blockchainTxId || "N/A"}
                    </p>
                  </div>
                </div>

                {crop.traceabilityQrCode && (
                  <div className="mt-2 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Traceability QR Code:
                    </p>
                    <img
                      src={crop.traceabilityQrCode}
                      alt="Traceability QR Code"
                      className="h-32 w-32 mx-auto border rounded-md"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Scan to verify authenticity
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="mb-4">
                  This crop is not yet tracked on the blockchain.
                </p>
                <Button
                  onClick={() => initializeMutation.mutate()}
                  disabled={initializeMutation.isPending}
                >
                  {initializeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    "Enable Blockchain Traceability"
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {crop.batchId && (
        <Tabs defaultValue="events">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Crop Events</h3>
              <Button size="sm" onClick={() => setIsAddEventOpen(true)}>
                Record New Event
              </Button>
            </div>

            {isLoadingEvents ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">Loading events...</span>
              </div>
            ) : events && events.length > 0 ? (
              <div className="space-y-2">
                {events.map((event) => (
                  <Card key={event.id} className="overflow-hidden">
                    <div className="border-l-4 border-green-500">
                      <CardHeader className="py-3">
                        <div className="flex justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {event.eventType}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {new Date(event.eventDate).toLocaleDateString()}{" "}
                              at{" "}
                              {new Date(event.eventDate).toLocaleTimeString()}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary" className="h-fit">
                            {event.blockchainTxId ? "Verified" : "Pending"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-sm">{event.description}</p>

                        {(event.inputMaterials || event.outputQuantity) && (
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            {event.inputMaterials && (
                              <div>
                                <span className="font-semibold">Inputs: </span>
                                {event.inputMaterials}
                              </div>
                            )}
                            {event.outputQuantity && (
                              <div>
                                <span className="font-semibold">Output: </span>
                                {event.outputQuantity} {event.outputUnit || ""}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="py-2 text-xs">
                        <span className="text-muted-foreground">TX: </span>
                        <code className="ml-1 font-mono truncate">
                          {event.blockchainTxId || "Processing..."}
                        </code>
                      </CardFooter>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border rounded-md bg-muted/30">
                <p className="text-muted-foreground">No events recorded yet.</p>
                <Button variant="link" onClick={() => setIsAddEventOpen(true)}>
                  Record your first event
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            <h3 className="text-lg font-semibold">Blockchain Verification</h3>

            {isLoadingHistory ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">Loading blockchain data...</span>
              </div>
            ) : history?.blockchainHistory &&
              history.blockchainHistory.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-md border bg-muted/30 p-4">
                  <h4 className="font-semibold mb-2">Verification Status</h4>
                  <div className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                    <span>All transactions verified on blockchain</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Anyone can verify this crop's authenticity by scanning the
                    QR code or entering the batch ID
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Blockchain Transactions</h4>
                  {history.blockchainHistory.map(
                    (entry: any, index: number) => (
                      <div
                        key={index}
                        className="rounded-md border p-3 text-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{entry.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant="outline" className="h-fit">
                            TX
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">
                            Transaction ID:
                          </p>
                          <code className="text-xs font-mono">
                            {entry.txId}
                          </code>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border rounded-md bg-muted/30">
                <p className="text-muted-foreground">
                  No blockchain data available yet.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Record events to create a blockchain history for this crop.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Dialog for adding new event */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Trace Event</DialogTitle>
            <DialogDescription>
              Record an event in this crop's lifecycle. This information will be
              stored on the blockchain for verification.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planting">Planting</SelectItem>
                        <SelectItem value="fertilizing">Fertilizing</SelectItem>
                        <SelectItem value="pesticide_application">
                          Pesticide Application
                        </SelectItem>
                        <SelectItem value="irrigation">Irrigation</SelectItem>
                        <SelectItem value="weeding">Weeding</SelectItem>
                        <SelectItem value="harvesting">Harvesting</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="packaging">Packaging</SelectItem>
                        <SelectItem value="shipping">Shipping</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the event in detail..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="inputMaterials"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Input Materials (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Fertilizer name, seeds"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="outputQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="outputUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit (Optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="ton">ton</SelectItem>
                            <SelectItem value="lb">lb</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="l">liter</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="units">units</SelectItem>
                            <SelectItem value="bags">bags</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddEventOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addEventMutation.isPending}>
                  {addEventMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    "Record Event"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
