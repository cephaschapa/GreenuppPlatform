import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  CheckCircle,
  Leaf,
  Award,
  Star,
  MapPin,
  Calendar,
  Package,
  Recycle,
  Thermometer,
  Droplets,
  Users,
  TrendingUp,
  Verified,
  QrCode,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { MarketplaceListing } from "@shared/schema";

interface TrustBadgesProps {
  listing: MarketplaceListing;
}

export function TrustBadges({ listing }: TrustBadgesProps) {
  const hasTrustFeatures =
    listing.blockchainVerified ||
    listing.greenuppVerified ||
    listing.organicCertified ||
    listing.fairTradeCertified ||
    listing.pesticideFree ||
    listing.gmoFree ||
    listing.localSourced ||
    listing.farmName ||
    listing.qualityTested ||
    listing.sellerVerified;

  if (!hasTrustFeatures) {
    return null;
  }

  const getVerificationLevelColor = (level: string) => {
    switch (level) {
      case "premium":
        return "bg-gradient-to-r from-purple-500 to-pink-500";
      case "certified":
        return "bg-gradient-to-r from-green-500 to-emerald-500";
      case "basic":
        return "bg-gradient-to-r from-blue-500 to-cyan-500";
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500";
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 4.5) return "text-green-600";
    if (score >= 4.0) return "text-blue-600";
    if (score >= 3.0) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Trust Score Overview */}
      {(listing.trustScore || listing.sellerRating || listing.qualityScore) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Trust & Quality Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {listing.trustScore && (
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div
                    className={`text-2xl font-bold ${getTrustScoreColor(
                      Number(listing.trustScore)
                    )}`}
                  >
                    {Number(listing.trustScore).toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Overall Trust
                  </div>
                </div>
              )}
              {listing.sellerRating && (
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div
                    className={`text-2xl font-bold ${getTrustScoreColor(
                      Number(listing.sellerRating)
                    )}`}
                  >
                    {Number(listing.sellerRating).toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Seller Rating ({listing.sellerReviewCount || 0} reviews)
                  </div>
                </div>
              )}
              {listing.qualityScore && (
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div
                    className={`text-2xl font-bold ${getTrustScoreColor(
                      Number(listing.qualityScore)
                    )}`}
                  >
                    {Number(listing.qualityScore).toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Quality Score
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Verified className="h-5 w-5 text-primary" />
            Verification & Certifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {listing.blockchainVerified && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Blockchain Verified
              </Badge>
            )}
            {listing.greenuppVerified && (
              <Badge
                variant="secondary"
                className={`flex items-center gap-1 ${getVerificationLevelColor(
                  listing.greenuppVerificationLevel || "basic"
                )} text-white`}
              >
                <CheckCircle className="h-3 w-3" />
                Greenupp {listing.greenuppVerificationLevel || "basic"}
              </Badge>
            )}
            {listing.organicCertified && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-green-100 text-green-800"
              >
                <Leaf className="h-3 w-3" />
                Organic Certified
              </Badge>
            )}
            {listing.fairTradeCertified && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-blue-100 text-blue-800"
              >
                <Award className="h-3 w-3" />
                Fair Trade
              </Badge>
            )}
            {listing.pesticideFree && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-emerald-100 text-emerald-800"
              >
                <Shield className="h-3 w-3" />
                Pesticide Free
              </Badge>
            )}
            {listing.gmoFree && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-orange-100 text-orange-800"
              >
                <Leaf className="h-3 w-3" />
                GMO Free
              </Badge>
            )}
            {listing.localSourced && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-purple-100 text-purple-800"
              >
                <MapPin className="h-3 w-3" />
                Locally Sourced
              </Badge>
            )}
            {listing.sellerVerified && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-indigo-100 text-indigo-800"
              >
                <Users className="h-3 w-3" />
                Verified Seller
              </Badge>
            )}
            {listing.qualityTested && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-teal-100 text-teal-800"
              >
                <Star className="h-3 w-3" />
                Quality Tested
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Farm Information */}
      {(listing.farmName ||
        listing.farmLocation ||
        listing.farmSize ||
        listing.farmType) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Farm Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listing.farmName && (
                <div>
                  <div className="text-sm text-muted-foreground">Farm Name</div>
                  <div className="font-medium">{listing.farmName}</div>
                </div>
              )}
              {listing.farmLocation && (
                <div>
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="font-medium">{listing.farmLocation}</div>
                </div>
              )}
              {listing.farmSize && (
                <div>
                  <div className="text-sm text-muted-foreground">Farm Size</div>
                  <div className="font-medium">{listing.farmSize}</div>
                </div>
              )}
              {listing.farmType && (
                <div>
                  <div className="text-sm text-muted-foreground">Farm Type</div>
                  <div className="font-medium">{listing.farmType}</div>
                </div>
              )}
              {listing.farmEstablishedYear && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    Established
                  </div>
                  <div className="font-medium">
                    {listing.farmEstablishedYear}
                  </div>
                </div>
              )}
              {listing.farmCertifications &&
                listing.farmCertifications.length > 0 && (
                  <div className="md:col-span-2">
                    <div className="text-sm text-muted-foreground mb-2">
                      Farm Certifications
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {listing.farmCertifications.map((cert, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {cert || "Unknown"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Lifecycle */}
      {(listing.harvestDate ||
        listing.expiryDate ||
        listing.storageConditions ||
        listing.transportMethod) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Product Lifecycle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listing.harvestDate && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    Harvest Date
                  </div>
                  <div className="font-medium">
                    {new Date(listing.harvestDate).toLocaleDateString()}
                  </div>
                </div>
              )}
              {listing.expiryDate && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    Expiry Date
                  </div>
                  <div className="font-medium">
                    {new Date(listing.expiryDate).toLocaleDateString()}
                  </div>
                </div>
              )}
              {listing.storageConditions && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    Storage Conditions
                  </div>
                  <div className="font-medium">{listing.storageConditions}</div>
                </div>
              )}
              {listing.transportMethod && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    Transport Method
                  </div>
                  <div className="font-medium">{listing.transportMethod}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Packaging Information */}
      {(listing.packagingType ||
        listing.packagingMaterial ||
        listing.packagingRecyclable) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Packaging Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listing.packagingType && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    Packaging Type
                  </div>
                  <div className="font-medium">{listing.packagingType}</div>
                </div>
              )}
              {listing.packagingMaterial && (
                <div>
                  <div className="text-sm text-muted-foreground">Material</div>
                  <div className="font-medium">{listing.packagingMaterial}</div>
                </div>
              )}
              {listing.packagingRecyclable && (
                <div className="flex items-center gap-2">
                  <Recycle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Recyclable Packaging</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sustainability Metrics */}
      {(listing.carbonFootprint ||
        listing.waterUsage ||
        listing.sustainabilityScore) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Sustainability Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {listing.carbonFootprint && (
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Thermometer className="h-4 w-4 text-orange-600" />
                    <span className="text-lg font-bold">
                      {listing.carbonFootprint} kg CO₂
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Carbon Footprint
                  </div>
                </div>
              )}
              {listing.waterUsage && (
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Droplets className="h-4 w-4 text-blue-600" />
                    <span className="text-lg font-bold">
                      {listing.waterUsage} L
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Water Usage
                  </div>
                </div>
              )}
              {listing.sustainabilityScore && (
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Leaf className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-bold">
                      {Number(listing.sustainabilityScore).toFixed(1)}/5
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Sustainability Score
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blockchain & Traceability */}
      {(listing.blockchainId ||
        listing.traceabilityQrCode ||
        listing.traceabilityBatchId) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Blockchain & Traceability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {listing.blockchainId && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    Blockchain ID
                  </div>
                  <div className="font-mono text-sm bg-muted p-2 rounded">
                    {listing.blockchainId}
                  </div>
                </div>
              )}
              {listing.blockchainTxHash && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    Transaction Hash
                  </div>
                  <div className="font-mono text-sm bg-muted p-2 rounded">
                    {listing.blockchainTxHash.substring(0, 20)}...
                  </div>
                </div>
              )}
              {listing.traceabilityQrCode && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Traceability QR Code
                  </div>
                  <div className="flex items-center gap-2">
                    <QrCode className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm">
                      Scan to verify product authenticity
                    </span>
                  </div>
                </div>
              )}
              {listing.traceabilityBatchId && (
                <div>
                  <div className="text-sm text-muted-foreground">Batch ID</div>
                  <div className="font-medium">
                    {listing.traceabilityBatchId}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Timestamps */}
      {(listing.blockchainVerifiedAt ||
        listing.greenuppVerifiedAt ||
        listing.sellerVerifiedAt ||
        listing.qualityTestDate) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Verification History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {listing.blockchainVerifiedAt && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Blockchain Verified</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(
                      listing.blockchainVerifiedAt
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
              {listing.greenuppVerifiedAt && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span>Greenupp Verified</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(listing.greenuppVerifiedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {listing.sellerVerifiedAt && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span>Seller Verified</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(listing.sellerVerifiedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {listing.qualityTestDate && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-600" />
                    <span>Quality Tested</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(listing.qualityTestDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Status */}
      {listing.farmComplianceStatus &&
        listing.farmComplianceStatus !== "pending" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    listing.farmComplianceStatus === "compliant"
                      ? "default"
                      : "destructive"
                  }
                  className="flex items-center gap-1"
                >
                  {listing.farmComplianceStatus === "compliant" ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  {listing.farmComplianceStatus === "compliant"
                    ? "Compliant"
                    : "Non-Compliant"}
                </Badge>
                {listing.farmAuditDate && (
                  <span className="text-sm text-muted-foreground">
                    (Last audit:{" "}
                    {new Date(listing.farmAuditDate).toLocaleDateString()})
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
