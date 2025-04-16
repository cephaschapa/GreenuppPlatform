import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ShieldCheck, AlertTriangle, ArrowLeft, QrCode, Share2, Download } from 'lucide-react';
import CropTraceability from '@/components/farmer/CropTraceability';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function CropTraceabilityPage() {
  const params = useParams<{ cropId: string }>();
  const cropId = parseInt(params.cropId);
  const [location, navigate] = useLocation();
  const [showQRCode, setShowQRCode] = useState(false);
  
  // Fetch crop details
  const { data: crop, isLoading, error } = useQuery({
    queryKey: ['/api/crops', cropId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/crops/${cropId}`);
      return await response.json();
    },
    enabled: !isNaN(cropId),
  });
  
  if (isLoading) {
    return (
      <div className="container flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading crop details...</span>
      </div>
    );
  }
  
  if (error || !crop) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Crop</AlertTitle>
          <AlertDescription>
            Could not load the crop details. Please try again or go back to your crops.
          </AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/crops')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Crops
        </Button>
      </div>
    );
  }
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${crop.name} Traceability`,
        text: `Verify the authenticity of ${crop.name} using blockchain traceability.`,
        url: `${window.location.origin}/trace?batch=${crop.batchId}`,
      });
    } else {
      // Fallback if Web Share API is not available
      navigator.clipboard.writeText(`${window.location.origin}/trace?batch=${crop.batchId}`);
      alert('Link copied to clipboard!');
    }
  };
  
  const downloadQRCode = () => {
    if (crop.traceabilityQrCode) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = crop.traceabilityQrCode;
      link.download = `${crop.name}-traceability-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/crops')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Crops
        </Button>
        <h1 className="text-2xl font-bold">Crop Traceability</h1>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{crop.name} {crop.variety ? `(${crop.variety})` : ''}</CardTitle>
              <CardDescription>
                Manage blockchain traceability and verification for this crop
              </CardDescription>
            </div>
            <Badge variant={crop.batchId ? "success" : "outline"}>
              {crop.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Planting Date</p>
                <p>{crop.plantingDate ? new Date(crop.plantingDate).toLocaleDateString() : 'Not recorded'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expected Harvest</p>
                <p>{crop.expectedHarvestDate ? new Date(crop.expectedHarvestDate).toLocaleDateString() : 'Not set'}</p>
              </div>
            </div>
            
            {crop.batchId && (
              <div className="space-y-4">
                <Separator />
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="font-semibold flex items-center">
                      <ShieldCheck className="h-5 w-5 mr-2 text-green-500" />
                      Blockchain Verification
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      This crop has blockchain traceability enabled
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowQRCode(true)}>
                      <QrCode className="h-4 w-4 mr-2" />
                      View QR Code
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
                
                <Alert>
                  <AlertTitle className="font-medium">Batch ID: {crop.batchId}</AlertTitle>
                  <AlertDescription className="text-sm">
                    Anyone can verify this crop's authenticity by scanning the QR code or entering this batch ID in the verification portal.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <CropTraceability cropId={cropId} />
      
      {/* QR Code Dialog */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Traceability QR Code</DialogTitle>
            <DialogDescription>
              Share this QR code for anyone to verify this crop's blockchain traceability.
            </DialogDescription>
          </DialogHeader>
          
          {crop.traceabilityQrCode ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="border rounded-md p-2 bg-white">
                <img 
                  src={crop.traceabilityQrCode} 
                  alt="Traceability QR Code" 
                  className="h-64 w-64 object-contain"
                />
              </div>
              <p className="text-sm text-center">
                Scan with any QR reader to verify this crop's authenticity.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadQRCode}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Link
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p>QR code is not available. Try initializing blockchain traceability first.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}