/**
 * Canonical marketplace category list and subcategories.
 * Use this for filters, validation, and display so analytics and UX stay consistent.
 */

export interface MarketplaceCategoryItem {
  id: string;
  name: string;
  icon: string;
}

export const MARKETPLACE_CATEGORIES: MarketplaceCategoryItem[] = [
  { id: "pesticides", name: "Pesticides & Herbicides", icon: "🦠" },
  { id: "fertilizers", name: "Fertilizers & Soil Amendments", icon: "🌱" },
  { id: "seeds", name: "Seeds & Plants", icon: "🌾" },
  { id: "equipment", name: "Farm Equipment", icon: "🚜" },
  { id: "tools", name: "Tools & Supplies", icon: "🔧" },
  { id: "livestock", name: "Livestock & Feed", icon: "🐄" },
  { id: "irrigation", name: "Irrigation Systems", icon: "💧" },
  { id: "organic", name: "Organic Products", icon: "🌿" },
  { id: "biocontrol", name: "Biological Control", icon: "🦗" },
  { id: "soil-health", name: "Soil Health Products", icon: "🏞️" },
  { id: "crop-protection", name: "Crop Protection", icon: "🛡️" },
  { id: "precision-ag", name: "Precision Agriculture", icon: "📡" },
  { id: "post-harvest", name: "Post-Harvest Solutions", icon: "📦" },
  { id: "services", name: "Agricultural Services", icon: "👨‍🌾" },
  { id: "produce", name: "Farm Produce", icon: "🥕" },
  { id: "other", name: "Other", icon: "📋" },
];

/** Category IDs allowed for listing.category (for server validation). Includes "general" for backward compatibility. */
export const ALLOWED_CATEGORY_IDS = [
  ...MARKETPLACE_CATEGORIES.map((c) => c.id),
  "general",
] as const;

/** For filter dropdowns that need an "All" option (UI-only, not stored). */
export const CATEGORIES_FOR_FILTER: MarketplaceCategoryItem[] = [
  { id: "all", name: "All Categories", icon: "📋" },
  ...MARKETPLACE_CATEGORIES,
];

export const SUBCATEGORIES: Record<string, { id: string; name: string }[]> = {
  seeds: [
    { id: "maize", name: "Maize" },
    { id: "wheat", name: "Wheat" },
    { id: "rice", name: "Rice" },
    { id: "vegetables", name: "Vegetables" },
    { id: "fruits", name: "Fruits" },
    { id: "other_seeds", name: "Other Seeds" },
  ],
  equipment: [
    { id: "tractors", name: "Tractors" },
    { id: "harvesters", name: "Harvesters" },
    { id: "ploughs", name: "Ploughs" },
    { id: "irrigation", name: "Irrigation Equipment" },
    { id: "other_equipment", name: "Other Equipment" },
  ],
};

const CATEGORY_NAME_BY_ID: Record<string, string> = {
  ...MARKETPLACE_CATEGORIES.reduce<Record<string, string>>(
    (acc, c) => {
      acc[c.id] = c.name;
      return acc;
    },
    {}
  ),
  general: "General",
};

/** Display label for a category id (e.g. in detail page or breadcrumbs). */
export function getCategoryLabel(category: string | null): string {
  if (!category) return "Other";
  return CATEGORY_NAME_BY_ID[category] ?? category;
}
