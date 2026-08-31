import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const purchases = await prisma.purchase.findMany({
    where: { status: "PENDING_VERIFICATION" },
    include: {
      user: {
        select: { id: true, name: true, email: true, city: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ purchases });
}