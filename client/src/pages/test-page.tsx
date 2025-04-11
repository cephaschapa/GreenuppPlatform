import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function TestPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState("Organic Tomatoes");
  const [description, setDescription] = useState("Locally grown organic tomatoes, perfect for salads and cooking.");
  const [price, setPrice] = useState(15.99);
  const [quantity, setQuantity] = useState(50);
  const [unit, setUnit] = useState("kg");
  const [category, setCategory] = useState("Vegetables");
  const [locationId, setLocationId] = useState(1);
  const [response, setResponse] = useState("");

  const testEndpoint = async () => {
    try {
      // First get current user
      const userResponse = await fetch("/api/user");
      if (!userResponse.ok) {
        throw new Error("User not authenticated. Please login first!");
      }
      const user = await userResponse.json();
      
      // Create listing
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
          sellerId: user.id,
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
    }
  };

  const fetchListings = async () => {
    try {
      const response = await fetch("/api/marketplace/listings");
      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
      
      toast({
        title: "Listings Retrieved",
        description: `Found ${data.length} listings`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <div className="grid gap-4 mb-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="price">Price</Label>
            <Input 
              id="price" 
              type="number" 
              value={price} 
              onChange={(e) => setPrice(parseFloat(e.target.value))} 
            />
          </div>
          
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input 
              id="quantity" 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(parseInt(e.target.value))} 
            />
          </div>
          
          <div>
            <Label htmlFor="unit">Unit</Label>
            <Input 
              id="unit" 
              value={unit} 
              onChange={(e) => setUnit(e.target.value)} 
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <Input 
            id="category" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
          />
        </div>
        
        <div>
          <Label htmlFor="locationId">Location ID</Label>
          <Input 
            id="locationId" 
            type="number" 
            value={locationId} 
            onChange={(e) => setLocationId(parseInt(e.target.value))} 
          />
        </div>
      </div>
      
      <div className="flex gap-4 mb-6">
        <Button onClick={testEndpoint}>Create Listing</Button>
        <Button onClick={fetchListings} variant="outline">Get Listings</Button>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Response:</h2>
        <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-auto max-h-96">
          {response || "No response yet"}
        </pre>
      </div>
    </div>
  );
}