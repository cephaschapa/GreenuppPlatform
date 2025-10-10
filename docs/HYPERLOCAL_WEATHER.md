# Hyperlocal Weather for Zambia

## 🎯 Overview

The Hyperlocal Weather system provides **neighborhood-level precision** weather data for Zambian locations. Instead of generic city-wide weather, farmers can now get precise forecasts for their specific compound or neighborhood.

### **Problem Solved**
- OpenWeatherMap's geocoding doesn't recognize Zambian neighborhoods like "Chalala" or "Kalingalinga"
- Farmers need precise local weather for their specific area, not just "Lusaka"
- Rural farmers need hyperlocal data for planting decisions

### **Solution**
- Comprehensive database of 100+ Zambian locations with GPS coordinates
- Neighborhood/compound-level precision
- Covers all 10 provinces and major cities

---

## 📍 **Supported Locations**

### **Lusaka Province**
**Compounds:**
- Chalala (-15.3856, 28.3189)
- Kalingalinga (-15.3742, 28.3528)
- Kanyama, Matero, Chawama, George, Garden, Ng'ombe, Kabanana, Linda, Mtendere

**Neighborhoods:**
- Chilenje, Olympia, Woodlands, Chelston, Rhodes Park, Kabwata, Libala, Roma, Meanwood, Northmead, Kalundu, Makeni, Kamwala

### **Other Provinces**
- **Copperbelt**: Kitwe, Ndola, Mufulira, Chingola, Luanshya, Chililabombwe, Kalulushi
- **Southern**: Livingstone, Choma, Mazabuka, Monze, Kalomo, Namwala
- **Eastern**: Chipata, Katete, Petauke, Lundazi
- **Northern**: Kasama, Mbala, Mpika, Isoka
- **Western**: Mongu, Senanga, Kaoma, Lukulu
- **Luapula**: Mansa, Kawambwa, Nchelenge, Samfya
- **Central**: Kabwe, Kapiri Mposhi, Serenje, Mkushi
- **Muchinga**: Chinsali, Nakonde, Mafinga
- **North-Western**: Solwezi, Mwinilunga, Zambezi, Kasempa

---

## 🚀 **API Endpoints**

### **1. Get Hyperlocal Weather**
```http
GET /api/hyperlocal-weather?location=Chalala - Lusaka
GET /api/hyperlocal-weather?location=Kalingalinga
GET /api/hyperlocal-weather?lat=-15.3856&lon=28.3189
GET /api/hyperlocal-weather?city=Lusaka
```

**Response:**
```json
{
  "success": true,
  "location": {
    "name": "Chalala",
    "city": "Lusaka",
    "province": "Lusaka",
    "type": "compound",
    "coordinates": {
      "lat": -15.3856,
      "lon": 28.3189
    },
    "description": "Residential compound in Lusaka"
  },
  "weather": {
    "location": "Chalala, Lusaka",
    "current": {
      "temp": 24.5,
      "feelsLike": 26.2,
      "humidity": 65,
      "windSpeed": 3.5,
      "condition": "Clear",
      "description": "clear sky"
    },
    "forecast": [...]
  },
  "meta": {
    "source": "zambian_database",
    "precision": "neighborhood",
    "message": "Weather data for Chalala neighborhood"
  }
}
```

### **2. Search Locations (Autocomplete)**
```http
GET /api/hyperlocal-weather/search?q=cha&limit=5
```

**Response:**
```json
{
  "success": true,
  "query": "cha",
  "count": 3,
  "locations": [
    {
      "name": "Chalala",
      "city": "Lusaka",
      "province": "Lusaka",
      "type": "compound",
      "fullName": "Chalala, Lusaka"
    },
    {
      "name": "Chawama",
      "city": "Lusaka",
      "province": "Lusaka",
      "type": "compound",
      "fullName": "Chawama, Lusaka"
    },
    {
      "name": "Choma",
      "city": "Choma",
      "province": "Southern",
      "type": "town",
      "fullName": "Choma, Choma"
    }
  ]
}
```

### **3. Get All Neighborhoods in a City**
```http
GET /api/hyperlocal-weather/city/Lusaka
```

**Response:**
```json
{
  "success": true,
  "city": "Lusaka",
  "count": 25,
  "locations": [
    {
      "name": "Chalala",
      "type": "compound",
      "coordinates": { "lat": -15.3856, "lon": 28.3189 }
    },
    {
      "name": "Kalingalinga",
      "type": "compound",
      "coordinates": { "lat": -15.3742, "lon": 28.3528 }
    },
    ...
  ]
}
```

### **4. Get Weather for All Neighborhoods**
```http
GET /api/hyperlocal-weather/city/Lusaka/weather
```

**Response:**
```json
{
  "success": true,
  "city": "Lusaka",
  "count": 25,
  "neighborhoods": [
    {
      "location": {
        "name": "Chalala",
        "type": "compound"
      },
      "weather": {
        "current": { "temp": 24.5, "humidity": 65 },
        "forecast": [...]
      },
      "precision": "neighborhood"
    },
    ...
  ]
}
```

### **5. Get Locations by Province**
```http
GET /api/hyperlocal-weather/province/Copperbelt
```

---

## 💻 **Frontend Integration Example**

