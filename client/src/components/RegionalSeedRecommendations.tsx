import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Leaf, Droplets, Thermometer, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RegionalVariety {
  id: string;
  name: string;
  company: string;
  maturityDays: number;
  region: string;
  description: string;
  features: string[];
  rainfall: string;
  growingSeason: string;
  yieldPotential: string;
}

interface RegionInfo {
  region: string;
  description: string;
  rainfall: string;
  growingSeason: string;
  provinces: string[];
}

interface RegionalSeedRecommendationsProps {
  location?: string;
  soilType?: string;
  cropType?: string;
  region?: string; // Specific region data from location
}

const RegionalSeedRecommendations: React.FC<RegionalSeedRecommendationsProps> = ({
  location,
  soilType,
  cropType = "maize",
  region,
}) => {
  const [activeTab, setActiveTab] = useState<string>("region1");
  const [selectedRegion, setSelectedRegion] = useState<RegionInfo | null>(null);
  const [filteredVarieties, setFilteredVarieties] = useState<RegionalVariety[]>([]);
  const [detectedRegion, setDetectedRegion] = useState<string | null>(null);

  // Zambian agricultural regions
  const regions: RegionInfo[] = [
    {
      region: "Region I",
      description: "Low rainfall region with short growing season",
      rainfall: "600-800mm",
      growingSeason: "80-120 days",
      provinces: ["Southern", "Eastern", "Western"],
    },
    {
      region: "Region II",
      description: "Medium rainfall with average growing season",
      rainfall: "800-1000mm",
      growingSeason: "100-140 days",
      provinces: ["Central", "Southern", "Eastern", "Lusaka"],
    },
    {
      region: "Region III",
      description: "High rainfall with long growing season",
      rainfall: "over 1000mm",
      growingSeason: "120-150 days",
      provinces: ["Northern", "Luapula", "Copperbelt", "Northwestern"],
    },
  ];

  // Seed variety database (representative Zambian varieties)
  const seedVarieties: RegionalVariety[] = [
    // ZAMSEED varieties
    {
      id: "zms301",
      name: "ZMS 301",
      company: "ZAMSEED",
      maturityDays: 75,
      region: "Region I",
      description: "Semi-flint white grain maize variety",
      features: ["Drought Tolerant", "Early Maturing"],
      rainfall: "600-800mm",
      growingSeason: "75 Days to Maturity",
      yieldPotential: "120–140 × 50 kg bags/ha",
    },
    {
      id: "zms405",
      name: "ZMS 405",
      company: "ZAMSEED",
      maturityDays: 105,
      region: "Regions I & II",
      description: "Flint white grain maize variety",
      features: ["High-yielding", "Medium Maturity"],
      rainfall: "600-1000mm",
      growingSeason: "100-105 Days to Maturity",
      yieldPotential: "140–160 × 50 kg bags/ha",
    },
    {
      id: "zms520",
      name: "ZMS 520",
      company: "ZAMSEED",
      maturityDays: 125,
      region: "Regions II & III",
      description: "Dent white grain maize variety",
      features: ["Full Husk Cover", "Late Maturity"],
      rainfall: "800+ mm",
      growingSeason: "120-125 Days to Maturity",
      yieldPotential: "180–200 × 50 kg bags/ha",
    },
    {
      id: "zms606",
      name: "ZMS 606",
      company: "ZAMSEED",
      maturityDays: 130,
      region: "Regions II & III",
      description: "Semi-dent white grain maize variety",
      features: ["Disease Resistant", "High Moisture Tolerance"],
      rainfall: "800+ mm",
      growingSeason: "130 Days to Maturity",
      yieldPotential: "160–180 × 50 kg bags/ha",
    },
    {
      id: "zms638",
      name: "ZMS 638",
      company: "ZAMSEED",
      maturityDays: 130,
      region: "Regions II & III",
      description: "Dent white grain maize variety",
      features: ["Good stand ability", "Excellent husk cover"],
      rainfall: "800+ mm",
      growingSeason: "130 Days to Maturity",
      yieldPotential: "170–180 × 50 kg bags/ha",
    },
    {
      id: "zms720",
      name: "ZMS 720",
      company: "ZAMSEED",
      maturityDays: 140,
      region: "Region III",
      description: "Dent white grain maize variety",
      features: ["High Yield in High Rainfall", "Late Maturity"],
      rainfall: "1000+ mm",
      growingSeason: "140 Days to Maturity",
      yieldPotential: "190–210 × 50 kg bags/ha",
    },
    {
      id: "gv664",
      name: "GV664 (A)",
      company: "ZAMSEED",
      maturityDays: 115,
      region: "Regions I & II",
      description: "Flint orange (Vitamin A enriched)",
      features: ["Vitamin A Enriched", "Medium Maturity"],
      rainfall: "600-1000mm",
      growingSeason: "115-125 Days to Maturity",
      yieldPotential: "140 × 50 kg bags/ha, GMO-free",
    },
    
    // SeedCo varieties
    {
      id: "sc633",
      name: "SC 633",
      company: "SeedCo",
      maturityDays: 130,
      region: "Regions II & III",
      description: "Medium maturing white maize hybrid",
      features: ["Drought Tolerant", "Good disease resistance"],
      rainfall: "800+ mm",
      growingSeason: "130-136 Days to Maturity",
      yieldPotential: "up to 13 t/ha",
    },
    {
      id: "sc637",
      name: "SC 637",
      company: "SeedCo",
      maturityDays: 135,
      region: "Region III",
      description: "Medium maturing white maize hybrid",
      features: ["Semi-flint grain", "Disease Tolerance"],
      rainfall: "1000+ mm",
      growingSeason: "135-140 Days to Maturity",
      yieldPotential: "11-13 t/ha",
    },
    {
      id: "sc647",
      name: "SC 647",
      company: "SeedCo",
      maturityDays: 130,
      region: "Regions I-III",
      description: "Medium maturing white maize hybrid",
      features: ["Heat & Drought Tolerant", "Adaptable"],
      rainfall: "600+ mm",
      growingSeason: "130-136 Days to Maturity",
      yieldPotential: "up to 16 t/ha",
    },
    
    // Amiran vegetable varieties
    {
      id: "dominique",
      name: "Dominique F1",
      company: "Amiran",
      maturityDays: 75,
      region: "Regions I-III",
      description: "Indeterminate hybrid tomato variety",
      features: ["180–200g Fruit", "TYLCV Resistant"],
      rainfall: "Irrigation required",
      growingSeason: "75-80 Days to Maturity",
      yieldPotential: "80-100 tons/ha",
    },
    {
      id: "landini",
      name: "Landini F1",
      company: "Amiran",
      maturityDays: 75,
      region: "Regions I-III",
      description: "Hybrid cabbage variety",
      features: ["Heat Tolerant", "Uniform Heads"],
      rainfall: "Irrigation required",
      growingSeason: "75 Days Maturity",
      yieldPotential: "60-80 tons/ha",
    }
  ];

  // Determine region based on location
  const determineRegionFromLocation = (location: string) => {
    // Extract province name from location format "City, Province"
    const parts = location.split(',');
    let province = parts.length > 1 ? parts[1].trim() : parts[0].trim();
    
    // Remove country code if present
    if (province.includes(' ')) {
      province = province.split(' ')[0].trim();
    }
    
    // Check which region this province belongs to
    for (const r of regions) {
      if (r.provinces.some(p => p.toLowerCase() === province.toLowerCase())) {
        return r.region;
      }
    }
    
    // Special case handling for major cities
    if (location.toLowerCase().includes('lusaka')) {
      return "Region II";
    } else if (location.toLowerCase().includes('ndola') || 
               location.toLowerCase().includes('kitwe') || 
               location.toLowerCase().includes('solwezi')) {
      return "Region III";
    } else if (location.toLowerCase().includes('livingstone') || 
               location.toLowerCase().includes('chipata')) {
      return "Region I";
    }
    
    // Return Region II as default if we can't determine
    return "Region II";
  };
  
  useEffect(() => {
    // Determine the region from location if available, otherwise use Region I as default
    let regionToUse = "Region I";
    
    if (region) {
      // If region is directly provided, use it
      regionToUse = region;
    } else if (location) {
      // Try to determine region from location
      regionToUse = determineRegionFromLocation(location);
    }
    
    // Set the detected region for display
    setDetectedRegion(regionToUse);
    
    // Find the region object
    const detectedRegionObj = regions.find(r => r.region === regionToUse) || null;
    setSelectedRegion(detectedRegionObj);
    
    // Set active tab based on region
    switch(regionToUse) {
      case "Region I":
        setActiveTab("region1");
        break;
      case "Region II":
        setActiveTab("region2");
        break;
      case "Region III":
        setActiveTab("region3");
        break;
    }
    
    // Filter varieties for detected region
    const regionVarieties = seedVarieties.filter(
      v => v.region.includes(regionToUse) || v.region.includes(`Regions ${regionToUse.split(' ')[1]}`)
    );
    setFilteredVarieties(regionVarieties);
  }, [region, location]);

  // Handle region tab change
  const handleRegionChange = (regionId: string) => {
    setActiveTab(regionId);
    
    let regionLabel = "";
    switch(regionId) {
      case "region1":
        regionLabel = "Region I";
        break;
      case "region2":
        regionLabel = "Region II";
        break;
      case "region3":
        regionLabel = "Region III";
        break;
      default:
        regionLabel = "Region I";
    }
    
    const newRegion = regions.find(r => r.region === regionLabel) || null;
    setSelectedRegion(newRegion);
    
    // Filter varieties for selected region
    const newVarieties = seedVarieties.filter(
      v => v.region.includes(regionLabel) || v.region.includes(`Regions ${regionLabel.split(' ')[1]}`)
    );
    setFilteredVarieties(newVarieties);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Leaf className="h-5 w-5 mr-2 text-green-500" />
          Regional Seed Recommendations
        </CardTitle>
        <CardDescription>
          {location ? (
            <>
              Seed varieties for <span className="font-medium text-primary">{location}</span> 
              {detectedRegion && (
                <span> ({detectedRegion})</span>
              )}
            </>
          ) : (
            "Find the best seed varieties for your agricultural region"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="region1" value={activeTab} onValueChange={handleRegionChange}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="region1">Region I</TabsTrigger>
            <TabsTrigger value="region2">Region II</TabsTrigger>
            <TabsTrigger value="region3">Region III</TabsTrigger>
          </TabsList>
          
          <div className="mb-4">
            {selectedRegion && (
              <div className="mb-4 space-y-3">
                <div className="bg-muted/30 p-3 rounded-lg">
                  <h3 className="font-medium mb-1">{selectedRegion.region}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedRegion.description}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Rainfall: {selectedRegion.rainfall}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">Season: {selectedRegion.growingSeason}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Provinces: {selectedRegion.provinces.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">Recommended Varieties for this Region:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVarieties.length > 0 ? 
                filteredVarieties.map(variety => (
                  <div key={variety.id} className="border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{variety.name}</h3>
                        <p className="text-xs text-muted-foreground">{variety.company}</p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                        {variety.region}
                      </Badge>
                    </div>
                    
                    <p className="text-sm mb-2">{variety.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {variety.features.map((feature, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-muted/30 p-2 rounded">
                        <span className="block text-muted-foreground">Maturity</span>
                        <span>{variety.growingSeason}</span>
                      </div>
                      <div className="bg-muted/30 p-2 rounded">
                        <span className="block text-muted-foreground">Yield Potential</span>
                        <span>{variety.yieldPotential}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 text-center p-4 bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground">No varieties found for this region.</p>
                  </div>
                )
              }
            </div>
            
            <div className="text-xs text-muted-foreground mt-4 p-2 bg-muted/10 rounded">
              <p>* Varieties listed are authenticated from Zambian seed companies: ZAMSEED, SeedCo, and Amiran.</p>
              <p>* Consult with local agricultural extension for specific advice for your farm.</p>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RegionalSeedRecommendations;