import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import {
  Loader2,
  ArrowLeft,
  MapPin,
  Calendar,
  Share2,
  Flag,
  Heart,
  User,
  Phone,
  MessageCircle,
  Tag,
  DollarSign,
  Ruler,
  ShoppingCart,
  Plus,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatDistanceToNow } from "date-fns";
import { MarketplaceListing } from "@shared/schema";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LocationMap from "@/components/marketplace/LocationMap";
import { Textarea } from "@/components/ui/textarea";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { toast } from "@/hooks/use-toast";
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

// Function to get condition label
function getConditionLabel(condition: string | null): string {
  if (!condition) return "Unknown";

  const conditionMap: Record<string, string> = {
    new: "New",
    like_new: "Like New",
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    salvage: "For Parts/Salvage",
  };

  return conditionMap[condition] || condition;
}

// Get the category label
function getCategoryLabel(category: string | null): string {
  if (!category) return "Other";

  const categoryMap: Record<string, string> = {
    seeds: "Seeds",
    equipment: "Equipment",
    livestock: "Livestock",
    crops: "Crops",
    fertilizer: "Fertilizer",
    pesticides: "Pesticides",
    tools: "Tools",
    feed: "Animal Feed",
    services: "Services",
    land: "Land",
    other: "Other",
  };

  return categoryMap[category] || category;
}

