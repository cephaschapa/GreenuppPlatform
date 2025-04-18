import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Loader2,
  Search,
  Grid3X3,
  List,
  MapPin,
  Star,
  Store,
  Package,
  Award
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import PublicNavbar from "@/components/navigation/PublicNavbar";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import user and marketplace types
import { User } from "@shared/schema";

// Type for the combined seller data
interface SellerWithStats {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
  profileImageUrl?: string | null;
  bio?: string | null;
  location?: {
    address?: string | null;
    city?: string | null;
    country?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    h3Index?: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  listingCount: number;
  averageRating: number | null;
  reviewCount: number;
}

export default function PublicSellersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = useState<string>("rating");

  // Fetch sellers data with listing count and average rating
  const {
    data: sellers = [],
    isLoading,
    isError,
  } = useQuery<SellerWithStats[]>({
    queryKey: ["/api/marketplace/sellers"],
    queryFn: async () => {
      const response = await fetch("/api/marketplace/sellers");
      if (!response.ok) {
        console.error("Error fetching sellers:", response.status, response.statusText);
        throw new Error("Failed to fetch sellers");
      }
      return response.json();
    },
  });

  // Apply filters and sorting
  const filteredSellers = sellers
    .filter((seller) => {
      const matchesSearch = searchQuery
        ? (seller.username && seller.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
          ((seller.firstName || "") + " " + (seller.lastName || "")).toLowerCase().includes(searchQuery.toLowerCase()) ||
          (seller.bio && seller.bio.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;

      const matchesType = selectedType === "all" 
        ? true 
        : seller.role === selectedType;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "rating":
          // Sort by rating, handling null values
          if (a.averageRating === null && b.averageRating === null) return 0;
          if (a.averageRating === null) return 1;
          if (b.averageRating === null) return -1;
          return b.averageRating - a.averageRating;
        case "listings":
          return b.listingCount - a.listingCount;
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Greenupp Marketplace Sellers
            </h1>
            <p className="text-muted-foreground max-w-2xl mb-8">
              Connect with trusted farmers, suppliers, and agricultural businesses on our platform. Find the right partners for your agricultural needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, location, or products..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={selectedType}
                onValueChange={setSelectedType}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center">
                    <Store className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Seller Type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sellers</SelectItem>
                  <SelectItem value="farmer">Farmers</SelectItem>
                  <SelectItem value="supplier">Suppliers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Sort Controls */}
      <section className="border-b">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{filteredSellers.length}</span> sellers
              </div>
              <div className="flex border rounded-md overflow-hidden">
                <button
                  className={`flex items-center justify-center w-9 h-9 ${
                    viewMode === "grid" ? "bg-secondary" : "hover:bg-muted"
                  }`}
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  className={`flex items-center justify-center w-9 h-9 ${
                    viewMode === "list" ? "bg-secondary" : "hover:bg-muted"
                  }`}
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm hidden sm:inline">Sort by:</span>
              <Select
                value={sortOrder}
                onValueChange={setSortOrder}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="listings">Listing Count</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8">
        <div className="container mx-auto max-w-6xl px-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Loading marketplace sellers...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-lg text-destructive">
                Failed to load marketplace sellers. Please try again later.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : filteredSellers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg mb-4">No sellers found matching your criteria.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSellers.map((seller) => (
                <Card
                  key={seller.id}
                  className="overflow-hidden transition-all duration-200 hover:shadow-md flex flex-col h-full"
                >
                  <div className="relative h-40 bg-gradient-to-r from-green-900/20 to-primary/20 flex items-center justify-center">
                    {seller.profileImageUrl ? (
                      <img
                        src={seller.profileImageUrl}
                        alt={seller.username}
                        className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold border-4 border-background shadow-lg">
                        {(seller.firstName?.[0] || seller.username[0] || "").toUpperCase()}
                      </div>
                    )}
                    <Badge variant="secondary" className="absolute top-3 right-3">
                      {seller.role === "farmer" ? "Farmer" : seller.role === "supplier" ? "Supplier" : seller.role}
                    </Badge>
                  </div>
                  
                  <CardContent className="flex-grow p-4 pt-6">
                    <div className="text-center mb-3">
                      <h3 className="font-semibold text-lg">
                        {seller.firstName && seller.lastName
                          ? `${seller.firstName} ${seller.lastName}`
                          : seller.username}
                      </h3>
                      <div className="flex items-center justify-center mt-1 space-x-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              seller.averageRating && i < Math.round(seller.averageRating)
                                ? "fill-current"
                                : "text-muted"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({seller.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-center space-x-6 my-3">
                      <div className="flex flex-col items-center">
                        <Package className="h-5 w-5 text-primary mb-1" />
                        <span className="text-sm font-medium">{seller.listingCount}</span>
                        <span className="text-xs text-muted-foreground">Listings</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Award className="h-5 w-5 text-primary mb-1" />
                        <span className="text-sm font-medium">
                          {seller.averageRating ? seller.averageRating.toFixed(1) : "N/A"}
                        </span>
                        <span className="text-xs text-muted-foreground">Rating</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <MapPin className="h-5 w-5 text-primary mb-1" />
                        <span className="text-sm font-medium">
                          {seller.location?.city || "N/A"}
                        </span>
                        <span className="text-xs text-muted-foreground">Location</span>
                      </div>
                    </div>
                    {seller.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-3">
                        {seller.bio}
                      </p>
                    )}
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/marketplace/sellers/${seller.id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSellers.map((seller) => (
                <Card
                  key={seller.id}
                  className="overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row p-4">
                    <div className="w-full sm:w-48 h-48 flex items-center justify-center bg-gradient-to-r from-green-900/20 to-primary/20 rounded-md sm:mr-4 mb-4 sm:mb-0">
                      {seller.profileImageUrl ? (
                        <img
                          src={seller.profileImageUrl}
                          alt={seller.username}
                          className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold border-4 border-background shadow-lg">
                          {(seller.firstName?.[0] || seller.username[0] || "").toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {seller.firstName && seller.lastName
                              ? `${seller.firstName} ${seller.lastName}`
                              : seller.username}
                          </h3>
                          <div className="flex items-center mt-1 space-x-1 text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  seller.averageRating && i < Math.round(seller.averageRating)
                                    ? "fill-current"
                                    : "text-muted"
                                }`}
                              />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({seller.reviewCount} reviews)
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {seller.role === "farmer" ? "Farmer" : seller.role === "supplier" ? "Supplier" : seller.role}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-6 my-3">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-primary mr-1" />
                          <span className="text-sm font-medium">{seller.listingCount} listings</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-primary mr-1" />
                          <span className="text-sm font-medium">
                            {seller.location?.city || "Location not specified"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-muted-foreground">
                            Member since {formatDistanceToNow(new Date(seller.createdAt))} ago
                          </span>
                        </div>
                      </div>
                      
                      {seller.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {seller.bio}
                        </p>
                      )}
                      
                      <div className="flex justify-end mt-2">
                        <Button variant="outline" asChild>
                          <Link href={`/marketplace/sellers/${seller.id}`}>
                            View Profile
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer with Call to Action */}
      <section className="bg-muted py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Want to sell your agricultural products?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Create an account as a farmer or supplier to list your products, connect with buyers, and grow your agricultural business.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => window.location.href = "/auth?register=true"}
            >
              Create Seller Account
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => window.location.href = "/marketplace"}
            >
              Browse Products
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}