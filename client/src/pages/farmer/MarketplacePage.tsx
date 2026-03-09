import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  Search,
  Filter,
  MapPin,
  Star,
  Heart,
  Plus,
  ShoppingCart,
  Bell,
  Sparkles,
  Layers,
  Map as MapIcon,
  List as ListIcon,
  AlertTriangle,
  ShieldCheck,
  Leaf,
  BadgeDollarSign,
  X,
  DollarSign,
  MessageCircle,
  Truck,
  ClipboardCheck,
  TrendingUp,
  Package,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Clock,
  Target,
  ChevronRight,
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
import { formatDistanceToNow } from "date-fns";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MarketplaceListing } from "@shared/schema";
import { useMarketplaceFavorites } from "@/hooks/use-marketplace-favorites";
import { useMarketplaceReviews } from "@/hooks/use-marketplace-reviews";
import { useAuth } from "@/hooks/use-auth";
import { CATEGORIES_FOR_FILTER } from "@shared/marketplaceCategories";

const MARKETPLACE_CATEGORIES = CATEGORIES_FOR_FILTER.filter((c) => c.id !== "all");
const MARKETING_CATEGORY_LOOKUP = MARKETPLACE_CATEGORIES.reduce<
  Record<string, string>
>((acc, category) => {
  acc[category.id] = category.name;
  return acc;
}, {});

// Mock data - will be replaced with API call
interface FilterState {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  distance: number;
  negotiableOnly: boolean;
}

type QuickFilterConfig = {
  id: string;
  label: string;
  description: string;
  icon: string;
  predicate: (listing: MarketplaceListing) => boolean;
};

type SavedSearch = {
  id: string;
  label: string;
  filters: FilterState;
  quickFilters: string[];
  createdAt: string;
};

interface SellerOrderItem {
  id: number;
  listingId: number;
  quantity: number;
  unitPrice: number;
  listing?: {
    title?: string;
    images?: string[];
  };
}

interface SellerOrder {
  id: number;
  orderNumber?: string;
  status: string;
  totalAmount?: string;
  currency?: string;
  paymentStatus?: string;
  createdAt: string;
  estimatedDeliveryDate?: string;
  buyer?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    companyName?: string;
  };
  items?: SellerOrderItem[];
  statusHistory?: Array<{
    status: string;
    notes?: string;
    createdAt: string;
  }>;
}

const THREE_DAYS_MS = 1000 * 60 * 60 * 24 * 3;

const getNumericPrice = (listing: MarketplaceListing): number | null => {
  if (listing.price === null || listing.price === undefined) {
    return null;
  }

  const parsed =
    typeof listing.price === "string"
      ? parseFloat(listing.price)
      : Number(listing.price);

  return Number.isFinite(parsed) ? parsed : null;
};

const isFreshListing = (listing: MarketplaceListing): boolean => {
  const reference = listing.harvestDate || listing.createdAt;
  if (!reference) return false;
  const diff = Date.now() - new Date(reference).getTime();
  return diff <= THREE_DAYS_MS;
};

const isVerifiedListing = (listing: MarketplaceListing): boolean =>
  Boolean(listing.greenuppVerified || listing.blockchainVerified);

const isOrganicListing = (listing: MarketplaceListing): boolean =>
  Boolean(listing.organicCertified || listing.pesticideFree || listing.gmoFree);

const isPremiumListing = (listing: MarketplaceListing): boolean => {
  const price = getNumericPrice(listing);
  return typeof price === "number" && price >= 5000;
};

const QUICK_FILTER_CONFIG: QuickFilterConfig[] = [
  {
    id: "fresh",
    label: "Fresh harvest (<3d)",
    description: "Recently harvested & ready to ship",
    icon: "🌾",
    predicate: isFreshListing,
  },
  {
    id: "verified",
    label: "Verified supply",
    description: "Greenupp or blockchain verified lots",
    icon: "✅",
    predicate: isVerifiedListing,
  },
  {
    id: "organic",
    label: "Organic / pesticide free",
    description: "Organic certified or pesticide-free",
    icon: "🌿",
    predicate: isOrganicListing,
  },
  {
    id: "premium",
    label: "Premium lots",
    description: "Average price above ZMW 5,000",
    icon: "💎",
    predicate: isPremiumListing,
  },
];

const QUICK_FILTER_PREDICATES = QUICK_FILTER_CONFIG.reduce<
  Record<string, QuickFilterConfig["predicate"]>
>((acc, config) => {
  acc[config.id] = config.predicate;
  return acc;
}, {});

const getListingPriceString = (listing: MarketplaceListing) => {
  try {
    const priceValue =
      typeof listing.price === "string"
        ? parseFloat(listing.price)
        : Number(listing.price);
    if (Number.isNaN(priceValue)) {
      return "ZMW —";
    }
    const formatted = priceValue.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });
    return `ZMW ${formatted}${listing.priceUnit ? ` / ${listing.priceUnit}` : ""}`;
  } catch {
    return "ZMW —";
  }
};

const SELLER_STATUS_BUCKETS = [
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "ready", label: "Ready" },
  { id: "inTransit", label: "In transit" },
  { id: "delivered", label: "Delivered" },
];

const normalizeOrderStatus = (status?: string) => {
  if (!status) return "pending";
  const normalized = status.toLowerCase();
  if (normalized.includes("transit") || normalized.includes("ship")) {
    return "inTransit";
  }
  if (normalized.includes("deliver")) {
    return "delivered";
  }
  if (normalized.includes("ready") || normalized.includes("pickup")) {
    return "ready";
  }
  if (normalized.includes("confirm") || normalized.includes("processing")) {
    return "confirmed";
  }
  if (normalized.includes("pending") || normalized.includes("awaiting")) {
    return "pending";
  }
  return normalized as
    | "pending"
    | "confirmed"
    | "ready"
    | "inTransit"
    | "delivered";
};

