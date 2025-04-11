import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function TestPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [userInfo, setUserInfo] = useState<any>(null);
  
  // Login form
  const [username, setUsername] = useState("testuser");
  const [password, setPassword] = useState("password123");
  const [email, setEmail] = useState("test@example.com");
  
  // Location form
  const [country, setCountry] = useState("United States");
  const [region, setRegion] = useState("California");
  const [city, setCity] = useState("San Francisco");
  const [neighborhood, setNeighborhood] = useState("Mission District");
  const [postalCode, setPostalCode] = useState("94105");
  const [latitude, setLatitude] = useState(37.7749);
  const [longitude, setLongitude] = useState(-122.4194);
  const [locationId, setLocationId] = useState<number | null>(null);
  
  // Listing form
  const [title, setTitle] = useState("Organic Tomatoes");
  const [description, setDescription] = useState("Locally grown organic tomatoes, perfect for salads and cooking.");
  const [price, setPrice] = useState(15.99);
  const [quantity, setQuantity] = useState(50);
  const [unit, setUnit] = useState("kg");
  const [category, setCategory] = useState("vegetables");

  // User functions
  const registerUser = async () => {
    setLoading(true);
    setResponse("");
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role: "farmer"
        }),
      });
      
      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
      
      if (response.ok) {
        toast({
          title: "Success!",
          description: "User registered and logged in successfully",
        });
        setUserInfo(data);
        setActiveTab("location");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to register user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      setResponse(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async () => {
    setLoading(true);
    setResponse("");
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      
      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
      
      if (response.ok) {
        toast({
          title: "Success!",
          description: "Login successful",
        });
        setUserInfo(data);
        checkUser();
        setActiveTab("location");
      } else {
        toast({
          title: "Error",
          description: data.message || "Login failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      setResponse(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const checkUser = async () => {
    setLoading(true);
    setResponse("");
    try {
      const response = await fetch("/api/user");
      
      if (response.ok) {
        const user = await response.json();
        setUserInfo(user);
        setResponse(JSON.stringify(user, null, 2));
        toast({
          title: "Success",
          description: "User is logged in",
        });
      } else {
        setUserInfo(null);
        setResponse(JSON.stringify({ message: "Not authenticated" }, null, 2));
        toast({
          title: "Not authenticated",
          description: "Please log in first",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      setResponse(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Location functions
  const createLocation = async () => {
    if (!userInfo) {
      toast({
        title: "Error",
        description: "Please login first",
        variant: "destructive",
      });
      setActiveTab("account");
      return;
    }

    setLoading(true);
    setResponse("");
    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country,
          region,
          city,
          neighborhood,
          postalCode,
          latitude,
          longitude,
          formattedAddress: `${neighborhood}, ${city}, ${region}, ${country}, ${postalCode}`
        }),
      });
      
      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
      
      if (response.ok) {
        toast({
          title: "Success!",
          description: "Location created successfully",
        });
        setLocationId(data.id);
        setActiveTab("listing");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create location",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      setResponse(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    setLoading(true);
    setResponse("");
    try {
      const response = await fetch("/api/locations");
      
      if (response.ok) {
        const data = await response.json();
        setResponse(JSON.stringify(data, null, 2));
        
        if (data.length > 0) {
          setLocationId(data[0].id);
          toast({
            title: "Locations Retrieved",
            description: `Found ${data.length} locations. Using location ID: ${data[0].id}`,
          });
        } else {
          toast({
            title: "No Locations",
            description: "No locations found. Please create one.",
          });
        }
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to fetch locations",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      setResponse(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Listing functions
  const createListing = async () => {
    if (!userInfo) {
      toast({
        title: "Error",
        description: "Please login first",
        variant: "destructive",
      });
      setActiveTab("account");
      return;
    }

    if (!locationId) {
      toast({
        title: "Error",
        description: "Please create or select a location first",
        variant: "destructive",
      });
      setActiveTab("location");
      return;
    }

    setLoading(true);
    setResponse("");
    try {
      const listingResponse = await fetch("/api/marketplace/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          price,
          quantity,
          unit,
          category,
          images: [],
          sellerId: userInfo.id,
          locationId,
        }),
      });
      
      const result = await listingResponse.json();
      setResponse(JSON.stringify(result, null, 2));
      
      if (listingResponse.ok) {
        toast({
          title: "Success!",
          description: "Marketplace listing created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create listing",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      setResponse(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    setResponse("");
    try {
      const response = await fetch("/api/marketplace/listings");
      
      if (response.ok) {
        const data = await response.json();
        setResponse(JSON.stringify(data, null, 2));
        
        toast({
          title: "Listings Retrieved",
          description: `Found ${data.length} listings`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to fetch listings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      setResponse(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">API Testing Dashboard</h1>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {userInfo ? (
              <span className="text-green-500 font-medium">
                Logged in as {userInfo.username} (ID: {userInfo.id})
              </span>
            ) : (
              <span className="text-red-500 font-medium">
                Not logged in
              </span>
            )}
          </div>
        </div>
        <Button onClick={checkUser} variant="outline" size="sm">
          Check Login Status
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account">Login/Register</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="listing">Listing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>User Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <Button 
                    onClick={registerUser} 
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Register
                  </Button>
                  <Button 
                    onClick={loginUser} 
                    className="flex-1" 
                    variant="outline"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="location" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Location</span>
                  {locationId && <span className="text-sm text-green-500">Current Location ID: {locationId}</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input 
                      id="country" 
                      value={country} 
                      onChange={(e) => setCountry(e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="region">Region/State</Label>
                    <Input 
                      id="region" 
                      value={region} 
                      onChange={(e) => setRegion(e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Neighborhood</Label>
                    <Input 
                      id="neighborhood" 
                      value={neighborhood} 
                      onChange={(e) => setNeighborhood(e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input 
                      id="postalCode" 
                      value={postalCode} 
                      onChange={(e) => setPostalCode(e.target.value)} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input 
                        id="latitude" 
                        type="number" 
                        step="0.0001"
                        value={latitude} 
                        onChange={(e) => setLatitude(parseFloat(e.target.value))} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input 
                        id="longitude" 
                        type="number"
                        step="0.0001" 
                        value={longitude} 
                        onChange={(e) => setLongitude(parseFloat(e.target.value))} 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <Button 
                    onClick={createLocation} 
                    className="flex-1"
                    disabled={loading || !userInfo}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Location
                  </Button>
                  <Button 
                    onClick={fetchLocations} 
                    className="flex-1" 
                    variant="outline"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Get Locations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="listing" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Marketplace Listing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      step="0.01"
                      value={price} 
                      onChange={(e) => setPrice(parseFloat(e.target.value))} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      value={quantity} 
                      onChange={(e) => setQuantity(parseInt(e.target.value))} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input 
                      id="unit" 
                      value={unit} 
                      onChange={(e) => setUnit(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input 
                    id="category" 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                  />
                  <p className="text-xs text-muted-foreground">Available categories: seeds, fertilizers, pesticides, equipment, tools, irrigation, livestock, feed, produce, grains, fruits, vegetables, dairy, meat, services, other</p>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <Button 
                    onClick={createListing} 
                    className="flex-1"
                    disabled={loading || !userInfo || !locationId}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Listing
                  </Button>
                  <Button 
                    onClick={fetchListings} 
                    className="flex-1" 
                    variant="outline"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Get Listings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-auto max-h-96 text-sm">
              {response || "No response yet"}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}