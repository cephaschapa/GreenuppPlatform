import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  PlusCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Calendar as CalendarIcon,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { insertCropSchema } from "@shared/schema";
import { Field } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

/** Emoji or icon for crop name/category (Zambia-relevant crops) */
function cropEmoji(name: string, category: string | null): string {
  const n = (name || "").toLowerCase();
  const c = (category || "").toLowerCase();
  if (n.includes("maize")) return "🌽";
  if (n.includes("wheat")) return "🌾";
  if (n.includes("rice")) return "🍚";
  if (n.includes("soy") || n.includes("bean")) return "🫘";
  if (n.includes("groundnut") || n.includes("peanut")) return "🥜";
  if (n.includes("sorghum") || n.includes("millet")) return "🌾";
  if (n.includes("cassava") || c.includes("tuber")) return "🥔";
  if (c.includes("legume")) return "🫘";
  if (c.includes("cereal")) return "🌾";
  return "🌱";
}

// Step indicators
const steps = [
  { id: 1, title: "Crop Data", description: "Basic crop information" },
  { id: 2, title: "Traceability", description: "Blockchain & certification" },
];

// Form schema with validation
const cropFormSchema = insertCropSchema
  .extend({
    fieldSize: z.union([
      z.string(),
      z.number().transform((val) => val.toString()),
    ]),
    sizeUnit: z.string().optional(),
    seedVariety: z.string().optional(),
  })
  .refine(
    (data) => {
      // Additional validation for required fields
      if (!data.name || data.name.trim() === "") {
        return false;
      }
      if (!data.plantingDate) {
        return false;
      }
      if (!data.expectedHarvestDate) {
        return false;
      }
      if (!data.fieldSize || data.fieldSize === "0") {
        return false;
      }
      return true;
    },
    {
      message: "Please fill in all required fields",
      path: ["name"], // This will show the error on the name field
    }
  );

interface AddCropDialogProps {
  field: Field;
  trigger?: React.ReactNode;
}

interface RefCrop { id: number; name: string; category: string | null; }
interface SeedVarietyRow { id: number; name: string; code: string | null; recommended?: boolean; recommendationReasons?: string[]; }

