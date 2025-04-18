import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { 
  Package,
  ArrowLeft,
  Tag,
  Calendar,
  Info,
  User,
  AlertCircle,
  ExternalLink,
  Box,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  MapPin
} from "lucide-react";
import PublicNavbar from "@/components/navigation/PublicNavbar";
import { MarketplaceListing } from "@shared/schema";

import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Get category label helper
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

export default function PublicListingDetailPage() {
  const pathname = window.location.pathname;
  const id = pathname.split('/').pop();
  const listingId = id ? parseInt(id) : null;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Redirect if no ID
  if (!listingId) {
    window.location.href = "/marketplace";
    return null;
  }
  
  // Fetch listing data
  const { data: listing, isLoading, isError } = useQuery<MarketplaceListing>({
    queryKey: [`/api/marketplace/listings/${listingId}`],
    queryFn: async () => {
      const response = await fetch(`/api/marketplace/listings/${listingId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch listing");
      }
      return response.json();
    },
  });
  
  // Handlers for image carousel
  const nextImage = () => {
    if (listing?.images && activeImageIndex < listing.images.length - 1) {
      setActiveImageIndex(prev => prev + 1);
    }
  };
  
  const prevImage = () => {
    if (activeImageIndex > 0) {
      setActiveImageIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <PublicNavbar />
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <Link href="/marketplace" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        ) : isError || !listing ? (
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error Loading Listing</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find the listing you're looking for. It may have been removed or no longer exists.
            </p>
            <Button asChild>
              <Link href="/marketplace">Return to Marketplace</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="relative overflow-hidden rounded-lg border bg-card">
                {listing.images && listing.images.length > 0 ? (
                  <div className="relative">
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img
                        src={listing.images[activeImageIndex]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Image Navigation Controls */}
                    {listing.images.length > 1 && (
                      <div className="absolute inset-0 flex items-center justify-between px-4">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="rounded-full bg-background/80 backdrop-blur-sm"
                          onClick={prevImage}
                          disabled={activeImageIndex === 0}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="rounded-full bg-background/80 backdrop-blur-sm"
                          onClick={nextImage}
                          disabled={activeImageIndex === listing.images.length - 1}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                    
                    {/* Thumbnail Indicators */}
                    {listing.images.length > 1 && (
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                        {listing.images.map((_, i) => (
                          <button
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i === activeImageIndex
                                ? "bg-primary"
                                : "bg-primary/30"
                            }`}
                            onClick={() => setActiveImageIndex(i)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <Package className="h-16 w-16 text-muted-foreground/50" />
                    <span className="sr-only">No image available</span>
                  </div>
                )}
                
                {/* Thumbnails */}
                {listing.images && listing.images.length > 1 && (
                  <div className="flex p-2 gap-2 overflow-x-auto">
                    {listing.images.map((img, i) => (
                      <button
                        key={i}
                        className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${
                          i === activeImageIndex
                            ? "border-primary"
                            : "border-transparent"
                        }`}
                        onClick={() => setActiveImageIndex(i)}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Title and Details */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">
                    {getCategoryLabel(listing.category)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Listed {formatDistanceToNow(new Date(listing.createdAt))}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">{listing.title}</h1>
                <div className="flex items-center mt-2 mb-4">
                  <div className="font-semibold text-xl md:text-2xl text-primary">
                    {formatCurrency(parseFloat(listing.price), listing.priceCurrency || "ZMW")}
                    {listing.priceUnit && (
                      <span className="text-sm text-muted-foreground ml-1">
                        per {listing.priceUnit}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Description</h2>
                <div className="text-muted-foreground whitespace-pre-line">
                  {listing.description || "No description provided."}
                </div>
              </div>
              
              {/* Specifications */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Condition:</span>
                    <span>{listing.condition || "Not specified"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Box className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Quantity:</span>
                    <span>{listing.quantity || "Not specified"}</span>
                  </div>
                                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Location:</span>
                    <span>Sign in to view</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Call to Action Card */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold">Interested in this listing?</h3>
                  <p className="text-muted-foreground">
                    Create an account or log in to contact the seller and make purchases.
                  </p>
                  <div className="space-y-2">
                    <Button className="w-full" asChild>
                      <Link href={`/auth?returnTo=/dashboard/marketplace/${listing.id}`}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Sign Up to Purchase
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/auth?returnTo=/dashboard/marketplace/${listing.id}`}>
                        Log In
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Seller Info Card */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold">About the Seller</h3>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted rounded-full w-12 h-12 flex items-center justify-center">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">
                        Seller #{listing.sellerId}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Sign in to see more details
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/auth?returnTo=/dashboard/marketplace/sellers/${listing.sellerId}`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Sign In to See Seller Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              {/* Safety Tips */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-primary" />
                    Safety Tips
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Always meet in a public location for transactions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Never send money in advance to sellers you don't know</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Inspect products thoroughly before completing a purchase</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Consider using our secure payment system after signing up</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      
      {/* Simple Footer */}
      <footer className="bg-secondary/40 border-t border-primary/10 py-8 mt-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center justify-center md:justify-start">
                <div className="text-primary text-xl mr-1">
                  <i className="fas fa-leaf"></i>
                </div>
                <span className="text-lg font-bold font-space tracking-wider">
                  Green<span className="text-primary">upp</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 text-center md:text-left">
                Empowering farmers with digital agriculture solutions
              </p>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">Home</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/marketplace">Marketplace</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth">Sign Up</Link>
              </Button>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-primary/10 text-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Greenupp. All rights reserved.</p>
            <p className="mt-1">
              Powered by <a href="https://www.metatronltd.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Metatron Technologies Ltd</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}