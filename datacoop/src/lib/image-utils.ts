export interface ExifData {
  DateTimeOriginal?: string;
  Make?: string;
  Model?: string;
  Software?: string;
  ImageWidth?: number;
  ImageHeight?: number;
  GPSLatitude?: number;
  GPSLongitude?: number;
  [key: string]: unknown;
}

export interface ImageAnalysisResult {
  exifData: ExifData;
  perceptualHash: string;
  isSuspicious: boolean;
  suspicionReasons: string[];
}

const SUSPICIOUS_SOFTWARE = [
  "Photoshop",
  "GIMP",
  "Canva",
  "Lightroom",
  "Snapseed",
  "VSCO",
  "PicsArt",
  "Pixelmator",
  "Affinity Photo",
  "Paint.NET",
  "Krita",
  "Inkscape",
  "Illustrator",
];

async function getExifr() {
  try {
    const exifr = await import("exifr");
    return exifr.default || exifr;
  } catch {
    return null;
  }
}

async function getImageHash() {
  try {
    const imageHash = await import("image-hash");
    return imageHash.default || imageHash;
  } catch {
    return null;
  }
}

export async function analyzeImage(buffer: Buffer): Promise<ImageAnalysisResult> {
  const suspicionReasons: string[] = [];

  let exifData: ExifData = {};
  const exifr = await getExifr();
  if (exifr) {
    try {
      exifData = (await exifr.parse(buffer)) as ExifData || {};

      if (exifData.Software) {
        const software = String(exifData.Software);
        for (const suspicious of SUSPICIOUS_SOFTWARE) {
          if (software.toLowerCase().includes(suspicious.toLowerCase())) {
            suspicionReasons.push(`Edited with ${suspicious} (EXIF Software: ${software})`);
            break;
          }
        }
      }

      if (!exifData.DateTimeOriginal && !exifData.Make && !exifData.Model) {
        suspicionReasons.push("No camera EXIF data found - may be a screenshot or edited image");
      }

      if (exifData.Software && exifData.Software.toString().toLowerCase().includes("screenshot")) {
        suspicionReasons.push("EXIF indicates screenshot");
      }
    } catch (error) {
      console.warn("EXIF parsing failed:", error);
      suspicionReasons.push("Could not parse EXIF data");
    }
  } else {
    suspicionReasons.push("EXIF parsing library not available");
  }

  let perceptualHash = "";
  const imageHash = await getImageHash();
  if (imageHash) {
    try {
      perceptualHash = await generatePerceptualHash(buffer, imageHash);
    } catch (error) {
      console.warn("Perceptual hash generation failed:", error);
      suspicionReasons.push("Could not generate perceptual hash");
    }
  } else {
    suspicionReasons.push("Perceptual hash library not available");
  }

  return {
    exifData,
    perceptualHash,
    isSuspicious: suspicionReasons.length > 0,
    suspicionReasons,
  };
}

function generatePerceptualHash(buffer: Buffer, imageHash: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const fs = require("fs");
    const path = require("path");
    const os = require("os");

    const tempFile = path.join(os.tmpdir(), `phash-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`);

    fs.writeFile(tempFile, buffer, (err: Error | null) => {
      if (err) {
        reject(err);
        return;
      }

      imageHash.imageHash(tempFile, 16, true, (error: Error | null, hash: string) => {
        fs.unlink(tempFile, () => {});

        if (error) {
          reject(error);
        } else {
          resolve(hash);
        }
      });
    });
  });
}

export function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) {
    return Infinity;
  }
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) {
      distance++;
    }
  }
  return distance;
}

export async function findSimilarImages(
  newHash: string,
  existingHashes: Array<{ id: string; perceptualHash: string }>,
  threshold = 5
): Promise<Array<{ id: string; distance: number }>> {
  const similar: Array<{ id: string; distance: number }> = [];

  for (const existing of existingHashes) {
    if (existing.perceptualHash) {
      const distance = hammingDistance(newHash, existing.perceptualHash);
      if (distance < threshold) {
        similar.push({ id: existing.id, distance });
      }
    }
  }

  return similar.sort((a, b) => a.distance - b.distance);
}

export function validateOrderId(platform: string, orderId: string): boolean {
  const patterns: Record<string, RegExp> = {
    AMAZON: /^\d{3}-\d{7}-\d{7}$/,
    FLIPKART: /^OD\d{16}$/,
    SWIGGY: /^\d{10}$/,
    ZOMATO: /^(ZO)?\d{10}$/,
    MYNTRA: /^MW\d{10}$/,
    NYKAA: /^NYK\d{10}$/,
    BLINKIT: /^BLK\d{10}$/,
    ZEPTO: /^ZPT\d{10}$/,
    BIGBASKET: /^BB\d{10}$/,
    JIOMART: /^JM\d{10}$/,
  };

  const pattern = patterns[platform.toUpperCase()];
  if (!pattern) {
    return true;
  }

  return pattern.test(orderId);
}