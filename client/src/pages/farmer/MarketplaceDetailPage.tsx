import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Loader2, ArrowLeft, MapPin, Calendar, MessageCircle, Share2, Flag, Heart, User, Star, ArrowRight, Send } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { MarketplaceListing } from "@shared/schema";

// Interface to adapt database model to UI needs
interface ListingDisplayData {
  id: number;
  title: string;
  description: string;
  category: string;
  subcategory: string | null;
  price: number;
  priceCurrency: string;
  quantity: string | null;
  quantityUnit: string | null;
  images: string[];
  createdAt: Date;
  isNegotiable: boolean;
  // Seller information - placeholders until we implement seller details
  sellerId: number;
  sellerName: string;
  sellerImage: string | null;
  sellerRating: number;
  sellerReviewCount: number;
  sellerJoined: Date;
  contactPhone: string | null;
  // Location information - placeholders until we implement location details
  location: string;
  address: string | null;
  coordinates: { lat: number; lng: number } | null;
  distance: number;
  // Reviews - placeholder until we implement reviews
  reviews: Array<{
    id: number;
    reviewerName: string;
    reviewerImage: string | null;
    rating: number;
    comment: string;
    date: Date;
  }>;
}

// Function to adapt the database model to the display model
function adaptListingForDisplay(listing: MarketplaceListing): ListingDisplayData {
  // Convert price from string/decimal to number for display
  const price = typeof listing.price === 'string' 
    ? parseFloat(listing.price) 
    : typeof listing.price === 'number' 
      ? listing.price 
      : 0;
      
  // Create a safe array of images
  const images = Array.isArray(listing.images) && listing.images 
    ? listing.images 
    : [];
    
  // Ensure isNegotiable is a boolean
  const isNegotiable = listing.isNegotiable === true || 
    String(listing.isNegotiable).toLowerCase() === 'true' ||
    Number(listing.isNegotiable) === 1 ||
    String(listing.isNegotiable) === '1';
    
  // Create a placeholder location display
  const location = listing.location || "Unknown location";
  
  // Placeholder coordinates for map display
  const coordinates = {
    lat: 0.0,
    lng: 0.0
  };
    
  return {
    id: listing.id,
    title: listing.title || "Untitled Listing",
    description: listing.description || "No description provided",
    category: listing.category || "Uncategorized",
    subcategory: listing.subcategory,
    price: price,
    priceCurrency: listing.priceCurrency || 'USD',
    quantity: listing.quantity?.toString() || null,
    quantityUnit: listing.quantityUnit || null,
    images: images.length > 0 ? images : ["https://placehold.co/700x500/green/white?text=No+Image"],
    createdAt: new Date(listing.createdAt),
    isNegotiable: isNegotiable,
    // Seller information
    sellerId: listing.sellerId || 0,
    sellerName: "Seller", // Will be populated from user data
    sellerImage: null,
    sellerRating: 4.5, // Placeholder
    sellerReviewCount: 0, // Placeholder
    sellerJoined: new Date(), // Placeholder  
    contactPhone: listing.contactPhone || null,
    // Location information
    location: location,
    address: "Address information unavailable", // Placeholder
    coordinates: coordinates, // Placeholder
    distance: 0, // Placeholder
    // Reviews placeholder
    reviews: [] // Empty array for now
  };
}

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Mock data - replace with API data when ready
const MOCK_LISTING = {
  id: 1,
  title: "High-yield Maize Seeds (10kg)",
  description: "Premium quality maize seeds with 95% germination rate. These seeds have been tested and proven to perform well in various climatic conditions. Package includes planting instructions and best practices for maximum yield.",
  category: "seeds",
  subcategory: "Maize",
  price: 45.99,
  priceCurrency: "USD",
  quantity: "10",
  quantityUnit: "kg",
  location: "Nairobi, Kenya",
  address: "Moi Avenue, Nairobi Central",
  coordinates: { lat: -1.2864, lng: 36.8172 },
  distance: 3.2,
  sellerName: "Kenya Seed Company",
  sellerRating: 4.8,
  sellerReviewCount: 156,
  sellerJoined: new Date(2022, 5, 15),
  sellerImage: null,
  images: [
    "https://placehold.co/700x500/green/white?text=Maize+Seeds+1",
    "https://placehold.co/700x500/darkgreen/white?text=Maize+Seeds+2",
    "https://placehold.co/700x500/green/white?text=Maize+Seeds+3",
  ],
  reviews: [
    {
      id: 1,
      reviewerName: "John Farmer",
      reviewerImage: null,
      rating: 5,
      comment: "Excellent seeds, 98% germination rate in my farm. Will buy again next season.",
      date: new Date(2023, 3, 10),
    },
    {
      id: 2,
      reviewerName: "Mary Gardens",
      reviewerImage: null,
      rating: 4,
      comment: "Good quality seeds but packaging could be improved. Got about 92% germination.",
      date: new Date(2023, 2, 25),
    },
  ],
  contactPhone: "+254712345678",
  createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
  updatedAt: new Date(Date.now() - 86400000), // 1 day ago
  isNegotiable: true,
  isFeatured: false,
};

