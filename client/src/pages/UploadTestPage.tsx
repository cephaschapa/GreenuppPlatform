import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const UploadTestPage = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multipleFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Array<{
    url: string;
    originalName: string;
    filename: string;
    mimetype: string;
    size: number;
  }>>([]);
  const [responseData, setResponseData] = useState<any>(null);

  const handleSingleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsUploading(true);
    
    try {
      // Validation
      if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file");
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error("File size exceeds 5MB limit");
      }
      
      // Create form data
      const formData = new FormData();
      formData.append("image", file);
      
      console.log("Uploading single file:", file.name);
      
      // Send request
      const response = await apiRequest(
        "POST",
        "/api/test/upload-single",
        formData,
        { isFormData: true }
      );
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Single upload response:", data);
      
      // Update state with response
      setResponseData(data);
      setUploadedImages([...uploadedImages, data.file]);
      
      toast({
        title: "Upload successful",
        description: "Image was uploaded successfully",
      });
    } catch (error) {
      console.error("Single upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleMultipleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      // Create form data
      const formData = new FormData();
      
      // Add all files to formData and validate
      Array.from(e.target.files).forEach(file => {
        // Validate each file
        if (!file.type.startsWith("image/")) {
          throw new Error(`File "${file.name}" is not an image`);
        }
        
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          throw new Error(`File "${file.name}" exceeds 5MB size limit`);
        }
        
        formData.append("images", file);
      });
      
      console.log(`Uploading ${e.target.files.length} files as batch`);
      
      // Send request
      const response = await apiRequest(
        "POST",
        "/api/test/upload-multiple",
        formData,
        { isFormData: true }
      );
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Multiple upload response:", data);
      
      // Update state with response
      setResponseData(data);
      setUploadedImages([...uploadedImages, ...data.files]);
      
      toast({
        title: "Multiple upload successful",
        description: `${data.files.length} images were uploaded successfully`,
      });
    } catch (error) {
      console.error("Multiple upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...uploadedImages];
    updatedImages.splice(index, 1);
    setUploadedImages(updatedImages);
  };

  const getFullUrl = (url: string) => {
    if (!url) return "";
    
    // Already a full URL
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    
    // Relative URL - prefix with API base URL
    if (url.startsWith("/")) {
      return `${window.location.origin}${url}`;
    }
    
    // Just the filename - prefix with uploads path
    return `${window.location.origin}/uploads/${url}`;
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Upload Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Single File Upload</CardTitle>
            <CardDescription>
              Test uploading a single image file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleSingleUpload}
                disabled={isUploading}
              />
              <Button 
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Image className="h-4 w-4 mr-2" />
                    Select File
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Multiple Files Upload</CardTitle>
            <CardDescription>
              Test uploading multiple image files at once
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                ref={multipleFileInputRef}
                accept="image/*"
                multiple
                onChange={handleMultipleUpload}
                disabled={isUploading}
              />
              <Button 
                variant="outline"
                onClick={() => multipleFileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Image className="h-4 w-4 mr-2" />
                    Select Files
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Uploaded Images ({uploadedImages.length})</CardTitle>
            <CardDescription>
              Preview of all uploaded images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={getFullUrl(image.url)} 
                    alt={image.originalName}
                    className="w-full h-40 object-cover rounded-md"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 text-sm truncate">{image.originalName}</div>
                  <div className="text-xs text-muted-foreground">{Math.round(image.size / 1024)} KB</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Response Data */}
      {responseData && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>API Response</CardTitle>
            <CardDescription>
              Raw response from the upload API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(responseData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UploadTestPage;