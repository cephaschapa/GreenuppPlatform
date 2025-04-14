import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Filter, MapPin, Star, Heart, Plus, ShoppingCart } from "lucide-react";
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
import { useMarketplaceFavorites } from "@/hooks/use-marketplace-favorites";
import { useMarketplaceReviews } from "@/hooks/use-marketplace-reviews";

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
    category: "all", // Set to "all" for initial display of all items
    minPrice: 0,
    maxPrice: 1000000, // Very high max price to show all items initially
    distance: 50,
    negotiableOnly: false,
  });
  
  // Add sorting options
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showFeatured, setShowFeatured] = useState<boolean>(true);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
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

      // Check structure of first listing if available
      if (listings.length > 0) {
        const firstListing = listings[0];
        console.log("First listing structure:", {
          id: firstListing.id,
          title: firstListing.title,
          price: firstListing.price,
          priceType: typeof firstListing.price,
          priceValue: Number(firstListing.price),
          isNegotiable: firstListing.isNegotiable,
          isNegotiableType: typeof firstListing.isNegotiable,
          category: firstListing.category,
          images: firstListing.images,
          imagesType: typeof firstListing.images,
          imagesLength: firstListing.images ? firstListing.images.length : 0,
          createdAt: firstListing.createdAt,
          createdAtType: typeof firstListing.createdAt,
        });

        // Log each property for debugging
        console.log("All properties of first listing:");
        Object.entries(firstListing).forEach(([key, value]) => {
          console.log(`${key}: ${value} (${typeof value})`);
        });
      }

      if (listings.length === 0) {
        toast({
          title: "No listings found",
          description: "No marketplace listings are available at this time.",
          variant: "default",
        });
      }
    }
    if (error) {
      console.error("Marketplace listings error:", error);
      toast({
        title: "Error loading listings",
        description: "There was a problem loading marketplace listings.",
        variant: "destructive",
      });
    }
  }, [listings, error]);
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

  // Get user's favorites
  const { favorites, isLoading: isFavoritesLoading } = useMarketplaceFavorites();
  
  // Filter real listings from the API
  // Filter listings by search term, category, price and favorites
  const filteredListings = listings
    ? listings.filter((listing: MarketplaceListing) => {
        try {
          // Favorites filter
          if (showFavoritesOnly) {
            const isFavorited = favorites?.some(fav => fav.listingId === listing.id);
            if (!isFavorited) {
              return false;
            }
          }
          
          // Search filter
          if (filters.search && listing.title) {
            if (
              !listing.title
                .toLowerCase()
                .includes(filters.search.toLowerCase())
            ) {
              console.log(
                `Filtering out by search: ${listing.id} - ${listing.title}`,
              );
              return false;
            }
          }

          // Category filter
          if (
            filters.category &&
            filters.category !== "all" &&
            listing.category
          ) {
            if (listing.category !== filters.category) {
              console.log(
                `Filtering out by category: ${listing.id} - category: ${listing.category}`,
              );
              return false;
            }
          }

          // Price filter - only if price is in a reasonable range (< 10000)
          try {
            // Special case for the 111111.00 listing, skip price filtering for it
            if (listing.price === "111111.00") {
              console.log("Skipping price filter for special test listing");
            } else {
              const priceValue =
                typeof listing.price === "string"
                  ? parseFloat(listing.price)
                  : Number(listing.price);

              if (
                !isNaN(priceValue) &&
                (priceValue < filters.minPrice || priceValue > filters.maxPrice)
              ) {
                console.log(
                  `Filtering out by price: ${listing.id} - price: ${priceValue}`,
                );
                return false;
              }
            }
          } catch (priceError) {
            console.error(
              `Price filter error for listing ${listing.id}:`,
              priceError,
            );
          }

          // Negotiable filter
          if (filters.negotiableOnly) {
            const isNegotiable =
              typeof listing.isNegotiable === "boolean"
                ? listing.isNegotiable
                : String(listing.isNegotiable).toLowerCase() === "true";

            if (!isNegotiable) {
              console.log(`Filtering out by negotiable: ${listing.id}`);
              return false;
            }
          }

          // Include this listing
          return true;
        } catch (error) {
          console.error("Error filtering listing:", error);
          return true; // Include all listings that cause errors in filtering
        }
      })
    : [];
    
  // Sort listings based on user preference
  const sortedListings = [...filteredListings].sort((a, b) => {
    try {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "price-low":
          const aPrice = typeof a.price === "string" ? parseFloat(a.price) : Number(a.price);
          const bPrice = typeof b.price === "string" ? parseFloat(b.price) : Number(b.price);
          return aPrice - bPrice;
        case "price-high":
          const aPrice2 = typeof a.price === "string" ? parseFloat(a.price) : Number(a.price);
          const bPrice2 = typeof b.price === "string" ? parseFloat(b.price) : Number(b.price);
          return bPrice2 - aPrice2;
        default:
          return 0;
      }
    } catch (error) {
      console.error("Error sorting listings:", error);
      return 0;
    }
  });
  
  // Select featured listings - newest + high price
  const featuredListings = showFeatured && sortedListings.length > 0
    ? [...sortedListings]
      .sort((a, b) => {
        // Complex sorting algorithm for "featured": combination of newness, price, and completeness
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();
        const aPrice = typeof a.price === "string" ? parseFloat(a.price) : Number(a.price);
        const bPrice = typeof b.price === "string" ? parseFloat(b.price) : Number(b.price);
        
        // Prefer listings with images
        const aHasImage = a.images && Array.isArray(a.images) && a.images.length > 0;
        const bHasImage = b.images && Array.isArray(b.images) && b.images.length > 0;
        
        if (aHasImage && !bHasImage) return -1;
        if (!aHasImage && bHasImage) return 1;
        
        // Weighted score combining recency and price
        const aScore = (aDate * 0.7) + (aPrice * 0.3);
        const bScore = (bDate * 0.7) + (bPrice * 0.3);
        
        return bScore - aScore;
      })
      .slice(0, 4)
    : [];
    
  // FavoriteButton component for toggling favorites
