/**
 * Comprehensive database of Zambian locations with precise GPS coordinates
 * For hyperlocal weather forecasts at neighborhood/compound level
 */

export interface ZambianLocation {
  name: string;
  city: string;
  province: string;
  district?: string;
  type: "city" | "town" | "compound" | "neighborhood" | "village" | "district";
  coordinates: {
    lat: number;
    lon: number;
  };
  population?: number;
  description?: string;
  aliases?: string[]; // Alternative names
}

/**
 * Zambian locations database
 * Organized by province -> city -> neighborhoods/compounds
 */
export const zambianLocations: ZambianLocation[] = [
  // ===== LUSAKA PROVINCE =====
  // Lusaka City
  {
    name: "Lusaka City Center",
    city: "Lusaka",
    province: "Lusaka",
    type: "neighborhood",
    coordinates: { lat: -15.4167, lon: 28.2833 },
    description: "Central Business District",
  },
  {
    name: "Chalala",
    city: "Lusaka",
    province: "Lusaka",
    type: "compound",
    coordinates: { lat: -15.3856, lon: 28.3189 },
    description: "Residential compound in Lusaka",
    aliases: ["Chalala Compound"],
  },
  {
    name: "Kalingalinga",
    city: "Lusaka",
    province: "Lusaka",
    type: "compound",
    coordinates: { lat: -15.3742, lon: 28.3528 },
    description: "High-density residential area",
    aliases: ["Kalingalinga Compound"],
  },
  {
    name: "Kanyama",
    city: "Lusaka",
    province: "Lusaka",
    type: "compound",
    coordinates: { lat: -15.4333, lon: 28.2500 },
    description: "Large high-density residential compound",
  },
  {
    name: "Matero",
    city: "Lusaka",
    province: "Lusaka",
    type: "compound",
    coordinates: { lat: -15.3856, lon: 28.2667 },
    description: "Residential compound",
  },
  {
    name: "Chilenje",
    city: "Lusaka",
    province: "Lusaka",
    type: "neighborhood",
    coordinates: { lat: -15.4500, lon: 28.3167 },
    description: "Middle-income residential area",
  },
  {
    name: "Olympia",
    city: "Lusaka",
    province: "Lusaka",
    type: "neighborhood",
    coordinates: { lat: -15.4644, lon: 28.3353 },
    description: "Residential area with shopping centers",
  },
  {
    name: "Kamwala",
    city: "Lusaka",
    province: "Lusaka",
    type: "neighborhood",
    coordinates: { lat: -15.4289, lon: 28.2975 },
    description: "Commercial and residential area",
  },
  {
    name: "Garden Compound",
    city: "Lusaka",
    province: "Lusaka",
    type: "compound",
    coordinates: { lat: -15.4081, lon: 28.2869 },
    description: "High-density residential compound",
  },
  {
    name: "Ng'ombe",
    city: "Lusaka",
    province: "Lusaka",
    type: "compound",
    coordinates: { lat: -15.3856, lon: 28.3331 },
    description: "Residential compound",
    aliases: ["Ngombe", "Ngombe Compound"],
  },
  {
    name: "Chawama",
    city: "Lusaka",
    province: "Lusaka",
    type: "compound",
    coordinates: { lat: -15.4833, lon: 28.2667 },
    description: "Residential compound south of Lusaka",
  },
  {
    name: "George",
    city: "Lusaka",
    province: "Lusaka",
    type: "compound",
    coordinates: { lat: -15.4503, lon: 28.2589 },
    description: "High-density residential compound",
    aliases: ["George Compound"],
  },
  {
    name: "Kabanana",
    city: "Lusaka",
    province: "Lusaka",
    type: "compound",
    coordinates: { lat: -15.4039, lon: 28.2686 },
    description: "Residential compound",
  },
  {
    name: "Linda",
    city: "Lusaka",
    province: "Lusaka",
    type: "compound",
    coordinates: { lat: -15.3597, lon: 28.3281 },
    description: "Residential compound northeast of Lusaka",
  },
  {
    name: "Mtendere",
    city: "Lusaka",
    province: "Lusaka",
    type: "compound",
    coordinates: { lat: -15.3667, lon: 28.3833 },
    description: "Large residential compound",
  },
  {
    name: "Roma",
    city: "Lusaka",
    province: "Lusaka",
    type: "neighborhood",
    coordinates: { lat: -15.4700, lon: 28.3300 },
    description: "Residential area with farmland",
  },
  {
    name: "Woodlands",
    city: "Lusaka",
    province: "Lusaka",
    type: "neighborhood",
    coordinates: { lat: -15.4206, lon: 28.3300 },
    description: "Affluent residential area",
  },
  {
    name: "Kalundu",
    city: "Lusaka",
    province: "Lusaka",
    type: "neighborhood",
    coordinates: { lat: -15.3917, lon: 28.3583 },
    description: "Mixed residential area",
  },
  {
    name: "Chelston",
    city: "Lusaka",
    province: "Lusaka",
    type: "neighborhood",
    coordinates: { lat: -15.4250, lon: 28.3500 },
    description: "Middle to high-income residential area",
  },
  {
    name: "Makeni",
    city: "Lusaka",
    province: "Lusaka",
    type: "neighborhood",
    coordinates: { lat: -15.4528, lon: 28.2383 },
    description: "Residential area with Manda Hill",
  },
  {
    name: "Kabwata",
    city: "Lusaka",
    province: "Lusaka",
    type: "neighborhood",
    coordinates: { lat: -15.4361, lon: 28.2847 },
    description: "Cultural and commercial area",
  },
  {
    name: "Libala",
    city: "Lusaka",
    province: "Lusaka",
    type: "neighborhood",
    coordinates: { lat: -15.3972, lon: 28.3111 },
    description: "Residential area",
  },
  {
    name: "Rhodes Park",
    city: "Lusaka",
    province: "Lusaka",
    type: "neighborhood",
    coordinates: { lat: -15.3992, lon: 28.3264 },
    description: "Upscale residential area",
  },
  {
    name: "Meanwood",
    city: "Lusaka",
    province: "Lusaka",
    type: "neighborhood",
    coordinates: { lat: -15.3847, lon: 28.3014 },
    description: "Mixed residential area",
  },
  {
    name: "Northmead",
    city: "Lusaka",
    province: "Lusaka",
    type: "neighborhood",
    coordinates: { lat: -15.3944, lon: 28.3353 },
    description: "Residential area",
  },

  // ===== COPPERBELT PROVINCE =====
  {
    name: "Kitwe",
    city: "Kitwe",
    province: "Copperbelt",
    type: "city",
    coordinates: { lat: -12.8028, lon: 28.2133 },
    description: "Second largest city, mining hub",
    population: 522092,
  },
  {
    name: "Ndola",
    city: "Ndola",
    province: "Copperbelt",
    type: "city",
    coordinates: { lat: -12.9585, lon: 28.6366 },
    description: "Third largest city, commercial center",
    population: 451246,
  },
  {
    name: "Mufulira",
    city: "Mufulira",
    province: "Copperbelt",
    type: "town",
    coordinates: { lat: -12.5500, lon: 28.2667 },
    description: "Mining town",
  },
  {
    name: "Chingola",
    city: "Chingola",
    province: "Copperbelt",
    type: "town",
    coordinates: { lat: -12.5286, lon: 27.8631 },
    description: "Mining town",
  },
  {
    name: "Luanshya",
    city: "Luanshya",
    province: "Copperbelt",
    type: "town",
    coordinates: { lat: -13.1369, lon: 28.4167 },
    description: "Mining town",
  },
  {
    name: "Chililabombwe",
    city: "Chililabombwe",
    province: "Copperbelt",
    type: "town",
    coordinates: { lat: -12.3647, lon: 27.8222 },
    description: "Mining town near Congo border",
  },
  {
    name: "Kalulushi",
    city: "Kalulushi",
    province: "Copperbelt",
    type: "town",
    coordinates: { lat: -12.8414, lon: 28.0947 },
    description: "Mining town",
  },

  // ===== SOUTHERN PROVINCE =====
  {
    name: "Livingstone",
    city: "Livingstone",
    province: "Southern",
    type: "city",
    coordinates: { lat: -17.8419, lon: 25.8544 },
    description: "Tourist capital, Victoria Falls",
    population: 139509,
  },
  {
    name: "Choma",
    city: "Choma",
    province: "Southern",
    type: "town",
    coordinates: { lat: -16.8083, lon: 26.9867 },
    description: "Agricultural town",
  },
  {
    name: "Mazabuka",
    city: "Mazabuka",
    province: "Southern",
    type: "town",
    coordinates: { lat: -15.8567, lon: 27.7483 },
    description: "Sugar production center",
  },
  {
    name: "Monze",
    city: "Monze",
    province: "Southern",
    type: "town",
    coordinates: { lat: -16.2833, lon: 27.4833 },
    description: "Agricultural town",
  },
  {
    name: "Kalomo",
    city: "Kalomo",
    province: "Southern",
    type: "town",
    coordinates: { lat: -17.0244, lon: 26.4872 },
    description: "District capital",
  },
  {
    name: "Namwala",
    city: "Namwala",
    province: "Southern",
    type: "town",
    coordinates: { lat: -15.7500, lon: 26.4333 },
    description: "Rural town",
  },

  // ===== EASTERN PROVINCE =====
  {
    name: "Chipata",
    city: "Chipata",
    province: "Eastern",
    type: "city",
    coordinates: { lat: -13.6333, lon: 32.6500 },
    description: "Capital of Eastern Province",
    population: 116806,
  },
  {
    name: "Katete",
    city: "Katete",
    province: "Eastern",
    type: "town",
    coordinates: { lat: -14.0667, lon: 32.0500 },
    description: "Agricultural town",
  },
  {
    name: "Petauke",
    city: "Petauke",
    province: "Eastern",
    type: "town",
    coordinates: { lat: -14.2411, lon: 31.3197 },
    description: "District capital",
  },
  {
    name: "Lundazi",
    city: "Lundazi",
    province: "Eastern",
    type: "town",
    coordinates: { lat: -12.2908, lon: 33.1767 },
    description: "District capital near Malawi border",
  },

  // ===== NORTHERN PROVINCE =====
  {
    name: "Kasama",
    city: "Kasama",
    province: "Northern",
    type: "city",
    coordinates: { lat: -10.2128, lon: 31.1808 },
    description: "Capital of Northern Province",
    population: 111588,
  },
  {
    name: "Mbala",
    city: "Mbala",
    province: "Northern",
    type: "town",
    coordinates: { lat: -8.8403, lon: 31.3658 },
    description: "Northern town near Tanzania",
  },
  {
    name: "Mpika",
    city: "Mpika",
    province: "Northern",
    type: "town",
    coordinates: { lat: -11.8333, lon: 31.4500 },
    description: "Gateway to northern region",
  },
  {
    name: "Isoka",
    city: "Isoka",
    province: "Northern",
    type: "town",
    coordinates: { lat: -10.1503, lon: 32.6325 },
    description: "Rural town",
  },

  // ===== WESTERN PROVINCE =====
  {
    name: "Mongu",
    city: "Mongu",
    province: "Western",
    type: "city",
    coordinates: { lat: -15.2689, lon: 23.1264 },
    description: "Capital of Western Province, Barotseland",
    population: 179585,
  },
  {
    name: "Senanga",
    city: "Senanga",
    province: "Western",
    type: "town",
    coordinates: { lat: -16.1167, lon: 23.2667 },
    description: "District capital",
  },
  {
    name: "Kaoma",
    city: "Kaoma",
    province: "Western",
    type: "town",
    coordinates: { lat: -14.7833, lon: 24.8000 },
    description: "District capital",
  },
  {
    name: "Lukulu",
    city: "Lukulu",
    province: "Western",
    type: "town",
    coordinates: { lat: -14.3833, lon: 23.2333 },
    description: "Rural town",
  },

  // ===== LUAPULA PROVINCE =====
  {
    name: "Mansa",
    city: "Mansa",
    province: "Luapula",
    type: "city",
    coordinates: { lat: -11.1994, lon: 28.8939 },
    description: "Capital of Luapula Province",
    population: 95581,
  },
  {
    name: "Kawambwa",
    city: "Kawambwa",
    province: "Luapula",
    type: "town",
    coordinates: { lat: -9.7914, lon: 29.0786 },
    description: "District capital",
  },
  {
    name: "Nchelenge",
    city: "Nchelenge",
    province: "Luapula",
    type: "town",
    coordinates: { lat: -9.3453, lon: 28.7353 },
    description: "Fishing town on Lake Mweru",
  },
  {
    name: "Samfya",
    city: "Samfya",
    province: "Luapula",
    type: "town",
    coordinates: { lat: -11.3658, lon: 29.5564 },
    description: "Fishing town on Lake Bangweulu",
  },

  // ===== CENTRAL PROVINCE =====
  {
    name: "Kabwe",
    city: "Kabwe",
    province: "Central",
    type: "city",
    coordinates: { lat: -14.4469, lon: 28.4464 },
    description: "Former mining capital",
    population: 213795,
  },
  {
    name: "Kapiri Mposhi",
    city: "Kapiri Mposhi",
    province: "Central",
    type: "town",
    coordinates: { lat: -13.9717, lon: 28.6806 },
    description: "Railway junction town",
  },
  {
    name: "Serenje",
    city: "Serenje",
    province: "Central",
    type: "town",
    coordinates: { lat: -13.2333, lon: 30.2333 },
    description: "District capital",
  },
  {
    name: "Mkushi",
    city: "Mkushi",
    province: "Central",
    type: "town",
    coordinates: { lat: -13.6203, lon: 29.3939 },
    description: "Agricultural town",
  },

  // ===== MUCHINGA PROVINCE =====
  {
    name: "Chinsali",
    city: "Chinsali",
    province: "Muchinga",
    type: "town",
    coordinates: { lat: -10.5411, lon: 32.0822 },
    description: "District capital",
  },
  {
    name: "Nakonde",
    city: "Nakonde",
    province: "Muchinga",
    type: "town",
    coordinates: { lat: -9.3417, lon: 32.7500 },
    description: "Border town with Tanzania",
  },
  {
    name: "Mafinga",
    city: "Mafinga",
    province: "Muchinga",
    type: "town",
    coordinates: { lat: -9.7667, lon: 31.9833 },
    description: "District capital",
  },

  // ===== NORTH-WESTERN PROVINCE =====
  {
    name: "Solwezi",
    city: "Solwezi",
    province: "North-Western",
    type: "city",
    coordinates: { lat: -12.1688, lon: 26.3833 },
    description: "Mining capital of NW Province",
    population: 89118,
  },
  {
    name: "Mwinilunga",
    city: "Mwinilunga",
    province: "North-Western",
    type: "town",
    coordinates: { lat: -11.7358, lon: 24.4289 },
    description: "District capital",
  },
  {
    name: "Zambezi",
    city: "Zambezi",
    province: "North-Western",
    type: "town",
    coordinates: { lat: -13.5431, lon: 23.1081 },
    description: "District capital",
  },
  {
    name: "Kasempa",
    city: "Kasempa",
    province: "North-Western",
    type: "town",
    coordinates: { lat: -13.4583, lon: 25.8333 },
    description: "District capital",
  },
];

