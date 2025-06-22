import { useState, useEffect, useCallback } from "react";
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
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
  const saveRecentSearch = useCallback(
    (query: string) => {
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
    },
    [recentSearches]
  );

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem("greenupp-recent-searches");
  }, []);

  // Fetch search suggestions
  const { data: suggestions = [], isLoading: isLoadingSuggestions } = useQuery<
    SearchSuggestion[]
  >({
    queryKey: ["search-suggestions", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];
      const response = await fetch(
        `/api/search/suggestions?query=${encodeURIComponent(
          debouncedQuery
        )}&limit=8`
      );
      if (!response.ok) return [];
      return response.json();
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch search results
  const { data: searchResults = [], isLoading: isLoadingResults } = useQuery<
    SearchResult[]
  >({
    queryKey: ["global-search", debouncedQuery, selectedCategory],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];

      const params = new URLSearchParams({
        query: debouncedQuery,
        category: selectedCategory,
        limit: "10",
      });

      const response = await fetch(`/api/search/global?${params}`);
      if (!response.ok) {
        throw new Error("Search failed");
      }

      return response.json();
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle search
  const handleSearch = useCallback(
    (query: string) => {
      if (query.trim()) {
        saveRecentSearch(query);
        setSearchQuery(query);
      }
    },
    [saveRecentSearch]
  );

  // Handle recent search selection
  const handleRecentSearchSelect = useCallback(
    (query: string) => {
      setSearchQuery(query);
      handleSearch(query);
    },
    [handleSearch]
  );

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
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