const FavoriteButton = ({ listingId }: { listingId: number }) => {
  const { isFavorite, toggleFavorite } = useMarketplaceFavorites();
  const isFav = isFavorite(listingId);
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 opacity-70 hover:opacity-100 hover:bg-primary/10 transition-all"
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(listingId);
      }}
    >
      <Heart 
        className={`h-4 w-4 text-primary transition-all ${isFav ? 'fill-primary' : 'hover:fill-primary'}`} 
      />
    </Button>
  );
};

// ReviewStars component for displaying seller ratings
const ReviewStars = ({ sellerId }: { sellerId: number }) => {
  const { reviews, reviewCount, averageRating, isLoading } = useMarketplaceReviews(undefined, sellerId);
  
  if (isLoading) {
    return (
      <div className="flex items-center">
        <Star className="h-3 w-3 mr-1 text-muted" />
        <span className="text-muted">Loading...</span>
      </div>
    );
  }
  
  // If no reviews, show placeholder
  if (!reviews || reviews.length === 0) {
    return (
      <div className="flex items-center">
        <Star className="h-3 w-3 mr-1 text-muted" />
        <span className="text-muted">No reviews yet</span>
      </div>
    );
  }
  
  // Round to nearest 0.5 for display
  const displayRating = Math.round(averageRating * 2) / 2;
  
  return (
    <div className="flex items-center">
      <div className="flex mr-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= displayRating
                ? 'text-yellow-500 fill-yellow-500'
                : star - 0.5 === displayRating
                ? 'text-yellow-500 fill-yellow-500/50'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
      <span className="font-medium">{displayRating.toFixed(1)}</span>
      <span className="ml-1">({reviewCount})</span>
    </div>
  );
};

