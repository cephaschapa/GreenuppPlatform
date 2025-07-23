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
  Users,
  ShoppingBag,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { MarketplaceListing } from "@shared/schema";
import Navbar from "@/components/Navbar";

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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            listing.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
        : true;

      const matchesCategory =
        selectedCategory && selectedCategory !== "all"
          ? listing.category === selectedCategory
          : true;

      return matchesSearch && matchesCategory && listing.status === "active";
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
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
      {/* Navbar */}
      <Navbar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Greenupp Marketplace
            </h1>
            <p className="text-muted-foreground max-w-2xl mb-4">
              Browse agricultural products from local farmers and suppliers.
              Connect directly with producers for the freshest goods and farming
              supplies.
            </p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button variant="outline" asChild>
                <Link
                  href="/marketplace/sellers"
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Browse Sellers</span>
                </Link>
              </Button>
              <Button variant="default" asChild>
                <Link
                  href="/auth?mode=register"
                  className="flex items-center gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Start Selling</span>
                </Link>
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products, seeds, equipment..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center">
                    <Tag className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="seeds">Seeds & Plants</SelectItem>
                  <SelectItem value="fertilizers">Fertilizers</SelectItem>
                  <SelectItem value="pesticides">Pesticides</SelectItem>
                  <SelectItem value="tools">Tools & Equipment</SelectItem>
                  <SelectItem value="equipment">Machinery</SelectItem>
                  <SelectItem value="livestock">Livestock</SelectItem>
                  <SelectItem value="harvest">Harvest & Produce</SelectItem>
                  <SelectItem value="feed">Animal Feed</SelectItem>
                  <SelectItem value="irrigation">
                    Irrigation Supplies
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
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
                <span className="font-medium text-foreground">
                  {filteredListings.length}
                </span>{" "}
                items
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    {sortOrder === "newest"
                      ? "Newest"
                      : sortOrder === "oldest"
                      ? "Oldest"
                      : sortOrder === "price_asc"
                      ? "Price: Low to High"
                      : "Price: High to Low"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Newest
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Oldest
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("price_asc")}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Price: Low to High
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("price_desc")}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Price: High to Low
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              <p className="mt-4 text-muted-foreground">
                Loading marketplace listings...
              </p>
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-lg text-destructive">
                Failed to load marketplace listings. Please try again later.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg mb-4">
                No listings found matching your criteria.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <Card
                  key={listing.id}
                  className="overflow-hidden transition-all duration-200 hover:shadow-md flex flex-col h-full"
                >
                  <div className="relative h-48 bg-muted">
                    <Link
                      href={`/marketplace/${listing.id}`}
                      className="block h-full"
                    >
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <span className="text-muted-foreground">
                            No image
                          </span>
                        </div>
                      )}
                    </Link>
                  </div>
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
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/marketplace/${listing.id}`}>
                        View Details
                      </Link>
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
                    <Link
                      href={`/marketplace/${listing.id}`}
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
                          <span className="text-muted-foreground">
                            No image
                          </span>
                        </div>
                      )}
                    </Link>
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
                          {formatCurrency(
                            parseFloat(listing.price),
                            listing.priceCurrency || "ZMW"
                          )}
                          {listing.priceUnit && (
                            <span className="text-xs text-muted-foreground ml-1">
                              per {listing.priceUnit}
                            </span>
                          )}
                        </div>
                        <Button variant="outline" asChild>
                          <Link href={`/marketplace/${listing.id}`}>
                            View Details
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
            Ready to join our agricultural marketplace?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Create an account to buy, sell, and connect with other agricultural
            professionals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => (window.location.href = "/auth")}
            >
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
