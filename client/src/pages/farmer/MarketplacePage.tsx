import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Filter, MapPin, Star, Heart } from "lucide-react";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
const MOCK_LISTINGS = [
  {
    id: 1,
    title: "High-yield Maize Seeds (10kg)",
    description: "Premium quality maize seeds with 95% germination rate",
    category: "seeds",
    price: 45.99,
    currency: "USD",
    location: "Nairobi, Kenya",
    distance: 3.2,
    sellerName: "Kenya Seed Company",
    images: ["https://placehold.co/300x200/green/white?text=Maize+Seeds"],
    rating: 4.8,
    reviewCount: 156,
    createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    isNegotiable: true,
  },
  {
    id: 2,
    title: "Used Tractor - John Deere 5065E",
    description: "Used John Deere 5065E tractor in excellent condition. 450 hours",
    category: "equipment",
    price: 15000,
    currency: "USD",
    location: "Nakuru, Kenya",
    distance: 12.7,
    sellerName: "Farm Machinery Ltd",
    images: ["https://placehold.co/300x200/darkgreen/white?text=Tractor"],
    rating: 4.5,
    reviewCount: 28,
    createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
    isNegotiable: true,
  },
  {
    id: 3,
    title: "Organic Fertilizer (50kg)",
    description: "100% organic fertilizer, perfect for vegetable gardens",
    category: "fertilizers",
    price: 30,
    currency: "USD",
    location: "Mombasa, Kenya",
    distance: 8.4,
    sellerName: "Organic Farms Kenya",
    images: ["https://placehold.co/300x200/brown/white?text=Organic+Fertilizer"],
    rating: 4.9,
    reviewCount: 74,
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    isNegotiable: false,
  },
  {
    id: 4,
    title: "Drip Irrigation System Kit",
    description: "Complete drip irrigation system for 1/4 acre",
    category: "tools",
    price: 120,
    currency: "USD",
    location: "Kisumu, Kenya",
    distance: 22.8,
    sellerName: "Irrigation Solutions",
    images: ["https://placehold.co/300x200/blue/white?text=Irrigation+System"],
    rating: 4.7,
    reviewCount: 41,
    createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
    isNegotiable: true,
  },
];

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
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Fetch marketplace listings
  const {
    data: listings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/marketplace-listings", filters],
    enabled: false, // Disable until we implement the API
  });

  // Request user's location for proximity search
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          console.log("User location:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location access denied",
            description: "Enable location services to see listings near you",
            variant: "destructive",
          });
        }
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
    setFilters((prev) => ({ ...prev, minPrice: values[0], maxPrice: values[1] }));
  };

  const handleDistanceChange = (values: number[]) => {
    setFilters((prev) => ({ ...prev, distance: values[0] }));
  };

  const handleNegotiableChange = (checked: boolean) => {
    setFilters((prev) => ({ ...prev, negotiableOnly: checked }));
  };

  const navigateToDetail = (id: number) => {
    setLocation(`/farmer/marketplace/${id}`);
  };

  const navigateToCreate = () => {
    setLocation("/farmer/marketplace/new");
  };

  // For development we'll use mock data until the API is connected
  const displayedListings = MOCK_LISTINGS.filter((listing) => {
    if (filters.search && !listing.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.category && listing.category !== filters.category) {
      return false;
    }
    if (listing.price < filters.minPrice || listing.price > filters.maxPrice) {
      return false;
    }
    if (listing.distance > filters.distance) {
      return false;
    }
    if (filters.negotiableOnly && !listing.isNegotiable) {
      return false;
    }
    return true;
  });

  return (
    <DashboardLayout title="Marketplace" description="Buy and sell agricultural products and services">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Marketplace</h1>
              <p className="text-muted-foreground">
                Buy and sell agricultural products and services
              </p>
            </div>
            <Button onClick={navigateToCreate} className="bg-green-600 hover:bg-green-700">
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
                  <SelectItem value="">All Categories</SelectItem>
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
                      <span className="text-sm font-medium">Negotiable Only</span>
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
                  <p className="text-muted-foreground">No listings found matching your criteria</p>
                </div>
              ) : (
                displayedListings.map((listing) => (
                  <Card 
                    key={listing.id} 
                    className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigateToDetail(listing.id)}
                  >
                    <div className="relative h-48 bg-muted">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
                          e.stopPropagation();
                          toast({
                            title: "Added to favorites",
                            description: "Item has been added to your favorites",
                          });
                        }}>
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription className="flex items-center text-xs">
                        <MapPin className="h-3 w-3 mr-1 inline" />
                        {listing.location} · {listing.distance} km away
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-bold text-lg">
                          {listing.currency} {listing.price.toFixed(2)}
                        </p>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          <span className="text-xs">{listing.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {listing.description}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground">
                      <span>{formatDistanceToNow(listing.createdAt, { addSuffix: true })}</span>
                      <span>{listing.sellerName}</span>
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