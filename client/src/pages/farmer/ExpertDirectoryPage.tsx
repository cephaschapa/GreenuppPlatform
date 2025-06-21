import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MapPin,
  Star,
  MessageCircle,
  Phone,
  Mail,
  Filter,
  Users,
  Award,
  Calendar,
  Clock,
  DollarSign,
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
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Expert specialties
const EXPERT_SPECIALTIES = [
  { id: "plant-disease", name: "Plant Disease Management" },
  { id: "soil-science", name: "Soil Science & Fertility" },
  { id: "crop-management", name: "Crop Management" },
  { id: "pest-control", name: "Pest Control & IPM" },
  { id: "irrigation", name: "Irrigation Systems" },
  { id: "organic-farming", name: "Organic Farming" },
  { id: "precision-agriculture", name: "Precision Agriculture" },
  { id: "livestock", name: "Livestock Management" },
  { id: "market-analysis", name: "Market Analysis" },
  { id: "financial-planning", name: "Financial Planning" },
  { id: "equipment", name: "Farm Equipment" },
  { id: "general", name: "General Agriculture" },
];

// Mock expert data - will be replaced with API
interface Expert {
  id: number;
  name: string;
  title: string;
  specialties: string[];
  location: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  availability: "available" | "busy" | "offline";
  experience: number; // years
  certifications: string[];
  description: string;
  languages: string[];
  contactMethods: {
    chat: boolean;
    phone: boolean;
    video: boolean;
    inPerson: boolean;
  };
  responseTime: string;
  verified: boolean;
  image?: string;
}

// Mock data
const mockExperts: Expert[] = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    title: "Plant Pathologist",
    specialties: ["plant-disease", "crop-management"],
    location: "Nairobi, Kenya",
    rating: 4.8,
    reviewCount: 127,
    hourlyRate: 2500,
    availability: "available",
    experience: 15,
    certifications: ["PhD Plant Pathology", "Certified Crop Advisor"],
    description:
      "Expert in plant disease diagnosis and treatment with 15+ years of experience in tropical agriculture.",
    languages: ["English", "Swahili"],
    contactMethods: {
      chat: true,
      phone: true,
      video: true,
      inPerson: true,
    },
    responseTime: "2 hours",
    verified: true,
  },
  {
    id: 2,
    name: "John Mwangi",
    title: "Soil Scientist",
    specialties: ["soil-science", "organic-farming"],
    location: "Eldoret, Kenya",
    rating: 4.6,
    reviewCount: 89,
    hourlyRate: 1800,
    availability: "available",
    experience: 12,
    certifications: ["MSc Soil Science", "Organic Certification"],
    description:
      "Specialized in soil fertility management and organic farming practices for sustainable agriculture.",
    languages: ["English", "Swahili", "Kikuyu"],
    contactMethods: {
      chat: true,
      phone: true,
      video: false,
      inPerson: true,
    },
    responseTime: "4 hours",
    verified: true,
  },
  {
    id: 3,
    name: "Dr. Maria Ochieng",
    title: "Agricultural Economist",
    specialties: ["market-analysis", "financial-planning"],
    location: "Mombasa, Kenya",
    rating: 4.9,
    reviewCount: 203,
    hourlyRate: 3200,
    availability: "busy",
    experience: 18,
    certifications: ["PhD Agricultural Economics", "CFA"],
    description:
      "Expert in agricultural market analysis, financial planning, and investment strategies for farmers.",
    languages: ["English", "Swahili", "Luo"],
    contactMethods: {
      chat: true,
      phone: true,
      video: true,
      inPerson: false,
    },
    responseTime: "1 hour",
    verified: true,
  },
  {
    id: 4,
    name: "Peter Kamau",
    title: "Pest Management Specialist",
    specialties: ["pest-control", "organic-farming"],
    location: "Nakuru, Kenya",
    rating: 4.7,
    reviewCount: 156,
    hourlyRate: 2000,
    availability: "available",
    experience: 10,
    certifications: ["BSc Entomology", "IPM Certification"],
    description:
      "Integrated pest management specialist with expertise in organic and sustainable pest control methods.",
    languages: ["English", "Swahili", "Kikuyu"],
    contactMethods: {
      chat: true,
      phone: true,
      video: true,
      inPerson: true,
    },
    responseTime: "3 hours",
    verified: true,
  },
];

interface FilterState {
  search: string;
  specialty: string;
  maxRate: number;
  minRating: number;
  availability: string;
  verifiedOnly: boolean;
}