export default function MarketplaceDetailPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState(false);
  
  // Fetch the actual listing data from the API
  const {
    data: listing,
    isLoading,
    error,
  } = useQuery<MarketplaceListing>({
    queryKey: ["/api/marketplace/listings", params.id],
  });
  
  // Use the actual listing data from the API, with fallback defaults
  const [displayedListing, setDisplayedListing] = useState<ListingDisplayData | null>(null);
  
  // When listing data changes, adapt it for display
  useEffect(() => {
    if (listing) {
      try {
        const adaptedListing = adaptListingForDisplay(listing);
        setDisplayedListing(adaptedListing);
      } catch (err) {
        console.error("Error adapting listing data:", err);
      }
    }
  }, [listing]);
  
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
    // In a real implementation, use the Web Share API if available
    // For now, just show a toast
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
    
    // In a real implementation, send the report to the server
    toast({
      title: "Listing reported",
      description: "Thank you for reporting this listing. Our team will review it.",
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
    
    // In a real implementation, send the message to the server
    toast({
      title: "Message sent",
      description: "Your message has been sent to the seller",
    });
    setMessageText("");
    setIsContactDrawerOpen(false);
  };
  
  const handleCallSeller = () => {
    // In a real implementation, this would use tel: protocol to make a call
    if (displayedListing && displayedListing.contactPhone) {
      window.location.href = `tel:${displayedListing.contactPhone}`;
    } else {
      toast({
        title: "Contact information unavailable",
        description: "This seller doesn't have contact information available",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <DashboardLayout title="Product Details" description="Marketplace listing details">
        <div className="flex justify-center items-center min-h-[500px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }
  
  if (error || !displayedListing) {
    return (
      <DashboardLayout title="Product Not Found" description="The listing you're looking for is unavailable">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-red-50 text-red-800 p-4 rounded-lg">
            <p>Error loading marketplace listing. The listing might have been removed or is unavailable.</p>
            <Button variant="link" onClick={navigateBack} className="p-0 mt-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout 
      title={displayedListing.title} 
      description={`${displayedListing.category} ${displayedListing.subcategory ? `- ${displayedListing.subcategory}` : ''}`}>
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
                <Carousel 
                  className="w-full"
                >
                  <CarouselContent>
                    {displayedListing.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`${displayedListing.title} - image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
                
                <div className="flex mt-4 gap-2">
                  {displayedListing.images.map((image, index) => (
                    <div 
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 
                        ${activeImageIndex === index ? 'border-primary' : 'border-transparent'}`}
                    >
                      <img 
                        src={image} 
                        alt={`Thumbnail ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Listing details */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold">{displayedListing.title}</h1>
                    {displayedListing.isNegotiable && (
                      <Badge className="mt-1 bg-yellow-500">Negotiable</Badge>
                    )}
                  </div>
                  <div className="text-2xl font-bold">
                    {displayedListing.priceCurrency} {displayedListing.price.toFixed(2)}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {displayedListing.location} · {displayedListing.distance} km away
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Posted {formatDistanceToNow(displayedListing.createdAt, { addSuffix: true })}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Description</h2>
                    <p className="text-muted-foreground">{displayedListing.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 my-4">
                    <div>
                      <h3 className="text-sm font-medium">Category</h3>
                      <p className="text-muted-foreground">{displayedListing.category}</p>
                    </div>
                    {displayedListing.subcategory && (
                      <div>
                        <h3 className="text-sm font-medium">Subcategory</h3>
                        <p className="text-muted-foreground">{displayedListing.subcategory}</p>
                      </div>
                    )}
                    {displayedListing.quantity && (
                      <div>
                        <h3 className="text-sm font-medium">Quantity</h3>
                        <p className="text-muted-foreground">
                          {displayedListing.quantity} {displayedListing.quantityUnit}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleFavoriteToggle}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                      {isFavorite ? 'Saved' : 'Save'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                        >
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
                          <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleReport}>
                            Submit Report
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Reviews section */}
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="reviews">
                  <TabsList className="mb-4">
                    <TabsTrigger value="reviews">
                      Reviews ({displayedListing.reviews.length})
                    </TabsTrigger>
                    <TabsTrigger value="location">
                      Location
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="reviews" className="space-y-4">
                    {displayedListing.reviews.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No reviews yet for this listing
                      </div>
                    ) : (
                      displayedListing.reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={review.reviewerImage || undefined} />
                                <AvatarFallback>{review.reviewerName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{review.reviewerName}</p>
                                <div className="flex items-center text-yellow-500">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-500' : 'text-muted-foreground'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(review.date, 'MMM d, yyyy')}
                            </span>
                          </div>
                          <p className="mt-2 text-muted-foreground">{review.comment}</p>
                        </div>
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="location">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                      {/* In a real implementation, add a map component here */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="h-8 w-8 mx-auto mb-2" />
                          <p>{displayedListing.address || "Address not available"}</p>
                          {displayedListing.coordinates && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Lat: {displayedListing.coordinates.lat.toFixed(4)}, 
                              Lng: {displayedListing.coordinates.lng.toFixed(4)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column: Seller info and contact */}
          <div className="space-y-6">
            {/* Seller info */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Seller Information</h2>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={displayedListing.sellerImage || undefined} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{displayedListing.sellerName}</p>
                    <div className="flex items-center text-sm">
                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                      <span>{displayedListing.sellerRating}</span>
                      <span className="text-muted-foreground ml-1">
                        ({displayedListing.sellerReviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground mb-4">
                  <p>Member since {format(displayedListing.sellerJoined, 'MMMM yyyy')}</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button className="bg-green-600 hover:bg-green-700 w-full" onClick={() => setIsContactDrawerOpen(true)}>
                    <MessageCircle className="h-4 w-4 mr-2" /> 
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleCallSeller}>
                    Call Seller
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Safety tips */}
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-2 text-amber-900">Safety Tips</h2>
                <ul className="list-disc list-inside text-sm text-amber-800 space-y-2">
                  <li>Meet in a public, well-lit place</li>
                  <li>Inspect items before paying</li>
                  <li>Don't share personal financial information</li>
                  <li>Consider using secure payment methods</li>
                  <li>Trust your instincts - if something seems suspicious, it probably is</li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Similar listings teaser */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Similar Listings</h2>
                  <Button variant="link" className="p-0" onClick={() => setLocation("/dashboard/marketplace")}>
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {/* Mock similar listings - replace with real data */}
                  {[
                    {
                      id: 2,
                      title: "Premium Maize Seeds (5kg)",
                      price: 25.99,
                      image: "https://placehold.co/300x200/darkgreen/white?text=Similar+1",
                    },
                    {
                      id: 3,
                      title: "Organic Maize Seeds",
                      price: 55.00,
                      image: "https://placehold.co/300x200/green/white?text=Similar+2",
                    },
                  ].map((item) => (
                    <div 
                      key={item.id} 
                      className="flex gap-3 cursor-pointer hover:bg-muted p-2 rounded-lg transition-colors"
                      onClick={() => setLocation(`/dashboard/marketplace/${item.id}`)}
                    >
                      <div className="w-20 h-20 rounded-md bg-muted overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium line-clamp-2">{item.title}</p>
                        <p className="text-sm font-semibold mt-1">
                          {displayedListing.priceCurrency} {item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Contact drawer for mobile */}
        <Drawer open={isContactDrawerOpen} onOpenChange={setIsContactDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Contact Seller</DrawerTitle>
              <DrawerDescription>
                Send a message to {displayedListing.sellerName} about this listing
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Hi, I'm interested in your "${displayedListing.title}" listing. Is it still available?`}
                className="min-h-[150px]"
              />
            </div>
            <DrawerFooter>
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4 mr-2" />
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