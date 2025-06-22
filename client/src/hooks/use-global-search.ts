import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

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
  icon: string;
  metadata?: Record<string, any>;
}

interface SearchSuggestion {
  text: string;
  type: string;
}

interface RecentSearch {
  query: string;
  timestamp: number;
}

export function useGlobalSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("greenupp-recent-searches");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecentSearches(parsed.slice(0, 5)); // Keep only last 5
      } catch (error) {
        console.error("Error loading recent searches:", error);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (query: string) => {
    const newSearch: RecentSearch = {
      query,
      timestamp: Date.now(),
    };

    const updated = [
      newSearch,
      ...recentSearches.filter((s) => s.query !== query),
    ].slice(0, 5);

    setRecentSearches(updated);
    localStorage.setItem("greenupp-recent-searches", JSON.stringify(updated));
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("greenupp-recent-searches");
  };

  // Fetch search suggestions
  const { data: suggestions = [], isLoading: isLoadingSuggestions } = useQuery<
    SearchSuggestion[]
  >({
    queryKey: ["search-suggestions", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const response = await fetch(
        `/api/search/suggestions?query=${encodeURIComponent(
          searchQuery
        )}&limit=8`
      );
      if (!response.ok) return [];
      return response.json();
    },
    enabled: searchQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch search results
  const { data: searchResults = [], isLoading: isLoadingResults } = useQuery<
    SearchResult[]
  >({
    queryKey: ["global-search", searchQuery, selectedCategory],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];

      const params = new URLSearchParams({
        query: searchQuery,
        category: selectedCategory,
        limit: "10",
      });

      const response = await fetch(`/api/search/global?${params}`);
      if (!response.ok) {
        throw new Error("Search failed");
      }

      return response.json();
    },
    enabled: searchQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle search
  const handleSearch = (query: string) => {
    if (query.trim()) {
      saveRecentSearch(query);
      setSearchQuery(query);
    }
  };

  // Handle recent search selection
  const handleRecentSearchSelect = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    recentSearches,
    suggestions,
    searchResults,
    isLoading: isLoadingSuggestions || isLoadingResults,
    handleSearch,
    handleRecentSearchSelect,
    saveRecentSearch,
    clearRecentSearches,
  };
}