const formatCurrency = (value: number | null | undefined) => {
  if (!value || Number.isNaN(value)) {
    return "ZMW 0";
  }
  return `ZMW ${value.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
};

export default function MarketplacePage() {
  const { user } = useAuth();
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
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const isSeller = user?.role === "seller";
  const sellerId = user?.id;

  // Fetch marketplace listings
  const {
    data: listings,
    isLoading,
    error,
  } = useQuery<MarketplaceListing[]>({
    queryKey: ["/api/marketplace/listings", filters],
  });

  const {
    data: sellerOrders = [],
    isLoading: sellerOrdersLoading,
    error: sellerOrdersError,
  } = useQuery<SellerOrder[]>({
    queryKey: ["/api/orders", "seller-dashboard"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/orders?role=seller");
        if (!response.ok) {
          throw new Error("Failed to fetch seller orders");
        }
        return await response.json();
      } catch (err) {
        // console.error("Seller orders fetch error:", err);
        return [];
      }
    },
    enabled: isSeller,
  });

  const quickFilterOptions = QUICK_FILTER_CONFIG;

  const marketplaceStats = useMemo(() => {
    if (!listings || listings.length === 0) {
      return {
        averagePrice: null,
        freshListings: 0,
        negotiableListings: 0,
        verifiedListings: 0,
      };
    }

    const numericPrices = listings
      .map(getNumericPrice)
      .filter((value): value is number => value !== null);

    const averagePrice = numericPrices.length
      ? numericPrices.reduce((sum, price) => sum + price, 0) / numericPrices.length
      : null;

    const freshListings = listings.filter(isFreshListing).length;
    const negotiableListings = listings.filter((listing) => {
      if (typeof listing.isNegotiable === "boolean") return listing.isNegotiable;
      if (typeof listing.isNegotiable === "string") {
        return listing.isNegotiable.toLowerCase() === "true";
      }
      return false;
    }).length;
    const verifiedListings = listings.filter(isVerifiedListing).length;

    return {
      averagePrice,
      freshListings,
      negotiableListings,
      verifiedListings,
    };
  }, [listings]);

  const priceSignals = useMemo(() => {
    if (!listings || listings.length === 0) {
      return [];
    }

    const grouped = listings.reduce(
      (acc, listing) => {
        const price = getNumericPrice(listing);
        if (price === null) return acc;
        const category = listing.category || "general";
        if (!acc[category]) {
          acc[category] = { total: 0, count: 0 };
        }
        acc[category].total += price;
        acc[category].count += 1;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>
    );

    return Object.entries(grouped)
      .map(([category, stats]) => ({
        category,
        average: stats.total / stats.count,
        listings: stats.count,
      }))
      .sort((a, b) => b.listings - a.listings)
      .slice(0, 4);
  }, [listings]);

  const locationClusters = useMemo(() => {
    if (!listings || listings.length === 0) return [];

    const now = Date.now();
    const aggregated = listings.reduce(
      (acc, listing) => {
        const key =
          listing.farmLocation ||
          (listing as any).location ||
          listing.farmName ||
          "Unspecified location";
        if (!acc[key]) {
          acc[key] = { count: 0, recent: 0 };
        }
        acc[key].count += 1;
        const createdAt = listing.createdAt
          ? new Date(listing.createdAt).getTime()
          : now;
        if (now - createdAt <= THREE_DAYS_MS) {
          acc[key].recent += 1;
        }
        return acc;
      },
      {} as Record<string, { count: number; recent: number }>
    );

    return Object.entries(aggregated)
      .map(([location, stats]) => ({
        location,
        count: stats.count,
        recentListings: stats.recent,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [listings]);

  const sellerListings = useMemo(() => {
    if (!isSeller || !listings || !sellerId) return [];
    return listings.filter((listing) => listing.sellerId === sellerId);
  }, [isSeller, listings, sellerId]);

  const sellerListingStats = useMemo(() => {
    if (!sellerListings.length) {
      return {
        total: 0,
        active: 0,
        draft: 0,
        reserved: 0,
        expiringSoon: 0,
        verified: 0,
      };
    }

    const now = Date.now();
    const expiringThreshold = THREE_DAYS_MS;

    return sellerListings.reduce(
      (acc, listing) => {
        acc.total += 1;
        if (listing.status === "active") acc.active += 1;
        if (listing.status === "draft") acc.draft += 1;
        if (
          listing.status === "reserved" ||
          listing.status === "pending" ||
          listing.status === "processing"
        ) {
          acc.reserved += 1;
        }
        const expirySource = listing.expiryDate || listing.expiresAt;
        if (expirySource) {
          const diff = new Date(expirySource).getTime() - now;
          if (diff > 0 && diff <= expiringThreshold) {
            acc.expiringSoon += 1;
          }
        }
        if (isVerifiedListing(listing)) acc.verified += 1;
        return acc;
      },
      {
        total: 0,
        active: 0,
        draft: 0,
        reserved: 0,
        expiringSoon: 0,
        verified: 0,
      }
    );
  }, [sellerListings]);

  const sellerOrderStats = useMemo(() => {
    if (!isSeller || !sellerOrders.length) {
      return {
        revenue: 0,
        pendingPayouts: 0,
        avgTicket: 0,
        statusCounts: {
          pending: 0,
          confirmed: 0,
          ready: 0,
          inTransit: 0,
          delivered: 0,
        },
      };
    }

    const totals = sellerOrders.reduce(
      (acc, order) => {
        const amount = order.totalAmount
          ? parseFloat(order.totalAmount)
          : 0;
        if (!Number.isNaN(amount)) {
          acc.revenue += amount;
          acc.avgTicketAccumulator.total += amount;
          acc.avgTicketAccumulator.count += 1;
          if (order.paymentStatus && order.paymentStatus !== "paid") {
            acc.pendingPayouts += amount;
          }
        }

        const normalizedStatus = normalizeOrderStatus(order.status);
        if (acc.statusCounts[normalizedStatus] !== undefined) {
          acc.statusCounts[normalizedStatus] += 1;
        }

        return acc;
      },
      {
        revenue: 0,
        pendingPayouts: 0,
        avgTicket: 0,
        avgTicketAccumulator: { total: 0, count: 0 },
        statusCounts: {
          pending: 0,
          confirmed: 0,
          ready: 0,
          inTransit: 0,
          delivered: 0,
        },
      }
    );
    const avgTicket =
      totals.avgTicketAccumulator.count > 0
        ? totals.avgTicketAccumulator.total /
          totals.avgTicketAccumulator.count
        : 0;

    return {
      revenue: totals.revenue,
      pendingPayouts: totals.pendingPayouts,
      avgTicket,
      statusCounts: totals.statusCounts,
    };
  }, [isSeller, sellerOrders]);

  const sellerOrderBuckets = useMemo(() => {
    if (!sellerOrders.length) return {};

    return sellerOrders.reduce<Record<string, SellerOrder[]>>((acc, order) => {
      const status = normalizeOrderStatus(order.status);
      if (!acc[status]) {
        acc[status] = [];
      }
      if (acc[status].length < 5) {
        acc[status].push(order);
      }
      return acc;
    }, {});
  }, [sellerOrders]);

  const sellerAlerts = useMemo(() => {
    const alerts: Array<{ id: string; title: string; message: string }> = [];

    if (sellerListingStats.expiringSoon > 0) {
      alerts.push({
        id: "expiry",
        title: "Listings expiring soon",
        message: `${sellerListingStats.expiringSoon} lot${
          sellerListingStats.expiringSoon === 1 ? "" : "s"
        } will expire within 3 days.`,
      });
    }

    if (sellerListingStats.verified < sellerListingStats.total) {
      alerts.push({
        id: "verification",
        title: "Boost trust with verification",
        message: `${
          sellerListingStats.total - sellerListingStats.verified
        } listing${
          sellerListingStats.total - sellerListingStats.verified === 1 ? "" : "s"
        } can be upgraded with traceability or certification.`,
      });
    }

    if (sellerOrderStats.pendingPayouts > 0) {
      alerts.push({
        id: "payouts",
        title: "Pending payouts",
        message: `${formatCurrency(
          sellerOrderStats.pendingPayouts
        )} awaiting release.`,
      });
    }

    if (!alerts.length && isSeller) {
      alerts.push({
        id: "all-clear",
        title: "All systems go",
        message: "You're up to date on compliance, payouts, and listings.",
      });
    }

    return alerts;
  }, [sellerListingStats, sellerOrderStats, isSeller]);

  const trustPercent =
    sellerListingStats.total > 0
      ? Math.round(
          (sellerListingStats.verified / sellerListingStats.total) * 100
        )
      : 0;

  const activeSellerOrdersCount =
    sellerOrderStats.statusCounts.pending +
    sellerOrderStats.statusCounts.confirmed +
    sellerOrderStats.statusCounts.ready +
    sellerOrderStats.statusCounts.inTransit;

  const sellerQuickActions = [
    {
      id: "create-listing",
      title: "Create listing",
      description: "Publish a new crop lot with traceability",
      icon: Sparkles,
      action: () => navigateToCreate(),
    },
    {
      id: "record-harvest",
      title: "Record harvest",
      description: "Update crop volumes & readiness",
      icon: ClipboardCheck,
      action: () => setLocation("/dashboard/crops"),
    },
    {
      id: "message-buyers",
      title: "Message buyers",
      description: "Respond to inquiries & offers",
      icon: MessageCircle,
      action: () => setLocation("/dashboard/notifications"),
    },
    {
      id: "book-transport",
      title: "Book transport",
      description: "Line up shared trucks or pickup",
      icon: Truck,
      action: () => setLocation("/dashboard/orders"),
    },
  ];

  const topSellerListings = sellerListings.slice(0, 5);

  const latestSellerOrders = sellerOrders.slice(0, 5);

  // Add debug effect to log listing data
  useEffect(() => {
    if (listings) {
      // console.log("Listings data from API:", listings);

      // Check structure of first listing if available
      // if (listings.length > 0) {
      //   const firstListing = listings[0];
      //   console.log("First listing structure:", {
      //     id: firstListing.id,
      //     title: firstListing.title,
      //     price: firstListing.price,
      //     priceType: typeof firstListing.price,
      //     priceValue: Number(firstListing.price),
      //     isNegotiable: firstListing.isNegotiable,
      //     isNegotiableType: typeof firstListing.isNegotiable,
      //     category: firstListing.category,
      //     images: firstListing.images,
      //     imagesType: typeof firstListing.images,
      //     imagesLength: firstListing.images ? firstListing.images.length : 0,
      //     createdAt: firstListing.createdAt,
      //     createdAtType: typeof firstListing.createdAt,
      //   });

      //   // Log each property for debugging
      //   console.log("All properties of first listing:");
      //   Object.entries(firstListing).forEach(([key, value]) => {
      //     console.log(`${key}: ${value} (${typeof value})`);
      //   });
      // }

      if (listings.length === 0) {
        toast({
          title: "No listings found",
          description: "No marketplace listings are available at this time.",
          variant: "default",
        });
      }
    }
    if (error) {
      // console.error("Marketplace listings error:", error);
      toast({
        title: "Error loading listings",
        description: "There was a problem loading marketplace listings.",
        variant: "destructive",
      });
    }
  }, [listings, error]);
  useEffect(() => {
    if (sellerOrdersError && isSeller) {
      toast({
        title: "Unable to load orders",
        description: "We couldn't fetch your latest sales. Please retry shortly.",
        variant: "destructive",
      });
    }
  }, [sellerOrdersError, isSeller]);
  // Request user's location for proximity search
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          // console.log(
          //   "User location:",
          //   position.coords.latitude,
          //   position.coords.longitude
          // );
        },
        (error) => {
          // console.error("Error getting location:", error);
          toast({
            title: "Location access denied",
            description: "Enable location services to see listings near you",
            variant: "destructive",
          });
        }
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

  const toggleQuickFilter = (filterId: string) => {
    setActiveQuickFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  const clearQuickFilters = () => setActiveQuickFilters([]);

  const handleSaveSearch = () => {
    const isDefaultFilters =
      filters.search === "" &&
      filters.category === "all" &&
      filters.minPrice === 0 &&
      filters.maxPrice === 1000000 &&
      filters.distance === 50 &&
      !filters.negotiableOnly &&
      activeQuickFilters.length === 0;

    if (isDefaultFilters) {
      toast({
        title: "Add filters before saving",
        description:
          "Use search, category, price or quick filters to create a meaningful alert.",
      });
      return;
    }

    const categoryName =
      filters.category === "all"
        ? "All categories"
        : MARKETING_CATEGORY_LOOKUP[filters.category] || filters.category;

    const label =
      filters.search ||
      `${categoryName} • ZMW ${filters.minPrice}-${
        filters.maxPrice >= 1000000 ? "Any" : filters.maxPrice
      }`;

    const generatedId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const newSavedSearch: SavedSearch = {
      id: generatedId,
      label,
      filters: { ...filters },
      quickFilters: [...activeQuickFilters],
      createdAt: new Date().toISOString(),
    };

    setSavedSearches((prev) => {
      const next = [newSavedSearch, ...prev];
      return next.slice(0, 5);
    });

    toast({
      title: "Search saved",
      description: "We'll surface new lots when they match this alert.",
    });
  };

  const applySavedSearch = (saved: SavedSearch) => {
    setFilters(saved.filters);
    setActiveQuickFilters(saved.quickFilters);
    setSearchValue(saved.filters.search);
    toast({
      title: "Filters applied",
      description: `Showing results for ${saved.label}`,
    });
  };

  const removeSavedSearch = (id: string) => {
    setSavedSearches((prev) => prev.filter((saved) => saved.id !== id));
  };

  // Get user's favorites
  const { favorites, isLoading: isFavoritesLoading } =
    useMarketplaceFavorites();

  // Filter real listings from the API
  // Filter listings by search term, category, price and favorites
  const filteredListings = listings
    ? listings.filter((listing: MarketplaceListing) => {
        try {
          // Favorites filter
          if (showFavoritesOnly) {
            const isFavorited = favorites?.some(
              (fav) => fav.listingId === listing.id
            );
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
              // console.log(
              //   `Filtering out by search: ${listing.id} - ${listing.title}`
              // );
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
              return false;
            }
          }

          // Price filter - only if price is in a reasonable range (< 10000)
          try {
            // Special case for the 111111.00 listing, skip price filtering for it
            if (listing.price === "111111.00") {
              // Skip price filtering for special test listing
            } else {
              const priceValue =
                typeof listing.price === "string"
                  ? parseFloat(listing.price)
                  : Number(listing.price);

              if (
                !isNaN(priceValue) &&
                (priceValue < filters.minPrice || priceValue > filters.maxPrice)
              ) {
                return false;
              }
            }
          } catch (priceError) {
            // console.error(
            //   `Price filter error for listing ${listing.id}:`,
            //   priceError
            // );
          }

          // Negotiable filter
          if (filters.negotiableOnly) {
            const isNegotiable =
              typeof listing.isNegotiable === "boolean"
                ? listing.isNegotiable
                : String(listing.isNegotiable).toLowerCase() === "true";

            if (!isNegotiable) {
              return false;
            }
          }

          if (activeQuickFilters.length) {
            const matchesQuickFilters = activeQuickFilters.every((filterId) => {
              const predicate = QUICK_FILTER_PREDICATES[filterId];
              if (!predicate) return true;
              try {
                return predicate(listing);
              } catch (err) {
                return false;
              }
            });

            if (!matchesQuickFilters) {
              return false;
            }
          }

          // Include this listing
          return true;
        } catch (error) {
          // console.error("Error filtering listing:", error);
          return true; // Include all listings that cause errors in filtering
        }
      })
    : [];

  // Sort listings based on user preference
  const sortedListings = [...filteredListings].sort((a, b) => {
    try {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "price-low": {
          const aPrice =
            typeof a.price === "string" ? parseFloat(a.price) : Number(a.price);
          const bPrice =
            typeof b.price === "string" ? parseFloat(b.price) : Number(b.price);
          return aPrice - bPrice;
        }
        case "price-high": {
          const aPrice2 =
            typeof a.price === "string" ? parseFloat(a.price) : Number(a.price);
          const bPrice2 =
            typeof b.price === "string" ? parseFloat(b.price) : Number(b.price);
          return bPrice2 - aPrice2;
        }
        default:
          return 0;
      }
    } catch (error) {
      // console.error("Error sorting listings:", error);
      return 0;
    }
  });

  // Select featured listings - newest + high price
  const featuredListings =
    showFeatured && sortedListings.length > 0
      ? [...sortedListings]
          .sort((a, b) => {
            // Complex sorting algorithm for "featured": combination of newness, price, and completeness
            const aDate = new Date(a.createdAt).getTime();
            const bDate = new Date(b.createdAt).getTime();
            const aPrice =
              typeof a.price === "string"
                ? parseFloat(a.price)
                : Number(a.price);
            const bPrice =
              typeof b.price === "string"
                ? parseFloat(b.price)
                : Number(b.price);

            // Prefer listings with images
            const aHasImage =
              a.images && Array.isArray(a.images) && a.images.length > 0;
            const bHasImage =
              b.images && Array.isArray(b.images) && b.images.length > 0;

            if (aHasImage && !bHasImage) return -1;
            if (!aHasImage && bHasImage) return 1;

            // Weighted score combining recency and price
            const aScore = aDate * 0.7 + aPrice * 0.3;
            const bScore = bDate * 0.7 + bPrice * 0.3;

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
          className={`h-4 w-4 text-primary transition-all ${
            isFav ? "fill-primary" : "hover:fill-primary"
          }`}
        />
      </Button>
    );
  };

  // ReviewStars component for displaying seller ratings
  const ReviewStars = ({ sellerId }: { sellerId: number }) => {
    const { reviews, reviewCount, averageRating, isLoading } =
      useMarketplaceReviews(undefined, sellerId);

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
                  ? "text-yellow-500 fill-yellow-500"
                  : star - 0.5 === displayRating
                  ? "text-yellow-500 fill-yellow-500/50"
                  : "text-muted-foreground"
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

  // console.log("Listings after filtering:", {
  //   before: listings ? listings.length : 0,
  //   after: displayedListings.length,
  //   filters,
  // });

  if (isSeller) {
    const leadingPriceSignal = priceSignals[0];
    const demandHotspot = locationClusters[0];
    return (
      <DashboardLayout
        title="Marketplace HQ"
        description="Manage your listings, orders, payouts, and trust in one place"
      >
        <div className="container mx-auto px-4 py-6 space-y-6">
          <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-800 to-lime-600 text-white p-6 md:p-10 shadow-xl border border-white/10 space-y-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <div className="flex items-center gap-3 text-white/70 text-xs uppercase tracking-[0.25em]">
                  <BadgeDollarSign className="h-3 w-3" />
                  Seller workspace
                </div>
                <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
                  Run your Greenupp storefront with confidence
                </h1>
                <p className="text-white/80 text-base">
                  Track revenue, monitor trust signals, confirm orders, and keep listings fresh
                  without leaving the dashboard.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    className="bg-white text-emerald-700 hover:bg-white/90"
                    onClick={() => navigateToCreate()}
                  >
                    <Sparkles className="h-4 w-4 mr-2 text-emerald-600" />
                    List a crop
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/70 text-white hover:bg-white/10"
                    onClick={() => setLocation("/dashboard/orders")}
                  >
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Review orders
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                  <p className="text-xs uppercase tracking-wide text-white/70">
                    Total sales
                  </p>
                  <p className="text-2xl font-semibold mt-2">
                    {formatCurrency(sellerOrderStats.revenue)}
                  </p>
                  <p className="text-white/70 text-xs mt-1">Lifetime marketplace revenue</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                  <p className="text-xs uppercase tracking-wide text-white/70">
                    Active orders
                  </p>
                  <p className="text-2xl font-semibold mt-2">
                    {activeSellerOrdersCount}
                  </p>
                  <p className="text-white/70 text-xs mt-1">Pending confirmation or delivery</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                  <p className="text-xs uppercase tracking-wide text-white/70">
                    Pending payouts
                  </p>
                  <p className="text-2xl font-semibold mt-2">
                    {formatCurrency(sellerOrderStats.pendingPayouts)}
                  </p>
                  <p className="text-white/70 text-xs mt-1">Awaiting release</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                  <p className="text-xs uppercase tracking-wide text-white/70">
                    Trust score
                  </p>
                  <p className="text-2xl font-semibold mt-2">{trustPercent}%</p>
                  <p className="text-white/70 text-xs mt-1">
                    Verified / blockchain-backed listings
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {sellerQuickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.id}
                  className="border border-border/70 hover:border-primary/60 transition-all shadow-sm"
                >
                  <CardHeader className="pb-2 space-y-1">
                    <div className="flex items-center gap-2 text-primary">
                      <Icon className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        Quick action
                      </span>
                    </div>
                    <CardTitle className="text-base">{action.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {action.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      variant="ghost"
                      className="px-0 text-primary hover:text-primary"
                      onClick={action.action}
                    >
                      Take action
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="border border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Price guidance
                </CardTitle>
                <CardDescription>
                  Suggested benchmarks based on live demand
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {leadingPriceSignal ? (
                  <>
                    <p className="text-2xl font-semibold">
                      {MARKETING_CATEGORY_LOOKUP[leadingPriceSignal.category] ||
                        leadingPriceSignal.category}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Avg. ZMW {Math.round(leadingPriceSignal.average).toLocaleString()} across{" "}
                      {leadingPriceSignal.listings} lot
                      {leadingPriceSignal.listings === 1 ? "" : "s"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Match or beat this price to appear in more buyer searches.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Price guidance will appear once we have a few of your listings or sales.
                  </p>
                )}
              </CardContent>
            </Card>
            <Card className="border border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Demand radar
                </CardTitle>
                <CardDescription>Where buyers are scouting this week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {demandHotspot ? (
                  <>
                    <p className="text-2xl font-semibold">{demandHotspot.location}</p>
                    <p className="text-sm text-muted-foreground">
                      {demandHotspot.recentListings} fresh listings, {demandHotspot.count} total lots
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Consider highlighting availability for pickup routes in this zone.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Add farm locations to your listings to unlock route-based demand insights.
                  </p>
                )}
              </CardContent>
            </Card>
            <Card className="border border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Trust & compliance
                </CardTitle>
                <CardDescription>Keep verifications and docs fresh</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Verified listings</span>
                  <Badge variant="secondary">{sellerListingStats.verified}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Expiring soon</span>
                  <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                    {sellerListingStats.expiringSoon}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload lab tests or blockchain proofs to unlock premium placement.
                </p>
              </CardContent>
            </Card>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="border border-border/70">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Active listings</CardTitle>
                    <CardDescription>
                      {sellerListingStats.active} live · {sellerListingStats.total} total
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={navigateToCreate}>
                    <Plus className="h-4 w-4 mr-1" />
                    New listing
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {topSellerListings.length ? (
                  topSellerListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="p-3 border border-border rounded-xl flex flex-col gap-2 md:flex-row md:items-center md:justify-between hover:border-primary/40 transition"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold line-clamp-1">
                          {listing.title || "Untitled listing"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getListingPriceString(listing)} • Qty:{" "}
                          {listing.quantityAvailable || listing.quantity || "—"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="uppercase text-[10px] tracking-wide"
                        >
                          {listing.status || "active"}
                        </Badge>
                        {isVerifiedListing(listing) && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary"
                          onClick={() => setLocation(`/dashboard/marketplace/${listing.id}`)}
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground py-8 text-center">
                    You haven't listed any products yet. Create your first lot to show up in buyer
                    searches.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-border/70">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Orders board</CardTitle>
                    <CardDescription>Track every stage from inquiry to delivery</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation("/dashboard/orders")}
                  >
                    View all
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {SELLER_STATUS_BUCKETS.map((bucket) => (
                    <div
                      key={bucket.id}
                      className="border border-border rounded-xl p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span>{bucket.label}</span>
                        <Badge variant="secondary">
                          {sellerOrderStats.statusCounts[bucket.id as keyof typeof sellerOrderStats.statusCounts] ||
                            0}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {sellerOrderBuckets[bucket.id]?.length ? (
                          sellerOrderBuckets[bucket.id].map((order) => (
                            <div
                              key={order.id}
                              className="flex items-center justify-between rounded-lg bg-muted/40 px-2 py-1"
                            >
                              <span>#{order.orderNumber || order.id}</span>
                              <span>{order.buyer?.firstName || "Buyer"}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No orders in this stage</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {sellerOrdersLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating sales board...
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-border/70">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Latest buyer updates</CardTitle>
                <CardDescription>Quick context before replying</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {latestSellerOrders.length ? (
                  latestSellerOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-border rounded-xl p-3 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">
                          #{order.orderNumber || order.id}
                        </span>
                        <Badge variant="outline" className="capitalize">
                          {order.status || "pending"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {order.items?.[0]?.listing?.title || "Marketplace listing"} •{" "}
                        {order.buyer
                          ? `${order.buyer.firstName || ""} ${
                              order.buyer.lastName || ""
                            }`.trim()
                          : "Buyer pending"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(order.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Buyer activity will appear here as orders come in.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border border-border/70">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  Alerts & reminders
                </CardTitle>
                <CardDescription>Stay ahead of expiries, payouts, and trust</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sellerAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="border border-border rounded-xl p-3 flex items-start gap-3 bg-muted/30"
                  >
                    <div className="mt-1">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Marketplace"
      description="Buy and sells agricultural products and services"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          <section className="rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-lime-500 text-white p-6 md:p-10 shadow-xl border border-white/10 space-y-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="uppercase text-xs tracking-[0.2em] text-white/70">
                  Local marketplace
                </p>
                <h1 className="text-3xl md:text-4xl font-bold mt-2 leading-tight">
                  Source fresh agro products from trusted farmers nearby
                </h1>
                <p className="text-white/80 mt-3">
                  Compare live offers, reserve lots, and line up transport or
                  pickup windows without leaving the dashboard.
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                  <Button
                    className="bg-white text-emerald-700 hover:bg-white/90"
                    onClick={() => setViewMode("list")}
                  >
                    <Sparkles className="h-4 w-4 mr-2 text-emerald-600" />
                    Browse fresh lots
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/60 text-white hover:bg-white/10"
                    onClick={() => setLocation("/dashboard/marketplace/cart")}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Request bulk order
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/60 text-white hover:bg-white/10"
                    onClick={navigateToCreate}
                  >
                    List your crop
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                  <p className="text-xs uppercase tracking-wide text-white/70">
                    Average price
                  </p>
                  <p className="text-2xl font-semibold mt-2">
                    {marketplaceStats.averagePrice
                      ? `ZMW ${Math.round(marketplaceStats.averagePrice).toLocaleString()}`
                      : "—"}
                  </p>
                  <p className="text-white/70 text-xs mt-1">
                    Across active listings
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                  <p className="text-xs uppercase tracking-wide text-white/70">
                    Fresh arrivals
                  </p>
                  <p className="text-2xl font-semibold mt-2">
                    {marketplaceStats.freshListings}
                  </p>
                  <p className="text-white/70 text-xs mt-1">
                    Harvested this week
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                  <p className="text-xs uppercase tracking-wide text-white/70">
                    Negotiable lots
                  </p>
                  <p className="text-2xl font-semibold mt-2">
                    {marketplaceStats.negotiableListings}
                  </p>
                  <p className="text-white/70 text-xs mt-1">
                    Open to offers
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
                  <p className="text-xs uppercase tracking-wide text-white/70">
                    Verified supply
                  </p>
                  <p className="text-2xl font-semibold mt-2">
                    {marketplaceStats.verifiedListings}
                  </p>
                  <p className="text-white/70 text-xs mt-1">
                    Blockchain / Greenupp verified
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-card border border-border/60 rounded-2xl p-4 md:p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Live price signals</h2>
                <p className="text-sm text-muted-foreground">
                  Average prices by category from today’s listings
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveSearch}
                  className="border-border"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Save search alert
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("map")}
                >
                  <MapIcon className="h-4 w-4 mr-2" />
                  Map preview
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {priceSignals.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Price intel will appear once listings load.
                </div>
              ) : (
                priceSignals.map((signal) => (
                  <div
                    key={signal.category}
                    className="flex flex-col border border-border/60 rounded-2xl px-4 py-3 min-w-[180px] bg-muted/30"
                  >
                    <span className="text-xs uppercase text-muted-foreground tracking-wide">
                      {MARKETING_CATEGORY_LOOKUP[signal.category] ||
                        signal.category}
                    </span>
                    <span className="text-xl font-semibold mt-1">
                      ZMW {Math.round(signal.average).toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {signal.listings} active lot
                      {signal.listings === 1 ? "" : "s"}
                    </span>
                  </div>
                ))
              )}
            </div>
            <Separator className="bg-border/40" />
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Quick filters</p>
                </div>
                {activeQuickFilters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={clearQuickFilters}
                  >
                    Clear quick filters
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {quickFilterOptions.map((filter) => {
                  const isActive = activeQuickFilters.includes(filter.id);
                  return (
                    <button
                      key={filter.id}
                      onClick={() => toggleQuickFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-full border text-sm flex items-center gap-2 transition ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow"
                          : "border-border/70 hover:border-primary/60"
                      }`}
                    >
                      <span>{filter.icon}</span>
                      <span>{filter.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Tap to combine signals such as fresh harvests + verified supply.
              </p>
            </div>
            <Separator className="bg-border/40" />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Bell className="h-4 w-4 text-primary" />
                Saved alerts
              </div>
              {savedSearches.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No alerts yet. Save a search to get pinged when new lots match.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {savedSearches.map((saved) => (
                    <div
                      key={saved.id}
                      className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground shadow-sm"
                    >
                      <button
                        className="font-semibold"
                        onClick={() => applySavedSearch(saved)}
                      >
                        {saved.label}
                      </button>
                      <span className="text-[10px] text-muted-foreground/70">
                        {new Date(saved.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSavedSearch(saved.id);
                        }}
                        className="p-1 rounded-full hover:bg-secondary-foreground/10"
                        aria-label="Remove saved search"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

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
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
                  {CATEGORIES_FOR_FILTER.map((category) => (
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
                    {(filters.minPrice > 0 ||
                      filters.maxPrice < 1000000 ||
                      filters.distance !== 50 ||
                      filters.negotiableOnly) && (
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
                        {(filters.minPrice > 0 ||
                          filters.maxPrice < 1000000) && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-primary/10 text-primary"
                          >
                            Active
                          </Badge>
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
                          <Badge
                            variant="outline"
                            className="text-xs bg-primary/10 text-primary"
                          >
                            Active
                          </Badge>
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
                          <Badge
                            variant="outline"
                            className="ml-2 text-xs bg-primary/10 text-primary"
                          >
                            Active
                          </Badge>
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
              <label className="text-sm font-medium text-muted-foreground">
                Sort by:
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
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
                {displayedListings.length}{" "}
                {displayedListings.length === 1 ? "listing" : "listings"} found
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
                  <Heart
                    className={`h-3 w-3 ${
                      showFavoritesOnly
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <label className="text-sm font-medium">Favorites Only</label>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                View:
              </span>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <ListIcon className="h-4 w-4 mr-1" />
                  List
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                >
                  <MapIcon className="h-4 w-4 mr-1" />
                  Map
                </Button>
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
                            if (
                              Array.isArray(listing.images) &&
                              listing.images.length > 0
                            ) {
                              const validImages = listing.images.filter(
                                (img) => img && img !== ""
                              );
                              if (validImages.length > 0)
                                imageUrl = validImages[0];
                            } else if (typeof listing.images === "string") {
                              try {
                                const parsed = JSON.parse(listing.images);
                                if (
                                  Array.isArray(parsed) &&
                                  parsed.length > 0
                                ) {
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
                          // console.error(
                          //   `Error processing image for featured listing ${listing.id}:`,
                          //   error
                          // );
                        }

                        return imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={listing.title || "Featured item"}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
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
                      <Badge className="absolute top-2 right-2 bg-orange-500/90">
                        Featured
                      </Badge>
                      <div className="absolute left-0 bottom-0 bg-gradient-to-r from-primary/90 to-primary/60 text-white px-2 py-1 font-bold rounded-tr-md">
                        ZMW{" "}
                        {typeof listing.price === "string"
                          ? parseFloat(listing.price).toFixed(2)
                          : Number(listing.price).toFixed(2)}
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
          ) : viewMode === "map" ? (
            <div className="space-y-4">
              <div className="h-96 rounded-2xl border border-dashed border-primary/40 bg-gradient-to-br from-emerald-50 to-lime-50 flex flex-col items-center justify-center text-center px-6">
                <MapIcon className="h-10 w-10 text-primary mb-3" />
                <p className="font-semibold text-primary">
                  Interactive map view coming soon
                </p>
                <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                  We&apos;re prepping live farm clusters and aggregation points.
                  For now, explore the top sourcing hotspots below.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {locationClusters.length === 0 ? (
                  <Card className="md:col-span-3 border-dashed border-primary/30">
                    <CardContent className="p-6 flex flex-col items-center text-center gap-2">
                      <AlertTriangle className="h-6 w-6 text-primary" />
                      <p className="font-medium">
                        Listings do not include location details yet.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Encourage sellers to add farm locations to unlock
                        routing insights.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  locationClusters.map((cluster) => {
                    const clusterListings = (listings || []).filter((listing) => {
                      const label =
                        listing.farmLocation ||
                        (listing as any).location ||
                        listing.farmName ||
                        "Unspecified location";
                      return label === cluster.location;
                    });
                    const verifiedCount = clusterListings.filter(
                      isVerifiedListing
                    ).length;
                    const organicCount = clusterListings.filter(
                      isOrganicListing
                    ).length;

                    return (
                      <Card
                        key={cluster.location}
                        className="border border-border/70 hover:border-primary/50 transition"
                      >
                        <CardHeader>
                          <CardTitle className="text-base">
                            {cluster.location}
                          </CardTitle>
                          <CardDescription>
                            {cluster.recentListings} fresh arrival
                            {cluster.recentListings === 1 ? "" : "s"} ·{" "}
                            {cluster.count} total lots
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <span>Verified lots: {verifiedCount}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Leaf className="h-4 w-4 text-emerald-600" />
                            <span>Organic / pesticide-free: {organicCount}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
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
                        <p className="text-lg font-medium mb-1">
                          No favorites yet
                        </p>
                        <p className="text-muted-foreground">
                          Click the heart icon on listings to add them to your
                          favorites
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
                  // console.log(`Rendering listing: ${listing.id}`, listing);

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
                                      (img) => img && img !== ""
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
                                // console.error(
                                //   `Error processing image for listing ${listing.id}:`,
                                //   error
                                // );
                              }

                              return imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={listing.title || "Marketplace item"}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  onError={(e) => {
                                    // console.log(
                                    //   `Image load error for ${listing.id}:`,
                                    //   e
                                    // );
                                    e.currentTarget.src =
                                      "https://placehold.co/700x500/green/white?text=No+Image";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                  <p className="text-muted-foreground">
                                    No image
                                  </p>
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
                                  // console.error("Price format error:", e);
                                  return "0.00";
                                }
                              })()}
                              {listing.priceUnit && (
                                <span className="text-xs font-normal">
                                  /{listing.priceUnit}
                                </span>
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
                                  const createdDate = new Date(
                                    listing.createdAt
                                  );
                                  const now = new Date();
                                  const diffDays = Math.floor(
                                    (now.getTime() - createdDate.getTime()) /
                                      (1000 * 60 * 60 * 24)
                                  );

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
                            <CardDescription className="flex items-center text-xs gap-1 flex-wrap">
                              <MapPin className="h-3 w-3 text-primary" />
                              <span>
                                {listing.farmLocation ||
                                  (listing as any).location ||
                                  listing.farmName ||
                                  "Location not specified"}
                              </span>
                              {listing.contactPhone && (
                                <span className="text-muted-foreground">
                                  · {listing.contactPhone}
                                </span>
                              )}
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="p-4 pt-0 space-y-3">
                            <p className="text-sm text-muted-foreground line-clamp-2 group-hover:line-clamp-3 transition-all duration-300">
                              {listing.description || "No description provided"}
                            </p>
                            <div className="flex flex-wrap gap-2 text-[11px]">
                              {isFreshListing(listing) && (
                                <Badge
                                  variant="secondary"
                                  className="bg-emerald-100 text-emerald-800"
                                >
                                  Fresh harvest
                                </Badge>
                              )}
                              {isVerifiedListing(listing) && (
                                <Badge
                                  variant="outline"
                                  className="border-primary/60 text-primary flex items-center gap-1"
                                >
                                  <ShieldCheck className="h-3 w-3" />
                                  Verified
                                </Badge>
                              )}
                              {isOrganicListing(listing) && (
                                <Badge
                                  variant="outline"
                                  className="border-emerald-400 text-emerald-600 flex items-center gap-1"
                                >
                                  <Leaf className="h-3 w-3" />
                                  Organic
                                </Badge>
                              )}
                            </div>
                          </CardContent>

                          <CardFooter className="p-4 pt-2 flex flex-wrap gap-2 justify-between items-center text-xs text-muted-foreground border-t border-border/30">
                            <div className="flex items-center">
                              <ReviewStars sellerId={listing.sellerId} />
                            </div>
                            <div className="flex items-center gap-1 text-primary font-medium">
                              <BadgeDollarSign className="h-3 w-3" />
                              {isVerifiedListing(listing)
                                ? "Escrow-ready"
                                : "Direct pay"}
                            </div>
                            <span className="bg-primary/10 px-2 py-0.5 rounded text-primary">
                              {(() => {
                                try {
                                  return formatDistanceToNow(
                                    new Date(listing.createdAt),
                                    {
                                      addSuffix: true,
                                    }
                                  );
                                } catch (error) {
                                  return "Recently";
                                }
                              })()}
                            </span>
                          </CardFooter>
                        </Card>
                      );
                    } catch (error) {
                      // console.error(
                      //   `Error rendering listing ${listing.id}:`,
                      //   error
                      // );
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