/**
 * Search for Zambian location by name (supports partial matching and aliases)
 */
export function findZambianLocation(
  searchTerm: string
): ZambianLocation | null {
  const normalizedSearch = searchTerm.toLowerCase().trim();

  // First try exact match
  const exactMatch = zambianLocations.find(
    (loc) =>
      loc.name.toLowerCase() === normalizedSearch ||
      `${loc.name.toLowerCase()}, ${loc.city.toLowerCase()}` ===
        normalizedSearch ||
      `${loc.name.toLowerCase()}-${loc.city.toLowerCase()}` ===
        normalizedSearch
  );

  if (exactMatch) return exactMatch;

  // Try alias match
  const aliasMatch = zambianLocations.find((loc) =>
    loc.aliases?.some((alias) => alias.toLowerCase() === normalizedSearch)
  );

  if (aliasMatch) return aliasMatch;

  // Try partial match (contains)
  const partialMatch = zambianLocations.find(
    (loc) =>
      loc.name.toLowerCase().includes(normalizedSearch) ||
      normalizedSearch.includes(loc.name.toLowerCase())
  );

  return partialMatch || null;
}

/**
 * Get all locations in a specific city
 */
export function getLocationsByCity(city: string): ZambianLocation[] {
  return zambianLocations.filter(
    (loc) => loc.city.toLowerCase() === city.toLowerCase()
  );
}

/**
 * Get all locations in a specific province
 */
export function getLocationsByProvince(province: string): ZambianLocation[] {
  return zambianLocations.filter(
    (loc) => loc.province.toLowerCase() === province.toLowerCase()
  );
}

/**
 * Find nearest location to given coordinates
 */
export function findNearestLocation(
  lat: number,
  lon: number
): ZambianLocation | null {
  if (zambianLocations.length === 0) return null;

  let nearest = zambianLocations[0];
  let minDistance = calculateDistance(
    lat,
    lon,
    nearest.coordinates.lat,
    nearest.coordinates.lon
  );

  for (const location of zambianLocations) {
    const distance = calculateDistance(
      lat,
      lon,
      location.coordinates.lat,
      location.coordinates.lon
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = location;
    }
  }

  return nearest;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