export function AddCropDialog({ field, trigger }: AddCropDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<
    Partial<z.infer<typeof cropFormSchema>>
  >({});
  const [selectedCropId, setSelectedCropId] = useState<number | null>(null);

  const { user } = useAuth();

  const { data: refCrops = [] } = useQuery<RefCrop[]>({
    queryKey: ["/api/reference/crops"],
    queryFn: async () => {
      const r = await fetch("/api/reference/crops", { credentials: "include" });
      if (!r.ok) throw new Error("Failed to fetch crops");
      return r.json();
    },
    enabled: isOpen,
  });

  const { data: seedVarieties = [], isLoading: varietiesLoading } = useQuery<SeedVarietyRow[]>({
    queryKey: ["/api/seed-varieties", field.id, selectedCropId],
    queryFn: async () => {
      const params = new URLSearchParams({ fieldId: String(field.id), cropId: String(selectedCropId) });
      const r = await fetch(`/api/seed-varieties?${params}`, { credentials: "include" });
      if (!r.ok) throw new Error("Failed to fetch varieties");
      return r.json();
    },
    enabled: isOpen && selectedCropId != null && selectedCropId > 0,
  });
  // Form setup
  const form = useForm<z.infer<typeof cropFormSchema>>({
    resolver: zodResolver(cropFormSchema),
    defaultValues: {
      userId: user?.id || 2, // Use actual user ID from auth context
      fieldId: field.id,
      name: "",
      variety: "",
      plantingDate: "",
      expectedHarvestDate: "",
      fieldSize: field.size?.toString() || "0", // Prefill with field size
      sizeUnit: field.sizeUnit || "hectares", // Use field's size unit
      status: "planning",
      notes: field.notes || "", // Prefill with field notes
      batchId: "",
      seedSource: "",
      seedVariety: "",
      organicCertified: false,
      certificationId: "",
      blockchainTxId: "",
      traceabilityQrCode: "",
    },
  });

  // Auto-generate batch ID and reset crop/variety selection when dialog opens
  useEffect(() => {
    if (isOpen) {
      generateBatchId();
    } else {
      setSelectedCropId(null);
    }
  }, [isOpen]);

  // Create crop mutation
  const createCropMutation = useMutation({
    mutationFn: async (data: z.infer<typeof cropFormSchema>) => {
      const response = await fetch("/api/crops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create crop");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Crop created successfully",
        description: `${form.getValues("name")} has been added to ${
          field.name
        }`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/crops"] });
      setIsOpen(false);
      setCurrentStep(1);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create crop",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleNext = async () => {
    // Validate only the fields in the current step
    const step1Fields = [
      "name",
      "variety",
      "plantingDate",
      "expectedHarvestDate",
      "fieldSize",
      "sizeUnit",
      "status",
      "notes",
    ] as const;
    const isValid = await form.trigger(step1Fields);

    if (isValid) {
      const currentData = form.getValues();
      setFormData({ ...formData, ...currentData });
      setCurrentStep(2);
    } else {
      // Show validation errors
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (data: z.infer<typeof cropFormSchema>) => {
    const finalData = { ...formData, ...data };
    createCropMutation.mutate(finalData);
  };

  const generateBatchId = () => {
    const location = field.location?.slice(0, 3).toUpperCase() || "LOC";
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const serial = Math.floor(1000 + Math.random() * 9000);
    const batchId = `${location}-${date}-${serial}`;
    form.setValue("batchId", batchId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-1.5">
            <PlusCircle className="h-4 w-4" />
            Add Crop
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Crop to {field.name}</DialogTitle>
          <DialogDescription>
            Enter the details for your new crop in two simple steps.
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step.id
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-gray-300 text-gray-500"
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    currentStep >= step.id ? "text-foreground" : "text-gray-500"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-400">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.id ? "bg-primary" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              // Only allow form submission on step 2
              if (currentStep !== 2) {
                e.preventDefault();
                return;
              }
              form.handleSubmit(handleSubmit)(e);
            }}
            className="space-y-4"
            noValidate
          >
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Step 1: Crop Data</h3>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop type *</FormLabel>
                      <Select
                        value={selectedCropId != null ? String(selectedCropId) : ""}
                        onValueChange={(v) => {
                          const id = v === "" ? null : Number(v);
                          setSelectedCropId(id);
                          const crop = refCrops.find((c) => c.id === id);
                          if (crop) {
                            field.onChange(crop.name);
                            form.setValue("variety", "");
                            form.setValue("seedVariety", "");
                          }
                        }}
                        required
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select crop (e.g. Maize)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {refCrops.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              <span className="flex items-center gap-2">
                                <span aria-hidden>{cropEmoji(c.name, c.category)}</span>
                                {c.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedCropId != null && (
                  <FormField
                    control={form.control}
                    name="variety"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                          Seed variety (optional)
                        </FormLabel>
                        <Select
                          value={field.value ? String(field.value) : "none"}
                          onValueChange={(v) => {
                            if (v === "none") {
                              field.onChange("");
                              form.setValue("seedVariety", "");
                              return;
                            }
                            const variety = seedVarieties.find((x) => x.name === v || String(x.id) === v);
                            if (variety) {
                              field.onChange(variety.name);
                              form.setValue("seedVariety", variety.code || variety.name);
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="None or pick recommended" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No specific variety</SelectItem>
                            {varietiesLoading ? (
                              <div className="py-2 px-2 text-sm text-muted-foreground flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading…
                              </div>
                            ) : (
                              seedVarieties.map((v) => (
                                <SelectItem key={v.id} value={v.name}>
                                  <span className="flex items-center gap-2">
                                    {v.name}
                                    {v.code && (
                                      <span className="text-muted-foreground">({v.code})</span>
                                    )}
                                    {v.recommended && (
                                      <span className="text-xs text-green-600">Recommended</span>
                                    )}
                                  </span>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="plantingDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Planting date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(new Date(field.value + "T12:00:00"), "PPP")
                                ) : (
                                  <span>Pick date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value + "T12:00:00") : undefined}
                              onSelect={(d) => field.onChange(d ? format(d, "yyyy-MM-dd") : "")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expectedHarvestDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Expected harvest date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(new Date(field.value + "T12:00:00"), "PPP")
                                ) : (
                                  <span>Pick date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value + "T12:00:00") : undefined}
                              onSelect={(d) => field.onChange(d ? format(d, "yyyy-MM-dd") : "")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fieldSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area Under Crop *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Area size"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                            required
                            min="0.1"
                            step="0.1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sizeUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value ? field.value : undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hectares">Hectares</SelectItem>
                            <SelectItem value="acres">Acres</SelectItem>
                            <SelectItem value="sqm">Square Meters</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="planted">Planted</SelectItem>
                          <SelectItem value="growing">Growing</SelectItem>
                          <SelectItem value="harvesting">Harvesting</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes about this crop"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Step 2: Crop Traceability
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="batchId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batch ID</FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input
                              placeholder="Auto-generated on save"
                              disabled
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={generateBatchId}
                            className="h-8 w-8"
                            title="Generate Batch ID"
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormDescription className="text-xs">
                          Format: LOCATION-DATE-SERIAL (auto-generated)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="seedSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seed Source</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value!}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select seed provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="zamseed">
                              Zambia Seed Company Ltd (ZAMSEED)
                            </SelectItem>
                            <SelectItem value="seedco">
                              Seed Co Zambia
                            </SelectItem>
                            <SelectItem value="amiran">
                              Amiran Zambia (Balton CP)
                            </SelectItem>
                            <SelectItem value="pioneer">
                              Pioneer Seeds
                            </SelectItem>
                            <SelectItem value="pannar">Pannar Seed</SelectItem>
                            <SelectItem value="monsanto">Monsanto</SelectItem>
                            <SelectItem value="klein">Klein Karoo</SelectItem>
                            <SelectItem value="starke">Starke Ayres</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="seedVariety"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seed Variety</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value ? field.value : undefined}
                          disabled={!form.watch("seedSource")}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select seed variety" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {form.watch("seedSource") === "zamseed" && (
                              <>
                                <SelectItem value="zms301">
                                  ZMS 301 (Early maturity, drought tolerant)
                                </SelectItem>
                                <SelectItem value="zms405">
                                  ZMS 405 (High-yielding early maturity)
                                </SelectItem>
                                <SelectItem value="zms520">
                                  ZMS 520 (Medium maturity, high yield)
                                </SelectItem>
                                <SelectItem value="zms606">
                                  ZMS 606 (Medium-late maturity, double cobbing)
                                </SelectItem>
                                <SelectItem value="zms620">
                                  ZMS 620 (High yield potential)
                                </SelectItem>
                                <SelectItem value="zms638">
                                  ZMS 638 (High & stable yield potential)
                                </SelectItem>
                                <SelectItem value="zms720">
                                  ZMS 720 (Large cobs, excellent grain quality)
                                </SelectItem>
                                <SelectItem value="zms721">
                                  ZMS 721 (Double cobbing, excellent for silage)
                                </SelectItem>
                                <SelectItem value="gv664">
                                  GV664 (A) (Vitamin A enriched)
                                </SelectItem>
                              </>
                            )}
                            {form.watch("seedSource") === "seedco" && (
                              <>
                                <SelectItem value="sc633">
                                  SC 633 (Drought tolerant, high yielding)
                                </SelectItem>
                                <SelectItem value="sc637">
                                  SC 637 (Excellent cob rot tolerance)
                                </SelectItem>
                                <SelectItem value="sc647">
                                  SC 647 (Heat & drought tolerant)
                                </SelectItem>
                                <SelectItem value="sc657">
                                  SC 657 (Stay-green trait, high yielding)
                                </SelectItem>
                              </>
                            )}
                            {form.watch("seedSource") === "amiran" && (
                              <>
                                <SelectItem value="dominique">
                                  Dominique F1 (Tomato: Resistant to TYLCV)
                                </SelectItem>
                                <SelectItem value="topacio">
                                  Topacio F1 (Tomato: Excellent shelf life)
                                </SelectItem>
                                <SelectItem value="yaara">
                                  Yaara F1 (Tomato: Tolerant to bacterial wilt)
                                </SelectItem>
                                <SelectItem value="karni">
                                  Karni F1 (Tomato: Resistant to TSWV)
                                </SelectItem>
                                <SelectItem value="nemonetta">
                                  Nemo-netta F1 (Tomato: Resistant to nematodes)
                                </SelectItem>
                                <SelectItem value="superelad">
                                  Super Elad F1 (Onion: Resistant to pink root)
                                </SelectItem>
                                <SelectItem value="landini">
                                  Landini F1 (Cabbage: Heat tolerant)
                                </SelectItem>
                              </>
                            )}
                            {form.watch("seedSource") === "pioneer" && (
                              <>
                                <SelectItem value="p1615">P1615</SelectItem>
                                <SelectItem value="p2432">P2432</SelectItem>
                                <SelectItem value="p1758">P1758</SelectItem>
                              </>
                            )}
                            {form.watch("seedSource") === "pannar" && (
                              <>
                                <SelectItem value="pn3r-743">
                                  PN3R-743
                                </SelectItem>
                                <SelectItem value="pn4m-19">PN4M-19</SelectItem>
                                <SelectItem value="pn53">PN53</SelectItem>
                              </>
                            )}
                            {form.watch("seedSource") !== "zamseed" &&
                              form.watch("seedSource") !== "seedco" &&
                              form.watch("seedSource") !== "amiran" &&
                              form.watch("seedSource") !== "pioneer" &&
                              form.watch("seedSource") !== "pannar" &&
                              form.watch("seedSource") && (
                                <SelectItem value="other">
                                  Other Variety
                                </SelectItem>
                              )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="organicCertified"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Organic Certified</FormLabel>
                          <FormDescription>
                            Request organic certification from Greenupp admins
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="certificationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certification ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Will be assigned by admin"
                            disabled
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Assigned after verification by Greenupp admin
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="blockchainTxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blockchain Transaction ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Auto-generated on save"
                            disabled
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Generated by Hyperledger Fabric on submission
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="traceabilityQrCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Traceability QR Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Auto-generated on blockchain registration"
                          disabled
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        QR code will be generated after crop registration
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter className="flex justify-between">
              {currentStep === 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}

              {currentStep === 1 ? (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNext();
                  }}
                  disabled={
                    !form.watch("name") ||
                    !form.watch("plantingDate") ||
                    !form.watch("expectedHarvestDate") ||
                    !form.watch("fieldSize") ||
                    form.watch("fieldSize") === "0"
                  }
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={createCropMutation.isPending}>
                  {createCropMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Crop"
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
