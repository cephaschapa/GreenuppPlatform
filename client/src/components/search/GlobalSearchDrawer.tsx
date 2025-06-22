import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  Search,
  X,
  Loader2,
  MapPin,
  Tag,
  Clock,
  TrendingUp,
  Filter,
  ArrowUp,
  ArrowDown,
  Package,
  Users,
  Map,
  Calendar,
  Cloud,
  Leaf,
  Settings,
  Home,
  ShoppingBag,
  MessageSquare,
  FileText,
  Star,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useGlobalSearch } from "@/hooks/use-global-search";

interface SearchResult {
  id: string;
  type:
    | "marketplace"
    | "field"
    | "crop"
    | "task"
    | "user"
    | "knowledge"
    | "social";
  title: string;
  description?: string;
  url: string;
  icon: React.ReactNode;
  metadata?: Record<string, any>;
}

interface GlobalSearchDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SEARCH_CATEGORIES = [
  { id: "all", name: "All", icon: Search },
  { id: "marketplace", name: "Marketplace", icon: ShoppingBag },
  { id: "fields", name: "Fields", icon: Map },
  { id: "crops", name: "Crops", icon: Leaf },
  { id: "tasks", name: "Tasks", icon: Calendar },
  { id: "users", name: "Users", icon: Users },
  { id: "knowledge", name: "Knowledge", icon: FileText },
  { id: "social", name: "Social", icon: MessageSquare },
];

export function GlobalSearchDrawer({
  open,
  onOpenChange,
}: GlobalSearchDrawerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    recentSearches,
    suggestions,
    searchResults,
    isLoading,
    handleSearch,
    handleRecentSearchSelect,
    saveRecentSearch,
    clearRecentSearches,
  } = useGlobalSearch();

  // Helper function to get icon for result type
  const getIconForType = (type: string) => {
    switch (type) {
      case "marketplace":
        return <ShoppingBag className="h-4 w-4" />;
      case "field":
        return <Map className="h-4 w-4" />;
      case "crop":
        return <Leaf className="h-4 w-4" />;
      case "task":
        return <Calendar className="h-4 w-4" />;
      case "user":
        return <Users className="h-4 w-4" />;
      case "knowledge":
        return <FileText className="h-4 w-4" />;
      case "social":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    saveRecentSearch(searchQuery);
    setLocation(result.url);
    onOpenChange(false);
    setSearchQuery("");
  };

  // Focus input when drawer opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }

      // Escape to close search
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // Transform API results to include icons
  const transformedResults: SearchResult[] = searchResults.map(
    (result: any) => ({
      ...result,
      icon: getIconForType(result.type),
    })
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[80vh] max-h-[600px] w-full rounded-t-xl border-t-2 border-primary/20"
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Global Search
            <Badge variant="secondary" className="text-xs w-auto h-auto">
              ⌘K
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search marketplace, fields, crops, tasks, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(searchQuery);
                }
              }}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {SEARCH_CATEGORIES.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                {category.icon === Search ? (
                  "All"
                ) : (
                  <category.icon className="h-3 w-3" />
                )}
                <span className="hidden md:block">{category.name}</span>
              </Button>
            ))}
          </div>

          <Separator />

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto">
            {searchQuery.length >= 2 ? (
              isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-muted-foreground">Searching...</span>
                </div>
              ) : transformedResults.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">
                      Results ({transformedResults.length})
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {selectedCategory === "all"
                        ? "All Categories"
                        : selectedCategory}
                    </Badge>
                  </div>

                  {transformedResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all"
                      onClick={() => handleResultSelect(result)}
                    >
                      <div className="flex-shrink-0 p-2 rounded-md bg-primary/10">
                        {result.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">
                            {result.title}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {result.type}
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {result.description}
                          </p>
                        )}
                        {result.metadata && (
                          <div className="flex items-center gap-2 mt-1">
                            {Object.entries(result.metadata).map(
                              ([key, value]) => (
                                <Badge
                                  key={key}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {key}: {value}
                                </Badge>
                              )
                            )}
                          </div>
                        )}
                      </div>

                      <ArrowUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No results found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search terms or browse different
                    categories
                  </p>

                  {/* Show suggestions if available */}
                  {suggestions.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-3">
                        Try these suggestions:
                      </h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleRecentSearchSelect(suggestion.text)
                            }
                            className="text-xs"
                          >
                            {suggestion.text}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              /* Recent Searches and Quick Actions */
              <div className="space-y-6">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Recent Searches
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecentSearches}
                        className="text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {recentSearches.map((search, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => handleRecentSearchSelect(search.query)}
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{search.query}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Quick Actions */}
                <div>
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4" />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => {
                        setLocation("/dashboard/marketplace");
                        onOpenChange(false);
                      }}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Browse Marketplace
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => {
                        setLocation("/dashboard/fields");
                        onOpenChange(false);
                      }}
                    >
                      <Map className="h-4 w-4 mr-2" />
                      View Fields
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => {
                        setLocation("/dashboard/tasks");
                        onOpenChange(false);
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Check Tasks
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => {
                        setLocation("/dashboard/social");
                        onOpenChange(false);
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Social Feed
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Popular Searches */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Popular Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "fertilizers",
                      "maize",
                      "irrigation",
                      "pesticides",
                      "tools",
                    ].map((term) => (
                      <Button
                        key={term}
                        variant="outline"
                        size="sm"
                        onClick={() => handleRecentSearchSelect(term)}
                        className="text-xs"
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
