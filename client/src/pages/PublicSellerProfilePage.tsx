import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import {
  Loader2,
  MapPin,
  Calendar,
  Mail,
  Phone,
  ExternalLink,
  Star,
  Grid3X3,
  List,
  Filter,
  ArrowLeft,
  MessageCircle,
  Share2,
  Search,
} from "lucide-react";
import { formatDistance, formatDistanceToNow } from "date-fns";
import { MarketplaceListing } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import PublicNavbar from "@/components/navigation/PublicNavbar";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  phoneNumber?: string | null;
  website?: string | null;
  socialLinks?: Record<string, string> | null;
  specialties?: string[] | null;
  certificates?: string[] | null;
  location?: {
    id?: number;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postalCode?: string | null;
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

// Type for seller reviews
interface SellerReview {
  id: number;
  sellerId: number;
  buyerId: number;
  buyerName: string;
  buyerProfileImage?: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}

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

export default function PublicSellerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const sellerId = parseInt(id);

  const [activeTab, setActiveTab] = useState("listings");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = useState<string>("newest");

  // Fetch seller data
  const {
    data: seller,
    isLoading: isLoadingSeller,
    isError: isErrorSeller,
  } = useQuery<SellerWithStats>({
    queryKey: [`/api/marketplace/sellers/${sellerId}`],
    queryFn: async () => {
      const response = await fetch(`/api/marketplace/sellers/${sellerId}`);
      if (!response.ok) {
        console.error(
          "Error fetching seller details:",
          response.status,
          response.statusText
        );
        throw new Error("Failed to fetch seller details");
      }
      return response.json();
    },
  });

  // Fetch seller's listings
  const {
    data: listings = [],
    isLoading: isLoadingListings,
    isError: isErrorListings,
  } = useQuery<MarketplaceListing[]>({
    queryKey: [`/api/marketplace/sellers/${sellerId}/listings`],
    queryFn: async () => {
      const response = await fetch(
        `/api/marketplace/sellers/${sellerId}/listings`
      );
      if (!response.ok) {
        console.error(
          "Error fetching seller listings:",
          response.status,
          response.statusText
        );
        throw new Error("Failed to fetch seller listings");
      }
      return response.json();
    },
    enabled: !!sellerId,
  });

  // Fetch seller reviews
  const {
    data: reviews = [],
    isLoading: isLoadingReviews,
    isError: isErrorReviews,
  } = useQuery<SellerReview[]>({
    queryKey: [`/api/marketplace/sellers/${sellerId}/reviews`],
    queryFn: async () => {
      const response = await fetch(
        `/api/marketplace/reviews?sellerId=${sellerId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch seller reviews");
      }
      return response.json();
    },
    enabled: !!sellerId && activeTab === "reviews",
  });

  // Apply filters and sorting to listings
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
        selectedCategory === "all"
          ? true
          : listing.category === selectedCategory;

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

  const isLoading =
    isLoadingSeller ||
    (isLoadingListings && activeTab === "listings") ||
    (isLoadingReviews && activeTab === "reviews");
  const isError =
    isErrorSeller ||
    (isErrorListings && activeTab === "listings") ||
    (isErrorReviews && activeTab === "reviews");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <div className="container mx-auto max-w-6xl px-4 py-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">
            Loading seller profile...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !seller) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <div className="container mx-auto max-w-6xl px-4 py-12 flex flex-col items-center justify-center">
          <p className="text-lg text-destructive mb-4">
            Failed to load seller profile. The seller may not exist or there was
            an error.
          </p>
          <Button variant="outline" asChild>
            <Link href="/marketplace/sellers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sellers
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Seller Profile Header */}
      <div className="bg-gradient-to-r from-green-900/20 to-primary/20 py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile Image */}
            <div className="flex-shrink-0 relative">
              {seller.profileImageUrl ? (
                <img
                  src={seller.profileImageUrl}
                  alt={seller.username}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-background shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary/10 flex items-center justify-center text-primary text-5xl font-bold border-4 border-background shadow-lg">
                  {(
                    seller.firstName?.[0] ||
                    seller.username[0] ||
                    ""
                  ).toUpperCase()}
                </div>
              )}
              <Badge
                variant="secondary"
                className="absolute bottom-1 right-1 px-3 py-1 capitalize"
              >
                {seller.role}
              </Badge>
            </div>

            {/* Profile Info */}
            <div className="flex-grow text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {seller.firstName && seller.lastName
                      ? `${seller.firstName} ${seller.lastName}`
                      : seller.username}
                  </h1>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <div className="flex items-center space-x-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            seller.averageRating &&
                            i < Math.round(seller.averageRating)
                              ? "fill-current"
                              : "text-muted/40"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">
                        {seller.averageRating
                          ? seller.averageRating.toFixed(1)
                          : "No ratings"}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        ({seller.reviewCount}{" "}
                        {seller.reviewCount === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-center md:justify-end mt-4 md:mt-0">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Contact
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sign in required</AlertDialogTitle>
                        <AlertDialogDescription>
                          You need to be signed in to contact sellers on
                          Greenupp.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Button asChild>
                            <Link href="/auth">Sign In</Link>
                          </Button>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button variant="outline" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>

                  <Button asChild size="sm">
                    <Link href="/auth">View All Products</Link>
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {seller.location &&
                  (seller.location.city || seller.location.country) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        {[
                          seller.location.city,
                          seller.location.state,
                          seller.location.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    Member since{" "}
                    {new Date(seller.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {seller.website && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-primary" />
                    <a
                      href={
                        seller.website.startsWith("http")
                          ? seller.website
                          : `https://${seller.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                    >
                      Website
                    </a>
                  </div>
                )}
              </div>

              {seller.bio && (
                <div className="mt-4 text-sm text-foreground/90">
                  {seller.bio}
                </div>
              )}

              {seller.specialties && seller.specialties.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {seller.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Tabs
          defaultValue="listings"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="w-full sm:w-auto grid sm:inline-grid grid-cols-2 sm:grid-cols-3 mb-6">
            <TabsTrigger value="listings">
              Listings ({seller.listingCount})
            </TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({seller.reviewCount})
            </TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          {/* Listings Tab */}
          <TabsContent value="listings">
            {/* Filters for listings */}
            <div className="mb-6 bg-muted/40 p-4 rounded-lg">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search in seller listings..."
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
                      <Filter className="mr-2 h-4 w-4" />
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
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="price_asc">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price_desc">
                      Price: High to Low
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border rounded-md overflow-hidden bg-background h-10">
                  <button
                    className={`flex items-center justify-center w-10 h-10 ${
                      viewMode === "grid" ? "bg-secondary" : "hover:bg-muted"
                    }`}
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    className={`flex items-center justify-center w-10 h-10 ${
                      viewMode === "list" ? "bg-secondary" : "hover:bg-muted"
                    }`}
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Listings */}
            {isLoadingListings ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">
                  Loading listings...
                </p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-lg mb-4">
                  {searchQuery || selectedCategory !== "all"
                    ? "No listings found matching your criteria."
                    : "This seller doesn't have any active listings at the moment."}
                </p>
                {(searchQuery || selectedCategory !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
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
                      <div className="font-semibold text-lg mt-auto">
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
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-semibold">Customer Reviews</h3>
                <div className="flex items-center mt-1">
                  <div className="flex items-center space-x-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          seller.averageRating &&
                          i < Math.round(seller.averageRating)
                            ? "fill-current"
                            : "text-muted/40"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground ml-2">
                    Based on {seller.reviewCount}{" "}
                    {seller.reviewCount === 1 ? "review" : "reviews"}
                  </span>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>Write a Review</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign in required</AlertDialogTitle>
                    <AlertDialogDescription>
                      You need to be signed in to write reviews on Greenupp.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button asChild>
                        <Link href="/auth">Sign In</Link>
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {isLoadingReviews ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-lg mb-4">
                  This seller doesn't have any reviews yet.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button>Be the first to review</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Sign in required</AlertDialogTitle>
                      <AlertDialogDescription>
                        You need to be signed in to write reviews on Greenupp.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button asChild>
                          <Link href="/auth">Sign In</Link>
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {review.buyerProfileImage ? (
                          <img
                            src={review.buyerProfileImage}
                            alt={review.buyerName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                            {review.buyerName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">
                              {review.buyerName}
                            </h4>
                            <div className="flex items-center mt-1">
                              <div className="flex items-center space-x-1 text-amber-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "fill-current"
                                        : "text-muted/40"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground ml-2">
                                {formatDistanceToNow(
                                  new Date(review.createdAt)
                                )}{" "}
                                ago
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="mt-2 text-sm">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    About {seller.firstName || seller.username}
                  </h3>
                  <p className="text-foreground/90">
                    {seller.bio ||
                      `No detailed information provided by ${
                        seller.firstName || seller.username
                      }.`}
                  </p>
                </div>

                {seller.specialties && seller.specialties.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {seller.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {seller.certificates && seller.certificates.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Certifications
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-foreground/90">
                      {seller.certificates.map((cert, index) => (
                        <li key={index}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Contact Information
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Email</p>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="link"
                                className="p-0 h-auto text-primary"
                              >
                                Login to view
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Sign in required
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  You need to be signed in to view seller
                                  contact information.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction asChild>
                                  <Button asChild>
                                    <Link href="/auth">Sign In</Link>
                                  </Button>
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {seller.phoneNumber && (
                        <div className="flex items-start gap-3">
                          <Phone className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Phone</p>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-primary"
                                >
                                  Login to view
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Sign in required
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    You need to be signed in to view seller
                                    contact information.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction asChild>
                                    <Button asChild>
                                      <Link href="/auth">Sign In</Link>
                                    </Button>
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      )}

                      {seller.website && (
                        <div className="flex items-start gap-3">
                          <ExternalLink className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Website</p>
                            <a
                              href={
                                seller.website.startsWith("http")
                                  ? seller.website
                                  : `https://${seller.website}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {seller.website}
                            </a>
                          </div>
                        </div>
                      )}

                      {seller.location &&
                        (seller.location.address || seller.location.city) && (
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium">Location</p>
                              <address className="not-italic text-foreground/80">
                                {seller.location.address && (
                                  <div>{seller.location.address}</div>
                                )}
                                <div>
                                  {[
                                    seller.location.city,
                                    seller.location.state,
                                    seller.location.postalCode,
                                    seller.location.country,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </div>
                              </address>
                            </div>
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Seller Statistics
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground/80">Member since</span>
                        <span className="font-medium">
                          {new Date(seller.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-foreground/80">
                          Active listings
                        </span>
                        <span className="font-medium">
                          {seller.listingCount}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-foreground/80">Reviews</span>
                        <span className="font-medium">
                          {seller.reviewCount}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-foreground/80">
                          Average rating
                        </span>
                        <div className="flex items-center">
                          <span className="font-medium mr-1">
                            {seller.averageRating
                              ? seller.averageRating.toFixed(1)
                              : "N/A"}
                          </span>
                          {seller.averageRating && (
                            <Star className="h-4 w-4 text-amber-500 fill-current" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Call to Action Footer */}
      <section className="bg-muted py-12 px-4 mt-12">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to connect with {seller.firstName || seller.username}?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Create an account to purchase products, contact sellers, and get the
            most out of Greenupp's marketplace.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => (window.location.href = "/auth")}
            >
              Sign Up Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => (window.location.href = "/marketplace")}
            >
              Browse More Sellers
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
