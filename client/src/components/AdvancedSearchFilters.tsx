import { useState } from "react";
import { X, MapPin, DollarSign, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

interface FilterState {
  minPrice: number;
  maxPrice: number;
  distance: number;
  condition: string;
  negotiableOnly: boolean;
  inStockOnly: boolean;
  sortBy: string;
}

interface AdvancedSearchFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  className?: string;
}

const CONDITIONS = [
  { value: "all", label: "All Conditions" },
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
];

export function AdvancedSearchFilters({
  filters,
  onFiltersChange,
  onReset,
  className: _className,
}: AdvancedSearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  // Check if any filters are active
  const hasActiveFilters =
    localFilters.minPrice > 0 ||
    localFilters.maxPrice < 1000000 ||
    localFilters.distance !== 50 ||
    localFilters.condition !== "all" ||
    localFilters.negotiableOnly ||
    localFilters.inStockOnly ||
    localFilters.sortBy !== "newest";

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  // Apply filters
  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  // Reset filters
  const handleReset = () => {
    const defaultFilters: FilterState = {
      minPrice: 0,
      maxPrice: 1000000,
      distance: 50,
      condition: "all",
      negotiableOnly: false,
      inStockOnly: false,
      sortBy: "newest",
    };
    setLocalFilters(defaultFilters);
    onReset();
  };

  // Handle price range change
  const handlePriceChange = (values: number[]) => {
    handleFilterChange("minPrice", values[0]);
    handleFilterChange("maxPrice", values[1]);
  };

  // Handle distance change
  const handleDistanceChange = (values: number[]) => {
    handleFilterChange("distance", values[0]);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative" size="sm">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              !
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Advanced Search Filters</SheetTitle>
          <SheetDescription>
            Refine your search with these filters
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Price Range */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                Price Range (ZMW)
                {(localFilters.minPrice > 0 ||
                  localFilters.maxPrice < 1000000) && (
                  <Badge
                    variant="outline"
                    className="ml-2 text-xs bg-primary/10 text-primary"
                  >
                    Active
                  </Badge>
                )}
              </h3>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{formatCurrency(localFilters.minPrice)}</span>
              <span>
                {localFilters.maxPrice >= 1000000
                  ? "Any"
                  : formatCurrency(localFilters.maxPrice)}
              </span>
            </div>
            <Slider
              value={[localFilters.minPrice, localFilters.maxPrice]}
              onValueChange={handlePriceChange}
              max={1000}
              step={10}
              className="[&>span:first-child]:bg-primary [&>span:first-child]:h-2 [&>span:first-child]:rounded-md"
            />
          </div>

          <Separator />

          {/* Distance */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                Distance (km)
                {localFilters.distance !== 50 && (
                  <Badge
                    variant="outline"
                    className="ml-2 text-xs bg-primary/10 text-primary"
                  >
                    Active
                  </Badge>
                )}
              </h3>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>0 km</span>
              <span>{localFilters.distance} km</span>
            </div>
            <Slider
              value={[localFilters.distance]}
              onValueChange={handleDistanceChange}
              max={100}
              step={5}
              className="[&>span:first-child]:bg-primary [&>span:first-child]:h-2 [&>span:first-child]:rounded-md"
            />
          </div>

          <Separator />

          {/* Condition */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Condition</h3>
            <Select
              value={localFilters.condition}
              onValueChange={(value) => handleFilterChange("condition", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((condition) => (
                  <SelectItem key={condition.value} value={condition.value}>
                    {condition.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Sort By */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Sort By</h3>
            <Select
              value={localFilters.sortBy}
              onValueChange={(value) => handleFilterChange("sortBy", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Toggle Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Negotiable Only</span>
              <Switch
                checked={localFilters.negotiableOnly}
                onCheckedChange={(checked) =>
                  handleFilterChange("negotiableOnly", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">In Stock Only</span>
              <Switch
                checked={localFilters.inStockOnly}
                onCheckedChange={(checked) =>
                  handleFilterChange("inStockOnly", checked)
                }
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
