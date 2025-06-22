import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, X, Camera, AlertTriangle } from "lucide-react";

interface QRCodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
  title?: string;
  description?: string;
}

export function QRCodeScanner({
  isOpen,
  onClose,
  onScan,
  title = "QR Code Scanner",
  description = "Point your camera at a QR code to scan",
}: QRCodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      initializeScanner();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [isOpen]);

  const initializeScanner = () => {
    try {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          // Success callback
          setScannedData(decodedText);
          setIsScanning(false);
          setError(null);

          // Stop scanning after successful scan
          if (scannerRef.current) {
            scannerRef.current.clear();
            scannerRef.current = null;
          }
        },
        (errorMessage) => {
          // Error callback - we'll ignore most errors as they're just "no QR code found"
          console.log("QR scan error:", errorMessage);
        }
      );

      setIsScanning(true);
      setError(null);
    } catch (err) {
      console.error("Failed to initialize scanner:", err);
      setError("Failed to initialize camera. Please check camera permissions.");
    }
  };

  const handleScanConfirm = () => {
    if (scannedData) {
      onScan(scannedData);
      handleClose();
    }
  };

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScannedData(null);
    setError(null);
    setIsScanning(false);
    onClose();
  };

  const retryScanner = () => {
    setError(null);
    setScannedData(null);
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setTimeout(() => {
      initializeScanner();
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="font-semibold text-red-700 dark:text-red-300 mb-2">
                Camera Error
              </p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={retryScanner} variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Retry Camera
              </Button>
            </div>
          ) : scannedData ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="font-semibold">QR Code Scanned!</p>
              <p className="text-sm text-muted-foreground mb-2">Batch ID:</p>
              <p className="font-mono text-sm bg-muted p-2 rounded break-all">
                {scannedData}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div id="qr-reader" className="w-full"></div>
              {isScanning && (
                <div className="text-center">
                  <div className="animate-pulse text-sm text-muted-foreground">
                    Scanning for QR codes...
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {scannedData ? (
              <>
                <Button onClick={handleScanConfirm} className="flex-1">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Verify Product
                </Button>
                <Button variant="outline" onClick={retryScanner}>
                  <Camera className="h-4 w-4 mr-2" />
                  Scan Another
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