### **Search with Autocomplete**
```typescript
import { useState, useEffect } from 'react';

function LocationSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.length < 2) return;
    
    fetch(`/api/hyperlocal-weather/search?q=${query}&limit=5`)
      .then(res => res.json())
      .then(data => setResults(data.locations));
  }, [query]);

  return (
    <div>
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search location..."
      />
      <ul>
        {results.map(loc => (
          <li key={`${loc.name}-${loc.city}`}>
            {loc.fullName} ({loc.type})
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### **Get Weather for User's Neighborhood**
```typescript
async function getNeighborhoodWeather(locationName: string) {
  const response = await fetch(
    `/api/hyperlocal-weather?location=${encodeURIComponent(locationName)}`
  );
  
  const data = await response.json();
  
  if (data.success) {
    console.log(`Weather for ${data.location.name}:`);
    console.log(`Temperature: ${data.weather.current.temp}°C`);
    console.log(`Precision: ${data.meta.precision}`);
  }
}

// Usage
getNeighborhoodWeather('Chalala - Lusaka');
getNeighborhoodWeather('Kalingalinga');
```

### **Get Weather by GPS**
```typescript
// Get user's GPS coordinates
navigator.geolocation.getCurrentPosition(async (position) => {
  const { latitude, longitude } = position.coords;
  
  const response = await fetch(
    `/api/hyperlocal-weather?lat=${latitude}&lon=${longitude}`
  );
  
  const data = await response.json();
  console.log(`Nearest location: ${data.location.name}, ${data.location.city}`);
});
```

---

## 🛠️ **Technical Architecture**

### **Database Structure**
```typescript
interface ZambianLocation {
  name: string;           // "Chalala"
  city: string;           // "Lusaka"
  province: string;       // "Lusaka"
  type: "city" | "town" | "compound" | "neighborhood" | "village";
  coordinates: {
    lat: number;          // -15.3856
    lon: number;          // 28.3189
  };
  description?: string;   // "Residential compound in Lusaka"
  aliases?: string[];     // ["Chalala Compound"]
  population?: number;    // Optional
}
```

### **Search Algorithm**
1. **Exact match**: `name.toLowerCase() === query`
2. **Alias match**: Check alternative names
3. **Starts with**: `name.startsWith(query)`
4. **Contains**: `name.includes(query)`
5. **City match**: `city.includes(query)`

### **Weather Resolution Strategy**
1. **Zambian Database First**: Check our local database
2. **GPS Fallback**: Find nearest location
3. **OpenWeather Fallback**: Use OpenWeather geocoding if not in database
4. **Precision Indicator**: Returns `"neighborhood"`, `"city"`, or `"approximate"`

---

## 📊 **Precision Levels**

| Precision | Description | Example |
|-----------|-------------|---------|
| **neighborhood** | Exact compound/neighborhood in database | "Chalala" |
| **city** | City-level (when specific neighborhood not found) | "Lusaka" |
| **approximate** | Nearest location to provided coordinates | GPS lookup |

---

## 🌍 **Use Cases**

### **For Small-Scale Farmers**
```
"I'm a farmer in Chalala. What's tomorrow's weather?"
→ GET /api/hyperlocal-weather?location=Chalala
→ Returns precise weather for Chalala compound
```

### **For Agricultural Extension Officers**
```
"Compare weather across Lusaka's farming compounds"
→ GET /api/hyperlocal-weather/city/Lusaka/weather
→ Returns weather for all 25+ neighborhoods
```

### **For Mobile App (GPS-based)**
```
User opens app in Kalingalinga
→ App gets GPS: -15.3742, 28.3528
→ GET /api/hyperlocal-weather?lat=-15.3742&lon=28.3528
→ Returns "Kalingalinga" weather automatically
```

---

## 🔮 **Future Enhancements**

1. **Micro-weather Stations**: Integrate IoT sensors in compounds
2. **Crowd-sourced Data**: Let farmers report local conditions
3. **Field-Level Precision**: Link to specific farm fields
4. **Historical Data**: Track weather patterns per neighborhood
5. **SMS Integration**: Send hyperlocal weather via SMS for feature phones
6. **Voice Interface**: "Weather for Chalala in Bemba"
7. **Offline Caching**: Store last 7 days for offline access

---

## 🧪 **Testing**

### **Test Endpoints**
```bash
# Test Chalala weather
curl "https://greenupp.earth/api/hyperlocal-weather?location=Chalala"

# Test Kalingalinga weather
curl "https://greenupp.earth/api/hyperlocal-weather?location=Kalingalinga - Lusaka"

# Test search
curl "https://greenupp.earth/api/hyperlocal-weather/search?q=ka"

# Test GPS
curl "https://greenupp.earth/api/hyperlocal-weather?lat=-15.3856&lon=28.3189"

# Test all Lusaka neighborhoods
curl "https://greenupp.earth/api/hyperlocal-weather/city/Lusaka"
```

---

## 📈 **Benefits for Rural Farmers**

1. **Precision Planting**: Know exact rainfall timing for your compound
2. **Reduced Risk**: Hyperlocal warnings for frost, storms, drought
3. **Better Planning**: Harvest timing based on your specific area
4. **Community Sharing**: Compare conditions with nearby compounds
5. **Trust**: Data specific to their known location, not "generic Lusaka"

---

## 🎉 **Success Metrics**

- **100+ locations** in database (expandable)
- **Neighborhood-level precision** for major compounds
- **<500ms response** time for weather queries
- **Offline-first** location database (no external API for location lookup)
- **Zero cost** for location database (maintains our own data)

---

## 📞 **Support**

For adding new locations to the database, contact the development team with:
- Location name
- GPS coordinates (lat/lon)
- City/Province
- Type (compound/neighborhood/village)
- Description (optional)

---

**Built with ❤️ for Zambian farmers**

