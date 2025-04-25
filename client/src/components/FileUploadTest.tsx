import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function FileUploadTest() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadedFileUrl(null); // Reset previous upload
      setUploadStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await apiRequest('POST', '/api/uploads/single', formData, { isFormData: true });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      setUploadedFileUrl(data.fileUrl);
      setUploadStatus('success');
      
      toast({
        title: 'File uploaded successfully',
        description: 'Your file has been uploaded.',
      });
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleTestUploadsDirectory = async () => {
    try {
      const response = await apiRequest('GET', '/api/test-uploads');
      
      if (!response.ok) {
        throw new Error(`Test failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      toast({
        title: 'Upload Directory Test',
        description: data.message,
        variant: data.uploadsDirExists && data.isDirectoryAccessible ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Test error:', error);
      
      toast({
        title: 'Test failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadedFileUrl(null);
    setUploadStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto my-8">
      <CardHeader>
        <CardTitle>File Upload Test</CardTitle>
        <CardDescription>
          Test the file upload functionality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Input 
              ref={fileInputRef}
              type="file" 
              onChange={handleFileChange} 
              accept="image/*"
              disabled={isUploading}
            />
            {selectedFile && (
              <p className="text-sm mt-2">
                Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </p>
            )}
          </div>
          
          {uploadedFileUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Uploaded File:</p>
              <img 
                src={uploadedFileUrl} 
                alt="Uploaded file" 
                className="max-w-full h-auto max-h-64 rounded-md border border-border"
              />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handleTestUploadsDirectory}
            disabled={isUploading}
          >
            Test Directory
          </Button>
          <Button
            variant="outline"
            onClick={resetUpload}
            disabled={isUploading || (!selectedFile && !uploadedFileUrl)}
          >
            Reset
          </Button>
        </div>
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </CardFooter>
    </Card>
  );
}