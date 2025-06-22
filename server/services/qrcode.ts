import QRCode from "qrcode";

/**
 * Service for generating QR codes for crop traceability
 */
export class QRCodeService {
  /**
   * Get the base URL for the frontend
   * @returns The frontend URL
   */
  private getFrontendUrl(): string {
    // In production, use the actual deployed URL
    if (process.env.NODE_ENV === "production") {
      // Use the actual deployed domain
      return "https://greenuppplatform-production.up.railway.app";
    }

    // In development, use localhost
    return process.env.FRONTEND_URL || "http://localhost:3000";
  }

  /**
   * Generate a QR code image for crop traceability
   * @param data The data to encode in the QR code
   * @returns A base64 encoded string of the QR code image
   */
  async generateQRCode(data: string): Promise<string> {
    try {
      console.log(`[QRCode] Generating QR code for data: ${data}`);

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(data, {
        errorCorrectionLevel: "M",
        type: "image/png",
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        width: 256,
      });

      console.log(`[QRCode] Successfully generated QR code`);
      return qrCodeDataUrl;
    } catch (error) {
      console.error("[QRCode] Error generating QR code:", error);
      throw new Error("Failed to generate QR code");
    }
  }

  /**
   * Generate a QR code for a specific crop batch
   * @param cropId The ID of the crop
   * @param batchId The batch ID
   * @returns A base64 encoded string of the QR code image
   */
  async generateCropTraceQRCode(
    cropId: number,
    batchId: string
  ): Promise<string> {
    const baseUrl = this.getFrontendUrl();
    const traceUrl = `${baseUrl}/dashboard/verification?batch=${batchId}&cropId=${cropId}`;
    console.log(`[QRCode] Generating crop trace QR code for URL: ${traceUrl}`);
    return this.generateQRCode(traceUrl);
  }

  /**
   * Generate a QR code for a marketplace listing
   * @param listingId The ID of the listing
   * @param batchId The batch ID for traceability
   * @returns A base64 encoded string of the QR code image
   */
  async generateMarketplaceQRCode(
    listingId: number,
    batchId: string
  ): Promise<string> {
    const baseUrl = this.getFrontendUrl();
    const traceUrl = `${baseUrl}/dashboard/verification?batch=${batchId}&listing=${listingId}`;
    console.log(`[QRCode] Generating marketplace QR code for URL: ${traceUrl}`);
    return this.generateQRCode(traceUrl);
  }
}

export const qrCodeService = new QRCodeService();
