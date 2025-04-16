import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Loader2,
  Search,
  Filter,
  MapPin,
  Calendar,
  ChevronDown,
  Grid3X3,
  List,
  Tag,
  DollarSign,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { MarketplaceListing } from "@shared/schema";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { formatCurrency } from "@/lib/utils";

function getCategoryLabel(category: string | null): string {
  const categories: Record<string, string> = {
    seeds: "Seeds & Plants",
    fertilizers: "Fertilizers",
    pesticides: "Pesticides",
    tools: "Tools & Equipment",
    equipment: "Machinery",
    livestock: "Livestock",
    harvest: "Harvest & Produce",
    feed: "Animal Feed",
    irrigation: "Irrigation Supplies",
    other: "Other",
  };
  return category ? categories[category] || category : "Uncategorized";
}

export default function PublicMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = useState<string>("newest");

  // Fetch marketplace listings
  const {
    data: listings = [],
    isLoading,
    isError,
  } = useQuery<MarketplaceListing[]>({
    queryKey: ["/api/marketplace/listings"],
    queryFn: async () => {
      const response = await fetch("/api/marketplace/listings");
      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }
      return response.json();
    },
  });

  // Apply filters and sorting
  const filteredListings = listings
    .filter((listing) => {
      const matchesSearch = searchQuery
        ? listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (listing.description &&
            listing.description.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;

      const matchesCategory = selectedCategory
        ? listing.category === selectedCategory
        : true;

      return matchesSearch && matchesCategory && listing.status === "active";
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "price_asc":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price_desc":
          return parseFloat(b.price) - parseFloat(a.price);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/80 to-primary px-4 py-16 text-white">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Greenupp Marketplace</h1>
          <p className="text-xl md:text-2xl max-w-2xl mb-8">
            Discover agricultural products and services from trusted sellers
          </p>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => window.location.href = "/auth"}
            >
              Sign Up to Sell
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 hover:text-white"
              onClick={() => window.location.href = "/auth"}
            >
              Log In
            </Button>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="sticky top-0 z-10 bg-background border-b py-4 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="seeds">Seeds & Plants</SelectItem>
                  <SelectItem value="fertilizers">Fertilizers</SelectItem>
                  <SelectItem value="pesticides">Pesticides</SelectItem>
                  <SelectItem value="tools">Tools & Equipment</SelectItem>
                  <SelectItem value="equipment">Machinery</SelectItem>
                  <SelectItem value="livestock">Livestock</SelectItem>
                  <SelectItem value="harvest">Harvest & Produce</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("price_asc")}>
                    Price: Low to High
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("price_desc")}>
                    Price: High to Low
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" />
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="container mx-auto max-w-6xl py-8 px-4">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">
              Unable to load marketplace listings
            </h2>
            <p className="text-muted-foreground">
              Please try again later or contact support.
            </p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No listings found</h2>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card
                key={listing.id}
                className="overflow-hidden h-full transition-all duration-200 hover:shadow-md flex flex-col"
              >
                <a 
                  href={`/auth?returnTo=/dashboard/marketplace/${listing.id}`}
                  className="block h-48 overflow-hidden bg-muted relative"
                >
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                      {formatCurrency(parseFloat(listing.price), listing.priceCurrency || "ZMW")}
                    </Badge>
                  </div>
                </a>
                <CardContent className="flex-grow p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {getCategoryLabel(listing.category)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(listing.createdAt))}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg line-clamp-1 mb-1">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {listing.description}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 pb-4 px-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <a href={`/auth?returnTo=/dashboard/marketplace/${listing.id}`}>
                      View Details
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map((listing) => (
              <Card
                key={listing.id}
                className="overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row">
                  <a 
                    href={`/auth?returnTo=/dashboard/marketplace/${listing.id}`}
                    className="block w-full sm:w-48 h-48 overflow-hidden bg-muted relative"
                  >
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                  </a>
                  <div className="flex-grow p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(listing.category)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(listing.createdAt))}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {listing.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-lg">
                        {formatCurrency(parseFloat(listing.price), listing.priceCurrency || "ZMW")}
                        {listing.priceUnit && (
                          <span className="text-xs text-muted-foreground ml-1">
                            per {listing.priceUnit}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        asChild
                      >
                        <a href={`/auth?returnTo=/dashboard/marketplace/${listing.id}`}>
                          View Details
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer with Call to Action */}
      <section className="bg-muted py-12 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to join our agricultural marketplace?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Create an account to buy, sell, and connect with other agricultural professionals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => window.location.href = "/auth"}
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}