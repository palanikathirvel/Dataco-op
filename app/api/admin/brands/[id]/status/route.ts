import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { action } = body

    let newStatus: "APPROVED" | "REJECTED" | "SUSPENDED"
    switch (action) {
      case "approve":
        newStatus = "APPROVED"
        break
      case "reject":
        newStatus = "REJECTED"
        break
      case "suspend":
        newStatus = "SUSPENDED"
        break
      case "reactivate":
        newStatus = "APPROVED"
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    await prisma.brand.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        ...(newStatus === "APPROVED" && {
          approvedAt: new Date(),
          approvedBy: session.user.id,
        }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[BRAND_STATUS]", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
