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
    coordinates: { lat: -15.4333, lon: 28.25 },
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
    coordinates: { lat: -15.45, lon: 28.3167 },
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
    coordinates: { lat: -15.47, lon: 28.33 },
    description: "Residential area with farmland",
  },
  {
    name: "Woodlands",
    city: "Lusaka",
    province: "Lusaka",
    type: "neighborhood",
    coordinates: { lat: -15.4206, lon: 28.33 },
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
    coordinates: { lat: -15.425, lon: 28.35 },
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

  // ===== LUSAKA PROVINCE - Additional Districts and Towns =====
  {
    name: "Kafue",
    city: "Kafue",
    province: "Lusaka",
    district: "Kafue",
    type: "town",
    coordinates: { lat: -15.769, lon: 28.1814 },
    description: "Industrial town south of Lusaka",
    population: 46000,
  },
  {
    name: "Chongwe",
    city: "Chongwe",
    province: "Lusaka",
    district: "Chongwe",
    type: "town",
    coordinates: { lat: -15.33, lon: 28.6833 },
    description: "Agricultural district capital east of Lusaka",
  },
  {
    name: "Luangwa",
    city: "Luangwa",
    province: "Lusaka",
    district: "Luangwa",
    type: "village",
    coordinates: { lat: -15.6167, lon: 30.4167 },
    description: "Rural settlement in Luangwa Valley",
  },
  {
    name: "Rufunsa",
    city: "Rufunsa",
    province: "Lusaka",
    district: "Rufunsa",
    type: "village",
    coordinates: { lat: -14.9167, lon: 29.3833 },
    description: "Remote rural settlement",
  },
  {
    name: "Chirundu",
    city: "Chirundu",
    province: "Lusaka",
    district: "Kafue",
    type: "town",
    coordinates: { lat: -16.0333, lon: 28.85 },
    description: "Border town with Zimbabwe, Zambezi River crossing",
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
    coordinates: { lat: -12.55, lon: 28.2667 },
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
  {
    name: "Mpongwe",
    city: "Mpongwe",
    province: "Copperbelt",
    district: "Mpongwe",
    type: "village",
    coordinates: { lat: -13.5167, lon: 28.15 },
    description: "Rural district capital",
  },
  {
    name: "Lufwanyama",
    city: "Lufwanyama",
    province: "Copperbelt",
    district: "Lufwanyama",
    type: "village",
    coordinates: { lat: -13.6667, lon: 27.8833 },
    description: "Remote rural district",
  },
  {
    name: "Masaiti",
    city: "Masaiti",
    province: "Copperbelt",
    district: "Masaiti",
    type: "town",
    coordinates: { lat: -13.3375, lon: 28.4256 },
    description: "Agricultural and mining area",
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
    coordinates: { lat: -15.75, lon: 26.4333 },
    description: "Rural town",
  },
  {
    name: "Sinazongwe",
    city: "Sinazongwe",
    province: "Southern",
    district: "Sinazongwe",
    type: "village",
    coordinates: { lat: -17.2619, lon: 27.4628 },
    description: "Lake Kariba fishing settlement",
  },
  {
    name: "Gwembe",
    city: "Gwembe",
    province: "Southern",
    district: "Gwembe",
    type: "village",
    coordinates: { lat: -16.5167, lon: 27.8667 },
    description: "Zambezi Valley settlement",
  },
  {
    name: "Siavonga",
    city: "Siavonga",
    province: "Southern",
    district: "Siavonga",
    type: "town",
    coordinates: { lat: -16.5381, lon: 28.7086 },
    description: "Lake Kariba resort town",
  },
  {
    name: "Zimba",
    city: "Zimba",
    province: "Southern",
    district: "Kalomo",
    type: "village",
    coordinates: { lat: -17.2667, lon: 26.0333 },
    description: "Rural farming settlement",
  },
  {
    name: "Pemba",
    city: "Pemba",
    province: "Southern",
    district: "Choma",
    type: "village",
    coordinates: { lat: -17.3, lon: 27.2 },
    description: "Rural farming area",
  },
  {
    name: "Macha",
    city: "Macha",
    province: "Southern",
    district: "Choma",
    type: "village",
    coordinates: { lat: -16.4, lon: 26.8 },
    description: "Mission hospital settlement",
  },
  {
    name: "Itezhi-Tezhi",
    city: "Itezhi-Tezhi",
    province: "Southern",
    district: "Itezhi-Tezhi",
    type: "village",
    coordinates: { lat: -15.7333, lon: 26.0333 },
    description: "Dam and wildlife area settlement",
  },

  // ===== EASTERN PROVINCE =====
  {
    name: "Chipata",
    city: "Chipata",
    province: "Eastern",
    type: "city",
    coordinates: { lat: -13.6333, lon: 32.65 },
    description: "Capital of Eastern Province",
    population: 116806,
  },
  {
    name: "Katete",
    city: "Katete",
    province: "Eastern",
    type: "town",
    coordinates: { lat: -14.0667, lon: 32.05 },
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
  {
    name: "Chadiza",
    city: "Chadiza",
    province: "Eastern",
    district: "Chadiza",
    type: "village",
    coordinates: { lat: -14.0667, lon: 32.4333 },
    description: "Agricultural district capital",
  },
  {
    name: "Chama",
    city: "Chama",
    province: "Eastern",
    district: "Chama",
    type: "village",
    coordinates: { lat: -11.2167, lon: 33.1167 },
    description: "Remote northeastern settlement",
  },
  {
    name: "Nyimba",
    city: "Nyimba",
    province: "Eastern",
    district: "Nyimba",
    type: "village",
    coordinates: { lat: -14.5667, lon: 30.8167 },
    description: "Rural farming area",
  },
  {
    name: "Sinda",
    city: "Sinda",
    province: "Eastern",
    district: "Sinda",
    type: "village",
    coordinates: { lat: -14.2167, lon: 31.75 },
    description: "Rural district capital",
  },
  {
    name: "Vubwi",
    city: "Vubwi",
    province: "Eastern",
    district: "Vubwi",
    type: "village",
    coordinates: { lat: -13.5833, lon: 32.3833 },
    description: "Rural settlement",
  },
  {
    name: "Mambwe",
    city: "Mambwe",
    province: "Eastern",
    district: "Mambwe",
    type: "village",
    coordinates: { lat: -9.85, lon: 31.8333 },
    description: "Border settlement with Tanzania",
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
    coordinates: { lat: -11.8333, lon: 31.45 },
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
  {
    name: "Luwingu",
    city: "Luwingu",
    province: "Northern",
    district: "Luwingu",
    type: "village",
    coordinates: { lat: -10.2617, lon: 29.9294 },
    description: "Remote district capital",
  },
  {
    name: "Mporokoso",
    city: "Mporokoso",
    province: "Northern",
    district: "Mporokoso",
    type: "village",
    coordinates: { lat: -9.3719, lon: 30.1256 },
    description: "Northern plateau settlement",
  },
  {
    name: "Kaputa",
    city: "Kaputa",
    province: "Northern",
    district: "Kaputa",
    type: "village",
    coordinates: { lat: -8.4667, lon: 29.6667 },
    description: "Remote northern settlement",
  },
  {
    name: "Chilubi",
    city: "Chilubi",
    province: "Northern",
    district: "Chilubi",
    type: "village",
    coordinates: { lat: -10.5667, lon: 29.9 },
    description: "Island settlement on Lake Bangweulu",
  },
  {
    name: "Senga Hill",
    city: "Senga Hill",
    province: "Northern",
    district: "Mbala",
    type: "village",
    coordinates: { lat: -8.9, lon: 31.45 },
    description: "Rural settlement",
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
    coordinates: { lat: -14.7833, lon: 24.8 },
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
  {
    name: "Kalabo",
    city: "Kalabo",
    province: "Western",
    district: "Kalabo",
    type: "village",
    coordinates: { lat: -14.9967, lon: 22.6833 },
    description: "Floodplain settlement",
  },
  {
    name: "Shangombo",
    city: "Shangombo",
    province: "Western",
    district: "Shangombo",
    type: "village",
    coordinates: { lat: -15.7667, lon: 22.4167 },
    description: "Remote southwestern settlement",
  },
  {
    name: "Sesheke",
    city: "Sesheke",
    province: "Western",
    district: "Sesheke",
    type: "town",
    coordinates: { lat: -17.4764, lon: 24.2964 },
    description: "Border town with Namibia",
  },
  {
    name: "Sioma",
    city: "Sioma",
    province: "Western",
    district: "Sioma",
    type: "village",
    coordinates: { lat: -16.5667, lon: 23.0167 },
    description: "Falls and wildlife area settlement",
  },
  {
    name: "Mulobezi",
    city: "Mulobezi",
    province: "Western",
    district: "Kazungula",
    type: "village",
    coordinates: { lat: -16.9333, lon: 26.2 },
    description: "Railway and agricultural settlement",
  },
  {
    name: "Nkeyema",
    city: "Nkeyema",
    province: "Western",
    district: "Mongu",
    type: "village",
    coordinates: { lat: -15.05, lon: 23.3 },
    description: "Rural farming area",
  },
  {
    name: "Limulunga",
    city: "Limulunga",
    province: "Western",
    district: "Mongu",
    type: "village",
    coordinates: { lat: -15.1167, lon: 23.1333 },
    description: "Royal village of Lozi kingdom",
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
  {
    name: "Mwense",
    city: "Mwense",
    province: "Luapula",
    district: "Mwense",
    type: "village",
    coordinates: { lat: -10.4333, lon: 28.6833 },
    description: "Lake Mweru area settlement",
  },
  {
    name: "Chembe",
    city: "Chembe",
    province: "Luapula",
    district: "Nchelenge",
    type: "village",
    coordinates: { lat: -9.1167, lon: 28.7667 },
    description: "Fishing village on Lake Mweru",
  },
  {
    name: "Chipili",
    city: "Chipili",
    province: "Luapula",
    district: "Mansa",
    type: "village",
    coordinates: { lat: -11.5167, lon: 28.65 },
    description: "Rural settlement",
  },
  {
    name: "Milenge",
    city: "Milenge",
    province: "Luapula",
    district: "Milenge",
    type: "village",
    coordinates: { lat: -11.1667, lon: 29.5 },
    description: "Lake Bangweulu fishing settlement",
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
  {
    name: "Mumbwa",
    city: "Mumbwa",
    province: "Central",
    district: "Mumbwa",
    type: "town",
    coordinates: { lat: -14.9831, lon: 27.0625 },
    description: "Agricultural and cattle ranching area",
  },
  {
    name: "Chibombo",
    city: "Chibombo",
    province: "Central",
    district: "Chibombo",
    type: "village",
    coordinates: { lat: -14.6569, lon: 28.0719 },
    description: "Rural farming district",
  },
  {
    name: "Itawa",
    city: "Itawa",
    province: "Central",
    district: "Kabwe",
    type: "village",
    coordinates: { lat: -14.3, lon: 28.6 },
    description: "Farming settlement near Kabwe",
  },
  {
    name: "Luano",
    city: "Luano",
    province: "Central",
    district: "Luano",
    type: "village",
    coordinates: { lat: -13.8667, lon: 30.5 },
    description: "Remote rural district",
  },
  {
    name: "Chitambo",
    city: "Chitambo",
    province: "Central",
    district: "Serenje",
    type: "village",
    coordinates: { lat: -13.0833, lon: 30.6 },
    description: "Historical site, David Livingstone's death place",
  },
  {
    name: "Ngabwe",
    city: "Ngabwe",
    province: "Central",
    district: "Mumbwa",
    type: "village",
    coordinates: { lat: -15.2167, lon: 26.7833 },
    description: "Rural settlement",
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
    coordinates: { lat: -9.3417, lon: 32.75 },
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
  {
    name: "Mpulungu",
    city: "Mpulungu",
    province: "Muchinga",
    district: "Mpulungu",
    type: "town",
    coordinates: { lat: -8.7622, lon: 31.1158 },
    description: "Port town on Lake Tanganyika",
  },
  {
    name: "Shiwang'andu",
    city: "Shiwang'andu",
    province: "Muchinga",
    district: "Shiwang'andu",
    type: "village",
    coordinates: { lat: -10.1833, lon: 31.8167 },
    description: "Agricultural district capital",
  },
  {
    name: "Kanchibiya",
    city: "Kanchibiya",
    province: "Muchinga",
    district: "Kanchibiya",
    type: "village",
    coordinates: { lat: -9.8667, lon: 31.7833 },
    description: "Rural farming settlement",
  },
  {
    name: "Lavushimanda",
    city: "Lavushimanda",
    province: "Muchinga",
    district: "Mpika",
    type: "village",
    coordinates: { lat: -11.55, lon: 31.65 },
    description: "Remote forest area settlement",
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
  {
    name: "Kabompo",
    city: "Kabompo",
    province: "North-Western",
    district: "Kabompo",
    type: "village",
    coordinates: { lat: -13.5933, lon: 24.2006 },
    description: "River settlement and district capital",
  },
  {
    name: "Mufumbwe",
    city: "Mufumbwe",
    province: "North-Western",
    district: "Mufumbwe",
    type: "village",
    coordinates: { lat: -13.6833, lon: 24.8 },
    description: "Remote rural district",
  },
  {
    name: "Ikelenge",
    city: "Ikelenge",
    province: "North-Western",
    district: "Ikelenge",
    type: "village",
    coordinates: { lat: -11.2, lon: 24.3167 },
    description: "Northwestern forest settlement",
  },
  {
    name: "Chavuma",
    city: "Chavuma",
    province: "North-Western",
    district: "Zambezi",
    type: "village",
    coordinates: { lat: -13.0667, lon: 22.6833 },
    description: "Border village with Angola",
  },
  {
    name: "Kalene Hill",
    city: "Kalene Hill",
    province: "North-Western",
    district: "Ikelenge",
    type: "village",
    coordinates: { lat: -11.0167, lon: 24.4667 },
    description: "Mission settlement in remote northwest",
  },

  // ===== ADDITIONAL RURAL AND REMOTE SETTLEMENTS =====

  // Lusaka Province - More compounds and peri-urban areas
  {
    name: "Bauleni",
    city: "Lusaka",
    province: "Lusaka",
    type: "compound",
    coordinates: { lat: -15.4422, lon: 28.3542 },
    description: "High-density residential compound",
  },
  {
    name: "Mandevu",
    city: "Lusaka",
    province: "Lusaka",
    type: "compound",
    coordinates: { lat: -15.3667, lon: 28.3333 },
    description: "Peri-urban compound",
  },
  {
    name: "Chaisa",
    city: "Lusaka",
    province: "Lusaka",
    type: "compound",
    coordinates: { lat: -15.41, lon: 28.29 },
    description: "Residential compound",
  },
  {
    name: "John Laing",
    city: "Lusaka",
    province: "Lusaka",
    type: "compound",
    coordinates: { lat: -15.3983, lon: 28.2758 },
    description: "Residential compound",
  },
  {
    name: "Misisi",
    city: "Lusaka",
    province: "Lusaka",
    type: "compound",
    coordinates: { lat: -15.4722, lon: 28.3042 },
    description: "Informal settlement",
  },
  {
    name: "Zingalume",
    city: "Lusaka",
    province: "Lusaka",
    type: "compound",
    coordinates: { lat: -15.4356, lon: 28.3169 },
    description: "Residential compound south of CBD",
  },

  // Southern Province - Additional settlements
  {
    name: "Kazungula",
    city: "Kazungula",
    province: "Southern",
    district: "Kazungula",
    type: "village",
    coordinates: { lat: -17.7833, lon: 25.2619 },
    description:
      "Four-country border point (Zambia, Zimbabwe, Botswana, Namibia)",
  },
  {
    name: "Batoka",
    city: "Batoka",
    province: "Southern",
    district: "Choma",
    type: "village",
    coordinates: { lat: -16.3667, lon: 26.9833 },
    description: "Rural farming settlement",
  },
  {
    name: "Maamba",
    city: "Maamba",
    province: "Southern",
    district: "Sinazongwe",
    type: "town",
    coordinates: { lat: -17.3667, lon: 27.15 },
    description: "Coal mining town",
  },
  {
    name: "Chikankata",
    city: "Chikankata",
    province: "Southern",
    district: "Mazabuka",
    type: "village",
    coordinates: { lat: -16.0167, lon: 27.7167 },
    description: "Mission hospital settlement",
  },

  // Copperbelt Province - Mining compounds and settlements
  {
    name: "Chambishi",
    city: "Chambishi",
    province: "Copperbelt",
    district: "Kalulushi",
    type: "town",
    coordinates: { lat: -12.65, lon: 28.0667 },
    description: "Copper mining town",
  },
  {
    name: "Konkola",
    city: "Konkola",
    province: "Copperbelt",
    district: "Chililabombwe",
    type: "town",
    coordinates: { lat: -12.4178, lon: 27.8422 },
    description: "Major copper mine settlement",
  },
  {
    name: "Nkana",
    city: "Kitwe",
    province: "Copperbelt",
    type: "neighborhood",
    coordinates: { lat: -12.8333, lon: 28.2167 },
    description: "Mining township in Kitwe",
  },
  {
    name: "Garneton",
    city: "Kitwe",
    province: "Copperbelt",
    type: "neighborhood",
    coordinates: { lat: -12.7833, lon: 28.2333 },
    description: "Residential area in Kitwe",
  },

  // Eastern Province - Additional rural areas
  {
    name: "Lumezi",
    city: "Lumezi",
    province: "Eastern",
    district: "Lundazi",
    type: "village",
    coordinates: { lat: -11.8833, lon: 33.1167 },
    description: "Rural farming settlement",
  },
  {
    name: "Msoro",
    city: "Msoro",
    province: "Eastern",
    district: "Chipata",
    type: "village",
    coordinates: { lat: -13.7833, lon: 32.7667 },
    description: "Agricultural village",
  },

  // Northern Province - Additional remote settlements
  {
    name: "Mungwi",
    city: "Mungwi",
    province: "Northern",
    district: "Mungwi",
    type: "village",
    coordinates: { lat: -10.1733, lon: 31.3689 },
    description: "Agricultural district",
  },
  {
    name: "Nsama",
    city: "Nsama",
    province: "Northern",
    district: "Kaputa",
    type: "village",
    coordinates: { lat: -8.6333, lon: 29.3167 },
    description: "Remote northern village",
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
      `${loc.name.toLowerCase()}-${loc.city.toLowerCase()}` === normalizedSearch
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
 * Returns location with distance information
 */
export function findNearestLocation(
  lat: number,
  lon: number,
  maxDistanceKm: number = 200 // Maximum distance threshold in km - prevents matching locations outside Zambia
): { location: ZambianLocation; distance: number } | null {
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

  // Only return if within the maximum distance threshold
  // This prevents matching locations far outside Zambia (e.g., Cape Town to Lusaka)
  if (minDistance > maxDistanceKm) {
    return null;
  }

  return {
    location: nearest,
    distance: minDistance, // Distance in km
  };
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
