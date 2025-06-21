import React from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Store,
  MessageCircle,
  Users,
  ExternalLink,
  MapPin,
  Phone,
} from "lucide-react";

interface MarketplaceProduct {
  productId: number;
  name: string;
  marketplaceUrl: string;
  dealerUrl: string;
}

interface ExpertConsultation {
  chatUrl: string;
  expertListUrl: string;
}

interface MarketplaceLinks {
  products: MarketplaceProduct[];
  expertConsultation: ExpertConsultation;
}

interface TreatmentPlanMarketplaceProps {
  marketplaceLinks: MarketplaceLinks;
  diseaseName?: string;
}

export const TreatmentPlanMarketplace: React.FC<
  TreatmentPlanMarketplaceProps
> = ({ marketplaceLinks, diseaseName = "plant disease" }) => {
  const [, setLocation] = useLocation();

  const handleViewMarketplace = (url: string) => {
    // If it's an internal URL, navigate to it
    if (url.startsWith("/dashboard/") || url.startsWith("/")) {
      setLocation(url);
    } else {
      // If it's an external URL, open in new tab
      window.open(url, "_blank");
    }
  };

  const handleChatWithExpert = () => {
    // Navigate to the expert directory for chat
    setLocation("/dashboard/experts");
  };

  const handleFindExperts = () => {
    // Navigate to the expert directory
    setLocation("/dashboard/experts");
  };

  const handleFindDealers = () => {
    // Navigate to the dealer directory
    setLocation("/dashboard/dealers");
  };

  const handleBrowseMarketplace = () => {
    // Navigate to the main marketplace
    setLocation("/dashboard/marketplace");
  };

  return (
    <div className="space-y-6">
      {/* Recommended Products Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-green-600" />
            Recommended Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketplaceLinks.products.map((product) => (
              <div
                key={product.productId}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-600">
                    Available in marketplace
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBrowseMarketplace()}
                    className="flex items-center gap-1"
                  >
                    <Store className="h-4 w-4" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFindDealers()}
                    className="flex items-center gap-1"
                  >
                    <MapPin className="h-4 w-4" />
                    Dealers
                  </Button>
                </div>
              </div>
            ))}

            {marketplaceLinks.products.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <Store className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No specific products recommended</p>
                <p className="text-sm">
                  Check marketplace for general {diseaseName} treatments
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expert Consultation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Expert Consultation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Need Professional Advice?
              </h4>
              <p className="text-blue-700 text-sm mb-4">
                Connect with agricultural experts specializing in {diseaseName}{" "}
                treatment and management.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleChatWithExpert}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat with Expert
                </Button>

                <Button
                  variant="outline"
                  onClick={handleFindExperts}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Find Experts
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                  <h5 className="font-medium">Live Chat</h5>
                </div>
                <p className="text-sm text-gray-600">
                  Get instant answers from certified agricultural experts
                </p>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <h5 className="font-medium">Phone Consultation</h5>
                </div>
                <p className="text-sm text-gray-600">
                  Schedule a call with experts for detailed guidance
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-purple-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleBrowseMarketplace()}
              className="flex items-center gap-2"
            >
              <Store className="h-4 w-4" />
              Browse Marketplace
            </Button>

            <Button
              variant="outline"
              onClick={() => handleFindDealers()}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Find Local Dealers
            </Button>

            <Button
              variant="outline"
              onClick={() => handleFindExperts()}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Expert Directory
            </Button>

            <Button
              variant="outline"
              onClick={() => handleChatWithExpert()}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Start Consultation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
