import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MapPin,
  Star,
  Phone,
  // Mail,
  Filter,
  Store,
  Award,
  Clock,
  DollarSign,
  Truck,
  // Package,
  Users,
  CheckCircle,
} from "lucide-react";
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
// import { Separator } from "@/components/ui/separator";
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
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Dealer categories
const DEALER_CATEGORIES = [
  { id: "pesticides", name: "Pesticides & Herbicides" },
  { id: "fertilizers", name: "Fertilizers & Soil Amendments" },
  { id: "seeds", name: "Seeds & Plants" },
  { id: "equipment", name: "Farm Equipment" },
  { id: "tools", name: "Tools & Supplies" },
  { id: "livestock", name: "Livestock & Feed" },
  { id: "irrigation", name: "Irrigation Systems" },
  { id: "organic", name: "Organic Products" },
  { id: "general", name: "General Agricultural Supplies" },
];

// Mock dealer data - will be replaced with API
interface Dealer {
  id: number;
  name: string;
  businessType: string;
  categories: string[];
  location: string;
  coordinates: { lat: number; lng: number };
  rating: number;
  reviewCount: number;
  distance?: number; // in km
  phone: string;
  email: string;
  website?: string;
  description: string;
  services: {
    delivery: boolean;
    credit: boolean;
    technicalSupport: boolean;
    bulkOrders: boolean;
    emergencySupply: boolean;
  };
  operatingHours: string;
  verified: boolean;
  certified: boolean;
  image?: string;
  products: string[];
  specialties: string[];
}

// Mock data
const mockDealers: Dealer[] = [
  {
    id: 1,
    name: "AgroTech Supplies Ltd",
    businessType: "Agricultural Supplier",
    categories: ["pesticides", "fertilizers", "equipment"],
    location: "Nairobi West, Kenya",
    coordinates: { lat: -1.2921, lng: 36.8219 },
    rating: 4.7,
    reviewCount: 234,
    distance: 2.3,
    phone: "+254 700 123 456",
    email: "info@agrotech.co.ke",
    website: "https://agrotech.co.ke",
    description:
      "Leading supplier of agricultural inputs with over 15 years of experience serving Kenyan farmers.",
    services: {
      delivery: true,
      credit: true,
      technicalSupport: true,
      bulkOrders: true,
      emergencySupply: true,
    },
    operatingHours: "Mon-Fri: 8AM-6PM, Sat: 8AM-4PM",
    verified: true,
    certified: true,
    products: [
      "Fungicides",
      "Insecticides",
      "NPK Fertilizers",
      "Organic Fertilizers",
    ],
    specialties: ["Plant Protection", "Soil Fertility", "Crop Nutrition"],
  },
  {
    id: 2,
    name: "Green Valley Agro Dealers",
    businessType: "Agro Dealer",
    categories: ["seeds", "organic", "tools"],
    location: "Eldoret, Kenya",
    coordinates: { lat: 0.5204, lng: 35.2697 },
    rating: 4.5,
    reviewCount: 156,
    distance: 5.1,
    phone: "+254 733 987 654",
    email: "sales@greenvalley.co.ke",
    description:
      "Specialized in organic farming supplies and certified seeds for sustainable agriculture.",
    services: {
      delivery: true,
      credit: false,
      technicalSupport: true,
      bulkOrders: true,
      emergencySupply: false,
    },
    operatingHours: "Mon-Sat: 7AM-7PM",
    verified: true,
    certified: true,
    products: [
      "Organic Seeds",
      "Bio Fertilizers",
      "Garden Tools",
      "Organic Pesticides",
    ],
    specialties: ["Organic Farming", "Seed Quality", "Sustainable Agriculture"],
  },
  {
    id: 3,
    name: "Farmers Choice Equipment",
    businessType: "Equipment Dealer",
    categories: ["equipment", "irrigation", "tools"],
    location: "Nakuru, Kenya",
    coordinates: { lat: -0.3031, lng: 36.08 },
    rating: 4.8,
    reviewCount: 189,
    distance: 8.7,
    phone: "+254 722 456 789",
    email: "info@farmerschoice.co.ke",
    website: "https://farmerschoice.co.ke",
    description:
      "Premium farm equipment and irrigation systems supplier with expert technical support.",
    services: {
      delivery: true,
      credit: true,
      technicalSupport: true,
      bulkOrders: true,
      emergencySupply: true,
    },
    operatingHours: "Mon-Fri: 8AM-5PM, Sat: 8AM-1PM",
    verified: true,
    certified: true,
    products: ["Irrigation Systems", "Tractors", "Harvesters", "Farm Tools"],
    specialties: ["Irrigation", "Mechanization", "Precision Farming"],
  },
  {
    id: 4,
    name: "Mama's Agro Shop",
    businessType: "Local Agro Dealer",
    categories: ["general", "fertilizers", "pesticides"],
    location: "Kisumu, Kenya",
    coordinates: { lat: -0.0917, lng: 34.768 },
    rating: 4.3,
    reviewCount: 98,
    distance: 12.4,
    phone: "+254 711 234 567",
    email: "mamasagro@gmail.com",
    description:
      "Family-owned agro dealer providing personalized service and local expertise.",
    services: {
      delivery: true,
      credit: true,
      technicalSupport: false,
      bulkOrders: false,
      emergencySupply: true,
    },
    operatingHours: "Daily: 6AM-8PM",
    verified: true,
    certified: false,
    products: ["Basic Fertilizers", "Common Pesticides", "Garden Supplies"],
    specialties: ["Local Knowledge", "Personal Service", "Flexible Credit"],
  },
];