export default function MarketplaceDetailPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();

  // Fetch the listing data from the API
  const {
    data: listing,
    isLoading,
    error,
  } = useQuery<MarketplaceListing>({
    queryKey: ["/api/marketplace/listings", params.id],
    queryFn: async () => {
      console.log(`Fetching listing with ID: ${params.id}`);
      const response = await fetch(`/api/marketplace/listings/${params.id}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching listing: ${response.status}`, errorText);
        throw new Error(`Failed to fetch listing: ${response.status} ${errorText || response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Listing data from API:", data);
      return data;
    },
  });
  
  // Fetch location data if the listing has a locationId
  const {
    data: locationData,
    isLoading: isLoadingLocation,
  } = useQuery({
    queryKey: ["/api/locations", listing?.locationId],
    queryFn: async () => {
      if (!listing?.locationId) return null;
      
      const response = await fetch(`/api/locations/${listing.locationId}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching location: ${response.status}`, errorText);
        return null;
      }
      
      const data = await response.json();
      console.log("Location data from API:", data);
      return data;
    },
    enabled: !!listing?.locationId,
  });

  const navigateBack = () => {
    setLocation("/dashboard/marketplace");
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite
        ? "Item has been removed from your saved listings"
        : "Item has been added to your saved listings",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied to clipboard",
      description: "You can now share this listing with others",
    });
  };

  const handleReport = () => {
    if (!reportReason.trim()) {
      toast({
        title: "Report reason required",
        description: "Please provide a reason for reporting this listing",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Listing reported",
      description:
        "Thank you for reporting this listing. Our team will review it.",
    });
    setIsReportDialogOpen(false);
    setReportReason("");
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message to send to the seller",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Message sent",
      description: "Your message has been sent to the seller",
    });
    setMessageText("");
    setIsContactDrawerOpen(false);
  };

  const handleCallSeller = () => {
    if (listing?.contactPhone) {
      window.location.href = `tel:${listing.contactPhone}`;
    } else {
      toast({
        title: "Contact information unavailable",
        description: "This seller doesn't have contact information available",
        variant: "destructive",
      });
    }
  };
  
  // Handle adding product to cart
  const handleAddToCart = async () => {
    if (!listing) return;
    
    setIsAddingToCart(true);
    try {
      await addToCart(listing.id, 1);
      
      toast({
        title: "Added to cart",
        description: "Item has been added to your shopping cart",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Failed to add to cart",
        description: "There was an error adding this item to your cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout
        title="Product Details"
        description="Marketplace listing details"
      >
        <div className="flex justify-center items-center min-h-[500px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !listing) {
    return (
      <DashboardLayout
        title="Product Not Found"
        description="The listing you're looking for is unavailable"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="bg-red-50 text-red-800 p-4 rounded-lg">
            <p>
              Error loading marketplace listing. The listing might have been
              removed or is unavailable.
            </p>
            <Button variant="link" onClick={navigateBack} className="p-0 mt-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Log all listing data for debugging
  console.log("Listing data:", JSON.stringify(listing, null, 2));
  console.log("Images data:", listing.images);

  // Prepare images from the database with more robust handling
  let imageArray: string[] = [];
  const defaultImage = "https://placehold.co/700x500/green/white?text=No+Image";

  try {
    // Check if we have any images
    if (listing.images) {
      console.log("Raw images value:", listing.images);

      if (Array.isArray(listing.images)) {
        // It's already an array, we can use it directly
        imageArray = listing.images.filter((img) => img && img !== "");
        console.log(
          "Images are provided as an array, count:",
          imageArray.length,
        );
      } else if (typeof listing.images === "string") {
        // First try to parse it as JSON (stringified array)
        try {
          const parsed = JSON.parse(listing.images);
          if (Array.isArray(parsed)) {
            imageArray = parsed.filter((img) => img && img !== "");
            console.log(
              "Images parsed from JSON string, count:",
              imageArray.length,
            );
          } else {
            // If it's not an array after parsing, use as single string
            imageArray = [listing.images];
            console.log(
              "Using single image string (not an array after parsing)",
            );
          }
        } catch (e) {
          // If parsing fails, it might be a single image URL
          imageArray = [listing.images];
          console.log("Using single image string (JSON parsing failed)");
        }
      }
    } else {
      console.log("No images in listing data");
    }
  } catch (error) {
    console.error("Error processing images:", error);
  }

  // Additional validation to ensure all array items are valid
  imageArray = imageArray.filter(
    (url) => url && typeof url === "string" && url.trim() !== "",
  );

  console.log("Final image array:", imageArray);

  // Make sure we have at least one image
  if (imageArray.length === 0) {
    console.log("Using default image as no valid images were found");
    imageArray = [defaultImage];
  }

  // Ensure we have a valid price
  const price =
    typeof listing.price === "string"
      ? parseFloat(listing.price)
      : typeof listing.price === "number"
        ? listing.price
        : 0;

  // Format the created date
  const createdAt = new Date(listing.createdAt);
  const isValidDate = !isNaN(createdAt.getTime());

  return (
    <DashboardLayout
      title={listing.title || "Listing Details"}
      description={`${getCategoryLabel(listing.category)} ${listing.subcategory ? `- ${listing.subcategory}` : ""}`}
    >
      <div className="container mx-auto px-4 py-6">
        <Button variant="link" onClick={navigateBack} className="p-0 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Image gallery and details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <Card>
              <CardContent className="p-4">
                <Carousel className="w-full">
                  <CarouselContent>
                    {imageArray.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`${listing.title} - image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {imageArray.length > 1 && (
                    <>
                      <CarouselPrevious />
                      <CarouselNext />
                    </>
                  )}
                </Carousel>

                {imageArray.length > 1 && (
                  <div className="flex mt-4 gap-2 overflow-x-auto pb-2">
                    {imageArray.map((image, index) => (
                      <div
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-16 h-16 flex-shrink-0 rounded-md overflow-hidden cursor-pointer border-2 
                          ${activeImageIndex === index ? "border-primary" : "border-transparent"}`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Listing details */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold">
                      {listing.title || "Untitled Listing"}
                    </h1>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {listing.isNegotiable && (
                        <Badge
                          variant="outline"
                          className="border-yellow-500 text-yellow-600"
                        >
                          Price Negotiable
                        </Badge>
                      )}
                      {listing.condition && (
                        <Badge variant="secondary">
                          {getConditionLabel(listing.condition)}
                        </Badge>
                      )}
                      {listing.deliveryAvailable && (
                        <Badge
                          variant="outline"
                          className="border-green-500 text-green-600"
                        >
                          Delivery Available
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    {listing.priceCurrency || "ZMW"} {price.toFixed(2)}
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                  {isValidDate && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Posted{" "}
                      {formatDistanceToNow(createdAt, { addSuffix: true })}
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Description</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {listing.description || "No description provided"}
                    </p>
                  </div>
                  
                  {/* Location map */}
                  {listing.locationId && locationData && (
                    <LocationMap
                      sellerLatitude={locationData.latitude ? parseFloat(locationData.latitude) : null}
                      sellerLongitude={locationData.longitude ? parseFloat(locationData.longitude) : null}
                      locationAddress={locationData.formattedAddress}
                      locationName={`${listing.title || 'Listing'} Location`}
                    />
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-4">
                    <div>
                      <h3 className="text-sm font-medium flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        Category
                      </h3>
                      <p className="text-muted-foreground">
                        {getCategoryLabel(listing.category)}
                      </p>
                    </div>
                    {listing.subcategory && (
                      <div>
                        <h3 className="text-sm font-medium">Subcategory</h3>
                        <p className="text-muted-foreground">
                          {listing.subcategory}
                        </p>
                      </div>
                    )}
                    {listing.quantity && (
                      <div>
                        <h3 className="text-sm font-medium flex items-center">
                          <Ruler className="h-4 w-4 mr-1" />
                          Quantity
                        </h3>
                        <p className="text-muted-foreground">
                          {listing.quantity} {listing.quantityUnit || "units"}
                        </p>
                      </div>
                    )}
                    {listing.priceUnit && (
                      <div>
                        <h3 className="text-sm font-medium flex items-center">
                          <span className="inline-flex items-center justify-center h-4 w-4 mr-1 text-xs font-semibold">ZMW</span>
                          Price Per Unit
                        </h3>
                        <p className="text-muted-foreground">
                          {listing.priceUnit}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFavoriteToggle}
                    >
                      <Heart
                        className={`h-4 w-4 mr-2 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
                      />
                      {isFavorite ? "Saved" : "Save"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Dialog
                      open={isReportDialogOpen}
                      onOpenChange={setIsReportDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Flag className="h-4 w-4 mr-2" />
                          Report
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Report Listing</DialogTitle>
                          <DialogDescription>
                            Please let us know why you're reporting this listing
                          </DialogDescription>
                        </DialogHeader>
                        <Textarea
                          value={reportReason}
                          onChange={(e) => setReportReason(e.target.value)}
                          placeholder="Describe the issue with this listing"
                          className="min-h-[100px]"
                        />
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsReportDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleReport}>Submit Report</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column: Seller info and contact */}
          <div className="space-y-6">
            {/* Seller info */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Seller Information
                </h2>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Seller ID: {listing.sellerId}</p>
                    <p className="text-sm text-muted-foreground">
                      Member since {new Date().getFullYear()}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                  >
                    {isAddingToCart ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <div className="flex items-center">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        <Plus className="h-3 w-3" />
                      </div>
                    )}
                    <span className="ml-1">{isAddingToCart ? "Adding..." : "Add to Cart"}</span>
                  </Button>
                  
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setIsContactDrawerOpen(true)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Seller
                  </Button>

                  {listing.contactPhone && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleCallSeller}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call: {listing.contactPhone}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Safety tips */}
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-2 text-amber-900">
                  Safety Tips
                </h2>
                <ul className="list-disc list-inside text-sm text-amber-800 space-y-2">
                  <li>Meet in a public, well-lit place</li>
                  <li>Inspect items before paying</li>
                  <li>Don't share personal financial information</li>
                  <li>Consider using secure payment methods</li>
                  <li>
                    Trust your instincts - if something seems suspicious, it
                    probably is
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact drawer for mobile */}
        <Drawer
          open={isContactDrawerOpen}
          onOpenChange={setIsContactDrawerOpen}
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Contact Seller</DrawerTitle>
              <DrawerDescription>
                Send a message about "{listing.title}"
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Hi, I'm interested in your "${listing.title}" listing. Is it still available?`}
                className="min-h-[150px]"
              />
            </div>
            <DrawerFooter>
              <Button onClick={handleSendMessage}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </DashboardLayout>
  );
}