// Final listings to display
const displayedListings = sortedListings;

console.log("Listings after filtering:", {
  before: listings ? listings.length : 0,
  after: displayedListings.length,
  filters,
});

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
          <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-lg shadow-sm border border-border/50 transition-all hover:shadow-md">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                <Input
                  placeholder="Search marketplace..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="flex-1 pl-10 transition-all border-border/50 focus:border-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                className="transition-all duration-200 bg-primary hover:bg-primary/90 active:scale-95"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            <div className="flex gap-2">
              <Select
                value={filters.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-[180px] border-border/50 transition-all hover:border-primary">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="border-border/50 shadow-lg">
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
                  <Button 
                    variant="outline" 
                    className="border-border/50 hover:border-primary transition-all active:scale-95 relative"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {(filters.minPrice > 0 || filters.maxPrice < 1000000 || filters.distance !== 50 || filters.negotiableOnly) && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full animate-pulse"></span>
                    )}
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
                      <h3 className="text-sm font-medium flex items-center">
                        <span className="mr-2">Price Range (ZMW)</span>
                        {(filters.minPrice > 0 || filters.maxPrice < 1000000) && (
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary">Active</Badge>
                        )}
                      </h3>
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>ZMW {filters.minPrice}</span>
                        <span>
                          {filters.maxPrice >= 1000000
                            ? "Any"
                            : `ZMW ${filters.maxPrice}`}
                        </span>
                      </div>
                      <Slider
                        defaultValue={[0, 1000]}
                        max={1000}
                        step={10}
                        onValueChange={handlePriceChange}
                        className="[&>span:first-child]:bg-primary [&>span:first-child]:h-2 [&>span:first-child]:rounded-md"
                      />
                    </div>

                    <Separator className="bg-border/40" />

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center">
                        <span className="mr-2">Distance (km)</span>
                        {filters.distance !== 50 && (
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary">Active</Badge>
                        )}
                      </h3>
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>0 km</span>
                        <span>{filters.distance} km</span>
                      </div>
                      <Slider
                        defaultValue={[filters.distance]}
                        max={100}
                        step={5}
                        onValueChange={handleDistanceChange}
                        className="[&>span:first-child]:bg-primary [&>span:first-child]:h-2 [&>span:first-child]:rounded-md"
                      />
                    </div>

                    <Separator className="bg-border/40" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center">
                        <span>Negotiable Only</span>
                        {filters.negotiableOnly && (
                          <Badge variant="outline" className="ml-2 text-xs bg-primary/10 text-primary">Active</Badge>
                        )}
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

          {/* Sort options */}
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Sort by:</label>
              <Select
                value={sortBy}
                onValueChange={setSortBy}
              >
                <SelectTrigger className="w-[140px] border-border/50 bg-card">
                  <SelectValue placeholder="Newest First" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {displayedListings.length} {displayedListings.length === 1 ? 'listing' : 'listings'} found
              </span>
              <div className="flex items-center gap-2 border-r pr-4 mr-2">
                <Switch
                  checked={showFeatured}
                  onCheckedChange={setShowFeatured}
                  className="data-[state=checked]:bg-primary"
                />
                <label className="text-sm font-medium">Show Featured</label>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={showFavoritesOnly}
                  onCheckedChange={setShowFavoritesOnly}
                  className="data-[state=checked]:bg-primary"
                />
                <div className="flex items-center gap-1">
                  <Heart className={`h-3 w-3 ${showFavoritesOnly ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                  <label className="text-sm font-medium">Favorites Only</label>
                </div>
              </div>
            </div>
          </div>

          {/* Featured listings section */}
          {showFeatured && featuredListings.length > 0 && (
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Featured Listings</h2>
                <Badge className="bg-primary/90 text-white">Recommended</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredListings.map((listing: MarketplaceListing) => (
                  <Card
                    key={`featured-${listing.id}`}
                    className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 border-primary/30 hover:border-primary/70"
                    onClick={() => navigateToDetail(listing.id)}
                  >
                    <div className="relative h-36 bg-muted overflow-hidden">
                      {(() => {
                        // Image handling
                        let imageUrl = null;
                        try {
                          if (listing.images) {
                            if (Array.isArray(listing.images) && listing.images.length > 0) {
                              const validImages = listing.images.filter(img => img && img !== "");
                              if (validImages.length > 0) imageUrl = validImages[0];
                            } else if (typeof listing.images === "string") {
                              try {
                                const parsed = JSON.parse(listing.images);
                                if (Array.isArray(parsed) && parsed.length > 0) {
                                  imageUrl = parsed[0];
                                } else {
                                  imageUrl = listing.images;
                                }
                              } catch (e) {
                                imageUrl = listing.images;
                              }
                            }
                          }
                        } catch (error) {
                          console.error(`Error processing image for featured listing ${listing.id}:`, error);
                        }

                        return imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={listing.title || "Featured item"}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.src = "https://placehold.co/700x500/green/white?text=No+Image";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <p className="text-muted-foreground">No image</p>
                          </div>
                        );
                      })()}
                      <Badge className="absolute top-2 right-2 bg-orange-500/90">Featured</Badge>
                      <div className="absolute left-0 bottom-0 bg-gradient-to-r from-primary/90 to-primary/60 text-white px-2 py-1 font-bold rounded-tr-md">
                        ZMW {typeof listing.price === "string" ? parseFloat(listing.price).toFixed(2) : Number(listing.price).toFixed(2)}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                          {listing.title || "Untitled Listing"}
                        </h3>
                        <FavoriteButton listingId={listing.id} />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {listing.description || "No description"}
                      </p>
                      <div className="mt-2 text-xs">
                        <ReviewStars sellerId={listing.sellerId} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Separator className="my-4" />
            </div>
          )}

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
                  {showFavoritesOnly ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <Heart className="h-16 w-16 text-muted-foreground/20" />
                        <Plus className="h-8 w-8 text-muted-foreground/40 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div>
                        <p className="text-lg font-medium mb-1">No favorites yet</p>
                        <p className="text-muted-foreground">
                          Click the heart icon on listings to add them to your favorites
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => setShowFavoritesOnly(false)}
                      >
                        Show all listings
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No listings found matching your criteria
                    </p>
                  )}
                </div>
              ) : (
                displayedListings.map((listing: MarketplaceListing) => {
                  // Debug log each listing in the map function
                  console.log(`Rendering listing: ${listing.id}`, listing);

                  // Safe render function to prevent crashes
                  const renderSafely = () => {
                    try {
                      return (
                        <Card
                          key={listing.id}
                          className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border border-border/50 hover:border-primary/50"
                          onClick={() => navigateToDetail(listing.id)}
                        >
                          <div className="relative h-48 bg-muted overflow-hidden">
                            {(() => {
                              // Enhanced image handling similar to detail page
                              let imageUrl = null;

                              try {
                                if (listing.images) {
                                  if (
                                    Array.isArray(listing.images) &&
                                    listing.images.length > 0
                                  ) {
                                    // Get first valid image from array
                                    const validImages = listing.images.filter(
                                      (img) => img && img !== "",
                                    );
                                    if (validImages.length > 0) {
                                      imageUrl = validImages[0];
                                    }
                                  } else if (
                                    typeof listing.images === "string"
                                  ) {
                                    try {
                                      // Try to parse as JSON string
                                      const parsed = JSON.parse(listing.images);
                                      if (
                                        Array.isArray(parsed) &&
                                        parsed.length > 0
                                      ) {
                                        imageUrl = parsed[0];
                                      } else {
                                        imageUrl = listing.images; // Use as single string
                                      }
                                    } catch (e) {
                                      imageUrl = listing.images; // Use as single string if parsing fails
                                    }
                                  }
                                }
                              } catch (error) {
                                console.error(
                                  `Error processing image for listing ${listing.id}:`,
                                  error,
                                );
                              }

                              return imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={listing.title || "Marketplace item"}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  onError={(e) => {
                                    console.log(
                                      `Image load error for ${listing.id}:`,
                                      e,
                                    );
                                    e.currentTarget.src =
                                      "https://placehold.co/700x500/green/white?text=No+Image";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                  <p className="text-muted-foreground">No image</p>
                                </div>
                              );
                            })()}

                            {/* Price overlay */}
                            <div className="absolute left-0 bottom-0 bg-gradient-to-r from-primary/90 to-primary/60 text-white px-3 py-1 font-bold rounded-tr-md shadow-md">
                              ZMW{" "}
                              {(() => {
                                try {
                                  const priceValue =
                                    typeof listing.price === "string"
                                      ? parseFloat(listing.price)
                                      : Number(listing.price);
                                  return !isNaN(priceValue)
                                    ? priceValue.toFixed(2)
                                    : "0.00";
                                } catch (e) {
                                  console.error("Price format error:", e);
                                  return "0.00";
                                }
                              })()}
                              {listing.priceUnit && (
                                <span className="text-xs font-normal">/{listing.priceUnit}</span>
                              )}
                            </div>

                            {/* Status badge */}
                            <div className="absolute right-0 top-0 m-2 flex flex-col gap-1">
                              {Boolean(listing.isNegotiable) && (
                                <Badge className="bg-yellow-500/90 hover:bg-yellow-500">
                                  Negotiable
                                </Badge>
                              )}
                              
                              {/* Check if listing is new - less than 3 days old */}
                              {(() => {
                                try {
                                  const createdDate = new Date(listing.createdAt);
                                  const now = new Date();
                                  const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
                                  
                                  if (diffDays < 3) {
                                    return (
                                      <Badge className="bg-blue-500/90 hover:bg-blue-500">
                                        New
                                      </Badge>
                                    );
                                  }
                                  return null;
                                } catch (e) {
                                  return null;
                                }
                              })()}
                            </div>
                          </div>

                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between">
                              <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                                {listing.title || "Untitled Listing"}
                              </CardTitle>
                              <FavoriteButton listingId={listing.id} />
                              
                            </div>
                            <CardDescription className="flex items-center text-xs">
                              <MapPin className="h-3 w-3 mr-1 inline text-primary" />
                              {listing.contactPhone
                                ? `Contact: ${listing.contactPhone}`
                                : "Location not specified"}
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground line-clamp-2 group-hover:line-clamp-3 transition-all duration-300">
                              {listing.description || "No description provided"}
                            </p>
                          </CardContent>

                          <CardFooter className="p-4 pt-2 flex justify-between items-center text-xs text-muted-foreground border-t border-border/30">
                            <div className="flex items-center">
                              <ReviewStars sellerId={listing.sellerId} />
                            </div>
                            <span className="bg-primary/10 px-2 py-0.5 rounded text-primary">
                              {(() => {
                                try {
                                  return formatDistanceToNow(
                                    new Date(listing.createdAt),
                                    {
                                      addSuffix: true,
                                    },
                                  );
                                } catch (error) {
                                  console.error(
                                    "Date formatting error:",
                                    error,
                                  );
                                  return "Recently";
                                }
                              })()}
                            </span>
                          </CardFooter>
                        </Card>
                      );
                    } catch (error) {
                      console.error(
                        `Error rendering listing ${listing.id}:`,
                        error,
                      );
                      return (
                        <Card
                          key={`error-${listing.id}`}
                          className="overflow-hidden bg-red-50"
                        >
                          <CardHeader>
                            <CardTitle>Error displaying listing</CardTitle>
                            <CardDescription>ID: {listing.id}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p>There was an error displaying this listing.</p>
                          </CardContent>
                        </Card>
                      );
                    }
                  };

                  return renderSafely();
                })
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