interface FilterState {
  search: string;
  category: string;
  maxDistance: number;
  minRating: number;
  verifiedOnly: boolean;
  certifiedOnly: boolean;
  deliveryOnly: boolean;
}

export default function DealerDirectoryPage() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "all",
    maxDistance: 50,
    minRating: 0,
    verifiedOnly: false,
    certifiedOnly: false,
    deliveryOnly: false,
  });

  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState<string>("distance");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          // console.error("Error getting location:", error);
          toast({
            title: "Location access denied",
            description: "Enable location services to see dealers near you",
            variant: "destructive",
          });
        }
      );
    }
  }, []);

  // Calculate distances if user location is available
  const dealersWithDistance = mockDealers.map((dealer) => {
    if (userLocation) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        dealer.coordinates.lat,
        dealer.coordinates.lng
      );
      return { ...dealer, distance };
    }
    return dealer;
  });

  // Fetch dealers - using mock data for now
  const { data: dealers = dealersWithDistance, isLoading } = useQuery<Dealer[]>(
    {
      queryKey: ["dealers", filters, userLocation],
      queryFn: async () => {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return dealersWithDistance;
      },
    }
  );

  // Filter dealers
  const filteredDealers = dealers.filter((dealer) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !dealer.name.toLowerCase().includes(searchLower) &&
        !dealer.description.toLowerCase().includes(searchLower) &&
        !dealer.products.some((product) =>
          product.toLowerCase().includes(searchLower)
        )
      ) {
        return false;
      }
    }

    // Category filter
    if (filters.category !== "all") {
      if (!dealer.categories.includes(filters.category)) {
        return false;
      }
    }

    // Distance filter
    if (dealer.distance && dealer.distance > filters.maxDistance) {
      return false;
    }

    // Rating filter
    if (dealer.rating < filters.minRating) {
      return false;
    }

    // Verified filter
    if (filters.verifiedOnly && !dealer.verified) {
      return false;
    }

    // Certified filter
    if (filters.certifiedOnly && !dealer.certified) {
      return false;
    }

    // Delivery filter
    if (filters.deliveryOnly && !dealer.services.delivery) {
      return false;
    }

    return true;
  });

  // Sort dealers
  const sortedDealers = [...filteredDealers].sort((a, b) => {
    switch (sortBy) {
      case "distance":
        if (a.distance && b.distance) {
          return a.distance - b.distance;
        }
        return 0;
      case "rating":
        return b.rating - a.rating;
      case "reviews":
        return b.reviewCount - a.reviewCount;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchValue }));
  };

  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({ ...prev, category }));
  };

  const handleDistanceChange = (values: number[]) => {
    setFilters((prev) => ({ ...prev, maxDistance: values[0] }));
  };

  const handleRatingChange = (values: number[]) => {
    setFilters((prev) => ({ ...prev, minRating: values[0] }));
  };

  const handleVerifiedChange = (checked: boolean) => {
    setFilters((prev) => ({ ...prev, verifiedOnly: checked }));
  };

  const handleCertifiedChange = (checked: boolean) => {
    setFilters((prev) => ({ ...prev, certifiedOnly: checked }));
  };

  const handleDeliveryChange = (checked: boolean) => {
    setFilters((prev) => ({ ...prev, deliveryOnly: checked }));
  };

  const contactDealer = (dealer: Dealer) => {
    // Open contact options
    toast({
      title: "Contact Dealer",
      description: `Call ${dealer.name} at ${dealer.phone}`,
    });
  };

  const viewDealer = (dealerId: number) => {
    setLocation(`/dashboard/dealers/${dealerId}`);
  };

  return (
    <DashboardLayout title="Dealer Directory">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agricultural Dealers Directory
          </h1>
          <p className="text-gray-600">
            Find local agro-dealers, suppliers, and equipment providers near you
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Search dealers by name, products, or location..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Sort */}
            <div className="w-full lg:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Nearest First</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Dealers</SheetTitle>
                  <SheetDescription>
                    Refine your search to find the perfect dealer
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  {/* Category */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Category
                    </label>
                    <Select
                      value={filters.category}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {DEALER_CATEGORIES.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Max Distance */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Maximum Distance: {filters.maxDistance} km
                    </label>
                    <Slider
                      value={[filters.maxDistance]}
                      onValueChange={handleDistanceChange}
                      max={100}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Min Rating */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Minimum Rating: {filters.minRating} stars
                    </label>
                    <Slider
                      value={[filters.minRating]}
                      onValueChange={handleRatingChange}
                      max={5}
                      min={0}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  {/* Service Filters */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={filters.verifiedOnly}
                        onCheckedChange={handleVerifiedChange}
                      />
                      <label className="text-sm font-medium">
                        Verified dealers only
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={filters.certifiedOnly}
                        onCheckedChange={handleCertifiedChange}
                      />
                      <label className="text-sm font-medium">
                        Certified dealers only
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={filters.deliveryOnly}
                        onCheckedChange={handleDeliveryChange}
                      />
                      <label className="text-sm font-medium">
                        Delivery service only
                      </label>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            Found {sortedDealers.length} dealer
            {sortedDealers.length !== 1 ? "s" : ""}
            {userLocation && " near you"}
          </p>
        </div>

        {/* Dealers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedDealers.map((dealer) => (
              <Card
                key={dealer.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{dealer.name}</CardTitle>
                        {dealer.verified && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {dealer.certified && (
                          <Badge variant="outline" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            Certified
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        {dealer.businessType}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= dealer.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {dealer.rating} ({dealer.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Location and Distance */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {dealer.location}
                    {dealer.distance && (
                      <Badge variant="outline" className="text-xs">
                        {dealer.distance.toFixed(1)} km
                      </Badge>
                    )}
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1">
                    {dealer.categories.slice(0, 2).map((category) => (
                      <Badge
                        key={category}
                        variant="outline"
                        className="text-xs"
                      >
                        {DEALER_CATEGORIES.find((c) => c.id === category)
                          ?.name || category}
                      </Badge>
                    ))}
                    {dealer.categories.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{dealer.categories.length - 2} more
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {dealer.description}
                  </p>

                  {/* Services */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {dealer.services.delivery && (
                      <Badge variant="outline" className="text-xs">
                        <Truck className="h-3 w-3 mr-1" />
                        Delivery
                      </Badge>
                    )}
                    {dealer.services.credit && (
                      <Badge variant="outline" className="text-xs">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Credit
                      </Badge>
                    )}
                    {dealer.services.technicalSupport && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        Support
                      </Badge>
                    )}
                  </div>

                  {/* Operating Hours */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{dealer.operatingHours}</span>
                  </div>

                  {/* Top Products */}
                  <div className="text-sm">
                    <p className="font-medium mb-1">Top Products:</p>
                    <div className="flex flex-wrap gap-1">
                      {dealer.products.slice(0, 3).map((product) => (
                        <Badge
                          key={product}
                          variant="secondary"
                          className="text-xs"
                        >
                          {product}
                        </Badge>
                      ))}
                      {dealer.products.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{dealer.products.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => viewDealer(dealer.id)}
                    className="flex-1"
                  >
                    <Store className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    onClick={() => contactDealer(dealer)}
                    className="flex-1"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && sortedDealers.length === 0 && (
          <div className="text-center py-12">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No dealers found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search terms to find dealers.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
