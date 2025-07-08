// Test script to verify weather data loading after page refresh
console.log("=== Weather Loading Test ===");

// Check if localStorage has saved location
const savedLocation = localStorage.getItem("weatherActiveLocation");
console.log("Saved location in localStorage:", savedLocation);

// Check if user has weather preferences
fetch("/api/weather-preferences", {
  credentials: "include",
})
  .then((response) => response.json())
  .then((preferences) => {
    console.log("User weather preferences:", preferences);
    console.log("Saved locations:", preferences.locations);

    if (preferences.locations && preferences.locations.length > 0) {
      console.log("✅ User has saved locations");
      console.log("First saved location:", preferences.locations[0]);

      // Test weather API call
      return fetch(
        `/api/weather?location=${encodeURIComponent(preferences.locations[0])}`,
        {
          credentials: "include",
        }
      );
    } else {
      console.log("❌ User has no saved locations");
    }
  })
  .then((response) => {
    if (response) {
      console.log("Weather API response status:", response.status);
      return response.json();
    }
  })
  .then((weatherData) => {
    if (weatherData) {
      console.log("✅ Weather data loaded successfully:", weatherData.location);
      console.log("Current temperature:", weatherData.current.temp);
    }
  })
  .catch((error) => {
    console.error("❌ Error testing weather loading:", error);
  });

console.log("=== Test Complete ===");
