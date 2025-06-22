import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2, MapPin, Tag } from "lucide-react";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SearchSuggestion {
  text: string;
  type: string;
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  className?: string;
  showCategoryFilter?: boolean;
  category?: string;
  onCategoryChange?: (category: string) => void;
  showSuggestions?: boolean;
  disabled?: boolean;
}

const MARKETPLACE_CATEGORIES = [
  { id: "all", name: "All Categories", icon: "📋" },
  { id: "seeds", name: "Seeds & Plants", icon: "🌾" },
  { id: "fertilizers", name: "Fertilizers", icon: "🌱" },
  { id: "pesticides", name: "Pesticides", icon: "🦠" },
  { id: "tools", name: "Tools & Equipment", icon: "🔧" },
  { id: "equipment", name: "Machinery", icon: "🚜" },
  { id: "livestock", name: "Livestock", icon: "🐄" },
  { id: "harvest", name: "Harvest & Produce", icon: "🥕" },
  { id: "feed", name: "Animal Feed", icon: "🌾" },
  { id: "irrigation", name: "Irrigation Supplies", icon: "💧" },
  { id: "other", name: "Other", icon: "📦" },
];

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search marketplace...",
  className,
  showCategoryFilter = false,
  category = "all",
  onCategoryChange,
  showSuggestions = true,
  disabled = false,
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch search suggestions
  const { data: suggestions = [], isLoading: isLoadingSuggestions } = useQuery<
    SearchSuggestion[]
  >({
    queryKey: ["/api/marketplace/search/suggestions", inputValue],
    queryFn: async () => {
      if (!inputValue || inputValue.length < 2) return [];
      const response = await fetch(
        `/api/marketplace/search/suggestions?query=${encodeURIComponent(
          inputValue
        )}&limit=8`
      );
      if (!response.ok) return [];
      return response.json();
    },
    enabled: showSuggestions && inputValue.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle input change
  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(newValue.length >= 2);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Handle search
  const handleSearch = () => {
    onSearch();
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Clear search
  const handleClear = () => {
    setInputValue("");
    onChange("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={() => inputValue.length >= 2 && setIsOpen(true)}
            className="pl-10 pr-10"
            disabled={disabled}
          />
          {inputValue && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {showCategoryFilter && onCategoryChange && (
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Tag className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {MARKETPLACE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <span className="mr-2">{cat.icon}</span>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          onClick={handleSearch}
          disabled={disabled || !inputValue.trim()}
          className="px-6"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Search Suggestions Popover */}
      {showSuggestions && isOpen && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverContent
            className="w-[calc(100vw-2rem)] max-w-[600px] p-0"
            align="start"
          >
            <Command>
              <CommandList>
                {isLoadingSuggestions ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Loading suggestions...
                    </span>
                  </div>
                ) : suggestions.length > 0 ? (
                  <CommandGroup heading="Suggestions">
                    {suggestions.map((suggestion, index) => (
                      <CommandItem
                        key={index}
                        onSelect={() => handleSuggestionSelect(suggestion.text)}
                        className="cursor-pointer"
                      >
                        <Search className="mr-2 h-4 w-4" />
                        <span>{suggestion.text}</span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {suggestion.type}
                        </Badge>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : inputValue.length >= 2 ? (
                  <CommandEmpty>
                    <div className="flex items-center justify-center py-6">
                      <span className="text-sm text-muted-foreground">
                        No suggestions found for "{inputValue}"
                      </span>
                    </div>
                  </CommandEmpty>
                ) : null}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
