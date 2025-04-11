import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Filter, MapPin, Star, Heart } from "lucide-react";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatDistanceToNow } from "date-fns";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MarketplaceListing } from "@shared/schema";

// Marketplace category list
const MARKETPLACE_CATEGORIES = [
  { id: "seeds", name: "Seeds & Plants" },
  { id: "equipment", name: "Farm Equipment" },
  { id: "tools", name: "Tools & Supplies" },
  { id: "fertilizers", name: "Fertilizers & Soil" },
  { id: "livestock", name: "Livestock & Feed" },
  { id: "produce", name: "Farm Produce" },
  { id: "services", name: "Services" },
  { id: "other", name: "Other" },
];

// Mock data - will be replaced with API call
interface FilterState {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  distance: number;
  negotiableOnly: boolean;
}

export default function MarketplacePage() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "",
    minPrice: 0,
    maxPrice: 1000,
    distance: 50,
    negotiableOnly: false,
  });
  const [searchValue, setSearchValue] = useState("");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Fetch marketplace listings
  const {
    data: listings,
    isLoading,
    error,
  } = useQuery<MarketplaceListing[]>({
    queryKey: ["/api/marketplace/listings", filters],
  });

  // Add debug effect to log listing data
  useEffect(() => {
    if (listings) {
      console.log("Listings data from API:", listings);
      
      if (listings.length === 0) {
        toast({
          title: "No listings found",
          description: "No marketplace listings are available at this time.",
          variant: "default"
        });
      }
    }
  }, [listings]);
  // Request user's location for proximity search
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          console.log(
            "User location:",
            position.coords.latitude,
            position.coords.longitude,
          );
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location access denied",
            description: "Enable location services to see listings near you",
            variant: "destructive",
          });
        },
      );
    }
  }, []);

  // Filter handlers
  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchValue }));
  };

  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({ ...prev, category }));
  };

  const handlePriceChange = (values: number[]) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1],
    }));
  };

  const handleDistanceChange = (values: number[]) => {
    setFilters((prev) => ({ ...prev, distance: values[0] }));
  };

  const handleNegotiableChange = (checked: boolean) => {
    setFilters((prev) => ({ ...prev, negotiableOnly: checked }));
  };

  const navigateToDetail = (id: number) => {
    setLocation(`/dashboard/marketplace/${id}`);
  };

  const navigateToCreate = () => {
    setLocation("/dashboard/marketplace/new");
  };

  // Filter real listings from the API
  const displayedListings = listings
    ? listings.filter((listing: MarketplaceListing) => {
        try {
          // Title search filter
          if (
            filters.search &&
            !listing.title.toLowerCase().includes(filters.search.toLowerCase())
          ) {
            return false;
          }
          
          // Category filter
          if (
            filters.category &&
            filters.category !== "all" &&
            listing.category !== filters.category
          ) {
            return false;
          }
          
          // Price filter - handle string or number types
          const listingPrice = typeof listing.price === 'string' 
            ? parseFloat(listing.price) 
            : Number(listing.price);
            
          if (
            isNaN(listingPrice) || 
            listingPrice < filters.minPrice ||
            listingPrice > filters.maxPrice
          ) {
            return false;
          }
          
          // Negotiable only filter - handle boolean or string types
          if (filters.negotiableOnly) {
            const isNegotiable = 
              typeof listing.isNegotiable === 'boolean' 
                ? listing.isNegotiable 
                : listing.isNegotiable === 'true';
                
            if (!isNegotiable) {
              return false;
            }
          }
          
          return true;
        } catch (error) {
          console.error("Error filtering listing:", error, listing);
          return false;
        }
      })
    : [];

  return (
    <DashboardLayout
      title="Marketplace"
      description="Buy and sell agricultural products and services"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">
                Marketplace
              </h1>
              <p className="text-muted-foreground">
                Buy and sell agricultural products and services
              </p>
            </div>
            <Button
              onClick={navigateToCreate}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Listing
            </Button>
          </div>

          {/* Search and filter bar */}
          <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-lg shadow-sm">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search marketplace..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="secondary">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            <div className="flex gap-2">
              <Select
                value={filters.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {MARKETPLACE_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Options</SheetTitle>
                    <SheetDescription>
                      Refine your search with these filters
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4 space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Price Range (USD)</h3>
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>${filters.minPrice}</span>
                        <span>${filters.maxPrice}</span>
                      </div>
                      <Slider
                        defaultValue={[filters.minPrice, filters.maxPrice]}
                        max={1000}
                        step={10}
                        onValueChange={handlePriceChange}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Distance (km)</h3>
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>0 km</span>
                        <span>{filters.distance} km</span>
                      </div>
                      <Slider
                        defaultValue={[filters.distance]}
                        max={100}
                        step={5}
                        onValueChange={handleDistanceChange}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Negotiable Only
                      </span>
                      <Switch
                        checked={filters.negotiableOnly}
                        onCheckedChange={handleNegotiableChange}
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg">
              <p>Error loading marketplace listings. Please try again.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedListings.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">
                    No listings found matching your criteria
                  </p>
                </div>
              ) : (
                displayedListings.map((listing: MarketplaceListing) => (
                  <Card
                    key={listing.id}
                    className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigateToDetail(listing.id)}
                  >
                    <div className="relative h-48 bg-muted">
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <p className="text-gray-500">No image</p>
                        </div>
                      )}
                      {listing.isNegotiable && (
                        <Badge className="absolute top-2 right-2 bg-yellow-500">
                          Negotiable
                        </Badge>
                      )}
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-lg font-semibold line-clamp-1">
                          {listing.title}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast({
                              title: "Added to favorites",
                              description:
                                "Item has been added to your favorites",
                            });
                          }}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription className="flex items-center text-xs">
                        <MapPin className="h-3 w-3 mr-1 inline" />
                        {listing.contactPhone
                          ? `Contact: ${listing.contactPhone}`
                          : "Location not specified"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-bold text-lg">
                          {listing.priceCurrency || "USD"}{" "}
                          {(typeof listing.price === 'string' 
                            ? parseFloat(listing.price) 
                            : Number(listing.price)).toFixed(2)}
                          {listing.priceUnit && (
                            <span className="text-sm font-normal">
                              /{listing.priceUnit}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center">
                          <span className="text-xs">
                            {listing.views || 0} views
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {listing.description}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground">
                      <span>
                        {(() => {
                          try {
                            return formatDistanceToNow(new Date(listing.createdAt), {
                              addSuffix: true,
                            });
                          } catch (error) {
                            console.error("Date formatting error:", error);
                            return "Recently";
                          }
                        })()}
                      </span>
                      <span>{listing.status}</span>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
