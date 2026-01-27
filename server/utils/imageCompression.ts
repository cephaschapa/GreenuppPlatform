/**
 * Image Compression Utility
 * Compresses base64-encoded images to reduce storage size
 * Note: Requires 'sharp' package. Falls back to no compression if not available.
 */

import { logger } from '../utils/logger.js';

// Try to import sharp, but make it optional
let sharp: any = null;
try {
  sharp = require('sharp');
} catch (error) {
  logger.warn('sharp package not found. Image compression will be disabled.');
}

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-100, default 80
  format?: 'jpeg' | 'png' | 'webp';
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 80,
  format: 'jpeg',
};

/**
 * Extract base64 data from data URL
 */
function extractBase64FromDataUrl(dataUrl: string): string {
  if (!dataUrl.startsWith('data:')) {
    return dataUrl; // Already base64
  }
  const base64Match = dataUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
  if (!base64Match) {
    throw new Error('Invalid data URL format');
  }
  return base64Match[1];
}

/**
 * Compress a base64-encoded image
 * @param imageData - Base64 string or data URL
 * @param options - Compression options
 * @returns Compressed base64 string (without data URL prefix)
 */
export async function compressImage(
  imageData: string,
  options: CompressionOptions = {}
): Promise<string> {
  // If sharp is not available, return original image
  if (!sharp) {
    logger.warn('Image compression skipped: sharp package not available');
    const base64Data = extractBase64FromDataUrl(imageData);
    return base64Data;
  }

  try {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const base64Data = extractBase64FromDataUrl(imageData);
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Get original image metadata
    const metadata = await sharp(imageBuffer).metadata();
    const originalSize = imageBuffer.length;

    // Resize if needed
    let sharpInstance = sharp(imageBuffer);
    
    if (metadata.width && metadata.height) {
      // Only resize if image is larger than max dimensions
      if (metadata.width > opts.maxWidth || metadata.height > opts.maxHeight) {
        sharpInstance = sharpInstance.resize(opts.maxWidth, opts.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }
    }

    // Compress based on format
    let compressedBuffer: Buffer;
    if (opts.format === 'jpeg') {
      compressedBuffer = await sharpInstance
        .jpeg({ quality: opts.quality, mozjpeg: true })
        .toBuffer();
    } else if (opts.format === 'png') {
      compressedBuffer = await sharpInstance
        .png({ quality: opts.quality, compressionLevel: 9 })
        .toBuffer();
    } else {
      // webp
      compressedBuffer = await sharpInstance
        .webp({ quality: opts.quality })
        .toBuffer();
    }

    const compressedSize = compressedBuffer.length;
    const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1);

    logger.info(`Image compressed: ${(originalSize / 1024).toFixed(1)}KB -> ${(compressedSize / 1024).toFixed(1)}KB (${compressionRatio}% reduction)`);

    // Return base64 string without data URL prefix
    return compressedBuffer.toString('base64');
  } catch (error) {
    logger.error('Error compressing image:', error);
    // If compression fails, return original (extract base64 if needed)
    const base64Data = extractBase64FromDataUrl(imageData);
    return base64Data;
  }
}

/**
 * Compress image with aggressive settings for storage (smaller size)
 */
export async function compressImageForStorage(imageData: string): Promise<string> {
  return compressImage(imageData, {
    maxWidth: 1280,
    maxHeight: 1280,
    quality: 75,
    format: 'jpeg',
  });
}

/**
 * Compress image with balanced settings (good quality, reasonable size)
 */
export async function compressImageBalanced(imageData: string): Promise<string> {
  return compressImage(imageData, {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 85,
    format: 'jpeg',
  });
}
