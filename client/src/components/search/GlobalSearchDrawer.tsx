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
  ChevronRight,
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
  const [showTypeahead, setShowTypeahead] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

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

  // Highlight matching text in suggestions
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-primary/20 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    saveRecentSearch(searchQuery);
    setLocation(result.url);
    onOpenChange(false);
    setSearchQuery("");
    setShowTypeahead(false);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
    setShowTypeahead(false);
    setSelectedSuggestionIndex(-1);
  };

  // Handle keyboard navigation for typeahead
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showTypeahead || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex].text);
        } else {
          handleSearch(searchQuery);
        }
        break;
      case "Escape":
        setShowTypeahead(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Show typeahead when there are suggestions and query is long enough
  useEffect(() => {
    setShowTypeahead(
      searchQuery.length >= 2 && suggestions.length > 0 && !isLoading
    );
    setSelectedSuggestionIndex(-1);
  }, [searchQuery, suggestions, isLoading]);

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
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
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

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
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
          {/* Search Input with Typeahead */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search marketplace, fields, crops, tasks, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => {
                  setSearchQuery("");
                  setShowTypeahead(false);
                  setSelectedSuggestionIndex(-1);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}

            {/* Typeahead Suggestions */}
            {showTypeahead && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center justify-between">
                    <span>Suggestions</span>
                    {isLoading && (
                      <div className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-xs">Loading...</span>
                      </div>
                    )}
                  </div>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">
                        Finding suggestions...
                      </span>
                    </div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                          index === selectedSuggestionIndex
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-muted"
                        )}
                        onClick={() => handleSuggestionSelect(suggestion.text)}
                      >
                        <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm">
                            {highlightText(suggestion.text, searchQuery)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {suggestion.type}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        No suggestions found
                      </p>
                    </div>
                  )}
                </div>
              </div>
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
                            {highlightText(result.title, searchQuery)}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {result.type}
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {highlightText(result.description, searchQuery)}
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

                <Separator />

                {/* Search Tips */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Search Tips</h3>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        ⌘K
                      </Badge>
                      <span>Quick search from anywhere</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        ↑↓
                      </Badge>
                      <span>Navigate suggestions with arrow keys</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Enter
                      </Badge>
                      <span>Select suggestion or search</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Esc
                      </Badge>
                      <span>Close search</span>
                    </div>
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
