import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateOrderId } from "@/lib/image-utils";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "USER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const platform = formData.get("platform") as string;
    const orderId = formData.get("orderId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validTypes = ["image/png", "image/jpeg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only PNG, JPG, PDF allowed" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    if (platform && orderId && !validateOrderId(platform, orderId)) {
      return NextResponse.json({ error: `Invalid order ID format for ${platform}` }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try to analyze image, but don't fail if image processing libraries aren't available
    let analysis: any = {
      exifData: {},
      perceptualHash: null,
      isSuspicious: false,
      suspicionReasons: [],
    };

    try {
      const { analyzeImage, findSimilarImages } = await import("@/lib/image-utils");
      analysis = await analyzeImage(buffer);

      if (analysis.perceptualHash) {
        const existingPurchases = await prisma.purchase.findMany({
          where: {
            perceptualHash: { not: null },
            userId: { not: session.userId },
          },
          select: { id: true, perceptualHash: true, userId: true, orderId: true },
        });

        const validHashes = existingPurchases
          .filter((p): p is { id: string; perceptualHash: string; userId: string; orderId: string | null } => p.perceptualHash !== null)
          .map((p) => ({ id: p.id, perceptualHash: p.perceptualHash }));

        const similar = await findSimilarImages(analysis.perceptualHash, validHashes, 5);

        if (similar.length > 0) {
          const duplicateOrderIds = similar
            .filter((s) => s.distance <= 2)
            .map((s) => {
              const match = existingPurchases.find((p) => p.id === s.id);
              return match?.orderId;
            })
            .filter(Boolean);

          if (duplicateOrderIds.length > 0) {
            return NextResponse.json(
              {
                error: "Duplicate or previously uploaded image detected",
                suspicionReasons: analysis.suspicionReasons,
                isSuspicious: true,
              },
              { status: 400 }
            );
          }

          analysis.suspicionReasons.push(
            `Similar image found (distance: ${similar[0].distance}) - flagged for manual review`
          );
          analysis.isSuspicious = true;
        }
      }
    } catch (imageError) {
      console.warn("Image analysis failed, continuing without it:", imageError);
      // Continue without image analysis
    }

    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      url: dataUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      exifData: analysis.exifData,
      perceptualHash: analysis.perceptualHash,
      isSuspicious: analysis.isSuspicious,
      suspicionReasons: analysis.suspicionReasons,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}