export default function ExpertDirectoryPage() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    specialty: "all",
    maxRate: 5000,
    minRating: 0,
    availability: "all",
    verifiedOnly: false,
  });

  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy] = useState<string>("rating");

  // Fetch experts - using mock data for now
  const { data: experts = mockExperts, isLoading } = useQuery<Expert[]>({
    queryKey: ["experts", filters],
    queryFn: async () => {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return mockExperts;
    },
  });

  // Filter experts
  const filteredExperts = experts.filter((expert) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !expert.name.toLowerCase().includes(searchLower) &&
        !expert.title.toLowerCase().includes(searchLower) &&
        !expert.description.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Specialty filter
    if (filters.specialty !== "all") {
      if (!expert.specialties.includes(filters.specialty)) {
        return false;
      }
    }

    // Rate filter
    if (expert.hourlyRate > filters.maxRate) {
      return false;
    }

    // Rating filter
    if (expert.rating < filters.minRating) {
      return false;
    }

    // Availability filter
    if (filters.availability !== "all") {
      if (expert.availability !== filters.availability) {
        return false;
      }
    }

    // Verified filter
    if (filters.verifiedOnly && !expert.verified) {
      return false;
    }

    return true;
  });

  // Sort experts
  const sortedExperts = [...filteredExperts].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "experience":
        return b.experience - a.experience;
      case "rate-low":
        return a.hourlyRate - b.hourlyRate;
      case "rate-high":
        return b.hourlyRate - a.hourlyRate;
      case "response-time":
        return a.responseTime.localeCompare(b.responseTime);
      default:
        return 0;
    }
  });

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchValue }));
  };

  const handleSpecialtyChange = (specialty: string) => {
    setFilters((prev) => ({ ...prev, specialty }));
  };

  const handleRateChange = (values: number[]) => {
    setFilters((prev) => ({ ...prev, maxRate: values[0] }));
  };

  const handleRatingChange = (values: number[]) => {
    setFilters((prev) => ({ ...prev, minRating: values[0] }));
  };

  const handleAvailabilityChange = (availability: string) => {
    setFilters((prev) => ({ ...prev, availability }));
  };

  const handleVerifiedChange = (checked: boolean) => {
    setFilters((prev) => ({ ...prev, verifiedOnly: checked }));
  };

  const startChat = (expertId: number) => {
    setLocation(`/chat/experts/${expertId}`);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "text-green-600 bg-green-100";
      case "busy":
        return "text-orange-600 bg-orange-100";
      case "offline":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case "available":
        return "Available";
      case "busy":
        return "Busy";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  return (
    <DashboardLayout title="Expert Directory">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agricultural Experts Directory
          </h1>
          <p className="text-gray-600">
            Connect with certified agricultural experts for personalized advice
            and consultation
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Search experts by name, specialty, or description..."
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
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="experience">Most Experienced</SelectItem>
                  <SelectItem value="rate-low">Lowest Rate</SelectItem>
                  <SelectItem value="rate-high">Highest Rate</SelectItem>
                  <SelectItem value="response-time">
                    Fastest Response
                  </SelectItem>
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
                  <SheetTitle>Filter Experts</SheetTitle>
                  <SheetDescription>
                    Refine your search to find the perfect expert
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  {/* Specialty */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Specialty
                    </label>
                    <Select
                      value={filters.specialty}
                      onValueChange={handleSpecialtyChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Specialties</SelectItem>
                        {EXPERT_SPECIALTIES.map((specialty) => (
                          <SelectItem key={specialty.id} value={specialty.id}>
                            {specialty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Max Rate */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Maximum Rate: KES {filters.maxRate}/hour
                    </label>
                    <Slider
                      value={[filters.maxRate]}
                      onValueChange={handleRateChange}
                      max={10000}
                      min={500}
                      step={500}
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

                  {/* Availability */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Availability
                    </label>
                    <Select
                      value={filters.availability}
                      onValueChange={handleAvailabilityChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="busy">Busy</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Verified Only */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={filters.verifiedOnly}
                      onCheckedChange={handleVerifiedChange}
                    />
                    <label className="text-sm font-medium">
                      Verified experts only
                    </label>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            Found {sortedExperts.length} expert
            {sortedExperts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Experts Grid */}
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
            {sortedExperts.map((expert) => (
              <Card
                key={expert.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{expert.name}</CardTitle>
                        {expert.verified && (
                          <Badge variant="secondary" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        {expert.title}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getAvailabilityColor(
                        expert.availability
                      )}`}
                    >
                      {getAvailabilityText(expert.availability)}
                    </Badge>
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
                            star <= expert.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {expert.rating} ({expert.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {expert.location}
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1">
                    {expert.specialties.slice(0, 2).map((specialty) => (
                      <Badge
                        key={specialty}
                        variant="outline"
                        className="text-xs"
                      >
                        {EXPERT_SPECIALTIES.find((s) => s.id === specialty)
                          ?.name || specialty}
                      </Badge>
                    ))}
                    {expert.specialties.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{expert.specialties.length - 2} more
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {expert.description}
                  </p>

                  {/* Contact Methods */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {expert.contactMethods.chat && (
                      <Badge variant="outline" className="text-xs">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Chat
                      </Badge>
                    )}
                    {expert.contactMethods.phone && (
                      <Badge variant="outline" className="text-xs">
                        <Phone className="h-3 w-3 mr-1" />
                        Phone
                      </Badge>
                    )}
                    {expert.contactMethods.video && (
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        Video
                      </Badge>
                    )}
                  </div>

                  {/* Rate and Response Time */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">
                        KES {expert.hourlyRate.toLocaleString()}/hour
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{expert.responseTime}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => startChat(expert.id)}
                    className="w-full"
                    disabled={expert.availability === "offline"}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Consultation
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && sortedExperts.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No experts found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search terms to find experts.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
